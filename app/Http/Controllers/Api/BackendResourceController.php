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
use App\Domain\Finance\Models\Currency;
use Illuminate\Support\Facades\Http;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BackendResourceController extends Controller
{
    public function __construct(
        protected BackendResourceAccessService $access,
        protected BackendResourceIndexQuery $indexQuery,
        protected BackendResourcePayloadSanitizer $payloadSanitizer,
        protected BackendResourceWriter $writer,
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

    public function store(BackendResourceStoreRequest $request, string $resource): JsonResponse
    {
        $blueprint = $request->blueprint();

        if ($resource === 'preferences') {
            $this->access->authorize($request->user(), $blueprint, 'create');
            $settings = $request->input('settings', []);
            
            \Illuminate\Support\Facades\DB::transaction(function () use ($settings): void {
                foreach ($settings as $key => $val) {
                    $group = 'features';
                    $companyKeys = [
                        'company-name', 'business-category', 'business-field', 
                        'phone', 'fax', 'email', 'start-date', 'accounting-period', 
                        'currency', 'street', 'city', 'province', 'postal-code', 'country'
                    ];
                    if (in_array($key, $companyKeys)) {
                        $group = 'company_info';
                    }

                    \App\Domain\Support\Models\PreferenceSetting::updateOrCreate(
                        [
                            'group_key' => $group,
                            'setting_key' => $key,
                            'scope_type' => 'company',
                            'scope_key' => 'default',
                        ],
                        [
                            'label' => ucwords(str_replace('-', ' ', $key)),
                            'data_type' => 'string',
                            'value' => $val,
                            'is_active' => true,
                        ]
                    );
                }
            });

            return response()->json([
                'message' => 'Preferensi berhasil disimpan.',
            ]);
        }

        $payload = $this->payloadSanitizer->sanitize($request->validated());
        $record = $this->writer->create($blueprint, $payload);

        return response()->json([
            'message' => "{$blueprint->label} created successfully.",
            'data' => $record,
        ], 201);
    }

    public function show(Request $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $this->access->authorize($request->user(), $blueprint, 'view');
        $customRecord = $blueprint->runShow($record);

        return response()->json([
            'data' => $customRecord ?? $this->findRecord($blueprint, $record),
        ]);
    }

    public function update(BackendResourceUpdateRequest $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $request->blueprint();

        if ($resource === 'preferences') {
            $this->access->authorize($request->user(), $blueprint, 'update');
            $settings = $request->input('settings', []);
            
            \Illuminate\Support\Facades\DB::transaction(function () use ($settings): void {
                foreach ($settings as $key => $val) {
                    $group = 'features';
                    $companyKeys = [
                        'company-name', 'business-category', 'business-field', 
                        'phone', 'fax', 'email', 'start-date', 'accounting-period', 
                        'currency', 'street', 'city', 'province', 'postal-code', 'country'
                    ];
                    if (in_array($key, $companyKeys)) {
                        $group = 'company_info';
                    }

                    \App\Domain\Support\Models\PreferenceSetting::updateOrCreate(
                        [
                            'group_key' => $group,
                            'setting_key' => $key,
                            'scope_type' => 'company',
                            'scope_key' => 'default',
                        ],
                        [
                            'label' => ucwords(str_replace('-', ' ', $key)),
                            'data_type' => 'string',
                            'value' => $val,
                            'is_active' => true,
                        ]
                    );
                }
            });

            return response()->json([
                'message' => 'Preferensi berhasil disimpan.',
            ]);
        }

        $entity = $this->findRecord($blueprint, $record);
        $payload = $this->payloadSanitizer->sanitize($request->validated());
        $entity = $this->writer->update($blueprint, $entity, $payload);

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

        $this->writer->delete($blueprint, $entity);

        return response()->json([
            'message' => "{$blueprint->label} deleted successfully.",
        ]);
    }

    protected function resolveBlueprint(string $resource): BackendResourceBlueprint
    {
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
        try {
            // Cache the rates for 12 hours (43200 seconds) to prevent API rate limit exhaustion.
            // Since the free API updates daily, hitting it more frequently is unnecessary.
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
}
