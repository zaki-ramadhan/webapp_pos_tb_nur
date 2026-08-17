<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Support\Backend\BackendResourceWriter;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('inventory_documents') || ! \Illuminate\Support\Facades\Schema::hasTable('operation_documents')) {
            return;
        }

        $invAdjustments = DB::table('inventory_documents')
            ->where('document_type', 'inventory_adjustment')
            ->orderBy('id', 'asc')
            ->get();

        if ($invAdjustments->isEmpty()) {
            return;
        }

        $writer = app(BackendResourceWriter::class);

        foreach ($invAdjustments as $invDoc) {
            $docDate = $invDoc->document_date ? Carbon::parse($invDoc->document_date)->toDateString() : now()->toDateString();
            
            // Generate standard sequential document number PS.YYYY.MM.xxxx
            $docNum = $writer->generateNextSequentialNumber('inventory-adjustments', $docDate);
            if (empty($docNum)) {
                $dateObj = Carbon::parse($docDate);
                $docNum = 'PS.' . $dateObj->format('Y.m.') . sprintf('%04d', rand(1, 9999));
            }

            $lines = DB::table('inventory_document_lines')
                ->where('inventory_document_id', $invDoc->id)
                ->get();

            $subtotal = 0;
            foreach ($lines as $l) {
                $attrs = json_decode($l->attributes ?? '{}', true) ?: [];
                $unitPrice = (float) ($attrs['unit_price'] ?? $attrs['cost'] ?? $l->unit_cost ?? 0);
                $subtotal += ((float) ($l->quantity ?? 0)) * $unitPrice;
            }

            $opDocId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'inventory_adjustment',
                'document_number' => $docNum,
                'warehouse_id' => $invDoc->warehouse_id,
                'status' => 'Selesai',
                'entry_date' => $docDate,
                'notes' => $invDoc->notes ?? 'Penyesuaian Stok Awal',
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
                'is_closed' => true,
                'created_at' => $invDoc->created_at ?? now(),
                'updated_at' => $invDoc->updated_at ?? now(),
            ]);

            foreach ($lines as $index => $l) {
                $attrs = json_decode($l->attributes ?? '{}', true) ?: [];
                $unitPrice = (float) ($attrs['unit_price'] ?? $attrs['cost'] ?? $l->unit_cost ?? 0);
                $qty = (float) ($l->quantity ?? 0);
                $totalAmt = $qty * $unitPrice;

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $opDocId,
                    'line_type' => 'item',
                    'product_id' => $l->product_id,
                    'unit_id' => $l->unit_id,
                    'warehouse_id' => $l->warehouse_id ?? $invDoc->warehouse_id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total_amount' => $totalAmt,
                    'description' => $l->notes ?? 'Penyesuaian Stok Awal',
                    'attributes' => json_encode(array_merge($attrs, [
                        'unit_price' => $unitPrice,
                        'total_amount' => $totalAmt,
                        'adjustment_type' => 'Penambahan',
                    ])),
                    'sort_order' => $index,
                    'created_at' => $l->created_at ?? now(),
                    'updated_at' => $l->updated_at ?? now(),
                ]);
            }

            // Cleanup migrated inventory_documents to prevent duplicate movements
            DB::table('inventory_document_lines')->where('inventory_document_id', $invDoc->id)->delete();
            DB::table('inventory_documents')->where('id', $invDoc->id)->delete();
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
