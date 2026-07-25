<?php

namespace App\Support\Backend\Queries;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\SupplierPrice;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Inventory\Models\InventoryDocument;
use App\Domain\Inventory\Models\InventoryDocumentLine;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use App\Support\Backend\Queries\Concerns\HasQueryHelpers;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class InventoryInquiryQueryService
{
    use HasQueryHelpers;
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateItemLocations(array $filters): LengthAwarePaginator
    {
        $stockMap = $this->buildStockMap($filters);
        $warehouses = Warehouse::query()->with('branch')->get()->keyBy('id');
        $products = $this->queryProducts($filters)->keyBy('id');
        $rows = collect();

        foreach ($stockMap as $compositeKey => $quantity) {
            [$productId, $warehouseId] = array_map('intval', explode(':', (string) $compositeKey));
            $product = $products->get($productId);
            $warehouse = $warehouses->get($warehouseId);

            if ($product === null || $warehouse === null) {
                continue;
            }

            $rows->push([
                'id' => sprintf('%d:%d', $productId, $warehouseId),
                'product_id' => $productId,
                'product_code' => $product->code,
                'product_name' => $product->name,
                'warehouse_id' => $warehouseId,
                'warehouse' => $warehouse->name,
                'multi_unit_quantity' => sprintf('%s %s', $this->formatNumber($quantity), $product->baseUnit?->name ?? ''),
                'saleable_stock' => $this->formatNumber($quantity),
                'address' => $this->resolveWarehouseAddress($warehouse),
            ]);
        }

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $rows = $rows
            ->filter(function (array $row) use ($search): bool {
                if ($search === '') {
                    return true;
                }

                return collect([
                    $row['product_code'],
                    $row['product_name'],
                    $row['warehouse'],
                    $row['address'],
                    $row['multi_unit_quantity'],
                ])->contains(fn ($value) => str_contains(mb_strtolower((string) $value), $search));
            })
            ->sortBy([
                ['product_name', 'asc'],
                ['warehouse', 'asc'],
            ])
            ->values();

        return $this->paginateRows($rows, $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateMinimumStocks(array $filters): LengthAwarePaginator
    {
        $stockMap = $this->buildStockMap($filters);
        $products = $this->queryProducts($filters)->keyBy('id');
        $supplierMap = $this->resolveSupplierMap($products->keys()->all());
        $requestedMap = $this->buildRequestedMap($filters);
        $orderedMap = $this->buildOrderedMap($filters);
        $rows = collect();

        foreach ($products as $product) {
            $supplier = $supplierMap->get($product->id);

            if (filled($filters['supplier_id'] ?? null) && (int) ($supplier?->supplier_id ?? 0) !== (int) $filters['supplier_id']) {
                continue;
            }

            $availableStock = collect($stockMap)
                ->filter(fn ($value, $key) => str_starts_with((string) $key, $product->id.':'))
                ->sum();
            $ordered = (float) ($orderedMap[$product->id] ?? 0);
            $requested = (float) ($requestedMap[$product->id] ?? 0);
            $minimum = (float) ($product->minimum_stock ?? 0);

            if ($availableStock > $minimum) {
                continue;
            }

            $rows->push([
                'id' => (string) $product->id,
                'supplier' => $supplier?->supplier?->name ?? '',
                'supplier_id' => $supplier?->supplier_id,
                'item_name' => $product->name,
                'item_code' => $product->code,
                'unit' => $product->baseUnit?->name ?? '',
                'available_stock' => $this->formatNumber($availableStock),
                'ordered' => $this->formatNumber($ordered),
                'requested' => $this->formatNumber($requested),
                'minimum_limit' => $this->formatNumber($minimum),
            ]);
        }

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $rows = $rows
            ->filter(function (array $row) use ($search): bool {
                if ($search === '') {
                    return true;
                }

                return collect([
                    $row['supplier'],
                    $row['item_name'],
                    $row['item_code'],
                    $row['unit'],
                ])->contains(fn ($value) => str_contains(mb_strtolower((string) $value), $search));
            })
            ->sortBy([
                ['supplier', 'asc'],
                ['item_name', 'asc'],
            ])
            ->values();

        return $this->paginateRows($rows, $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateProductMutations(array $filters): LengthAwarePaginator
    {
        $productId = filled($filters['product_id'] ?? null) ? (int) $filters['product_id'] : null;
        if ($productId === null) {
            return $this->paginateRows(collect(), $filters);
        }

        $dateFrom = $this->resolveDateFilter($filters['date_from'] ?? null);
        $dateTo = $this->resolveDateFilter($filters['date_to'] ?? null);

        $rows = collect();

        $invDocs = InventoryDocument::query()
            ->with(['lines'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->when($dateFrom, fn ($q) => $q->whereDate('document_date', '>=', $dateFrom->toDateString()))
            ->when($dateTo, fn ($q) => $q->whereDate('document_date', '<=', $dateTo->toDateString()))
            ->get();

        $warehouses = Warehouse::all()->keyBy('id');

        foreach ($invDocs as $doc) {
            foreach ($doc->lines as $line) {
                if ((int) $line->product_id !== $productId) {
                    continue;
                }
                $movements = $this->inventoryMovements($doc, $line);
                foreach ($movements as $whId => $qty) {
                    $wh = $warehouses->get($whId);
                    $rows->push([
                        'id' => 'inv-'.$doc->id.'-'.$line->id.'-'.$whId,
                        'raw_date' => $doc->document_date ? Carbon::parse($doc->document_date)->timestamp : 0,
                        'date' => $doc->document_date ? Carbon::parse($doc->document_date)->format('d/m/Y') : '-',
                        'document_number' => $doc->document_number ?? '-',
                        'document_type' => match ($doc->document_type) {
                            'stock_transfer' => 'Pemindahan Barang',
                            'stock_opname_result' => 'Hasil Stok Opname',
                            'inventory_adjustment' => 'Penyesuaian Persediaan',
                            default => ucwords(str_replace('_', ' ', (string) $doc->document_type)),
                        },
                        'description' => $doc->notes ?? $line->notes ?? '-',
                        'warehouse' => $wh?->name ?? '-',
                        'unit_cost' => $this->formatNumber((float) ($line->unit_cost ?? 0)),
                        'in_qty' => $qty > 0 ? $this->formatNumber($qty) : '',
                        'out_qty' => $qty < 0 ? $this->formatNumber(abs($qty)) : '',
                        'qty_change' => $qty,
                    ]);
                }
            }
        }

        $opDocs = OperationDocument::query()
            ->with(['lines', 'warehouse'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->whereIn('document_type', ['goods_receipt', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return'])
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->when($dateFrom, fn ($q) => $q->whereDate('entry_date', '>=', $dateFrom->toDateString()))
            ->when($dateTo, fn ($q) => $q->whereDate('entry_date', '<=', $dateTo->toDateString()))
            ->get();

        foreach ($opDocs as $doc) {
            foreach ($doc->lines as $line) {
                if ((int) $line->product_id !== $productId) {
                    continue;
                }
                $qty = (float) ($line->quantity ?? 0);
                if ($doc->document_type === 'sales_delivery' || $doc->document_type === 'sales_invoice' || $doc->document_type === 'purchase_return') {
                    $qty *= -1;
                }
                $whId = $line->warehouse_id ?? $doc->warehouse_id;
                $wh = $whId ? $warehouses->get($whId) : $doc->warehouse;

                $rows->push([
                    'id' => 'op-'.$doc->id.'-'.$line->id,
                    'raw_date' => $doc->entry_date ? Carbon::parse($doc->entry_date)->timestamp : 0,
                    'date' => $doc->entry_date ? Carbon::parse($doc->entry_date)->format('d/m/Y') : '-',
                    'document_number' => $doc->document_number ?? '-',
                    'document_type' => match ($doc->document_type) {
                        'goods_receipt' => 'Penerimaan Barang',
                        'sales_delivery' => 'Pengiriman Penjualan',
                        'sales_invoice' => 'Faktur Penjualan',
                        'sales_return' => 'Retur Penjualan',
                        'purchase_return' => 'Retur Pembelian',
                        default => ucwords(str_replace('_', ' ', (string) $doc->document_type)),
                    },
                    'description' => $doc->notes ?? $line->description ?? '-',
                    'warehouse' => $wh?->name ?? '-',
                    'unit_cost' => $this->formatNumber((float) ($line->unit_price ?? 0)),
                    'in_qty' => $qty > 0 ? $this->formatNumber($qty) : '',
                    'out_qty' => $qty < 0 ? $this->formatNumber(abs($qty)) : '',
                    'qty_change' => $qty,
                ]);
            }
        }

        $sorted = $rows->sortBy('raw_date')->values();
        $runningBalance = 0;
        $finalRows = $sorted->map(function ($row) use (&$runningBalance) {
            $runningBalance += $row['qty_change'];
            $row['balance'] = $this->formatNumber($runningBalance);

            return $row;
        });

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        if ($search !== '') {
            $finalRows = $finalRows->filter(function ($row) use ($search) {
                return collect([
                    $row['document_number'],
                    $row['document_type'],
                    $row['description'],
                    $row['warehouse'],
                ])->contains(fn ($val) => str_contains(mb_strtolower((string) $val), $search));
            })->values();
        }

        return $this->paginateRows($finalRows, $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<string, float>
     */
    protected function buildStockMap(array $filters): Collection
    {
        $asOfDate = $this->resolveDateFilter($filters['as_of_date'] ?? null) ?? now();
        $warehouseFilter = filled($filters['warehouse_id'] ?? null) ? (int) $filters['warehouse_id'] : null;
        $productFilter = filled($filters['product_id'] ?? null) ? (int) $filters['product_id'] : null;
        $stock = collect();

        $inventoryDocuments = InventoryDocument::query()
            ->with(['lines'])
            ->whereDate('document_date', '<=', $asOfDate->toDateString())
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->get();

        foreach ($inventoryDocuments as $document) {
            foreach ($document->lines as $line) {
                $productId = $line->product_id ? (int) $line->product_id : null;

                if ($productId === null || ($productFilter !== null && $productId !== $productFilter)) {
                    continue;
                }

                foreach ($this->inventoryMovements($document, $line) as $warehouseId => $quantity) {
                    if ($warehouseFilter !== null && $warehouseId !== $warehouseFilter) {
                        continue;
                    }

                    $key = sprintf('%d:%d', $productId, $warehouseId);
                    $stock[$key] = (float) ($stock[$key] ?? 0) + $quantity;
                }
            }
        }

        $operationDocuments = OperationDocument::query()
            ->with(['lines'])
            ->whereDate('entry_date', '<=', $asOfDate->toDateString())
            ->whereIn('document_type', ['goods_receipt', 'sales_delivery', 'sales_return', 'purchase_return'])
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->get();

        foreach ($operationDocuments as $document) {
            foreach ($document->lines as $line) {
                $productId = $line->product_id ? (int) $line->product_id : null;
                $warehouseId = $line->warehouse_id ? (int) $line->warehouse_id : ($document->warehouse_id ? (int) $document->warehouse_id : null);

                if ($productId === null || $warehouseId === null) {
                    continue;
                }

                if (($productFilter !== null && $productId !== $productFilter) || ($warehouseFilter !== null && $warehouseId !== $warehouseFilter)) {
                    continue;
                }

                $quantity = (float) ($line->quantity ?? 0);

                if ($document->document_type === 'sales_delivery' || $document->document_type === 'purchase_return') {
                    $quantity *= -1;
                }

                $key = sprintf('%d:%d', $productId, $warehouseId);
                $stock[$key] = (float) ($stock[$key] ?? 0) + $quantity;
            }
        }

        return $stock;
    }

    /**
     * @return array<int, float>
     */
    protected function inventoryMovements(InventoryDocument $document, InventoryDocumentLine $line): array
    {
        $warehouseId = $document->warehouse_id ? (int) $document->warehouse_id : null;
        $counterpartWarehouseId = $document->counterpart_warehouse_id ? (int) $document->counterpart_warehouse_id : null;
        $quantity = (float) ($line->quantity ?? 0);

        return match ($document->document_type) {
            'stock_transfer' => array_filter([
                $warehouseId => $warehouseId !== null ? $quantity * -1 : null,
                $counterpartWarehouseId => $counterpartWarehouseId !== null ? $quantity : null,
            ], fn ($value) => $value !== null),
            'stock_opname_result' => $warehouseId !== null
                ? [$warehouseId => (float) ($line->counted_quantity ?? 0) - (float) ($line->system_quantity ?? 0)]
                : [],
            'inventory_adjustment' => $warehouseId !== null ? [$warehouseId => $quantity] : [],
            'material_addition' => $warehouseId !== null ? [$warehouseId => $quantity * -1] : [],
            'work_completion' => $warehouseId !== null ? [$warehouseId => $quantity] : [],
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Product>
     */
    protected function queryProducts(array $filters): Collection
    {
        return Product::query()
            ->with(['baseUnit'])
            ->when(filled($filters['product_id'] ?? null), fn ($query) => $query->whereKey((int) $filters['product_id']))
            ->where('is_active', true)
            ->get();
    }

    /**
     * @param  array<int, int>  $productIds
     * @return Collection<int, SupplierPrice>
     */
    protected function resolveSupplierMap(array $productIds): Collection
    {
        return SupplierPrice::query()
            ->with('supplier')
            ->whereIn('product_id', $productIds)
            ->orderByDesc('effective_from')
            ->get()
            ->unique('product_id')
            ->keyBy('product_id');
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, float>
     */
    protected function buildRequestedMap(array $filters): array
    {
        $warehouseFilter = filled($filters['warehouse_id'] ?? null) ? (int) $filters['warehouse_id'] : null;

        return InventoryDocument::query()
            ->with('lines')
            ->where('document_type', 'item_request')
            ->where('is_closed', false)
            ->get()
            ->flatMap(function (InventoryDocument $document) use ($warehouseFilter) {
                if ($warehouseFilter !== null && (int) $document->warehouse_id !== $warehouseFilter) {
                    return [];
                }

                return $document->lines->map(fn (InventoryDocumentLine $line) => [
                    'product_id' => (int) $line->product_id,
                    'quantity' => (float) ($line->quantity ?? 0),
                ]);
            })
            ->groupBy('product_id')
            ->map(fn (Collection $rows) => $rows->sum('quantity'))
            ->all();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<int, float>
     */
    protected function buildOrderedMap(array $filters): array
    {
        $warehouseFilter = filled($filters['warehouse_id'] ?? null) ? (int) $filters['warehouse_id'] : null;

        return OperationDocument::query()
            ->with('lines')
            ->where('document_type', 'purchase_order')
            ->where('is_closed', false)
            ->get()
            ->flatMap(function (OperationDocument $document) use ($warehouseFilter) {
                return $document->lines->filter(function (OperationDocumentLine $line) use ($warehouseFilter, $document): bool {
                    $warehouseId = $line->warehouse_id ? (int) $line->warehouse_id : (int) $document->warehouse_id;

                    return $warehouseFilter === null || $warehouseId === $warehouseFilter;
                })->map(fn (OperationDocumentLine $line) => [
                    'product_id' => (int) $line->product_id,
                    'quantity' => (float) ($line->quantity ?? 0),
                ]);
            })
            ->groupBy('product_id')
            ->map(fn (Collection $rows) => $rows->sum('quantity'))
            ->all();
    }

    protected function resolveWarehouseAddress(Warehouse $warehouse): string
    {
        $branch = $warehouse->branch;

        if ($branch === null) {
            return '';
        }

        return collect([
            $branch->street,
            $branch->city,
            $branch->province,
            $branch->country,
        ])->filter()->implode(', ');
    }

}
