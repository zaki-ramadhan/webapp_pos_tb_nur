<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('operation_documents')) {
            return;
        }

        $docs = DB::table('operation_documents')
            ->where('document_type', 'purchase_invoice')
            ->orderBy('id', 'asc')
            ->get();

        $seq = 0;
        foreach ($docs as $doc) {
            $seq++;
            if (!empty($doc->reference_number)) {
                continue;
            }

            $date = $doc->entry_date ? \Carbon\Carbon::parse($doc->entry_date) : now();
            $year = (int) $date->format('Y');
            $m = (int) $date->format('m');
            $suppId = (int) ($doc->supplier_id ?? 1);

            $supplierCode = DB::table('suppliers')->where('id', $suppId)->value('code') ?? '';

            $supplierBillNo = match ($supplierCode) {
                'SUPP-001' => sprintf('INV/SI/%04d/%02d/%04d', $year, $m, 1000 + $seq),
                'SUPP-002' => sprintf('KS-INV-%04d%02d-%03d', $year, $m, $seq),
                'SUPP-003' => sprintf('AVN/FAK/%02d/%04d/%03d', $m, $year, $seq),
                'SUPP-004' => sprintf('ETR-INV-%04d-%04d', $year, 2000 + $seq),
                'SUPP-005' => sprintf('RCK/PB/%04d/%02d/%03d', $year, $m, $seq),
                default => sprintf('INV-SUP-%04d%02d-%03d', $year, $m, $seq),
            };

            DB::table('operation_documents')
                ->where('id', $doc->id)
                ->update([
                    'reference_number' => $supplierBillNo,
                    'external_number' => $supplierBillNo,
                ]);
        }
    }

    public function down(): void
    {
    }
};
