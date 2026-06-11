<?php

namespace App\Domain\Inventory\Services;

use App\Domain\Catalog\Models\Product;
use App\Domain\Inventory\Models\InventoryBatch;
use Carbon\Carbon;

class InventoryCostingService
{
    /**
     * Record a new incoming stock batch.
     */
    public function recordStockEntry(
        string $sourceType,
        int $sourceId,
        ?int $sourceLineId,
        int $productId,
        int $warehouseId,
        float $quantity,
        float $unitCost,
        Carbon $entryDate
    ): InventoryBatch {
        // First delete if there's any existing batch for this exact source line
        $this->revertStockEntry($sourceType, $sourceLineId);

        return InventoryBatch::create([
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'entry_date' => $entryDate,
            'qty_received' => $quantity,
            'qty_remaining' => $quantity,
            'unit_cost' => $unitCost,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'source_line_id' => $sourceLineId,
        ]);
    }

    /**
     * Revert/remove an incoming stock batch.
     */
    public function revertStockEntry(string $sourceType, ?int $sourceLineId): void
    {
        if ($sourceLineId === null) {
            return;
        }

        InventoryBatch::where('source_type', $sourceType)
            ->where('source_line_id', $sourceLineId)
            ->delete();
    }

    /**
     * Consume stock using FIFO logic and return the cost breakdown.
     */
    public function consumeStock(
        int $productId,
        int $warehouseId,
        float $qty,
        Carbon $entryDate
    ): array {
        $qtyNeeded = $qty;
        $consumptions = [];
        $totalCost = 0.0;

        // Fetch active batches ordered by entry_date ASC, then ID ASC
        $batches = InventoryBatch::where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->where('qty_remaining', '>', 0)
            ->orderBy('entry_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        foreach ($batches as $batch) {
            if ($qtyNeeded <= 0) {
                break;
            }

            $remaining = (float) $batch->qty_remaining;
            $consumeQty = min($qtyNeeded, $remaining);

            $batch->qty_remaining = $remaining - $consumeQty;
            $batch->save();

            $consumptions[] = [
                'batch_id' => $batch->id,
                'qty' => $consumeQty,
                'unit_cost' => (float) $batch->unit_cost,
            ];

            $totalCost += $consumeQty * (float) $batch->unit_cost;
            $qtyNeeded -= $consumeQty;
        }

        // Fallback for shortage
        if ($qtyNeeded > 0) {
            $fallbackCost = $this->resolveProductCost($productId);
            $consumptions[] = [
                'batch_id' => null,
                'qty' => $qtyNeeded,
                'unit_cost' => $fallbackCost,
            ];
            $totalCost += $qtyNeeded * $fallbackCost;
        }

        return [
            'total_cost' => $totalCost,
            'consumptions' => $consumptions,
        ];
    }

    /**
     * Revert stock consumption (return quantity back to the batches).
     */
    public function revertStockConsumption(array $consumptions): void
    {
        foreach ($consumptions as $consumption) {
            $batchId = $consumption['batch_id'] ?? null;
            $qty = (float) ($consumption['qty'] ?? 0);

            if ($batchId === null || $qty <= 0) {
                continue;
            }

            $batch = InventoryBatch::find($batchId);
            if ($batch) {
                $batch->qty_remaining = (float) $batch->qty_remaining + $qty;
                $batch->save();
            }
        }
    }

    /**
     * Helper to resolve the cost of a product as a fallback.
     */
    protected function resolveProductCost(int $productId): float
    {
        $product = Product::find($productId);
        if ($product) {
            return (float) ($product->default_purchase_price ?? 0);
        }

        return 0.0;
    }
}
