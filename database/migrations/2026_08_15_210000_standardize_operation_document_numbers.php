<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('operation_documents')) {
            return;
        }

        $prefixes = [
            'sales_quote' => 'PN',
            'sales_order' => 'SO',
            'sales_delivery' => 'SJ',
            'sales_invoice' => 'FP',
            'sales_return' => 'RJ',
            'purchase_order' => 'PO',
            'goods_receipt' => 'PB',
            'purchase_invoice' => 'FB',
            'purchase_return' => 'RB',
            'payroll_entry' => 'GJ',
            'expense_entry' => 'BB',
            'general_journal' => 'JU',
            'cash_payment' => 'KK',
            'cash_receipt' => 'KM',
            'bank_transfer' => 'TB',
            'stock_transfer' => 'TP',
            'sales_deposit' => 'UM',
            'purchase_payment' => 'BYB',
            'purchase_deposit' => 'UMP',
            'sales_receipt' => 'KW',
            'item_request' => 'PBG',
            'inventory_adjustment' => 'PS',
            'price_adjustment' => 'PH',
            'work_order' => 'SPK',
            'material_addition' => 'FPB',
            'work_completion' => 'SPP',
            'asset_change' => 'PAA',
            'asset_disposal' => 'PDA',
            'asset_move' => 'PMA',
        ];

        $docs = DB::table('operation_documents')->orderBy('id', 'asc')->get();
        foreach ($docs as $doc) {
            $oldNumber = (string) ($doc->document_number ?? '');
            $docType = $doc->document_type ?? 'operation';
            $prefix = $prefixes[$docType] ?? 'DOC';

            $date = $doc->entry_date ? \Carbon\Carbon::parse($doc->entry_date) : now();
            $year = $date->format('Y');
            $month = $date->format('m');

            $isValid = false;
            if (preg_match('/^[A-Z]+\.\d{4}\.\d{2}\.\d{4}$/', $oldNumber)) {
                $parts = explode('.', $oldNumber);
                if ($parts[0] === $prefix) {
                    $isValid = true;
                }
            }

            if (!$isValid) {
                $seq = 1;
                do {
                    $seqStr = str_pad($seq, 4, '0', STR_PAD_LEFT);
                    $newNumber = "{$prefix}.{$year}.{$month}.{$seqStr}";
                    $exists = DB::table('operation_documents')
                        ->where('document_number', $newNumber)
                        ->where('id', '!=', $doc->id)
                        ->exists();
                    if ($exists) {
                        $seq++;
                    }
                } while ($exists);

                DB::table('operation_documents')
                    ->where('id', $doc->id)
                    ->update(['document_number' => $newNumber]);

                if (!empty($oldNumber) && \Illuminate\Support\Facades\Schema::hasTable('operation_document_lines')) {
                    DB::table('operation_document_lines')
                        ->where('reference_code', $oldNumber)
                        ->update(['reference_code' => $newNumber]);
                }
            }
        }
    }

    public function down(): void
    {
    }
};
