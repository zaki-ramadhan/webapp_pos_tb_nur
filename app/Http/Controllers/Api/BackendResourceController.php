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
            'message' => "{$blueprint->label} berhasil ditambahkan.",
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

        if (in_array($resource, ['payroll-entries', 'expense-entries'], true) && $entity instanceof \App\Domain\Support\Models\OperationDocument) {
            $paid = (float) \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'cash_payment')
                ->where('related_document_id', $entity->id)
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->sum('total_amount');

            $docTotal = (float) $entity->total_amount;
            $outstanding = max(0.00, round($docTotal - $paid, 2));

            if ($paid <= 0.00) {
                $computedStatus = 'Sedang diproses';
            } elseif ($outstanding <= 0.01) {
                $computedStatus = 'Terbayar';
            } else {
                $computedStatus = 'Sebagian dibayar';
            }

            if ($entity->status !== $computedStatus || (float) $entity->paid_amount !== $paid) {
                \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->where('id', $entity->id)
                    ->update([
                        'paid_amount' => $paid,
                        'outstanding_amount' => $outstanding,
                        'status' => $computedStatus,
                    ]);
            }

            $entity->setAttribute('paid_amount', $paid);
            $entity->setAttribute('outstanding_amount', $outstanding);
            $entity->setAttribute('status', $computedStatus);
        }

        if (in_array($resource, ['sales-invoices', 'purchase-invoices'], true) && $entity instanceof \App\Domain\Support\Models\OperationDocument) {
            $paid = (float) ($entity->paid_amount ?? 0.0);
            $docTotal = (float) ($entity->total_amount ?? 0.0);
            $outstanding = max(0.00, round($docTotal - $paid, 2));

            if ($docTotal > 0 && $outstanding <= 0.01) {
                $computedStatus = 'Lunas';
            } elseif ($paid > 0 && $outstanding > 0.01) {
                $computedStatus = 'Sebagian';
            } else {
                $computedStatus = 'Belum Lunas';
            }

            if ($entity->status !== $computedStatus || (float) ($entity->outstanding_amount ?? 0.0) !== $outstanding) {
                try {
                    \Illuminate\Support\Facades\DB::table('operation_documents')
                        ->where('id', $entity->id)
                        ->update([
                            'outstanding_amount' => $outstanding,
                            'status' => $computedStatus,
                        ]);
                } catch (\Throwable) {
                    // Ignore write error on read request
                }
                $entity->setAttribute('outstanding_amount', $outstanding);
                $entity->setAttribute('status', $computedStatus);
            }
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
            'message' => "{$blueprint->label} berhasil diperbarui.",
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

        if ($resource === 'users' && $entity instanceof \App\Models\User) {
            $this->validator->validateUserDeletion($request->user(), $entity);
        }

        $this->writer->delete($blueprint, $entity);

        return response()->json([
            'message' => "{$blueprint->label} berhasil dihapus.",
        ]);
    }

    protected function resolveBlueprint(string $resource): BackendResourceBlueprint
    {
        if ($resource === 'currencies') {
            abort(403, 'Modul mata uang (Currencies) saat ini dinonaktifkan.');
        }

        $blueprint = BackendResourceRegistry::find($resource);

        if ($blueprint === null) {
            throw new NotFoundHttpException("Modul data [{$resource}] tidak terdaftar di sistem.");
        }

        return $blueprint;
    }

    protected function findRecord(BackendResourceBlueprint $blueprint, int $record): Model
    {
        $modelClass = $blueprint->modelClass();

        $entity = $modelClass::query()
            ->with($blueprint->with)
            ->find($record);

        if ($entity) {
            return $entity;
        }

        // Fallback transparent adapter for inventory adjustments created in inventory_documents table
        if ($blueprint->key === 'inventory-adjustments') {
            $invDoc = \App\Domain\Inventory\Models\InventoryDocument::with([
                'lines.product.baseUnit',
                'lines.unit',
                'lines.warehouse',
                'warehouse',
            ])->find($record);

            if ($invDoc) {
                $opDoc = new \App\Domain\Inventory\Models\InventoryAdjustment([
                    'document_type' => 'inventory_adjustment',
                    'document_number' => $invDoc->document_number,
                    'status' => $invDoc->status ?? 'posted',
                    'entry_date' => $invDoc->document_date ? \Carbon\Carbon::parse($invDoc->document_date)->toDateString() : now()->toDateString(),
                    'notes' => $invDoc->notes,
                    'warehouse_id' => $invDoc->warehouse_id,
                ]);
                $opDoc->exists = true;
                $opDoc->id = $invDoc->id;

                $opLines = $invDoc->lines->map(function ($l) {
                    $attrs = (array) ($l->attributes ?? []);
                    $unitPrice = (float) ($attrs['unit_price'] ?? $attrs['cost'] ?? $l->unit_cost ?? 0);
                    $totalAmt = (float) ($attrs['total_amount'] ?? ($l->quantity * $unitPrice));

                    $opLine = new \App\Domain\Support\Models\OperationDocumentLine([
                        'id' => $l->id,
                        'product_id' => $l->product_id,
                        'unit_id' => $l->unit_id,
                        'warehouse_id' => $l->warehouse_id,
                        'quantity' => $l->quantity,
                        'unit_price' => $unitPrice,
                        'total_amount' => $totalAmt,
                        'description' => $l->notes ?? $l->product?->name ?? 'Stok Awal',
                        'attributes' => $attrs,
                    ]);
                    $opLine->setRelation('product', $l->product);
                    $opLine->setRelation('unit', $l->unit ?? $l->product?->baseUnit);
                    $opLine->setRelation('warehouse', $l->warehouse);
                    return $opLine;
                });

                $opDoc->setRelation('lines', $opLines);
                $opDoc->setRelation('warehouse', $invDoc->warehouse);
                return $opDoc;
            }
        }

        abort(404, "Data {$blueprint->label} #{$record} tidak ditemukan.");
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
            'account_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'string'],
        ]);

        $isClosed = (bool) $validated['is_closed'];
        $accountId = !empty($validated['account_id']) ? (int) $validated['account_id'] : null;
        $reconcileDate = $validated['date'] ?? now()->format('d/m/Y');
        $dateFormatted = str_starts_with($reconcileDate, '(') ? $reconcileDate : "({$reconcileDate})";

        $documents = \App\Domain\Support\Models\OperationDocument::whereIn('document_number', $validated['document_numbers'])
            ->with(['primaryAccount', 'secondaryAccount'])
            ->get();

        $affected = 0;

        foreach ($documents as $doc) {
            $metadata = $doc->metadata ?? [];

            if ($doc->document_type === 'bank_transfer') {
                $primaryId = $doc->primary_account_id ? (int) $doc->primary_account_id : null;
                $secondaryId = $doc->secondary_account_id ? (int) $doc->secondary_account_id : null;

                $fromLabel = $metadata['from_bank_label'] ?? $doc->primaryAccount?->name ?? 'Kas/Bank Asal';
                $toLabel = $metadata['to_bank_label'] ?? $doc->secondaryAccount?->name ?? 'Kas/Bank Tujuan';

                $currentRecons = $metadata['reconciliations'] ?? [];
                $fromRecon = collect($currentRecons)->firstWhere('id', 'from') ?? [
                    'id' => 'from',
                    'bank' => $fromLabel,
                    'status' => 'Belum',
                    'date' => null,
                ];
                $toRecon = collect($currentRecons)->firstWhere('id', 'to') ?? [
                    'id' => 'to',
                    'bank' => $toLabel,
                    'status' => 'Belum',
                    'date' => null,
                ];

                if ($accountId !== null) {
                    if ($accountId === $primaryId) {
                        $fromRecon['status'] = $isClosed ? 'Ya' : 'Belum';
                        $fromRecon['date'] = $isClosed ? $dateFormatted : null;
                    } elseif ($accountId === $secondaryId) {
                        $toRecon['status'] = $isClosed ? 'Ya' : 'Belum';
                        $toRecon['date'] = $isClosed ? $dateFormatted : null;
                    } else {
                        $fromRecon['status'] = $isClosed ? 'Ya' : 'Belum';
                        $fromRecon['date'] = $isClosed ? $dateFormatted : null;
                        $toRecon['status'] = $isClosed ? 'Ya' : 'Belum';
                        $toRecon['date'] = $isClosed ? $dateFormatted : null;
                    }
                } else {
                    $fromRecon['status'] = $isClosed ? 'Ya' : 'Belum';
                    $fromRecon['date'] = $isClosed ? $dateFormatted : null;
                    $toRecon['status'] = $isClosed ? 'Ya' : 'Belum';
                    $toRecon['date'] = $isClosed ? $dateFormatted : null;
                }

                $bothReconciled = ($fromRecon['status'] === 'Ya' && $toRecon['status'] === 'Ya');
                $doc->is_closed = $bothReconciled;

                $metadata['reconciliations'] = [$fromRecon, $toRecon];
                $metadata['reconcile_status'] = $bothReconciled ? 'Ya' : ($fromRecon['status'] === 'Ya' || $toRecon['status'] === 'Ya' ? 'Parsial' : 'Belum');
                $metadata['reconcile_date'] = $isClosed ? $dateFormatted : null;
                $metadata['reconciled_at'] = $isClosed ? now()->toIso8601String() : null;
            } else {
                $doc->is_closed = $isClosed;
                $metadata['reconcile_status'] = $isClosed ? 'Ya' : 'Belum';
                $metadata['reconcile_date'] = $isClosed ? $dateFormatted : null;
                $metadata['reconciled_at'] = $isClosed ? now()->toIso8601String() : null;
            }

            $doc->metadata = $metadata;
            $doc->save();
            $affected++;
        }

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
