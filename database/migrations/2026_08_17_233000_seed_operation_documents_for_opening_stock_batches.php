<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('inventory_batches') || ! \Illuminate\Support\Facades\Schema::hasTable('operation_documents')) {
            return;
        }

        $batches = DB::table('inventory_batches')
            ->where('source_type', 'opening_balance')
            ->orderBy('id', 'asc')
            ->get();

        if ($batches->isEmpty()) {
            return;
        }

        $branchId = DB::table('branches')->value('id') ?? 1;
        $adminUserId = DB::table('users')->value('id') ?? 1;

        $docSeq = 1;
        foreach ($batches as $batch) {
            // Check if this batch is already linked to an existing operation_document
            $existingOpDoc = DB::table('operation_documents')
                ->where('id', $batch->source_id)
                ->where('document_type', 'inventory_adjustment')
                ->first();

            if ($existingOpDoc) {
                continue;
            }

            $product = DB::table('products')->where('id', $batch->product_id)->first();
            if (! $product) {
                continue;
            }

            $entryDate = $batch->entry_date ? Carbon::parse($batch->entry_date)->toDateString() : '2025-01-02';
            $dateObj = Carbon::parse($entryDate);
            $docNumber = sprintf('PS.%s.%s.%04d', $dateObj->format('Y'), $dateObj->format('m'), $docSeq);

            // Avoid collisions with existing numbers
            while (DB::table('operation_documents')->where('document_number', $docNumber)->exists()) {
                $docSeq++;
                $docNumber = sprintf('PS.%s.%s.%04d', $dateObj->format('Y'), $dateObj->format('m'), $docSeq);
            }

            $qty = (float) ($batch->qty_received ?? 0);
            $cost = (float) ($batch->unit_cost ?? $product->default_purchase_price ?? 0);
            $totalAmount = $qty * $cost;

            $opDocId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'inventory_adjustment',
                'branch_id' => $branchId,
                'warehouse_id' => $batch->warehouse_id ?? 1,
                'responsible_user_id' => $adminUserId,
                'document_number' => $docNumber,
                'status' => 'Selesai',
                'entry_date' => $entryDate,
                'notes' => 'Stok awal barang: ' . $product->name,
                'subtotal' => $totalAmount,
                'total_amount' => $totalAmount,
                'is_closed' => true,
                'created_at' => $batch->created_at ?? now(),
                'updated_at' => $batch->updated_at ?? now(),
            ]);

            $lineId = DB::table('operation_document_lines')->insertGetId([
                'operation_document_id' => $opDocId,
                'line_type' => 'item',
                'product_id' => $product->id,
                'unit_id' => $product->base_unit_id ?? 1,
                'warehouse_id' => $batch->warehouse_id ?? 1,
                'description' => $product->name,
                'quantity' => $qty,
                'unit_price' => $cost,
                'total_amount' => $totalAmount,
                'attributes' => json_encode([
                    'unit_price' => $cost,
                    'total_amount' => $totalAmount,
                    'adjustment_type' => 'Penambahan',
                ]),
                'sort_order' => 1,
                'created_at' => $batch->created_at ?? now(),
                'updated_at' => $batch->updated_at ?? now(),
            ]);

            DB::table('inventory_batches')
                ->where('id', $batch->id)
                ->update([
                    'source_id' => $opDocId,
                    'source_line_id' => $lineId,
                ]);

            $docSeq++;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
