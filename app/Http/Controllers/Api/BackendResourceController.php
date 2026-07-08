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
            throw new AuthorizationException('You are not allowed to access this record.');
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
            throw new AuthorizationException('You are not allowed to access this record.');
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
            throw new AuthorizationException('You are not allowed to access this record.');
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

    public function import(Request $request, string $resource): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $this->access->authorize($request->user(), $blueprint, 'create');

        $rows = $request->input('rows', []);
        if (!is_array($rows) || empty($rows)) {
            return response()->json([
                'message' => 'Data impor tidak boleh kosong.',
            ], 422);
        }

        $relationClassMap = [
            'tax_id' => \App\Domain\Finance\Models\Tax::class,
            'branch_id' => \App\Domain\Organization\Models\Branch::class,
            'parent_id' => $blueprint->modelClass(),
            'category_id' => \App\Domain\Catalog\Models\ProductCategory::class,
            'brand_id' => \App\Domain\Catalog\Models\Brand::class,
            'base_unit_id' => \App\Domain\Catalog\Models\Unit::class,
            'purchase_unit_id' => \App\Domain\Catalog\Models\Unit::class,
            'sales_unit_id' => \App\Domain\Catalog\Models\Unit::class,
            'unit_id' => \App\Domain\Catalog\Models\Unit::class,
            'supplier_id' => \App\Domain\Partner\Models\Supplier::class,
            'product_id' => \App\Domain\Catalog\Models\Product::class,
            'department_id' => \App\Domain\Organization\Models\Department::class,
            'user_id' => \App\Models\User::class,
            'output_account_id' => \App\Domain\Finance\Models\Account::class,
            'input_account_id' => \App\Domain\Finance\Models\Account::class,
            'account_id' => \App\Domain\Finance\Models\Account::class,
        ];

        $attributeMap = [
            'code' => 'kode',
            'name' => 'nama',
            'symbol' => 'simbol',
            'exchange_rate' => 'nilai kurs',
            'rate' => 'tarif/nilai',
            'percentage' => 'persentase',
            'is_active' => 'status aktif',
            'description' => 'deskripsi/keterangan',
            'notes' => 'catatan',
            'quantity' => 'kuantitas/jumlah',
            'price' => 'harga',
            'parent_id' => 'kategori induk',
            'category_id' => 'kategori',
            'unit_id' => 'satuan',
            'base_unit_id' => 'satuan dasar',
            'purchase_unit_id' => 'satuan pembelian',
            'sales_unit_id' => 'satuan penjualan',
            'supplier_id' => 'pemasok',
            'product_id' => 'barang/jasa',
            'tax_id' => 'pajak',
            'branch_id' => 'cabang',
            'department_id' => 'departemen',
            'user_id' => 'pengguna',
            'due_days' => 'jatuh tempo (hari)',
            'allowance_type' => 'tipe tunjangan',
            'account_id' => 'akun',
            'output_account_id' => 'akun PPN Keluaran',
            'input_account_id' => 'akun PPN Masukan',
            'accounts_payable_account_id' => 'akun hutang usaha',
            'accounts_receivable_account_id' => 'akun piutang usaha',
            'purchase_advance_account_id' => 'akun uang muka pembelian',
            'sales_advance_account_id' => 'akun uang muka penjualan',
            'sales_discount_account_id' => 'akun diskon penjualan',
            'realized_gain_loss_account_id' => 'akun laba rugi selisih kurs terealisasi',
            'unrealized_gain_loss_account_id' => 'akun laba rugi selisih kurs belum terealisasi',
        ];

        $messages = [
            'required' => 'Kolom :attribute harus diisi.',
            'unique' => 'Kolom :attribute dengan nilai ini sudah terdaftar di sistem (harus unik).',
            'max' => 'Kolom :attribute tidak boleh melebihi :max karakter.',
            'min' => 'Kolom :attribute tidak boleh kurang dari :min.',
            'numeric' => 'Kolom :attribute harus berisi angka (contoh: 15000 atau 12.5).',
            'integer' => 'Kolom :attribute harus berisi angka bulat (contoh: 10).',
            'email' => 'Kolom :attribute harus berisi format email yang valid (contoh: admin@domain.com).',
            'boolean' => 'Kolom :attribute harus berisi nilai aktif/nonaktif (ya/tidak).',
            'exists' => 'Nilai pada kolom :attribute tidak ditemukan dalam daftar pilihan sistem. Silakan pastikan data referensi tersebut sudah terdaftar.',
            'size' => 'Kolom :attribute harus berukuran tepat :size karakter.',
            'date' => 'Kolom :attribute harus berisi format tanggal yang valid (contoh: YYYY-MM-DD seperti 2026-06-14).',
        ];

        $created = 0;
        $errors = [];

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($blueprint, $rows, $relationClassMap, $attributeMap, $messages, &$created, &$errors) {
                foreach ($rows as $index => $row) {
                    if (!is_array($row)) continue;

                    $cleanRow = [];
                    foreach ($row as $k => $v) {
                        if ($v !== null && $v !== '') {
                            $cleanRow[trim($k)] = is_string($v) ? trim($v) : $v;
                        }
                    }

                    foreach ($cleanRow as $key => $val) {
                        if (str_ends_with($key, '_id') && is_string($val) && !is_numeric($val)) {
                            $modelClass = $relationClassMap[$key] ?? null;
                            if ($modelClass) {
                                $resolvedId = $this->resolveRelationId($modelClass, $val);
                                if ($resolvedId !== null) {
                                    $cleanRow[$key] = $resolvedId;
                                } else {
                                    $rowNum = $index + 2;
                                    $friendlyKey = $attributeMap[$key] ?? str_replace('_', ' ', $key);
                                    throw new \Exception("Baris {$rowNum}: Gagal mencocokkan '{$val}' untuk kolom '{$friendlyKey}'. Pastikan data referensi tersebut sudah terdaftar.");
                                }
                            }
                        }
                    }

                    $rules = $blueprint->storeRules();
                    unset($rules['attachment_ids'], $rules['attachment_ids.*']);

                    // Cek kelengkapan kolom impor
                    foreach ($rules as $ruleKey => $ruleList) {
                        $isRequired = false;
                        if (is_array($ruleList)) {
                            $isRequired = in_array('required', $ruleList, true);
                        } else if (is_string($ruleList)) {
                            $isRequired = str_contains($ruleList, 'required');
                        }

                        if ($isRequired && !array_key_exists($ruleKey, $cleanRow)) {
                            $friendlyKey = $attributeMap[$ruleKey]
                                ?? $attributeMap[preg_replace('/_id$/', '', $ruleKey)]
                                ?? str_replace('_', ' ', $ruleKey);
                            $rowNum = $index + 2;
                            throw new \Exception("Baris {$rowNum}: Kolom '{$friendlyKey}' tidak ditemukan di dalam file. Pastikan file Anda memiliki kolom dengan nama tersebut.");
                        }
                    }

                    $customAttributes = [];
                    foreach (array_keys($rules) as $ruleKey) {
                        $cleanKey = preg_replace('/_id$/', '', $ruleKey);
                        $customAttributes[$ruleKey] = $attributeMap[$ruleKey]
                            ?? $attributeMap[$cleanKey]
                            ?? str_replace('_', ' ', $ruleKey);
                    }

                    $validator = \Illuminate\Support\Facades\Validator::make($cleanRow, $rules, $messages, $customAttributes);
                    if ($validator->fails()) {
                        $rowNum = $index + 2;
                        $firstError = collect($validator->errors()->all())->first();
                        throw new \Exception("Baris {$rowNum}: {$firstError}");
                    }

                    $payload = $this->payloadSanitizer->sanitize($cleanRow);
                    $this->writer->create($blueprint, $payload);
                    $created++;
                }
            });
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => "Berhasil mengimpor {$created} data ke database.",
        ]);
    }

    protected function resolveRelationId(string $modelClass, string $value): ?int
    {
        $value = trim($value);
        if ($value === '') return null;

        $tempModel = new $modelClass();
        $tableName = $tempModel->getTable();
        $columns = \Illuminate\Support\Facades\Schema::getColumnListing($tableName);

        $matchCols = array_intersect(['code', 'employee_code', 'name', 'full_name', 'description'], $columns);
        foreach ($matchCols as $col) {
            $record = $modelClass::query()->where($col, $value)->first();
            if ($record) return $record->getKey();
        }

        foreach ($matchCols as $col) {
            $record = $modelClass::query()->where($col, 'like', $value)->first();
            if ($record) return $record->getKey();
        }

        return null;
    }

    protected function savePreferences(array $settings): void
    {
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
    }

    protected function allowedPreferenceKeys(): array
    {
        return [
            // Info & alamat toko
            'company-name', 'business-category', 'business-field', 'phone', 'fax',
            'email', 'start-date', 'accounting-period', 'currency', 'street',
            'city', 'province', 'postal-code', 'country',
            // Fitur dasar
            'multi-branch', 'multi-currency', 'tax-feature', 'approval-feature',
            'asset-feature', 'budget-feature',
            // Metode & pusat biaya
            'inventory-average', 'inventory-fifo', 'department-center',
            // Penjualan & Pembelian
            'sales-quote-order', 'sales-return', 'price-adjustment', 'salesman',
            'delivery-service', 'payment-terms', 'purchase-order', 'supplier-price-list',
            // Persediaan
            'item-request', 'multi-warehouse', 'multi-unit', 'simple-production',
            // Persetujuan transaksi
            'approval-sales-quote', 'approval-sales-order', 'approval-sales-delivery',
            'approval-sales-invoice', 'approval-sales-receipt', 'approval-sales-return',
            'approval-sales-discount', 'approval-purchase-order', 'approval-purchase-receipt',
            'approval-purchase-invoice', 'approval-purchase-payment', 'approval-purchase-return',
            'approval-purchase-price', 'approval-inventory-request', 'approval-inventory-adjustment',
            'approval-inventory-transfer', 'approval-inventory-job-order', 'approval-inventory-material-addition',
            'approval-inventory-job-completion', 'approval-inventory-stock-opname', 'approval-other-payment',
            'approval-other-receipt', 'approval-other-bank-transfer', 'approval-other-expense',
            'approval-other-salary', 'approval-other-transfer-asset',
            // Lampiran transaksi
            'attachments-sales-quote', 'attachments-sales-order', 'attachments-sales-delivery',
            'attachments-sales-invoice', 'attachments-sales-receipt', 'attachments-sales-return',
            'attachments-sales-discount', 'attachments-purchase-order', 'attachments-purchase-receipt',
            'attachments-purchase-invoice', 'attachments-purchase-payment', 'attachments-purchase-return',
            'attachments-purchase-price', 'attachments-inventory-request', 'attachments-inventory-transfer',
            'attachments-inventory-adjustment', 'attachments-inventory-job-order', 'attachments-inventory-material-addition',
            'attachments-inventory-job-completion', 'attachments-inventory-stock-opname-request', 'attachments-inventory-stock-opname-result',
            'attachments-other-expense-record', 'attachments-other-salary-record', 'attachments-other-general-journal',
            'attachments-other-payment', 'attachments-other-receipt', 'attachments-other-bank-transfer',
            'attachments-other-fixed-asset', 'attachments-other-fixed-asset-change', 'attachments-other-fixed-asset-disposal',
            'attachments-other-fixed-asset-transfer',
            // Batasan
            'limitations-operator-access-mode', 'limitations-transaction-date-mode',
            'limitations-general-items', 'limitations-serial-items', 'limitations-return-form-items',
            'limitations-period-end-items', 'limitations-advance-payment-items',
            // Format & lainnya
            'others-decimal-format', 'others-decimal-option-value', 'others-decimal-option-condition',
            'others-date-display', 'others-aging-ar-range', 'others-aging-ar-source',
            'others-aging-inventory-range', 'others-sales-commission-source',
        ];
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
