<?php

namespace App\Support\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BackendResourceWriter
{
    public function __construct(
        protected BackendActivityLogger $activityLogger,
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function create(BackendResourceBlueprint $blueprint, array $payload): Model
    {
        $modelClass = $blueprint->modelClass();

        /** @var Model $record */
        $record = new $modelClass();

        return $this->persist($blueprint, $record, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function update(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        return $this->persist($blueprint, $record, $payload);
    }

    public function delete(BackendResourceBlueprint $blueprint, Model $record): void
    {
        DB::transaction(function () use ($blueprint, $record): void {
            if ($blueprint->key !== 'period-ends' && $record instanceof \App\Domain\Support\Models\OperationDocument) {
                if ($record->entry_date && $this->isPeriodClosed($record->entry_date)) {
                    $formattedDate = \Carbon\Carbon::parse($record->entry_date)->format('d/m/Y');
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'entry_date' => ["Transaksi tidak dapat dihapus karena periode tanggal tersebut ({$formattedDate}) sudah ditutup oleh Proses Akhir Bulan."]
                    ]);
                }
            }

            $costingKeys = [
                'goods-receipts',
                'sales-deliveries',
                'sales-returns',
                'purchase-returns',
                'inventory-adjustments',
                'work-completions',
                'material-additions',
                'stock-transfers',
                'stock-opname-results',
            ];
            if (in_array($blueprint->key, $costingKeys)) {
                $this->revertCosting($record);
            }

            $before = $this->activityLogger->snapshot($record);
            $record->delete();
            $this->activityLogger->logMutation(
                $blueprint,
                'delete',
                $record,
                $before,
                null,
            );

            // Invalidate dashboard caches on mutation
            $this->invalidateDashboardCache();
        });
    }

    protected function persist(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        return DB::transaction(function () use ($blueprint, $record, $payload): Model {
            // 1. Validasi Periode Ditutup (Period Lock)
            if ($blueprint->key !== 'period-ends' && is_subclass_of($blueprint->modelClass(), \App\Domain\Support\Models\OperationDocument::class)) {
                $targetDate = $payload['entry_date'] ?? ($record->exists ? $record->entry_date : null);
                if ($targetDate && $this->isPeriodClosed($targetDate)) {
                    $formattedDate = \Carbon\Carbon::parse($targetDate)->format('d/m/Y');
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'entry_date' => ["Transaksi tidak dapat disimpan karena periode untuk tanggal tersebut ({$formattedDate}) sudah ditutup oleh Proses Akhir Bulan."]
                    ]);
                }
            }

            // 2. Rekalkulasi & Validasi Total di Sisi Backend (Price/Total Manipulation Protection)
            if ($blueprint->key !== 'period-ends' && is_subclass_of($blueprint->modelClass(), \App\Domain\Support\Models\OperationDocument::class)) {
                $itemKeys = [
                    'sales-invoices', 'sales-orders', 'sales-quotes', 'sales-deliveries', 'sales-returns',
                    'purchase-invoices', 'purchase-orders', 'purchase-returns', 'goods-receipts',
                    'inventory-adjustments', 'work-orders', 'material-additions', 'work-completions',
                    'stock-transfers', 'delivery-orders', 'asset-changes', 'asset-disposals', 'asset-moves',
                    'item-requests', 'price-adjustments',
                ];
                if (in_array($blueprint->key, $itemKeys) && isset($payload['lines']) && is_array($payload['lines'])) {
                    $subtotal = 0.0;
                    $discountTotal = 0.0;
                    $taxTotal = 0.0;

                    foreach ($payload['lines'] as &$line) {
                        $qty = (float)($line['quantity'] ?? 0.0);
                        $price = (float)($line['unit_price'] ?? 0.0);
                        $discount = (float)($line['discount_amount'] ?? 0.0);

                        $lineTotal = max(0.0, ($qty * $price) - $discount);
                        $line['total_amount'] = $lineTotal;

                        $subtotal += $lineTotal;
                        $discountTotal += $discount;
                    }
                    unset($line);

                    $taxId = $payload['tax_id'] ?? null;
                    if ($taxId) {
                        $taxTotal = max(0.0, ($subtotal - $discountTotal) * 0.1);
                    }

                    $totalAmount = max(0.0, $subtotal - $discountTotal + $taxTotal);

                    $payload['subtotal'] = $subtotal;
                    $payload['discount_total'] = $discountTotal;
                    $payload['tax_total'] = $taxTotal;
                    $payload['total_amount'] = $totalAmount;
                }
            }

            // Validasi logika bisnis
            if ($blueprint->key === 'general-journals') {
                $lines = $payload['lines'] ?? [];
                $totalDebit = 0;
                $totalCredit = 0;
                foreach ($lines as $line) {
                    $totalDebit += (float) ($line['debit_amount'] ?? 0);
                    $totalCredit += (float) ($line['credit_amount'] ?? 0);
                }
                if (abs($totalDebit - $totalCredit) > 0.001) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'lines' => ['Total Debet harus sama dengan Total Kredit (Jurnal Umum harus seimbang / balance).']
                    ]);
                }
            }

            if ($blueprint->key === 'sales-invoices') {
                $warehouseId = $payload['warehouse_id'] ?? null;
                if ($warehouseId) {
                    $lines = $payload['lines'] ?? [];
                    foreach ($lines as $index => $line) {
                        $productId = $line['product_id'] ?? null;
                        $qtyRequested = (float) ($line['quantity'] ?? 0);
                        if ($productId && $qtyRequested > 0) {
                            $stockMap = app(\App\Support\Backend\Queries\InventoryInquiryQueryService::class)->paginateItemLocations([
                                'product_id' => $productId,
                                'warehouse_id' => $warehouseId,
                                'per_page' => 1,
                            ]);
                            
                            $qtyAvailable = 0.0;
                            if (count($stockMap->items()) > 0) {
                                $item = $stockMap->items()[0];
                                $qtyAvailable = (float) ($item['saleable_stock'] ?? 0.0);
                            }
                            
                            if ($qtyRequested > $qtyAvailable) {
                                $productName = DB::table('products')->where('id', $productId)->value('name') ?? 'Barang';
                                throw \Illuminate\Validation\ValidationException::withMessages([
                                    "lines.{$index}.quantity" => ["Stok tidak mencukupi untuk {$productName}. Stok tersedia: {$qtyAvailable}, diminta: {$qtyRequested}."]
                                ]);
                            }
                        }
                    }
                }
            }

            // Validasi lampiran wajib
            $blueprintToPreferenceMap = [
                'sales-quotes' => 'attachments-sales-quote',
                'sales-orders' => 'attachments-sales-order',
                'sales-deliveries' => 'attachments-sales-delivery',
                'sales-invoices' => 'attachments-sales-invoice',
                'sales-receipts' => 'attachments-sales-receipt',
                'sales-returns' => 'attachments-sales-return',
                'price-adjustments' => 'attachments-sales-discount',
                'purchase-orders' => 'attachments-purchase-order',
                'goods-receipts' => 'attachments-purchase-receipt',
                'purchase-invoices' => 'attachments-purchase-invoice',
                'purchase-payments' => 'attachments-purchase-payment',
                'purchase-returns' => 'attachments-purchase-return',
                'supplier-prices' => 'attachments-purchase-price',
                'item-requests' => 'attachments-inventory-request',
                'stock-transfers' => 'attachments-inventory-transfer',
                'inventory-adjustments' => 'attachments-inventory-adjustment',
                'work-orders' => 'attachments-inventory-job-order',
                'material-additions' => 'attachments-inventory-material-addition',
                'work-completions' => 'attachments-inventory-job-completion',
                'stock-opname-orders' => 'attachments-inventory-stock-opname-request',
                'stock-opname-results' => 'attachments-inventory-stock-opname-result',
                'expense-entries' => 'attachments-other-expense-record',
                'payroll-entries' => 'attachments-other-salary-record',
                'general-journals' => 'attachments-other-general-journal',
                'cash-payments' => 'attachments-other-payment',
                'cash-receipts' => 'attachments-other-receipt',
                'bank-transfers' => 'attachments-other-bank-transfer',
                'fixed-assets' => 'attachments-other-fixed-asset',
                'asset-changes' => 'attachments-other-fixed-asset-change',
                'asset-disposals' => 'attachments-other-fixed-asset-disposal',
                'asset-moves' => 'attachments-other-fixed-asset-transfer',
            ];

            $prefKey = $blueprintToPreferenceMap[$blueprint->key] ?? null;
            if ($prefKey && \Illuminate\Support\Facades\Schema::hasTable('preference_settings')) {
                $setting = DB::table('preference_settings')
                    ->where('setting_key', $prefKey)
                    ->first();

                $isEnabled = false;
                if ($setting !== null) {
                    $decoded = json_decode($setting->value, true);
                    $isEnabled = $decoded === 'true' || $decoded === true || $decoded === '1' || $decoded === 1;
                }

                if ($isEnabled) {
                    $hasAttachmentsInPayload = !empty($payload['attachment_ids']);
                    $hasExistingAttachments = false;
                    if ($record->exists) {
                        $hasExistingAttachments = DB::table('attachments')
                            ->where('attachable_type', get_class($record))
                            ->where('attachable_id', $record->getKey())
                            ->exists();
                    }
                    if (!$hasAttachmentsInPayload && !$hasExistingAttachments) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'attachments' => ["Lampiran wajib disertakan untuk transaksi {$blueprint->label} sesuai pengaturan preferensi."]
                        ]);
                    }
                }
            }

            $before = $record->exists ? $this->activityLogger->snapshot($record) : null;

            // Kembalikan costing lama
            $costingKeys = [
                'goods-receipts',
                'sales-deliveries',
                'sales-returns',
                'purchase-returns',
                'inventory-adjustments',
                'work-completions',
                'material-additions',
                'stock-transfers',
                'stock-opname-results',
            ];
            $wasExisting = $record->exists;
            if ($wasExisting && in_array($blueprint->key, $costingKeys)) {
                $this->revertCosting($record);
            }

            if ($blueprint->key === 'accounts') {
                $autoCode = filter_var($payload['auto_code'] ?? true, FILTER_VALIDATE_BOOLEAN);
                $payload['auto_code'] = $autoCode;
                if ($autoCode) {
                    if (!empty($payload['parent_id'])) {
                        $parent = \App\Domain\Finance\Models\Account::find($payload['parent_id']);
                        if ($parent) {
                            $parentCode = (string) preg_replace('/[^0-9]/', '', $parent->code);
                            $needsGeneration = !$record->exists 
                                || $record->parent_id != $payload['parent_id'] 
                                || empty($record->code);

                            if ($needsGeneration) {
                                $existingChildren = \App\Domain\Finance\Models\Account::where('parent_id', $parent->id)->get();
                                $index = count($existingChildren) + 1;
                                do {
                                    $suffix = str_pad($index, 2, '0', STR_PAD_LEFT);
                                    $generatedCode = $parentCode . $suffix;
                                    $index++;
                                } while (\App\Domain\Finance\Models\Account::where('code', $generatedCode)->exists());

                                $payload['code'] = $generatedCode;
                            } else {
                                $payload['code'] = $record->code;
                            }
                        }
                    } else {
                        $needsGeneration = !$record->exists 
                            || empty($record->code)
                            || (isset($payload['account_type']) && $record->account_type != $payload['account_type']);

                        if ($needsGeneration) {
                            $type = $payload['account_type'] ?? 'Cash/Bank';
                             $typePrefixMap = [
                                'Cash/Bank' => '11',
                                'Receivable' => '11',
                                'Inventory' => '11',
                                'Other Current Asset' => '11',
                                'Fixed Asset' => '12',
                                'Accumulated Depreciation' => '12',
                                'Other Asset' => '13',
                                'Payable' => '21',
                                'Other Current Liability' => '21',
                                'Long Term Liability' => '22',
                                'Equity' => '31',
                                'Revenue' => '41',
                                'Cost of Sales' => '51',
                                'Expense' => '61',
                                'Other Expense' => '71',
                                'Other Revenue' => '81',
                            ];
                            $prefix = $typePrefixMap[$type] ?? '99';
                            
                            $index = 1;
                            do {
                                $seqNum = str_pad($index, 2, '0', STR_PAD_LEFT);
                                $generatedCode = "{$prefix}{$seqNum}";
                                $index++;
                            } while (\App\Domain\Finance\Models\Account::where('code', $generatedCode)->exists());

                            $payload['code'] = $generatedCode;
                        } else {
                            $payload['code'] = $record->code;
                        }
                    }
                }
            }

            $record->fill(Arr::only($payload, $record->getFillable()));
            $record->save();

            $blueprint->sync($record, $payload);

            // Terapkan costing baru
            if (in_array($blueprint->key, $costingKeys)) {
                $this->applyCosting($record);
            }

            if (array_key_exists('attachment_ids', $payload) && method_exists($record, 'attachments')) {
                $attachmentIds = $payload['attachment_ids'] ?? [];

                \App\Domain\Support\Models\Attachment::whereIn('id', $attachmentIds)
                    ->update([
                        'attachable_type' => get_class($record),
                        'attachable_id' => $record->getKey(),
                    ]);

                $record->attachments()
                    ->whereNotIn('id', $attachmentIds)
                    ->get()
                    ->each(function ($attachment): void {
                        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($attachment->file_path)) {
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
                        }
                        $attachment->delete();
                    });
            }

            $freshRecord = $record->fresh($blueprint->with) ?? $record;

            $this->activityLogger->logMutation(
                $blueprint,
                $record->wasRecentlyCreated ? 'create' : 'update',
                $freshRecord,
                $before,
                $this->activityLogger->snapshot($freshRecord),
            );

            // Invalidate dashboard caches on mutation
            $this->invalidateDashboardCache();

            return $freshRecord;
        });
    }

    /**
     * Batalkan costing dokumen.
     */
    protected function revertCosting(Model $record): void
    {
        $costingService = app(\App\Domain\Inventory\Services\InventoryCostingService::class);

        if (!method_exists($record, 'lines')) {
            return;
        }

        $lines = $record->lines()->get();

        foreach ($lines as $line) {
            $sourceType = get_class($record);
            $sourceLineId = $line->id;

            // Kembalikan batch masuk jika ada
            $costingService->revertStockEntry($sourceType, $sourceLineId);

            // Kembalikan konsumsi keluar jika ada
            $attributes = is_string($line->attributes) ? json_decode($line->attributes, true) : ($line->attributes ?? []);
            if (!empty($attributes['consumed_batches'])) {
                $costingService->revertStockConsumption($attributes['consumed_batches']);
            }
        }
    }

    /**
     * Terapkan costing untuk baris dokumen.
     */
    protected function applyCosting(Model $record): void
    {
        $status = strtolower((string) ($record->status ?? ''));
        if (in_array($status, ['void', 'cancelled'])) {
            return;
        }

        if (!method_exists($record, 'lines')) {
            return;
        }

        $costingService = app(\App\Domain\Inventory\Services\InventoryCostingService::class);
        $sourceType = get_class($record);
        $sourceId = $record->id;

        $docType = $record->document_type ?? null;
        if (isset($record->entry_date)) {
            $entryDate = \Carbon\Carbon::parse($record->entry_date);
        } elseif (isset($record->document_date)) {
            $entryDate = \Carbon\Carbon::parse($record->document_date);
        } else {
            $entryDate = now();
        }

        $lines = $record->lines()->get();

        foreach ($lines as $line) {
            $productId = $line->product_id;
            if (!$productId) {
                continue;
            }

            $sourceLineId = $line->id;

            // Cari gudang
            $warehouseId = null;
            if (isset($line->warehouse_id) && $line->warehouse_id) {
                $warehouseId = $line->warehouse_id;
            } elseif (isset($record->warehouse_id) && $record->warehouse_id) {
                $warehouseId = $record->warehouse_id;
            }

            if ($record instanceof \App\Domain\Support\Models\OperationDocument) {
                if ($docType === 'goods_receipt' || $docType === 'sales_return' || $docType === 'work_completion') {
                    if ($warehouseId) {
                        $this->recordEntryHelper(
                            $costingService,
                            $sourceType,
                            $sourceId,
                            $sourceLineId,
                            $productId,
                            $warehouseId,
                            (float) $line->quantity,
                            (float) ($line->unit_price ?? 0),
                            $entryDate
                        );
                    }
                } elseif ($docType === 'sales_delivery' || $docType === 'purchase_return' || $docType === 'material_addition') {
                    if ($warehouseId) {
                        $this->consumeStockHelper(
                            $costingService,
                            $line,
                            $productId,
                            $warehouseId,
                            (float) $line->quantity,
                            $entryDate
                        );
                    }
                } elseif ($docType === 'inventory_adjustment') {
                    if ($warehouseId) {
                        $qty = (float) $line->quantity;
                        if ($qty > 0) {
                            $this->recordEntryHelper(
                                $costingService,
                                $sourceType,
                                $sourceId,
                                $sourceLineId,
                                $productId,
                                $warehouseId,
                                $qty,
                                (float) ($line->unit_price ?? 0),
                                $entryDate
                            );
                        } elseif ($qty < 0) {
                            $this->consumeStockHelper(
                                $costingService,
                                $line,
                                $productId,
                                $warehouseId,
                                abs($qty),
                                $entryDate
                            );
                        }
                    }
                }
            } elseif ($record instanceof \App\Domain\Inventory\Models\InventoryDocument) {
                if ($docType === 'stock_transfer') {
                    $fromWarehouseId = $record->warehouse_id;
                    $toWarehouseId = $record->counterpart_warehouse_id;
                    $qty = (float) $line->quantity;

                    if ($fromWarehouseId && $toWarehouseId && $qty > 0) {
                        $consumeResult = $this->consumeStockHelper(
                            $costingService,
                            $line,
                            $productId,
                            $fromWarehouseId,
                            $qty,
                            $entryDate
                        );

                        $unitCost = 0.0;
                        if ($qty > 0) {
                            $unitCost = $consumeResult['total_cost'] / $qty;
                        }
                        $this->recordEntryHelper(
                            $costingService,
                            $sourceType,
                            $sourceId,
                            $sourceLineId,
                            $productId,
                            $toWarehouseId,
                            $qty,
                            $unitCost,
                            $entryDate
                        );
                    }
                } elseif ($docType === 'stock_opname_result') {
                    $qtyDiff = (float) ($line->counted_quantity ?? 0) - (float) ($line->system_quantity ?? 0);
                    if ($qtyDiff > 0) {
                        $this->recordEntryHelper(
                            $costingService,
                            $sourceType,
                            $sourceId,
                            $sourceLineId,
                            $productId,
                            $warehouseId,
                            $qtyDiff,
                            0.0,
                            $entryDate
                        );
                    } elseif ($qtyDiff < 0) {
                        $this->consumeStockHelper(
                            $costingService,
                            $line,
                            $productId,
                            $warehouseId,
                            abs($qtyDiff),
                            $entryDate
                        );
                    }
                }
            }
        }
    }

    /**
     * Catat penambahan stok.
     */
    protected function recordEntryHelper(
        \App\Domain\Inventory\Services\InventoryCostingService $costingService,
        string $sourceType,
        int $sourceId,
        int $sourceLineId,
        int $productId,
        int $warehouseId,
        float $qty,
        float $unitCost,
        \Carbon\Carbon $entryDate
    ): void {
        if ($unitCost <= 0) {
            $unitCost = $this->resolveProductCost($productId);
        }
        $costingService->recordStockEntry(
            $sourceType,
            $sourceId,
            $sourceLineId,
            $productId,
            $warehouseId,
            $qty,
            $unitCost,
            $entryDate
        );
    }

    /**
     * Catat konsumsi stok.
     */
    protected function consumeStockHelper(
        \App\Domain\Inventory\Services\InventoryCostingService $costingService,
        Model $line,
        int $productId,
        int $warehouseId,
        float $qty,
        \Carbon\Carbon $entryDate
    ): array {
        $result = $costingService->consumeStock($productId, $warehouseId, $qty, $entryDate);

        $attributes = is_string($line->attributes) ? json_decode($line->attributes, true) : ($line->attributes ?? []);
        $attributes['consumed_batches'] = $result['consumptions'];
        $attributes['cogs'] = $result['total_cost'];
        $line->attributes = $attributes;
        $line->saveQuietly();

        return $result;
    }

    /**
     * Ambil fallback harga produk.
     */
    protected function resolveProductCost(int $productId): float
    {
        $product = \App\Domain\Catalog\Models\Product::find($productId);
        return $product ? (float) ($product->default_purchase_price ?? 0) : 0.0;
    }

    /**
     * Memeriksa apakah periode tanggal yang diberikan sudah ditutup.
     */
    protected function isPeriodClosed(mixed $date): bool
    {
        if (empty($date)) {
            return false;
        }

        try {
            $dt = \Carbon\Carbon::parse($date);
            $year = (string) $dt->format('Y');
            $monthNum = (int) $dt->format('n');

            $monthsMap = [
                1 => 'Januari',
                2 => 'Februari',
                3 => 'Maret',
                4 => 'April',
                5 => 'Mei',
                6 => 'Juni',
                7 => 'Juli',
                8 => 'Agustus',
                9 => 'September',
                10 => 'Oktober',
                11 => 'November',
                12 => 'Desember',
            ];

            $monthName = $monthsMap[$monthNum] ?? '';
            if (empty($monthName)) {
                return false;
            }

            return DB::table('operation_documents')
                ->where('document_type', 'period_end')
                ->where('metadata->month', $monthName)
                ->where('metadata->year', $year)
                ->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Hapus seluruh cache widget dashboard.
     */
    protected function invalidateDashboardCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('dashboard_widgets_retail');
        \Illuminate\Support\Facades\Cache::forget('dashboard_widgets_trade-portal');
        \Illuminate\Support\Facades\Cache::forget('dashboard_widgets_manufacture');
    }
}
