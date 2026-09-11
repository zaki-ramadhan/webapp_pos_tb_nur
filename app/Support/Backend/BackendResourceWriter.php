<?php

namespace App\Support\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BackendResourceWriter
{
    use \App\Support\Backend\Traits\InventoryCostingWriterTrait;

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

        $saved = $this->persist($blueprint, $record, $payload);
        $this->notifyResourceChanged($blueprint->key, 'created', $saved->id ?? null);

        return $saved;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function update(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        if ($record instanceof \App\Domain\Finance\Models\Account) {
            $origBal = (float) ($record->opening_balance ?? 0);
            $newBal = array_key_exists('opening_balance', $payload) ? (float) ($payload['opening_balance'] ?? 0) : $origBal;
            $origDate = $record->opening_balance_date ? \Carbon\Carbon::parse($record->opening_balance_date)->format('Y-m-d') : null;
            $newDate = array_key_exists('opening_balance_date', $payload) && !empty($payload['opening_balance_date']) ? \Carbon\Carbon::parse($payload['opening_balance_date'])->format('Y-m-d') : $origDate;

            if (abs($origBal - $newBal) > 0.001 || $origDate !== $newDate) {
                $journal = \App\Support\Backend\Definitions\FinanceBackendResources::findOpeningBalanceJournal($record);
                if ($journal && $journal->is_closed) {
                    $docNumber = $journal->document_number ?: 'Saldo Awal';
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'opening_balance' => ["Jurnal Umum {$docNumber} Tidak dapat diubah/dihapus, karena sudah dicocokkan dengan rekening koran!"]
                    ]);
                }
            }
        }

        $saved = $this->persist($blueprint, $record, $payload);
        $this->notifyResourceChanged($blueprint->key, 'updated', $saved->id ?? null);

        return $saved;
    }

    public function delete(BackendResourceBlueprint $blueprint, Model $record): void
    {
        DB::transaction(function () use ($blueprint, $record): void {
            if ($record instanceof \App\Domain\Finance\Models\Account) {
                $journal = \App\Support\Backend\Definitions\FinanceBackendResources::findOpeningBalanceJournal($record);
                if ($journal && $journal->is_closed) {
                    $docNumber = $journal->document_number ?: 'Saldo Awal';
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'opening_balance' => ["Jurnal Umum {$docNumber} Tidak dapat diubah/dihapus, karena sudah dicocokkan dengan rekening koran!"]
                    ]);
                }
            }

            if ($blueprint->key !== 'period-ends' && $record instanceof \App\Domain\Support\Models\OperationDocument) {
                if ($record->is_closed) {
                    $docNumber = $record->document_number ?: '-';
                    $label = $record->document_type === 'general_journal' ? 'Jurnal Umum' : 'Transaksi';
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'document_number' => ["{$label} {$docNumber} Tidak dapat diubah/dihapus, karena sudah dicocokkan dengan rekening koran!"]
                    ]);
                }

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

            $deletedRelatedDocId = null;
            if ($blueprint->key === 'cash-payments' && $record->related_document_id) {
                $deletedRelatedDocId = (int) $record->related_document_id;
            }

          // Hapus jurnal otomatis terkait jika ada

            \App\Domain\Support\Models\OperationDocument::where('document_type', 'general_journal')
                ->where('related_document_id', $record->id)
                ->delete();

            $oldDocs = [];
            if (in_array($blueprint->key, ['sales-receipts', 'purchase-payments']) && method_exists($record, 'lines')) {
                $oldDocs = $record->lines()->pluck('reference_code')->filter()->unique()->toArray();
            }

            $oldDepositIds = [];
            if ($blueprint->key === 'sales-invoices' && $record->metadata && isset($record->metadata['advance_payments'])) {
                foreach ($record->metadata['advance_payments'] as $adv) {
                    if (isset($adv['__depositId'])) {
                        $oldDepositIds[] = (int) $adv['__depositId'];
                    }
                }
            }

            $record->delete();

            if ($blueprint->key === 'sales-invoices' && !empty($oldDepositIds)) {
                $this->reconcileSalesDeposits($record, $oldDepositIds);
            }

            $this->activityLogger->logMutation(
                $blueprint,
                'delete',
                $record,
                $before,
                null,
            );

            if ($deletedRelatedDocId) {
                $this->reconcileExpenseOrPayrollPayment($deletedRelatedDocId);
            }

            // Reconcile payment status on delete
            $this->reconcilePayments($blueprint, $record, $oldDocs);

            // Invalidate dashboard caches on mutation
            $this->invalidateDashboardCache();

            $this->notifyResourceChanged($blueprint->key, 'deleted', $record->id ?? null);
        }, 3);
    }

    protected function persist(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        return DB::transaction(function () use ($blueprint, $record, $payload): Model {
            // 0. Auto-numbering sequential generation
            if (!$record->exists) {
                if (is_subclass_of($blueprint->modelClass(), \App\Domain\Support\Models\OperationDocument::class)) {
                    $docNumber = $payload['document_number'] ?? '';
                    if (empty($docNumber) || $this->isAutoGeneratedNumber($docNumber, $blueprint->key)) {
                        $payload['document_number'] = $this->generateNextSequentialNumber($blueprint->key, $payload['entry_date'] ?? null);
                    }
                    if (empty($payload['status'])) {
                        $payload['status'] = 'Selesai';
                    }
                    if ($blueprint->key === 'general-journals') {
                        $isDirect = empty($payload['reference_number'])
                            || ($payload['process_type'] ?? '') === 'general-journal'
                            || (($payload['metadata']['transaction_type_value'] ?? '') === 'general-journal');
                        if ($isDirect) {
                            $payload['reference_number'] = $payload['document_number'];
                            if (!isset($payload['metadata']) || !is_array($payload['metadata'])) {
                                $payload['metadata'] = [];
                            }
                            $payload['metadata']['transaction_number'] = $payload['document_number'];
                        }
                    }
                } elseif (in_array($blueprint->key, ['products', 'customers', 'suppliers'], true)) {
                    $code = $payload['code'] ?? '';
                    if (empty($code) || $this->isAutoGeneratedNumber($code, $blueprint->key)) {
                        $payload['code'] = $this->generateNextSequentialNumber($blueprint->key);
                    }
                }
            }

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

            // 1b. Validasi Dokumen Terekonsiliasi (Reconciliation Lock)
            if ($record->exists && $blueprint->key !== 'period-ends' && $record instanceof \App\Domain\Support\Models\OperationDocument && $record->is_closed) {
                $docNumber = $record->document_number ?: '-';
                $label = $record->document_type === 'general_journal' ? 'Jurnal Umum' : 'Transaksi';
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'document_number' => ["{$label} {$docNumber} Tidak dapat diubah/dihapus, karena sudah dicocokkan dengan rekening koran!"]
                ]);
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
                if (isset($payload['lines']) && is_array($payload['lines'])) {
                    foreach ($payload['lines'] as &$line) {
                        if (isset($line['payment_amount']) && (!isset($line['total_amount']) || (float)$line['total_amount'] === 0.0)) {
                            $line['total_amount'] = (float) $line['payment_amount'];
                        }
                    }
                    unset($line);
                }

                if (in_array($blueprint->key, $itemKeys) && isset($payload['lines']) && is_array($payload['lines'])) {
                    $grossSubtotal = 0.0;
                    $discountTotal = 0.0;
                    $taxTotal = 0.0;

                    foreach ($payload['lines'] as &$line) {
                        if (empty($line['product_id']) && !empty($line['reference_code'])) {
                            $line['product_id'] = \App\Domain\Catalog\Models\Product::where('code', $line['reference_code'])->value('id');
                        }
                        if (empty($line['product_id']) && !empty($line['description'])) {
                            $line['product_id'] = \App\Domain\Catalog\Models\Product::where('name', $line['description'])->value('id');
                        }
                        if (empty($line['unit_id']) && !empty($line['product_id'])) {
                            $prod = \App\Domain\Catalog\Models\Product::find($line['product_id']);
                            if ($prod) {
                                $line['unit_id'] = $prod->purchase_unit_id ?? $prod->base_unit_id;
                            }
                        }

                        $qty = (float)($line['quantity'] ?? 0.0);
                        $price = (float)($line['unit_price'] ?? 0.0);
                        $discount = (float)($line['discount_amount'] ?? 0.0);

                        $lineGross = max(0.0, $qty * $price);
                        $lineTotal = max(0.0, $lineGross - $discount);
                        $line['total_amount'] = $lineTotal;

                        $grossSubtotal += $lineGross;
                        $discountTotal += $discount;
                    }
                    unset($line);

                    $taxId = $payload['tax_id'] ?? null;
                    $taxRate = 0.0;
                    if ($taxId) {
                        $taxRecord = \App\Domain\Finance\Models\Tax::find($taxId);
                        $taxRate = $taxRecord ? ((float) $taxRecord->rate / 100.0) : 0.11;
                    }

                    $netTaxable = max(0.0, $grossSubtotal - $discountTotal);
                    $taxTotal = $taxId ? round($netTaxable * $taxRate, 2) : 0.0;
                    $totalAmount = max(0.0, $netTaxable + $taxTotal);

                    $payload['subtotal'] = $grossSubtotal;
                    $payload['discount_total'] = $discountTotal;
                    $payload['tax_total'] = $taxTotal;
                    $payload['total_amount'] = $totalAmount;
                }

                if (in_array($blueprint->key, ['sales-invoices', 'purchase-invoices'], true)) {
                    $totalVal = (float) ($payload['total_amount'] ?? 0.0);
                    $paidVal = (float) ($record->paid_amount ?? 0.0);
                    $outstandingVal = max(0.0, $totalVal - $paidVal);
                    $payload['paid_amount'] = $paidVal;
                    $payload['outstanding_amount'] = $outstandingVal;
                    $payload['status'] = $outstandingVal <= 0.01 ? 'Lunas' : 'Belum Lunas';
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

            // Validasi Anti-Overpayment (Nilai bayar tidak boleh melebihi sisa tagihan faktur)
            if (in_array($blueprint->key, ['sales-receipts', 'purchase-payments'], true) && !empty($payload['lines'])) {
                foreach ($payload['lines'] as $line) {
                    $refCode = trim($line['reference_code'] ?? '');
                    $payAmt = (float) ($line['total_amount'] ?? $line['payment_amount'] ?? 0);
                    if ($refCode !== '' && $payAmt > 0) {
                        $invDoc = \App\Domain\Support\Models\OperationDocument::where('document_number', $refCode)->lockForUpdate()->first();
                        if ($invDoc) {
                            $existingPaidQuery = DB::table('operation_document_lines')
                                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                                ->where('operation_document_lines.reference_code', $refCode)
                                ->whereIn('operation_documents.document_type', ['sales_receipt', 'purchase_payment', 'sales_return', 'purchase_return'])
                                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled']);

                            if ($record->exists) {
                                $existingPaidQuery->where('operation_documents.id', '!=', $record->id);
                            }
                            $otherPaid = (float) $existingPaidQuery->sum('operation_document_lines.total_amount');

                            $advanceTotal = 0.0;
                            if ($invDoc->metadata && isset($invDoc->metadata['advance_payments']) && is_array($invDoc->metadata['advance_payments'])) {
                                foreach ($invDoc->metadata['advance_payments'] as $adv) {
                                    $amt = $adv['amount'] ?? 0;
                                    if (is_string($amt)) {
                                        $amt = (float) preg_replace('/[^\d]/', '', $amt);
                                    }
                                    $advanceTotal += (float) $amt;
                                }
                            }

                            $maxPayable = max(0.0, (float) $invDoc->total_amount - ($otherPaid + $advanceTotal));
                            if ($payAmt > ($maxPayable + 1.0)) {
                                $docLabel = $blueprint->key === 'sales-receipts' ? 'Faktur Penjualan' : 'Faktur Pembelian';
                                throw \Illuminate\Validation\ValidationException::withMessages([
                                    'lines' => ["Nilai pembayaran untuk {$docLabel} [{$refCode}] (Rp " . number_format($payAmt, 0, ',', '.') . ") melebihi sisa tagihan yang belum lunas (Rp " . number_format($maxPayable, 0, ',', '.') . ")."]
                                ]);
                            }
                        }
                    }
                }
            }

            // Validasi Gudang Transfer Antar Gudang
            if ($blueprint->key === 'stock-transfers') {
                $fromWarehouseId = $payload['warehouse_id'] ?? null;
                $toWarehouseId = $payload['counterpart_warehouse_id'] ?? null;
                if ($fromWarehouseId && $toWarehouseId && (int) $fromWarehouseId === (int) $toWarehouseId) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'counterpart_warehouse_id' => ['Gudang tujuan transfer tidak boleh sama dengan gudang asal.']
                    ]);
                }
            }

            if ($blueprint->key === 'sales-invoices') {
                $advancePayments = $payload['metadata']['advance_payments'] ?? [];
                $totalAdvance = 0.0;
                foreach ($advancePayments as $adv) {
                    $amt = $adv['amount'] ?? 0;
                    if (is_string($amt)) {
                        $amt = (float) preg_replace('/[^\d]/', '', $amt);
                    }
                    $totalAdvance += (float) $amt;
                }

                $totalInvoice = (float) ($payload['total_amount'] ?? 0.0);
                if ($totalAdvance > $totalInvoice) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'advance_payments' => ["Total alokasi Uang Muka tidak boleh melebihi Total Faktur Penjualan (Total Uang Muka: Rp " . number_format($totalAdvance, 0, ',', '.') . ", Total Faktur: Rp " . number_format($totalInvoice, 0, ',', '.') . ")."]
                    ]);
                }

                $invoiceTaxId = $payload['tax_id'] ?? null;
                foreach ($advancePayments as $adv) {
                    $depositId = $adv['__depositId'] ?? null;
                    if ($depositId) {
                        $deposit = DB::table('operation_documents')->where('id', $depositId)->lockForUpdate()->first();
                        if ($deposit && !empty($deposit->tax_id ?? null) && !$invoiceTaxId) {
                            throw \Illuminate\Validation\ValidationException::withMessages([
                                'tax_id' => ["Uang Muka [{$deposit->document_number}] menggunakan PPN. Faktur Penjualan ini juga wajib menggunakan PPN."]
                            ]);
                        }
                    }
                }

                $ignoreStockWarning = filter_var($payload['metadata']['ignore_stock_warning'] ?? false, FILTER_VALIDATE_BOOLEAN);

                if (!$ignoreStockWarning) {
                    $warehouseId = $payload['warehouse_id'] ?? null;
                    if ($warehouseId) {
                        $lines = $payload['lines'] ?? [];
                        foreach ($lines as $index => $line) {
                            $productId = $line['product_id'] ?? null;
                            $qtyRequested = (float) ($line['quantity'] ?? 0);
                            if ($productId && $qtyRequested > 0) {
                                DB::table('products')->where('id', $productId)->lockForUpdate()->first();

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
                                    $warehouseName = DB::table('warehouses')->where('id', $warehouseId)->value('name') ?? 'Utama';
                                    throw \Illuminate\Validation\ValidationException::withMessages([
                                        'stock_warning' => [
                                            'product_name' => $productName,
                                            'warehouse_name' => $warehouseName,
                                        ]
                                    ]);
                                }
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
                                $existingChildren = \App\Domain\Finance\Models\Account::where('parent_id', $parent->id)
                                    ->when($record->exists, fn ($q) => $q->where('id', '!=', $record->id))
                                    ->get();
                                $index = count($existingChildren) + 1;
                                do {
                                    $suffix = str_pad($index, 2, '0', STR_PAD_LEFT);
                                    $generatedCode = $parentCode . $suffix;
                                    $index++;
                                } while (\App\Domain\Finance\Models\Account::where('code', $generatedCode)->where('id', '!=', $record->id ?? 0)->exists());

                                $payload['code'] = $generatedCode;
                            } else {
                                $payload['code'] = $record->code;
                            }
                        }
                    } else {
                        $needsGeneration = !$record->exists 
                            || empty($record->code)
                            || !empty($record->parent_id)
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
                            } while (\App\Domain\Finance\Models\Account::where('code', $generatedCode)->where('id', '!=', $record->id ?? 0)->exists());

                            $payload['code'] = $generatedCode;
                        } else {
                            $payload['code'] = $record->code;
                        }
                    }
                }
            }

            if (isset($payload['lines']) && is_array($payload['lines'])) {
                foreach ($payload['lines'] as &$line) {
                    if (empty($line['account_id']) && !empty($line['reference_code'])) {
                        $code = trim($line['reference_code']);
                        $accId = \App\Domain\Finance\Models\Account::where('code', $code)->value('id');
                        if ($accId) {
                            $line['account_id'] = $accId;
                        }
                    }
                }
                unset($line);
            }

            if ($blueprint->key === 'general-journals') {
                $docNum = $payload['document_number'] ?? $record->document_number ?? '';
                $isDirect = empty($payload['reference_number'])
                    || ($payload['process_type'] ?? '') === 'general-journal'
                    || (($payload['metadata']['transaction_type_value'] ?? '') === 'general-journal');

                if ($isDirect) {
                    if (empty($payload['reference_number'])) {
                        $payload['reference_number'] = $docNum;
                    }
                    if (!isset($payload['metadata']) || !is_array($payload['metadata'])) {
                        $payload['metadata'] = $record->metadata ?? [];
                    }
                    if (empty($payload['metadata']['transaction_number'])) {
                        $payload['metadata']['transaction_number'] = $payload['reference_number'];
                    }
                }
            }

            $record->fill(Arr::only($payload, $record->getFillable()));
            $record->save();

            if ($blueprint->key === 'accounts' && $record instanceof \App\Domain\Finance\Models\Account && $record->wasChanged('code')) {
                $this->syncChildAccountCodes($record);
            }

            $oldDocs = [];
            if ($record->exists && in_array($blueprint->key, ['sales-receipts', 'purchase-payments']) && method_exists($record, 'lines')) {
                $oldDocs = $record->lines()->pluck('reference_code')->filter()->unique()->toArray();
            }

            $blueprint->sync($record, $payload);

            if ($blueprint->key === 'sales-invoices') {
                $rawMetadata = $record->getOriginal('metadata');
                $oldMetadata = is_string($rawMetadata) ? json_decode($rawMetadata, true) : ($rawMetadata ?? []);
                $oldDepositIds = [];
                if (isset($oldMetadata['advance_payments'])) {
                    foreach ($oldMetadata['advance_payments'] as $adv) {
                        if (isset($adv['__depositId'])) {
                            $oldDepositIds[] = (int) $adv['__depositId'];
                        }
                    }
                }
                $this->reconcileSalesDeposits($record, $oldDepositIds);
            }

            if ($blueprint->key === 'cash-payments') {
                $originalRelatedId = $wasExisting ? $record->getOriginal('related_document_id') : null;
                $currentRelatedId = $record->related_document_id;

                if ($originalRelatedId && $originalRelatedId != $currentRelatedId) {
                    $this->reconcileExpenseOrPayrollPayment((int) $originalRelatedId);
                }
                if ($currentRelatedId) {
                    $this->reconcileExpenseOrPayrollPayment((int) $currentRelatedId);
                }
            }

          // Terapkan costing baru

            if (in_array($blueprint->key, $costingKeys)) {
                $this->applyCosting($record);
            }

            if (array_key_exists('attachment_ids', $payload) && method_exists($record, 'attachments')) {
                $attachmentIds = $payload['attachment_ids'] ?? [];

                \App\Domain\Support\Models\Attachment::whereIn('id', $attachmentIds)
                    ->where(function ($q) use ($record) {
                        $q->whereNull('attachable_id')
                          ->orWhere(function ($sub) use ($record) {
                              $sub->where('attachable_type', get_class($record))
                                  ->where('attachable_id', $record->getKey());
                          });
                    })
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

            // Post to Jurnal Umum
            $this->postToGeneralJournal($freshRecord);

            // Reconcile payment status
            $this->reconcilePayments($blueprint, $freshRecord, $oldDocs);

            // Invalidate dashboard caches on mutation
            $this->invalidateDashboardCache();

            return $freshRecord;
        }, 3);
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
        \Illuminate\Support\Facades\Cache::flush();
    }

    /**
     * Cek apakah nomor dokumen adalah nomor otomatis (generated/draft/placeholder).
     */
    protected function isAutoGeneratedNumber(string $number, string $resourceKey): bool
    {
        $number = trim($number);
        if ($number === '' || in_array(strtolower($number), ['auto', 'draft', 'default', 'trx-default', 'undefined', 'null'], true)) {
            return true;
        }

        // Teks placeholder nama modul form (misal: "Penyesuaian Persediaan", "Faktur Penjualan")
        if (preg_match('/penyesuaian|faktur|pembayaran|pesanan|penawaran|pengeluaran|penerimaan|transfer|jurnal|retur|beban|gaji|permintaan|perintah|formula/i', $number)) {
            return true;
        }

        // Format epoch timestamp: PREFIX.YYYY.MM.DD.1786797889961 atau PREFIX.YYYY.MM.1786797889961
        if (preg_match('/^[A-Z]+(\.[A-Z]+)?\.\d{4}(\.\d{2}){1,2}\.\d{5,}$/', $number)) {
            return true;
        }

        // Format titik lama: PREFIX.YYYY.MM.DD.HHMMSS (dengan DD)
        if (preg_match('/^[A-Z]+(\.[A-Z]+)?\.\d{4}\.\d{2}\.\d{2}\.\d+$/', $number)) {
            return true;
        }

        // Format titik frontend: PREFIX.YYYY.MM.HHMMSS (6+ digit waktu/timestamp)
        if (preg_match('/^[A-Z]+(\.[A-Z]+)?\.\d{4}\.\d{2}\.\d{5,}$/', $number)) {
            return true;
        }

        // Format strip baru: PREFIX-YYYYMMDD-HHMMSS
        if (preg_match('/^[A-Z]+(\.[A-Z]+)?-\d{8}-\d+$/', $number)) {
            return true;
        }

        if (in_array($resourceKey, ['customers', 'suppliers'], true)) {
            return empty($number) || strtolower($number) === 'auto';
        }

        return false;
    }

    /**
     * Generate nomor dokumen sekuensial urut ala Accurate (PREFIX.YYYY.MM.0001).
     */
    public function generateNextSequentialNumber(string $resourceKey, ?string $entryDate = null): string
    {
        $prefixes = [
            'sales-quotes' => 'PN',        // Penawaran Penjualan
            'sales-orders' => 'SO',        // Pesanan Penjualan
            'sales-deliveries' => 'SJ',    // Surat Jalan
            'sales-invoices' => 'FP',      // Faktur Penjualan
            'sales-returns' => 'RJ',       // Retur Penjualan
            'purchase-orders' => 'PO',     // Pesanan Pembelian
            'goods-receipts' => 'PB',      // Penerimaan Barang Supplier
            'purchase-invoices' => 'FB',   // Faktur Pembelian
            'purchase-returns' => 'RB',    // Retur Pembelian
            'payroll-entries' => 'GJ',     // Penggajian / Gaji
            'expense-entries' => 'BB',     // Beban Operasional
            'general-journals' => 'JU',    // Jurnal Umum
            'cash-payments' => 'KK',       // Kas Keluar
            'cash-receipts' => 'KM',       // Kas Masuk
            'bank-transfers' => 'TB',      // Transfer Bank
            'stock-transfers' => 'TP',     // Transfer Persediaan
            'sales-deposits' => 'UM',      // Uang Muka Penjualan
            'purchase-payments' => 'BYB',  // Bayar Pembelian Supplier
            'purchase-deposits' => 'UMP',  // Uang Muka Pembelian
            'sales-receipts' => 'KW',      // Kuitansi / Terima Penjualan
            'item-requests' => 'PBG',      // Permintaan Barang
            'inventory-adjustments' => 'PS', // Penyesuaian Stok
            'price-adjustments' => 'PH',   // Penyesuaian Harga
            'work-orders' => 'SPK',        // Surat Perintah Kerja
            'material-additions' => 'FPB', // Formula / Penambahan Bahan
            'work-completions' => 'SPP',   // Penyelesaian Pesanan
            'asset-changes' => 'PAA',      // Perubahan Aset
            'asset-disposals' => 'PDA',    // Penghentian Aset
            'asset-moves' => 'PMA',        // Pemindahan Aset
            'products' => 'BRG',           // Kode Barang
            'customers' => 'CUST',         // Kode Pelanggan
            'suppliers' => 'SUPP',         // Kode Pemasok
        ];

        $prefix = $prefixes[$resourceKey] ?? 'DOC';
        
        $date = $entryDate ? \Carbon\Carbon::parse($entryDate) : now();
        $year = $date->format('Y');
        $month = $date->format('m');
        
        $targetTable = match ($resourceKey) {
            'products' => 'products',
            'customers' => 'customers',
            'suppliers' => 'suppliers',
            default => 'operation_documents',
        };
        $targetColumn = in_array($resourceKey, ['products', 'customers', 'suppliers'], true) ? 'code' : 'document_number';

        if (in_array($resourceKey, ['customers', 'suppliers'], true)) {
            $latest = DB::table($targetTable)
                ->where($targetColumn, 'like', "{$prefix}-%")
                ->lockForUpdate()
                ->orderBy('id', 'desc')
                ->get()
                ->first(function ($doc) use ($targetColumn) {
                    $val = $doc->{$targetColumn} ?? '';
                    $parts = explode('-', $val);
                    return count($parts) === 2 && is_numeric(end($parts));
                });

            $nextSeq = 1;
            if ($latest) {
                $parts = explode('-', $latest->{$targetColumn});
                $nextSeq = ((int) end($parts)) + 1;
            }

            do {
                $candidateNumber = sprintf('%s-%03d', $prefix, $nextSeq);
                $exists = DB::table($targetTable)->where($targetColumn, $candidateNumber)->exists();
                if ($exists) {
                    $nextSeq++;
                }
            } while ($exists);

            return $candidateNumber;
        }

        // Cari nomor terakhir di bulan dan tahun yang sama dengan lockForUpdate untuk mencegah bentrokan concurrency
        $latest = DB::table($targetTable)
            ->where($targetColumn, 'like', "{$prefix}.{$year}.{$month}.%")
            ->lockForUpdate()
            ->orderBy('id', 'desc')
            ->get()
            ->first(function ($doc) use ($targetColumn) {
                // Hanya ambil yang berformat PREFIX.YYYY.MM.0001 (4 bagian)
                $val = $doc->{$targetColumn} ?? '';
                $parts = explode('.', $val);
                return count($parts) === 4 && is_numeric(end($parts)) && strlen(end($parts)) <= 5;
            });

        $nextSeq = 1;
        if ($latest) {
            $val = $latest->{$targetColumn} ?? '';
            $parts = explode('.', $val);
            $lastPart = end($parts);
            if (is_numeric($lastPart)) {
                $nextSeq = ((int) $lastPart) + 1;
            }
        }

        do {
            $seqString = str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
            $candidateNumber = "{$prefix}.{$year}.{$month}.{$seqString}";
            $exists = DB::table($targetTable)->where($targetColumn, $candidateNumber)->exists();
            if ($exists) {
                $nextSeq++;
            }
        } while ($exists);

        return $candidateNumber;
    }

    /**
     * Dapatkan tipe dokumen berdasarkan key resource.
     */
    protected function getDocumentTypeFromResource(string $resourceKey): string
    {
        $map = [
            'sales-quotes' => 'sales_quote',
            'sales-orders' => 'sales_order',
            'sales-deliveries' => 'sales_delivery',
            'sales-invoices' => 'sales_invoice',
            'sales-returns' => 'sales_return',
            'purchase-orders' => 'purchase_order',
            'goods-receipts' => 'goods_receipt',
            'purchase-invoices' => 'purchase_invoice',
            'purchase-returns' => 'purchase_return',
            'payroll-entries' => 'payroll_entry',
            'expense-entries' => 'expense_entry',
            'general-journals' => 'general_journal',
            'cash-payments' => 'cash_payment',
            'cash-receipts' => 'cash_receipt',
            'bank-transfers' => 'bank_transfer',
            'sales-deposits' => 'sales_deposit',
            'purchase-payments' => 'purchase_payment',
            'sales-receipts' => 'sales_receipt',
            'item-requests' => 'item_request',
        ];
        return $map[$resourceKey] ?? str_replace('-', '_', rtrim($resourceKey, 's'));
    }

    /**
     * Posting otomatis transaksi ke Jurnal Umum.
     */
    public function postToGeneralJournal(Model $record): void
    {
        if (!($record instanceof \App\Domain\Support\Models\OperationDocument)) {
            return;
        }

        $postableTypes = [
            'expense_entry',
            'payroll_entry',
            'cash_payment',
            'cash_receipt',
            'bank_transfer',
            'sales_invoice',
            'purchase_invoice',
            'sales_receipt',
            'purchase_payment',
            'sales_return',
            'purchase_return',
            'sales_deposit',
        ];
        if (!in_array($record->document_type, $postableTypes)) {
            return;
        }

        $journal = \App\Domain\Support\Models\OperationDocument::where('document_type', 'general_journal')
            ->where('related_document_id', $record->id)
            ->first();

        if (!$journal) {
            $journal = new \App\Domain\Support\Models\OperationDocument();
            $journal->document_type = 'general_journal';
            $journal->related_document_id = $record->id;
        }

        $transactionLabels = [
            'expense_entry'    => 'Pencatatan Beban',
            'payroll_entry'    => 'Penggajian Karyawan',
            'cash_payment'     => 'Pembayaran Kas',
            'cash_receipt'     => 'Penerimaan Kas',
            'bank_transfer'    => 'Transfer Bank',
            'sales_invoice'    => 'Faktur Penjualan',
            'purchase_invoice' => 'Faktur Pembelian',
            'sales_receipt'    => 'Kuitansi Penjualan',
            'purchase_payment' => 'Bayar Pembelian',
            'sales_return'     => 'Retur Penjualan',
            'purchase_return'  => 'Retur Pembelian',
            'sales_deposit'    => 'Uang Muka Penjualan',
        ];

        $transactionValues = [
            'expense_entry'    => 'expense-entry',
            'payroll_entry'    => 'payroll-entry',
            'cash_payment'     => 'cash-payment',
            'cash_receipt'     => 'cash-receipt',
            'bank_transfer'    => 'bank-transfer',
            'sales_invoice'    => 'sales-invoice',
            'purchase_invoice' => 'purchase-invoice',
            'sales_receipt'    => 'sales-receipt',
            'purchase_payment' => 'purchase-payment',
            'sales_return'     => 'sales-return',
            'purchase_return'  => 'purchase-return',
            'sales_deposit'    => 'sales-deposit',
        ];

        $cleanNotes = trim((string) $record->notes);
        $cleanNotes = preg_replace('/^Posting otomatis dari\s*/i', '', $cleanNotes);
        if ($cleanNotes === '') {
            $label = $transactionLabels[$record->document_type] ?? 'Transaksi';
            $cleanNotes = $label . ' ' . $record->document_number;
        }

        $journal->branch_id       = $record->branch_id;
        if (!$journal->document_number) {
            $journal->document_number = $this->generateNextSequentialNumber('general-journals', $record->entry_date);
        }
        $journal->entry_date      = $record->entry_date;
        $journal->status          = 'Posted';
        $journal->notes           = $cleanNotes;
        $journal->total_amount    = $record->total_amount;

        $meta = is_array($journal->metadata) ? $journal->metadata : (json_decode($journal->metadata ?? '[]', true) ?: []);
        $meta['transaction_number'] = $record->document_number;
        $meta['transaction_type_label'] = $transactionLabels[$record->document_type] ?? 'Jurnal Umum';
        $meta['transaction_type_value'] = $transactionValues[$record->document_type] ?? 'general-journal';
        $journal->metadata = $meta;

        $journal->save();

        $lines      = [];
        $sortOrder  = 0;
        $docType    = $record->document_type;
        $recordLines = $record->lines ?? collect();

        if ($docType === 'expense_entry' || $docType === 'payroll_entry') {
            $defaultDebitAcc = ($docType === 'payroll_entry')
                ? (DB::table('accounts')->where('code', '610101')->value('id') ?? DB::table('accounts')->where('code', 'like', '6101%')->value('id'))
                : null;
            foreach ($recordLines as $line) {
                $lineAcc = $line->account_id ?: $defaultDebitAcc;
                if ($lineAcc && $line->total_amount > 0) {
                    $lines[] = ['account_id' => $lineAcc, 'description' => $line->description ?? ($docType === 'payroll_entry' ? 'Beban Gaji Karyawan' : 'Beban Operasional'), 'debit_amount' => $line->total_amount, 'credit_amount' => 0.00, 'total_amount' => $line->total_amount, 'sort_order' => $sortOrder++];
                }
            }
            $creditAcc = $record->primary_account_id
                ?? ($docType === 'payroll_entry' ? (DB::table('accounts')->where('code', '210201')->value('id') ?? DB::table('accounts')->where('code', 'like', '2102%')->value('id')) : null);
            if ($creditAcc && $record->total_amount > 0) {
                $lines[] = ['account_id' => $creditAcc, 'description' => 'Utang / Kewajiban', 'debit_amount' => 0.00, 'credit_amount' => $record->total_amount, 'total_amount' => $record->total_amount, 'sort_order' => $sortOrder++];
            }
        } elseif ($docType === 'cash_payment') {
            foreach ($recordLines as $line) {
                if ($line->account_id && $line->total_amount > 0) {
                    $lines[] = ['account_id' => $line->account_id, 'description' => $line->description ?? 'Pembayaran', 'debit_amount' => $line->total_amount, 'credit_amount' => 0.00, 'total_amount' => $line->total_amount, 'sort_order' => $sortOrder++];
                }
            }
            if ($record->primary_account_id) {
                $lines[] = ['account_id' => $record->primary_account_id, 'description' => 'Kas / Bank', 'debit_amount' => 0.00, 'credit_amount' => $record->total_amount, 'total_amount' => $record->total_amount, 'sort_order' => $sortOrder++];
            }
        } elseif ($docType === 'cash_receipt') {
            if ($record->primary_account_id) {
                $lines[] = ['account_id' => $record->primary_account_id, 'description' => 'Kas / Bank', 'debit_amount' => $record->total_amount, 'credit_amount' => 0.00, 'total_amount' => $record->total_amount, 'sort_order' => $sortOrder++];
            }
            foreach ($recordLines as $line) {
                if ($line->account_id && $line->total_amount > 0) {
                    $lines[] = ['account_id' => $line->account_id, 'description' => $line->description ?? 'Penerimaan', 'debit_amount' => 0.00, 'credit_amount' => $line->total_amount, 'total_amount' => $line->total_amount, 'sort_order' => $sortOrder++];
                }
            }
        } elseif ($docType === 'bank_transfer') {
            $transferFeeTotal = 0.0;
            foreach ($recordLines as $line) {
                if (($line->attributes['kind'] ?? '') === 'fee' && $line->account_id && $line->total_amount > 0) {
                    $feeAmt = (float) $line->total_amount;
                    $transferFeeTotal += $feeAmt;
                    $lines[] = [
                        'account_id' => $line->account_id,
                        'description' => $line->description ?? 'Biaya Transfer',
                        'debit_amount' => $feeAmt,
                        'credit_amount' => 0.00,
                        'total_amount' => $feeAmt,
                        'sort_order' => $sortOrder++
                    ];
                }
            }
            if ($record->secondary_account_id) {
                $lines[] = ['account_id' => $record->secondary_account_id, 'description' => 'Kas/Bank Penerima', 'debit_amount' => $record->total_amount, 'credit_amount' => 0.00, 'total_amount' => $record->total_amount, 'sort_order' => $sortOrder++];
            }
            if ($record->primary_account_id) {
                $totalSenderCredit = $record->total_amount + $transferFeeTotal;
                $lines[] = ['account_id' => $record->primary_account_id, 'description' => 'Kas/Bank Pengirim', 'debit_amount' => 0.00, 'credit_amount' => $totalSenderCredit, 'total_amount' => $totalSenderCredit, 'sort_order' => $sortOrder++];
            }
        } elseif ($docType === 'sales_invoice') {
            $piutangAcc = $record->primary_account_id
                ?? DB::table('accounts')->where('code', '110301')->value('id')
                ?? DB::table('accounts')->where('code', 'like', '1103%')->value('id');
            if ($piutangAcc && $record->total_amount > 0) {
                $lines[] = ['account_id' => $piutangAcc, 'description' => 'Piutang Penjualan', 'debit_amount' => $record->total_amount, 'credit_amount' => 0.00, 'total_amount' => $record->total_amount, 'sort_order' => $sortOrder++];
            }
            foreach ($recordLines as $line) {
                if ($line->total_amount > 0) {
                    $accId = optional($line->product)->sales_account_id
                        ?? optional(optional($line->product)->category)->sales_account_id
                        ?? DB::table('accounts')->where('code', 'like', '41%')->value('id');
                    if ($accId) {
                        $lines[] = ['account_id' => $accId, 'description' => 'Pendapatan - ' . (optional($line->product)->name ?? $line->description ?? 'Barang'), 'debit_amount' => 0.00, 'credit_amount' => $line->total_amount, 'total_amount' => $line->total_amount, 'sort_order' => $sortOrder++];
                    }
                }
            }
        } elseif ($docType === 'purchase_invoice') {
            $hutangAcc = $record->primary_account_id
                ?? DB::table('accounts')->where('code', '210101')->value('id')
                ?? DB::table('accounts')->where('code', 'like', '2101%')->value('id');
            if ($hutangAcc && $record->total_amount > 0) {
                $lines[] = ['account_id' => $hutangAcc, 'description' => 'Hutang Usaha', 'debit_amount' => 0.00, 'credit_amount' => $record->total_amount, 'total_amount' => $record->total_amount, 'sort_order' => $sortOrder++];
            }
            foreach ($recordLines as $line) {
                if ($line->total_amount > 0) {
                    $accId = optional($line->product)->inventory_account_id
                        ?? optional(optional($line->product)->category)->inventory_account_id
                        ?? DB::table('accounts')->where('code', 'like', '11%')->value('id');
                    if ($accId) {
                        $lines[] = ['account_id' => $accId, 'description' => 'Persediaan - ' . (optional($line->product)->name ?? $line->description ?? 'Barang'), 'debit_amount' => $line->total_amount, 'credit_amount' => 0.00, 'total_amount' => $line->total_amount, 'sort_order' => $sortOrder++];
                    }
                }
            }
        }

        $journal->lines()->delete();
        foreach ($lines as $line) {
            $journal->lines()->create($line);
        }
    }

    /**
     * Reconcile payment statuses of source documents.
     */
    protected function reconcilePayments(BackendResourceBlueprint $blueprint, Model $record, ?array $oldDocs = null): void
    {
        if (!in_array($blueprint->key, ['sales-receipts', 'purchase-payments', 'sales-returns', 'purchase-returns'], true)) {
            return;
        }

        $currentDocs = DB::table('operation_document_lines')
            ->where('operation_document_id', $record->id)
            ->pluck('reference_code')
            ->filter()
            ->unique()
            ->toArray();

        $allDocs = array_unique(array_merge($currentDocs, $oldDocs ?? []));
        if (empty($allDocs)) {
            return;
        }

        foreach ($allDocs as $docNum) {
            $sourceDoc = \App\Domain\Support\Models\OperationDocument::where('document_number', $docNum)->first();
            if (!$sourceDoc) {
                continue;
            }

            $totalPaid = (float) DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->where('operation_document_lines.reference_code', $docNum)
                ->whereIn('operation_documents.document_type', ['sales_receipt', 'purchase_payment', 'sales_return', 'purchase_return'])
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->sum('operation_document_lines.total_amount');

            $advanceTotal = 0.0;
            if ($sourceDoc->metadata && isset($sourceDoc->metadata['advance_payments']) && is_array($sourceDoc->metadata['advance_payments'])) {
                foreach ($sourceDoc->metadata['advance_payments'] as $adv) {
                    $amt = $adv['amount'] ?? 0;
                    if (is_string($amt)) {
                        $amt = (float) preg_replace('/[^\d]/', '', $amt);
                    }
                    $advanceTotal += (float) $amt;
                }
            }

            $totalPaidCombined = $totalPaid + $advanceTotal;
            $totalAmount = (float) $sourceDoc->total_amount;
            $outstanding = max(0.00, $totalAmount - $totalPaidCombined);
            $outstanding = round($outstanding, 2);

            $status = $outstanding <= 0.01 ? 'Lunas' : 'Belum Lunas';

            $sourceDoc->update([
                'paid_amount' => $totalPaidCombined,
                'outstanding_amount' => $outstanding,
                'status' => $status,
            ]);
        }
    }

    /**
     * Reconcile outstanding amount of used sales deposits.
     */
    protected function reconcileSalesDeposits(Model $record, ?array $oldDepositIds = null): void
    {
        $currentIds = [];
        if ($record->metadata && isset($record->metadata['advance_payments'])) {
            foreach ($record->metadata['advance_payments'] as $adv) {
                if (isset($adv['__depositId'])) {
                    $currentIds[] = (int) $adv['__depositId'];
                }
            }
        }
        
        $allIds = array_unique(array_merge($currentIds, $oldDepositIds ?? []));
        if (empty($allIds)) {
            return;
        }

        foreach ($allIds as $depositId) {
            $deposit = \App\Domain\Support\Models\OperationDocument::find($depositId);
            if (!$deposit) {
                continue;
            }

            $totalAllocated = 0.0;
            
          // Search all operation_documents of type 'sales_invoice' that are active

            $invoices = \App\Domain\Support\Models\OperationDocument::where('document_type', 'sales_invoice')
                ->where(function ($q) {
                    $q->whereNull('status')
                      ->orWhereNotIn('status', ['Void', 'Cancelled']);
                })
                ->get();

            foreach ($invoices as $invoice) {
                if ($invoice->metadata && isset($invoice->metadata['advance_payments'])) {
                    foreach ($invoice->metadata['advance_payments'] as $adv) {
                        if (isset($adv['__depositId']) && (int) $adv['__depositId'] === (int) $depositId) {
                            $amt = $adv['amount'] ?? 0;
                            if (is_string($amt)) {
                                $amt = (float) preg_replace('/[^\d]/', '', $amt);
                            }
                            $totalAllocated += (float) $amt;
                        }
                    }
                }
            }

            $totalAmount = (float) $deposit->total_amount;
            $outstanding = max(0.00, $totalAmount - $totalAllocated);
            $outstanding = round($outstanding, 2);

            $deposit->update([
                'paid_amount' => $totalAllocated,
                'outstanding_amount' => $outstanding,
            ]);
        }
    }

    /**
     * Reconcile payment status and outstanding amount for payroll entries and expense entries.
     */
    protected function reconcileExpenseOrPayrollPayment(?int $relatedDocumentId): void
    {
        if (!$relatedDocumentId) {
            return;
        }

        $relatedDoc = \App\Domain\Support\Models\OperationDocument::find($relatedDocumentId);
        if (!$relatedDoc || !in_array($relatedDoc->document_type, ['expense_entry', 'payroll_entry'], true)) {
            return;
        }

        $totalPaid = (float) \App\Domain\Support\Models\OperationDocument::query()
            ->where('document_type', 'cash_payment')
            ->where('related_document_id', $relatedDocumentId)
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->sum('total_amount');

        $docTotal = (float) $relatedDoc->total_amount;
        $outstanding = max(0.00, round($docTotal - $totalPaid, 2));

        if ($totalPaid <= 0.00) {
            $status = 'Sedang diproses';
        } elseif ($outstanding <= 0.01) {
            $status = 'Terbayar';
        } else {
            $status = 'Sebagian dibayar';
        }

        $relatedDoc->update([
            'paid_amount' => $totalPaid,
            'outstanding_amount' => $outstanding,
            'status' => $status,
        ]);
    }

    protected function notifyResourceChanged(string $resourceKey, string $action, mixed $recordId): void
    {
        try {
            $timestamp = (int) (microtime(true) * 1000);
            \Illuminate\Support\Facades\Cache::put('last_resource_change', [
                'resource' => $resourceKey,
                'action' => $action,
                'record_id' => $recordId,
                'timestamp' => $timestamp,
            ], 60);

            event(new \App\Events\ResourceUpdatedEvent($resourceKey, $action, $recordId));
        } catch (\Throwable $e) {
          // Silently swallow broadcast errors

        }
    }

    protected function syncChildAccountCodes(\App\Domain\Finance\Models\Account $account): void
    {
        $parentCode = (string) preg_replace('/[^0-9]/', '', $account->code);
        $children = \App\Domain\Finance\Models\Account::where('parent_id', $account->id)->orderBy('id')->get();
        $index = 1;
        foreach ($children as $child) {
            do {
                $suffix = str_pad($index, 2, '0', STR_PAD_LEFT);
                $newCode = $parentCode . $suffix;
                $index++;
            } while (\App\Domain\Finance\Models\Account::where('code', $newCode)->where('id', '!=', $child->id)->exists());

            if ($child->code !== $newCode) {
                $child->code = $newCode;
                $child->saveQuietly();
                $this->syncChildAccountCodes($child);
            }
        }
    }
}

