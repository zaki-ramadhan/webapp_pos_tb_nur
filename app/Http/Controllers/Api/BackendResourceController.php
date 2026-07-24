<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Backend\BackendResourceIndexRequest;
use App\Http\Requests\Api\Backend\BackendResourceStoreRequest;
use App\Http\Requests\Api\Backend\BackendResourceUpdateRequest;
use App\Support\Backend\BackendResourceAccessService;
use App\Support\Backend\BackendResourceBlueprint;
use App\Support\Backend\BackendResourceIndexQuery;
use App\Support\Backend\BackendResourcePayloadSanitizer;
use App\Support\Backend\BackendResourceRegistry;
use App\Support\Backend\BackendResourceWriter;
use App\Support\Backend\BackendResourceSecurityValidator;
use App\Domain\Finance\Models\Currency;
use Illuminate\Support\Facades\Http;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BackendResourceController extends Controller
{
    use \App\Http\Controllers\Api\Traits\BackendResourceImportExportTrait;

    public function __construct(
        protected BackendResourceAccessService $access,
        protected BackendResourceIndexQuery $indexQuery,
        protected BackendResourcePayloadSanitizer $payloadSanitizer,
        protected BackendResourceWriter $writer,
        protected BackendResourceSecurityValidator $validator,
    ) {
    }

    public function resources(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->access->visibleResourcesFor($request->user()),
        ]);
    }

    public function index(BackendResourceIndexRequest $request, string $resource): JsonResponse
    {
        $records = $this->indexQuery->paginate(
            $request->blueprint(),
            $request->validated(),
        );

        return response()->json($records);
    }

    public function liveUpdates(Request $request): JsonResponse
    {
        $lastChange = \Illuminate\Support\Facades\Cache::get('last_resource_change');

        return response()->json([
            'change' => $lastChange,
        ]);
    }

    public function store(BackendResourceStoreRequest $request, string $resource): JsonResponse
    {
        $blueprint = $request->blueprint();

        if ($resource === 'preferences' && $request->has('settings')) {
            $this->access->authorize($request->user(), $blueprint, 'create');
            $settings = collect($request->input('settings', []))
                ->filter(fn ($val, $key) => in_array($key, $this->allowedPreferenceKeys(), true))
                ->toArray();

            $this->savePreferences($settings);

            return response()->json([
                'message' => 'Preferensi berhasil disimpan.',
            ]);
        }

        $payload = $this->payloadSanitizer->sanitize($request->validated());
        $this->validator->validateBranchAssignment($request->user(), $payload);
        $this->validator->validatePrivilegeEscalation($request->user(), $resource, $payload);

        $record = $this->writer->create($blueprint, $payload);
        if (!empty($blueprint->with)) {
            $record->load($blueprint->with);
        }

        return response()->json([
            'message' => "{$blueprint->label} created successfully.",
            'data' => $record,
        ], 201);
    }

    public function show(Request $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $this->access->authorize($request->user(), $blueprint, 'view');

        $entity = $this->findRecord($blueprint, $record);
        if (! $this->access->canAccessRecord($request->user(), $entity)) {
            throw new AuthorizationException('Anda tidak memiliki hak akses untuk melihat data ini.');
        }

        $customRecord = $blueprint->runShow($record);

        return response()->json([
            'data' => $customRecord ?? $entity,
        ]);
    }

    public function update(BackendResourceUpdateRequest $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $request->blueprint();

        if ($resource === 'preferences' && $request->has('settings')) {
            $this->access->authorize($request->user(), $blueprint, 'update');
            $settings = collect($request->input('settings', []))
                ->filter(fn ($val, $key) => in_array($key, $this->allowedPreferenceKeys(), true))
                ->toArray();

            $this->savePreferences($settings);

            return response()->json([
                'message' => 'Preferensi berhasil disimpan.',
            ]);
        }

        $entity = $this->findRecord($blueprint, $record);
        if (! $this->access->canAccessRecord($request->user(), $entity)) {
            throw new AuthorizationException('Anda tidak memiliki hak akses untuk melihat data ini.');
        }

        $payload = $this->payloadSanitizer->sanitize($request->validated());
        $this->validator->validateBranchAssignment($request->user(), $payload);
        $this->validator->validatePrivilegeEscalation($request->user(), $resource, $payload);

        $entity = $this->writer->update($blueprint, $entity, $payload);
        if (!empty($blueprint->with)) {
            $entity->load($blueprint->with);
        }

        return response()->json([
            'message' => "{$blueprint->label} updated successfully.",
            'data' => $entity,
        ]);
    }

    public function destroy(Request $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $this->access->authorize($request->user(), $blueprint, 'delete');

        $entity = $this->findRecord($blueprint, $record);
        if (! $this->access->canAccessRecord($request->user(), $entity)) {
            throw new AuthorizationException('Anda tidak memiliki hak akses untuk melihat data ini.');
        }

        $this->writer->delete($blueprint, $entity);

        return response()->json([
            'message' => "{$blueprint->label} deleted successfully.",
        ]);
    }

    protected function resolveBlueprint(string $resource): BackendResourceBlueprint
    {
        if ($resource === 'currencies') {
            abort(403, 'Modul mata uang (Currencies) saat ini dinonaktifkan.');
        }

        $blueprint = BackendResourceRegistry::find($resource);

        if ($blueprint === null) {
            throw new NotFoundHttpException("Backend resource [{$resource}] is not registered.");
        }

        return $blueprint;
    }

    protected function findRecord(BackendResourceBlueprint $blueprint, int $record): Model
    {
        $modelClass = $blueprint->modelClass();

        return $modelClass::query()
            ->with($blueprint->with)
            ->findOrFail($record);
    }

    public function syncCurrencies(Request $request): JsonResponse
    {
        abort(403, 'Modul mata uang (Currencies) saat ini dinonaktifkan.');
        try {
          // Cache rate 12 jam

          // Cukup hit API sekali sehari

            $rates = \Illuminate\Support\Facades\Cache::remember('currency_rates_usd', 43200, function () {
                $response = Http::timeout(10)->get('https://open.er-api.com/v6/latest/USD');

                if (!$response->successful()) {
                    throw new \Exception('Gagal mengambil data dari API ExchangeRate.');
                }

                $data = $response->json();
                return $data['rates'] ?? [];
            });

            if (empty($rates) || !isset($rates['IDR'])) {
                \Illuminate\Support\Facades\Cache::forget('currency_rates_usd');
                return response()->json([
                    'message' => 'Format data API tidak valid.',
                ], 500);
            }

            $idrRate = (float) $rates['IDR'];
            $currencies = Currency::all();
            $syncedCount = 0;

            foreach ($currencies as $currency) {
                $code = strtoupper($currency->code);

                if ($code === 'IDR') {
                    $currency->exchange_rate = 1.0;
                    $currency->save();
                    $syncedCount++;
                    continue;
                }

                if (isset($rates[$code])) {
                    $foreignRateInUsd = (float) $rates[$code];
                    if ($foreignRateInUsd > 0) {
                        $rateInIdr = $idrRate / $foreignRateInUsd;
                        $currency->exchange_rate = $rateInIdr;
                        $currency->save();
                        $syncedCount++;
                    }
                }
            }

            return response()->json([
                'message' => "Berhasil sinkronisasi {$syncedCount} mata uang dengan kurs real-time (cached).",
                'rates' => $rates,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan sistem saat sinkronisasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function reconcileDocuments(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_numbers' => ['required', 'array'],
            'document_numbers.*' => ['required', 'string'],
            'is_closed' => ['required', 'boolean'],
        ]);

        $affected = \App\Domain\Support\Models\OperationDocument::whereIn('document_number', $validated['document_numbers'])
            ->update(['is_closed' => $validated['is_closed']]);

      // Invalidate dashboard caches on mutation

        \Illuminate\Support\Facades\Cache::forget('dashboard_widgets_retail');
        \Illuminate\Support\Facades\Cache::forget('dashboard_widgets_trade-portal');
        \Illuminate\Support\Facades\Cache::forget('dashboard_widgets_manufacture');

        return response()->json([
            'success' => true,
            'message' => "Berhasil memperbarui status rekonsiliasi untuk {$affected} dokumen.",
        ]);
    }
}
