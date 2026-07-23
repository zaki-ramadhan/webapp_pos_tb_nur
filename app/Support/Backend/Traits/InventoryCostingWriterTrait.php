<?php

namespace App\Support\Backend\Traits;

use Illuminate\Database\Eloquent\Model;

trait InventoryCostingWriterTrait
{
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

            $costingService->revertStockEntry($sourceType, $sourceLineId);

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
            $warehouseId = $line->warehouse_id ?? $record->warehouse_id ?? null;

            if ($record instanceof \App\Domain\Support\Models\OperationDocument) {
                if (in_array($docType, ['goods_receipt', 'sales_return', 'work_completion'], true)) {
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
                } elseif (in_array($docType, ['sales_delivery', 'purchase_return', 'material_addition'], true)) {
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

                        $unitCost = $qty > 0 ? ($consumeResult['total_cost'] ?? 0) / $qty : 0.0;
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
                    if ($qtyDiff > 0 && $warehouseId) {
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
                    } elseif ($qtyDiff < 0 && $warehouseId) {
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

    protected function recordEntryHelper(
        $costingService,
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

    protected function consumeStockHelper(
        $costingService,
        Model $line,
        int $productId,
        int $warehouseId,
        float $qty,
        \Carbon\Carbon $entryDate
    ): array {
        $result = $costingService->consumeStock($productId, $warehouseId, $qty, $entryDate);

        $attributes = is_string($line->attributes) ? json_decode($line->attributes, true) : ($line->attributes ?? []);
        $attributes['consumed_batches'] = $result['consumptions'] ?? [];
        $attributes['cogs'] = $result['total_cost'] ?? 0;
        $line->attributes = $attributes;
        $line->saveQuietly();

        return $result;
    }

    protected function resolveProductCost(int $productId): float
    {
        $product = \App\Domain\Catalog\Models\Product::find($productId);
        return $product ? (float) ($product->default_purchase_price ?? 0) : 0.0;
    }
}
