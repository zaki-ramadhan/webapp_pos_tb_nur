<?php

namespace App\Support\Backend\Queries;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Inventory\Models\InventoryDocument;
use App\Domain\Inventory\Models\InventoryDocumentLine;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use App\Support\Backend\Queries\Concerns\HasQueryHelpers;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InventoryInquiryQueryService
{
    use HasQueryHelpers;
    /**
     * @param  array<int, int>  $productIds
     * @param  int|null  $warehouseId
     * @return array<int, array{stock_on_hand: float, stock_available: float}>
     */
    public function buildStockTotalsByProduct(array $productIds = [], ?int $warehouseId = null): array
    {
        $filters = [];
        if (count($productIds) === 1) {
            $filters['product_id'] = $productIds[0];
        } elseif (count($productIds) > 1) {
            $filters['product_ids'] = $productIds;
        }
        if ($warehouseId !== null) {
            $filters['warehouse_id'] = $warehouseId;
        }
        $compositeStockMap = $this->buildStockMap($filters);
        
        $onHandTotals = [];
        $productIdSet = !empty($productIds) ? array_flip($productIds) : null;
        foreach ($compositeStockMap as $compositeKey => $qty) {
            $parts = explode(':', $compositeKey);
            $pid = (int) ($parts[0] ?? 0);
            $wid = (int) ($parts[1] ?? 0);
            if ($warehouseId !== null && $wid !== $warehouseId) {
                continue;
            }
            if ($pid > 0 && ($productIdSet === null || isset($productIdSet[$pid]))) {
                $onHandTotals[$pid] = (float) ($onHandTotals[$pid] ?? 0.0) + (float) $qty;
            }
        }

        $reservedQuery = DB::table('operation_document_lines as odl')
            ->join('operation_documents as od', 'odl.operation_document_id', '=', 'od.id')
            ->where('od.document_type', 'sales_order')
            ->where('od.is_closed', false)
            ->where(function ($q) {
                $q->whereNull('od.status')
                  ->orWhereNotIn('od.status', ['Void', 'Cancelled', 'void', 'cancelled']);
            });

        if (!empty($productIds)) {
            $reservedQuery->whereIn('odl.product_id', $productIds);
        }

        if ($warehouseId !== null) {
            $reservedQuery->where(function ($q) use ($warehouseId) {
                $q->where('odl.warehouse_id', $warehouseId)
                  ->orWhere(function ($sq) use ($warehouseId) {
                      $sq->whereNull('odl.warehouse_id')
                         ->where('od.warehouse_id', $warehouseId);
                  });
            });
        }

        $reservedTotals = $reservedQuery
            ->groupBy('odl.product_id')
            ->select('odl.product_id', DB::raw('SUM(odl.quantity) as reserved_qty'))
            ->pluck('reserved_qty', 'odl.product_id')
            ->all();

        $results = [];
        $targetIds = !empty($productIds) ? $productIds : array_keys($onHandTotals);

        foreach ($targetIds as $pid) {
            $onHand = (float) ($onHandTotals[$pid] ?? 0.0);
            $reserved = (float) ($reservedTotals[$pid] ?? 0.0);
            $results[$pid] = [
                'stock_on_hand' => $onHand,
                'stock_available' => max(0.0, $onHand - $reserved),
            ];
        }

        return $results;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateItemLocations(array $filters): LengthAwarePaginator
    {
        if (
            filter_var($filters['require_target'] ?? false, FILTER_VALIDATE_BOOLEAN) ||
            (!filled($filters['product_id'] ?? null) && !filled($filters['warehouse_id'] ?? null) && isset($filters['require_target']))
        ) {
            return $this->paginateRows(collect(), $filters);
        }

        $stockMap = $this->buildStockMap($filters);
        $warehouses = Warehouse::query()->with('branch')
            ->when(filled($filters['warehouse_id'] ?? null), fn ($q) => $q->where('id', (int) $filters['warehouse_id']))
            ->get()->keyBy('id');
        $products = $this->queryProducts($filters)->keyBy('id');
        $rows = collect();

        $docDates = InventoryDocumentLine::query()
            ->join('inventory_documents', 'inventory_documents.id', '=', 'inventory_document_lines.inventory_document_id')
            ->selectRaw('inventory_document_lines.product_id, inventory_documents.warehouse_id, MAX(inventory_documents.document_date) as max_date')
            ->groupBy('inventory_document_lines.product_id', 'inventory_documents.warehouse_id')
            ->get()
            ->keyBy(fn ($item) => sprintf('%d:%d', $item->product_id, $item->warehouse_id));

        $batchCosts = \Illuminate\Support\Facades\DB::table('inventory_batches')
            ->selectRaw('product_id, warehouse_id, unit_cost')
            ->whereIn('product_id', $products->keys()->all())
            ->where('unit_cost', '>', 0)
            ->orderBy('id', 'desc')
            ->get()
            ->unique(fn ($item) => sprintf('%d:%d', $item->product_id, $item->warehouse_id))
            ->keyBy(fn ($item) => sprintf('%d:%d', $item->product_id, $item->warehouse_id));

        $docCosts = \Illuminate\Support\Facades\DB::table('inventory_document_lines')
            ->join('inventory_documents', 'inventory_documents.id', '=', 'inventory_document_lines.inventory_document_id')
            ->whereIn('inventory_document_lines.product_id', $products->keys()->all())
            ->whereNotIn('inventory_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->select('inventory_document_lines.product_id', 'inventory_documents.warehouse_id', 'inventory_document_lines.attributes')
            ->orderBy('inventory_document_lines.id', 'desc')
            ->get();

        foreach ($products as $product) {
            foreach ($warehouses as $warehouse) {
                $compositeKey = sprintf('%d:%d', $product->id, $warehouse->id);
                $quantity = (float) ($stockMap[$compositeKey] ?? 0);
                $docDate = $docDates->get($compositeKey)?->max_date;
                $formattedDate = $docDate
                    ? Carbon::parse($docDate)->format('d/m/Y')
                    : ($product->created_at ? Carbon::parse($product->created_at)->format('d/m/Y') : Carbon::now()->format('d/m/Y'));

                $cost = (float) ($batchCosts->get($compositeKey)?->unit_cost ?? 0);
                if ($cost <= 0) {
                    $docLine = $docCosts->first(fn ($d) => sprintf('%d:%d', $d->product_id, $d->warehouse_id) === $compositeKey);
                    if ($docLine) {
                        $attrs = is_string($docLine->attributes) ? json_decode($docLine->attributes, true) : (array) ($docLine->attributes ?? []);
                        $cost = (float) ($attrs['unit_price'] ?? $attrs['unit_cost'] ?? $attrs['cost'] ?? 0);
                    }
                }
                if ($cost <= 0) {
                    $cost = (float) ($product->default_purchase_price ?: $product->default_sale_price ?: 0);
                }

                $rows->push([
                    'id' => $compositeKey,
                    'product_id' => $product->id,
                    'product_code' => $product->code,
                    'product_name' => $product->name,
                    'warehouse_id' => $warehouse->id,
                    'warehouse' => $warehouse->name,
                    'unit' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '',
                    'unit_name' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '',
                    'multi_unit_quantity' => $this->formatMultiUnitQuantity((float) $quantity, $product),
                    'saleable_stock' => $this->formatNumber($quantity),
                    'quantity' => (float) $quantity,
                    'raw_quantity' => (float) $quantity,
                    'unit_cost' => $this->formatNumber($cost),
                    'raw_unit_cost' => $cost,
                    'address' => $this->resolveWarehouseAddress($warehouse),
                    'date' => $formattedDate,
                ]);
            }
        }

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $rows = $rows
            ->filter(function (array $row) use ($search): bool {
                if ($search === '') {
                    return true;
                }

                return collect([
                    $row['product_name'],
                    $row['product_code'],
                    $row['warehouse'],
                    $row['address'],
                    $row['unit'],
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
    public function paginateProductOpeningStocks(array $filters): LengthAwarePaginator
    {
        $productId = filled($filters['product_id'] ?? null) ? (int) $filters['product_id'] : null;
        if ($productId === null) {
            return $this->paginateRows(collect(), $filters);
        }

        $product = Product::query()->with(['baseUnit', 'purchaseUnit'])->find($productId);
        if (!$product) {
            return $this->paginateRows(collect(), $filters);
        }

        $warehouses = Warehouse::query()->get()->keyBy('id');
        $rows = collect();

        // 1. Initial batches
        $batches = \Illuminate\Support\Facades\DB::table('inventory_batches')
            ->where('product_id', $productId)
            ->where(function ($q) {
                $q->where('source_type', 'opening_balance')
                  ->orWhereNull('source_type')
                  ->orWhere('source_type', 'like', '%Initial%')
                  ->orWhere('source_type', 'like', '%opening%');
            })
            ->where('qty_received', '>', 0)
            ->orderBy('id', 'asc')
            ->get();

        foreach ($batches as $batch) {
            if ($batch->source_id && \Illuminate\Support\Facades\DB::table('operation_documents')->where('id', $batch->source_id)->where('document_type', 'inventory_adjustment')->exists()) {
                continue;
            }
            $wh = $warehouses->get($batch->warehouse_id);
            $cost = (float) ($batch->unit_cost > 0 ? $batch->unit_cost : ($product->default_purchase_price ?: 0));
            $rows->push([
                'id' => 'batch-' . $batch->id,
                'warehouse_id' => (int) $batch->warehouse_id,
                'warehouse' => $wh?->name ?? ('Gudang #' . $batch->warehouse_id),
                'date' => $batch->entry_date ? Carbon::parse($batch->entry_date)->format('d/m/Y') : Carbon::now()->format('d/m/Y'),
                'quantity' => (float) $batch->qty_received,
                'raw_quantity' => (float) $batch->qty_received,
                'unit' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '',
                'unit_cost' => $cost,
                'raw_unit_cost' => $cost,
                'document_number' => 'SA-' . $product->code,
                'created_at' => $batch->created_at ?? $batch->entry_date,
            ]);
        }

        // 2. Operation Document Adjustments (Opening stock entries created as OperationDocument)
        $opDocs = OperationDocument::query()
            ->with(['lines.unit', 'warehouse'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->where('document_type', 'inventory_adjustment')
            ->where(function ($q) {
                $q->where('notes', 'like', '%Stok awal%')
                  ->orWhere('document_number', 'like', 'SA-%');
            })
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
            ->orderBy('id', 'asc')
            ->get();

        foreach ($opDocs as $doc) {
            foreach ($doc->lines as $line) {
                if ((int) $line->product_id !== $productId) {
                    continue;
                }
                $wh = $doc->warehouse ?? $warehouses->get($line->warehouse_id ?? $doc->warehouse_id);
                $attrs = is_string($line->attributes) ? json_decode($line->attributes, true) : (array) ($line->attributes ?? []);
                $cost = (float) ($line->unit_price ?? $attrs['unit_price'] ?? $attrs['unit_cost'] ?? $product->default_purchase_price ?? 0);
                $qty = (float) ($line->quantity ?? 0);

                if ($qty <= 0) {
                    continue;
                }

                $whId = (int) ($line->warehouse_id ?? $doc->warehouse_id ?? 1);
                $rows->push([
                    'id' => 'op-line-' . $line->id,
                    'warehouse_id' => $whId,
                    'warehouse' => $wh?->name ?? ('Gudang #' . $whId),
                    'date' => $doc->entry_date ? Carbon::parse($doc->entry_date)->format('d/m/Y') : ($doc->created_at ? Carbon::parse($doc->created_at)->format('d/m/Y') : Carbon::now()->format('d/m/Y')),
                    'quantity' => $qty,
                    'raw_quantity' => $qty,
                    'unit' => $line->unit?->name ?? $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '',
                    'unit_cost' => $cost,
                    'raw_unit_cost' => $cost,
                    'document_number' => $doc->document_number,
                    'created_at' => $doc->created_at,
                ]);
            }
        }

        // 3. Inventory Adjustment Documents (Manual Opening Stock entries legacy)
        $documents = InventoryDocument::query()
            ->with(['lines.unit', 'warehouse'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->where('document_type', 'inventory_adjustment')
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
            ->orderBy('id', 'asc')
            ->get();

        foreach ($documents as $doc) {
            foreach ($doc->lines as $line) {
                if ((int) $line->product_id !== $productId) {
                    continue;
                }
                $wh = $doc->warehouse ?? $warehouses->get($line->warehouse_id ?? $doc->warehouse_id);
                $attrs = is_string($line->attributes) ? json_decode($line->attributes, true) : (array) ($line->attributes ?? []);
                $cost = (float) ($attrs['unit_price'] ?? $attrs['unit_cost'] ?? $product->default_purchase_price ?? 0);
                $qty = (float) ($line->quantity ?? 0);

                if ($qty <= 0) {
                    continue;
                }

                $whId = (int) ($doc->warehouse_id ?? $line->warehouse_id ?? 1);
                $rows->push([
                    'id' => 'doc-line-' . $line->id,
                    'warehouse_id' => $whId,
                    'warehouse' => $wh?->name ?? ('Gudang #' . $whId),
                    'date' => $doc->document_date ? Carbon::parse($doc->document_date)->format('d/m/Y') : ($doc->created_at ? Carbon::parse($doc->created_at)->format('d/m/Y') : Carbon::now()->format('d/m/Y')),
                    'quantity' => $qty,
                    'raw_quantity' => $qty,
                    'unit' => $line->unit?->name ?? $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '',
                    'unit_cost' => $cost,
                    'raw_unit_cost' => $cost,
                    'document_number' => $doc->document_number,
                    'created_at' => $doc->created_at,
                ]);
            }
        }

        // 4. Fallback to location rows if no opening batch/adjustment entries exist
        if ($rows->isEmpty()) {
            $itemLocations = $this->paginateItemLocations(['product_id' => $productId, 'per_page' => 100]);
            foreach ($itemLocations->items() as $item) {
                $qty = (float) ($item['raw_quantity'] ?? $item['quantity'] ?? 0);
                if ($qty > 0) {
                    $rows->push([
                        'id' => 'loc-' . ($item['id'] ?? $item['warehouse_id']),
                        'warehouse_id' => (int) ($item['warehouse_id'] ?? 1),
                        'warehouse' => $item['warehouse'] ?? ('Gudang #' . ($item['warehouse_id'] ?? 1)),
                        'date' => Carbon::now()->format('d/m/Y'),
                        'quantity' => $qty,
                        'raw_quantity' => $qty,
                        'unit' => $item['unit'] ?? ($product->baseUnit?->name ?? ''),
                        'unit_cost' => (float) ($item['raw_unit_cost'] ?? $item['unit_cost'] ?? 0),
                        'raw_unit_cost' => (float) ($item['raw_unit_cost'] ?? $item['unit_cost'] ?? 0),
                        'document_number' => 'SA-' . $product->code,
                        'created_at' => Carbon::now(),
                    ]);
                }
            }
        }

        return $this->paginateRows($rows->values(), $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateMinimumStocks(array $filters): LengthAwarePaginator
    {
        $warehouseId = filled($filters['warehouse_id'] ?? null) ? (int) $filters['warehouse_id'] : null;
        if ($warehouseId === null && filled($filters['warehouse'] ?? null)) {
            $warehouseName = trim((string) $filters['warehouse']);
            $warehouseId = Warehouse::where('name', 'like', "%{$warehouseName}%")
                ->orWhere('code', 'like', "%{$warehouseName}%")
                ->value('id');
        }

        $supplierId = filled($filters['supplier_id'] ?? null) ? (int) $filters['supplier_id'] : null;
        $supplierKeyword = filled($filters['supplier'] ?? null) ? trim((string) $filters['supplier']) : null;
        $searchKeyword = filled($filters['search'] ?? null) ? trim((string) $filters['search']) : null;

        $products = $this->queryProducts($filters);
        $supplierMap = $this->resolveSupplierMap($products);

        $productIds = $products->pluck('id')->all();
        $allTotals = $this->buildStockTotalsByProduct($productIds, $warehouseId);

        $rows = $products
            ->map(function (Product $product) use ($allTotals, $supplierMap, $supplierId, $supplierKeyword, $searchKeyword): ?array {
                $totals = $allTotals[$product->id] ?? [
                    'stock_on_hand' => 0.0,
                    'stock_available' => 0.0,
                ];

                $onHandStock = (float) $totals['stock_on_hand'];
                $availableStock = (float) ($totals['stock_available'] ?? max(0.0, $onHandStock));
                $minimumStock = (float) ($product->minimum_stock ?? 0);
                if ($onHandStock > $minimumStock) {
                    return null;
                }

                $deficit = max(0.0, $minimumStock - $onHandStock);
                $purchasePrice = (float) ($product->default_purchase_price ?? 0);

                $resolvedSupplier = $supplierMap->get($product->id);
                $supplierModel = $resolvedSupplier
                    ?? $product->preferredSupplier
                    ?? $product->mainSupplier;

                $supplierName = $supplierModel?->name ?? $supplierModel?->full_name ?? '-';
                $resolvedSupplierId = $product->main_supplier_id ?? $supplierModel?->id ?? null;

                if ($supplierId !== null && (int) $resolvedSupplierId !== $supplierId) {
                    return null;
                }
                if ($supplierKeyword !== null && $supplierKeyword !== '') {
                    if (!str_contains(mb_strtolower((string) $supplierName), mb_strtolower($supplierKeyword))) {
                        return null;
                    }
                }

                if ($searchKeyword !== null && $searchKeyword !== '') {
                    $searchLower = mb_strtolower($searchKeyword);
                    $matchesCode = str_contains(mb_strtolower((string) $product->code), $searchLower);
                    $matchesName = str_contains(mb_strtolower((string) $product->name), $searchLower);
                    $matchesSupplier = str_contains(mb_strtolower((string) $supplierName), $searchLower);
                    if (!$matchesCode && !$matchesName && !$matchesSupplier) {
                        return null;
                    }
                }

                $displayAvailableStock = max(0.0, $availableStock);
                $displayCurrentStock = max(0.0, $onHandStock);

                return [
                    'id' => $product->id,
                    'item_id' => $product->id,
                    'item_code' => $product->code,
                    'item_name' => $product->name,
                    'supplier' => $supplierName,
                    'supplier_id' => $resolvedSupplierId,
                    'main_supplier_id' => $resolvedSupplierId,
                    'unit' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '',
                    'cost_price' => $this->formatNumber($purchasePrice),
                    'default_purchase_price' => $purchasePrice,
                    'price' => $purchasePrice,
                    'current_stock' => $this->formatNumber($displayCurrentStock),
                    'available_stock' => $this->formatNumber($displayAvailableStock),
                    'minimum_stock' => $this->formatNumber($minimumStock),
                    'minimum_limit' => $this->formatNumber($minimumStock),
                    'suggested_reorder_qty' => $this->formatNumber($deficit > 0 ? $deficit : $minimumStock),
                    'raw_cost_price' => $purchasePrice,
                    'raw_current_stock' => $displayCurrentStock,
                    'raw_available_stock' => $displayAvailableStock,
                    'raw_minimum_stock' => $minimumStock,
                    'raw_minimum_limit' => $minimumStock,
                ];
            })
            ->filter()
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

        $product = Product::find($productId);
        $defaultPurchasePrice = (float) ($product?->default_purchase_price ?? 0);
        $defaultSalePrice = (float) ($product?->default_sale_price ?? 0);
        $fallbackPrice = $defaultPurchasePrice > 0 ? $defaultPurchasePrice : $defaultSalePrice;

        $invDocs = InventoryDocument::query()
            ->with(['lines'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
            ->when($dateFrom, fn ($q) => $q->where(function ($sub) use ($dateFrom) {
                $sub->whereDate('document_date', '>=', $dateFrom->toDateString())
                    ->orWhere(fn ($nullSub) => $nullSub->whereNull('document_date')->whereDate('created_at', '>=', $dateFrom->toDateString()));
            }))
            ->when($dateTo, fn ($q) => $q->where(function ($sub) use ($dateTo) {
                $sub->whereDate('document_date', '<=', $dateTo->toDateString())
                    ->orWhere(fn ($nullSub) => $nullSub->whereNull('document_date')->whereDate('created_at', '<=', $dateTo->toDateString()));
            }))
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
                    $docTypeStr = (string) $doc->document_type;
                    $pageId = match ($docTypeStr) {
                        'stock_transfer' => 'stock-transfer',
                        'stock_opname_result' => 'stock-opname-result',
                        'inventory_adjustment' => 'inventory-adjustment',
                        default => str_replace('_', '-', $docTypeStr),
                    };

                    $lineCost = (float) (
                        ($line->unit_cost ?? null)
                        ?: ($line->attributes['unit_cost'] ?? null)
                        ?: ($line->attributes['cost'] ?? null)
                        ?: ($line->attributes['unit_price'] ?? null)
                        ?: $fallbackPrice
                    );

                    $rows->push([
                        'id' => 'inv-'.$doc->id.'-'.$line->id.'-'.$whId,
                        'document_id' => $doc->id,
                        'raw_document_type' => $docTypeStr,
                        'page_id' => $pageId,
                        'raw_date' => $doc->document_date ? Carbon::parse($doc->document_date)->timestamp : ($doc->created_at ? Carbon::parse($doc->created_at)->timestamp : 0),
                        'date' => $doc->document_date ? Carbon::parse($doc->document_date)->format('d/m/Y') : ($doc->created_at ? Carbon::parse($doc->created_at)->format('d/m/Y') : '-'),
                        'document_number' => $doc->document_number ?? '-',
                        'document_type' => match ($doc->document_type) {
                            'stock_transfer' => 'Pemindahan Barang',
                            'stock_opname_result' => 'Hasil Stok Opname',
                            'inventory_adjustment' => 'Penyesuaian Persediaan',
                            default => ucwords(str_replace('_', ' ', (string) $doc->document_type)),
                        },
                        'description' => $doc->notes ?? $line->notes ?? '-',
                        'warehouse' => $wh?->name ?? '-',
                        'unit_cost' => $this->formatNumber($lineCost),
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
            ->whereIn('document_type', ['goods_receipt', 'purchase_invoice', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return', 'inventory_adjustment', 'stock_transfer'])
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
            ->when($dateFrom, fn ($q) => $q->where(function ($sub) use ($dateFrom) {
                $sub->whereDate('entry_date', '>=', $dateFrom->toDateString())
                    ->orWhere(fn ($nullSub) => $nullSub->whereNull('entry_date')->whereDate('created_at', '>=', $dateFrom->toDateString()));
            }))
            ->when($dateTo, fn ($q) => $q->where(function ($sub) use ($dateTo) {
                $sub->whereDate('entry_date', '<=', $dateTo->toDateString())
                    ->orWhere(fn ($nullSub) => $nullSub->whereNull('entry_date')->whereDate('created_at', '<=', $dateTo->toDateString()));
            }))
            ->get();

        foreach ($opDocs as $doc) {
            foreach ($doc->lines as $line) {
                if ((int) $line->product_id !== $productId) {
                    continue;
                }
                $qty = (float) ($line->quantity ?? 0);
                if ($doc->document_type === 'sales_delivery' || $doc->document_type === 'sales_invoice' || $doc->document_type === 'purchase_return') {
                    $qty *= -1;
                } elseif ($doc->document_type === 'inventory_adjustment') {
                    $attributes = is_string($line->attributes) ? json_decode($line->attributes, true) : ($line->attributes ?? []);
                    $adjType = $attributes['adjustment_type'] ?? 'Penambahan';
                    if ($adjType === 'Pengurangan' && $qty > 0) {
                        $qty *= -1;
                    } elseif ($adjType === 'Atur Stok') {
                        $qty = (float) ($attributes['delta_quantity'] ?? ($qty - (float) ($attributes['system_quantity'] ?? 0)));
                    }
                }
                $whId = $line->warehouse_id ?? $doc->warehouse_id;
                $wh = $whId ? $warehouses->get($whId) : $doc->warehouse;

                $docTypeStr = (string) $doc->document_type;
                $pageId = match ($docTypeStr) {
                    'goods_receipt' => 'goods-receipt',
                    'purchase_invoice' => 'purchase-invoice',
                    'sales_delivery' => 'sales-delivery',
                    'sales_invoice' => 'sales-invoice',
                    'sales_return' => 'sales-return',
                    'purchase_return' => 'purchase-return',
                    'inventory_adjustment' => 'inventory-adjustment',
                    'stock_transfer' => 'stock-transfer',
                    default => str_replace('_', '-', $docTypeStr),
                };

                $linePrice = (float) ($line->unit_price ?? 0);
                $docCost = (float) (
                    ($linePrice > 0 ? $linePrice : null)
                    ?: ($line->attributes['unit_price'] ?? null)
                    ?: ($line->attributes['unit_cost'] ?? null)
                    ?: ($line->attributes['cost'] ?? null)
                    ?: ($doc->document_type === 'sales_invoice' || $doc->document_type === 'sales_delivery'
                        ? ($defaultSalePrice > 0 ? $defaultSalePrice : $fallbackPrice)
                        : ($defaultPurchasePrice > 0 ? $defaultPurchasePrice : $fallbackPrice))
                );

                $rows->push([
                    'id' => 'op-'.$doc->id.'-'.$line->id,
                    'document_id' => $doc->id,
                    'raw_document_type' => $docTypeStr,
                    'page_id' => $pageId,
                    'raw_date' => $doc->entry_date ? Carbon::parse($doc->entry_date)->timestamp : 0,
                    'date' => $doc->entry_date ? Carbon::parse($doc->entry_date)->format('d/m/Y') : '-',
                    'document_number' => $doc->document_number ?? '-',
                    'document_type' => match ($doc->document_type) {
                        'goods_receipt' => 'Penerimaan Barang',
                        'purchase_invoice' => 'Faktur Pembelian',
                        'sales_delivery' => 'Pengiriman Penjualan',
                        'sales_invoice' => 'Faktur Penjualan',
                        'sales_return' => 'Retur Penjualan',
                        'purchase_return' => 'Retur Pembelian',
                        'inventory_adjustment' => 'Penyesuaian Persediaan' . match ($adjType ?? '') {
                            'Atur Stok' => ' (Atur Stok)',
                            'Pengurangan' => ' (Pengurangan)',
                            default => ' (Penambahan)',
                        },
                        'stock_transfer' => 'Pemindahan Barang',
                        default => ucwords(str_replace('_', ' ', (string) $doc->document_type)),
                    },
                    'description' => $doc->notes ?? $line->description ?? '-',
                    'warehouse' => $wh?->name ?? '-',
                    'unit_cost' => $this->formatNumber($docCost),
                    'in_qty' => $qty > 0 ? $this->formatNumber($qty) : '',
                    'out_qty' => $qty < 0 ? $this->formatNumber(abs($qty)) : '',
                    'qty_change' => $qty,
                ]);
            }
        }

        // Hitung Saldo Awal (Opening Balance) sebelum periode tanggal date_from yang difilter
        $initialStock = 0.0;

        if ($dateFrom) {
            // 1. Batches before dateFrom
            $initialBatches = \Illuminate\Support\Facades\DB::table('inventory_batches')
                ->where('product_id', $productId)
                ->where(function ($q) use ($dateFrom) {
                    $q->whereDate('entry_date', '<', $dateFrom->toDateString())
                      ->orWhere(fn ($sub) => $sub->whereNull('entry_date')->whereDate('created_at', '<', $dateFrom->toDateString()));
                })
                ->get();
            foreach ($initialBatches as $b) {
                if ($b->source_id && \Illuminate\Support\Facades\DB::table('operation_documents')->where('id', $b->source_id)->where('document_type', 'inventory_adjustment')->exists()) {
                    continue;
                }
                $initialStock += (float) $b->qty_received;
            }

            // 2. Inventory Documents before dateFrom
            $priorInv = InventoryDocument::query()
                ->with(['lines'])
                ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
                ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
                ->whereDate('document_date', '<', $dateFrom->toDateString())
                ->get();
            foreach ($priorInv as $d) {
                foreach ($d->lines as $l) {
                    if ((int) $l->product_id === $productId) {
                        foreach ($this->inventoryMovements($d, $l) as $whId => $mQty) {
                            $initialStock += $mQty;
                        }
                    }
                }
            }

            // 3. Operation Documents before dateFrom
            $priorOp = OperationDocument::query()
                ->with(['lines'])
                ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
                ->whereIn('document_type', ['goods_receipt', 'purchase_invoice', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return', 'inventory_adjustment'])
                ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
                ->whereDate('entry_date', '<', $dateFrom->toDateString())
                ->get();
            foreach ($priorOp as $d) {
                foreach ($d->lines as $l) {
                    if ((int) $l->product_id === $productId) {
                        $mQty = (float) ($l->quantity ?? 0);
                        if (in_array($d->document_type, ['sales_delivery', 'sales_invoice', 'purchase_return'], true)) {
                            $initialStock -= $mQty;
                        } elseif ($d->document_type === 'inventory_adjustment') {
                            $attributes = is_string($l->attributes) ? json_decode($l->attributes, true) : ($l->attributes ?? []);
                            $adjType = $attributes['adjustment_type'] ?? 'Penambahan';
                            if ($adjType === 'Pengurangan') {
                                $initialStock -= $mQty;
                            } elseif ($adjType === 'Atur Stok') {
                                $delta = (float) ($attributes['delta_quantity'] ?? ($mQty - (float) ($attributes['system_quantity'] ?? 0)));
                                $initialStock += $delta;
                            } else {
                                $initialStock += $mQty;
                            }
                        } else {
                            $initialStock += $mQty;
                        }
                    }
                }
            }
        }

        $sorted = $rows->sortBy('raw_date')->values();
        $runningBalance = $initialStock;
        $finalRows = $sorted->map(function ($row) use (&$runningBalance) {
            $runningBalance += $row['qty_change'];
            $row['balance'] = $this->formatNumber($runningBalance);

            return $row;
        })->sortByDesc('raw_date')->values();

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
     * @return array<string, float>
     */
    public function buildStockMap(array $filters): array
    {
        $warehouseFilter = filled($filters['warehouse_id'] ?? null) ? (int) $filters['warehouse_id'] : null;
        $productFilter = filled($filters['product_id'] ?? null) ? (int) $filters['product_id'] : null;
        $productIdsFilter = !empty($filters['product_ids']) && is_array($filters['product_ids'])
            ? array_filter(array_map('intval', $filters['product_ids']))
            : null;
        $productIdsSet = !empty($productIdsFilter) ? array_flip($productIdsFilter) : null;
        $asOfDate = $this->resolveDateFilter($filters['as_of_date'] ?? null) ?? now();

        $stock = [];

        // 1. Initial Stock Batches
        $batches = \Illuminate\Support\Facades\DB::table('inventory_batches')
            ->where(function ($q) use ($asOfDate) {
                $q->whereDate('entry_date', '<=', $asOfDate->toDateString())
                  ->orWhere(fn ($sub) => $sub->whereNull('entry_date')->whereDate('created_at', '<=', $asOfDate->toDateString()));
            })
            ->when($productFilter !== null, fn ($q) => $q->where('product_id', $productFilter))
            ->when($productIdsFilter !== null, fn ($q) => $q->whereIn('product_id', $productIdsFilter))
            ->when($warehouseFilter !== null, fn ($q) => $q->where('warehouse_id', $warehouseFilter))
            ->get();

        $sourceIds = $batches->pluck('source_id')->filter()->unique()->values()->all();
        $adjustmentSourceIds = empty($sourceIds) ? [] : \Illuminate\Support\Facades\DB::table('operation_documents')
            ->whereIn('id', $sourceIds)
            ->where('document_type', 'inventory_adjustment')
            ->pluck('id')
            ->flip()
            ->all();

        foreach ($batches as $batch) {
            if ($batch->source_id && isset($adjustmentSourceIds[$batch->source_id])) {
                continue;
            }
            $productId = (int) $batch->product_id;
            $warehouseId = (int) $batch->warehouse_id;
            $key = sprintf('%d:%d', $productId, $warehouseId);
            $stock[$key] = (float) (($stock[$key] ?? 0) + (float) $batch->qty_received);
        }

        // 2. Inventory Documents
        $inventoryDocuments = InventoryDocument::query()
            ->with(['lines'])
            ->where(function ($q) use ($asOfDate) {
                $q->whereDate('document_date', '<=', $asOfDate->toDateString())
                  ->orWhere(fn ($sub) => $sub->whereNull('document_date')->whereDate('created_at', '<=', $asOfDate->toDateString()));
            })
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
            ->get();

        foreach ($inventoryDocuments as $document) {
            foreach ($document->lines as $line) {
                $productId = $line->product_id ? (int) $line->product_id : null;

                if ($productId === null
                    || ($productFilter !== null && $productId !== $productFilter)
                    || ($productIdsSet !== null && !isset($productIdsSet[$productId]))) {
                    continue;
                }

                foreach ($this->inventoryMovements($document, $line) as $warehouseId => $quantity) {
                    if ($warehouseFilter !== null && $warehouseId !== $warehouseFilter) {
                        continue;
                    }

                    $key = sprintf('%d:%d', $productId, $warehouseId);
                    $stock[$key] = (float) (($stock[$key] ?? 0) + $quantity);
                }
            }
        }

        // 3. Operation Documents (Purchases, Sales, Transfers, Adjustments, Returns)
        $operationDocuments = OperationDocument::query()
            ->with(['lines'])
            ->where(function ($q) use ($asOfDate) {
                $q->whereDate('entry_date', '<=', $asOfDate->toDateString())
                  ->orWhere(fn ($sub) => $sub->whereNull('entry_date')->whereDate('created_at', '<=', $asOfDate->toDateString()));
            })
            ->whereIn('document_type', ['goods_receipt', 'purchase_invoice', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return', 'inventory_adjustment', 'stock_transfer'])
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']))
            ->when(!empty($filters['exclude_document_id']), fn ($q) => $q->where('id', '!=', (int) $filters['exclude_document_id']))
            ->get();

        static $refCodeProductMap = [];
        static $descProductMap = [];

        foreach ($operationDocuments as $document) {
            foreach ($document->lines as $line) {
                $productId = $line->product_id ? (int) $line->product_id : null;
                if ($productId === null && !empty($line->reference_code)) {
                    $productId = $refCodeProductMap[$line->reference_code] ??= Product::where('code', $line->reference_code)->value('id');
                }
                if ($productId === null && !empty($line->description)) {
                    $productId = $descProductMap[$line->description] ??= Product::where('name', $line->description)->value('id');
                }

                $warehouseId = $line->warehouse_id ? (int) $line->warehouse_id : ($document->warehouse_id ? (int) $document->warehouse_id : 1);

                if ($productId === null) {
                    continue;
                }

                if ($productFilter !== null && $productId !== $productFilter) {
                    continue;
                }

                if ($productIdsSet !== null && !isset($productIdsSet[$productId])) {
                    continue;
                }

                $quantity = (float) ($line->quantity ?? 0);

                if ($document->document_type === 'stock_transfer') {
                    $counterpartId = $document->counterpart_warehouse_id ? (int) $document->counterpart_warehouse_id : null;
                    if ($warehouseId !== null && ($warehouseFilter === null || $warehouseId === $warehouseFilter)) {
                        $key = sprintf('%d:%d', $productId, $warehouseId);
                        $stock[$key] = (float) ($stock[$key] ?? 0) - $quantity;
                    }
                    if ($counterpartId !== null && ($warehouseFilter === null || $counterpartId === $warehouseFilter)) {
                        $key = sprintf('%d:%d', $productId, $counterpartId);
                        $stock[$key] = (float) ($stock[$key] ?? 0) + $quantity;
                    }
                    continue;
                }

                if ($warehouseId === null || ($warehouseFilter !== null && $warehouseId !== $warehouseFilter)) {
                    continue;
                }

                if (in_array($document->document_type, ['sales_delivery', 'sales_invoice', 'purchase_return'], true)) {
                    $quantity *= -1;
                } elseif ($document->document_type === 'inventory_adjustment') {
                    $attributes = is_string($line->attributes) ? json_decode($line->attributes, true) : ($line->attributes ?? []);
                    $adjType = $attributes['adjustment_type'] ?? 'Penambahan';
                    if ($adjType === 'Pengurangan' && $quantity > 0) {
                        $quantity *= -1;
                    } elseif ($adjType === 'Atur Stok') {
                        $quantity = (float) ($attributes['delta_quantity'] ?? ($quantity - (float) ($attributes['system_quantity'] ?? 0)));
                    }
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
            ->with(['baseUnit', 'purchaseUnit', 'salesUnit', 'preferredSupplier', 'mainSupplier', 'unitConversions', 'unitConversions.unit'])
            ->when(filled($filters['product_id'] ?? null), fn ($query) => $query->whereKey((int) $filters['product_id']))
            ->get();
    }

    protected function formatMultiUnitQuantity(float $quantity, Product $product): string
    {
        $baseUnitName = $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? '';
        $conversions = $product->relationLoaded('unitConversions')
            ? $product->unitConversions
            : $product->unitConversions()->with('unit')->get();

        $validConversions = $conversions
            ->filter(fn ($conv) => $conv->unit && (float) $conv->quantity > 0)
            ->sortByDesc(fn ($conv) => (float) $conv->quantity)
            ->values();

        if ($validConversions->isEmpty() || $quantity <= 0) {
            return sprintf('%s %s', $this->formatNumber($quantity), $baseUnitName);
        }

        $parts = [];
        $remaining = $quantity;

        foreach ($validConversions as $conv) {
            $ratio = (float) $conv->quantity;
            if ($ratio <= 0) {
                continue;
            }

            if ($remaining >= $ratio) {
                $count = floor($remaining / $ratio);
                if ($count > 0) {
                    $parts[] = sprintf('%s %s', $this->formatNumber($count), $conv->unit->name);
                    $remaining = round($remaining - ($count * $ratio), 4);
                }
            }
        }

        if ($remaining > 0.00001 || empty($parts)) {
            $parts[] = sprintf('%s %s', $this->formatNumber($remaining), $baseUnitName);
        }

        return implode(', ', $parts);
    }

    /**
     * @param  Collection<int, Product>|array<int, int>  $products
     * @return Collection<int, Supplier>
     */
    protected function resolveSupplierMap($products): Collection
    {
        $productCollection = $products instanceof Collection
            ? $products
            : Product::with(['mainSupplier', 'preferredSupplier'])->whereIn('id', (array) $products)->get();

        if ($productCollection->isEmpty()) {
            return collect();
        }

        $allSuppliers = Supplier::all()->keyBy('id');
        $supplierByCode = Supplier::all()->keyBy('code');
        $defaultSupplier = $supplierByCode->get('SUPP-001') ?? $allSuppliers->first();

        $missingSupplierProductIds = [];
        $supplierMap = collect();

        foreach ($productCollection as $product) {
            $supplier = $product->preferredSupplier ?? $product->mainSupplier;
            if ($supplier) {
                $supplierMap->put($product->id, $supplier);
            } else {
                $missingSupplierProductIds[] = $product->id;
            }
        }

        if (empty($missingSupplierProductIds)) {
            return $supplierMap;
        }

        // Tier 2: Check supplier_prices table
        $supplierPrices = DB::table('supplier_prices')
            ->whereIn('product_id', $missingSupplierProductIds)
            ->orderByDesc('id')
            ->get()
            ->keyBy('product_id');

        // Tier 3: Check operation documents (purchase_invoice, purchase_order, goods_receipt)
        $docSuppliers = DB::table('operation_document_lines as odl')
            ->join('operation_documents as od', 'odl.operation_document_id', '=', 'od.id')
            ->whereIn('odl.product_id', $missingSupplierProductIds)
            ->whereNotNull('od.supplier_id')
            ->orderByDesc('od.id')
            ->select('odl.product_id', 'od.supplier_id')
            ->get()
            ->keyBy('product_id');

        $updates = [];

        foreach ($productCollection as $product) {
            if ($supplierMap->has($product->id)) {
                continue;
            }

            $resolvedSupplier = null;

            // Check Tier 2
            if (isset($supplierPrices[$product->id])) {
                $suppId = (int) $supplierPrices[$product->id]->supplier_id;
                $resolvedSupplier = $allSuppliers->get($suppId);
            }

            // Check Tier 3
            if (!$resolvedSupplier && isset($docSuppliers[$product->id])) {
                $suppId = (int) $docSuppliers[$product->id]->supplier_id;
                $resolvedSupplier = $allSuppliers->get($suppId);
            }

            // Check Tier 4: Domain pattern matching by code prefix or brand/category
            if (!$resolvedSupplier) {
                $code = strtoupper((string) $product->code);
                $name = strtolower((string) $product->name);

                if (str_starts_with($code, 'SMN-') || str_contains($name, 'semen')) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-001') ?? $defaultSupplier;
                } elseif (
                    str_starts_with($code, 'PSR-') || str_starts_with($code, 'SPL-') ||
                    str_starts_with($code, 'BTA-') || str_starts_with($code, 'BTK-') ||
                    str_contains($name, 'pasir') || str_contains($name, 'bata') || str_contains($name, 'split') || str_contains($name, 'batako')
                ) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-006') ?? $defaultSupplier;
                } elseif (
                    str_starts_with($code, 'BES-') || str_starts_with($code, 'BJA-') ||
                    str_starts_with($code, 'RNG-') || str_starts_with($code, 'WMH-') ||
                    str_starts_with($code, 'KWT-') || str_starts_with($code, 'PAK-') ||
                    str_contains($name, 'besi') || str_contains($name, 'baja') || str_contains($name, 'paku') || str_contains($name, 'kawat')
                ) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-004') ?? $defaultSupplier;
                } elseif (
                    str_starts_with($code, 'CAT-') || str_starts_with($code, 'AQP-') ||
                    str_starts_with($code, 'THN-') || str_starts_with($code, 'BND-') ||
                    str_contains($name, 'cat') || str_contains($name, 'aquaproof') || str_contains($name, 'thinner')
                ) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-003') ?? $defaultSupplier;
                } elseif (
                    str_starts_with($code, 'PIP-') || str_starts_with($code, 'KRN-') ||
                    str_starts_with($code, 'STP-') || str_starts_with($code, 'LEM-') ||
                    str_starts_with($code, 'TRN-') || str_contains($name, 'pipa') || str_contains($name, 'toren') || str_contains($name, 'kran')
                ) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-002') ?? $defaultSupplier;
                } elseif (
                    str_starts_with($code, 'TPL-') || str_starts_with($code, 'SNG-') ||
                    str_starts_with($code, 'SPD-') || str_starts_with($code, 'ASB-') ||
                    str_starts_with($code, 'GYP-') || str_contains($name, 'triplek') || str_contains($name, 'seng') || str_contains($name, 'spandek') || str_contains($name, 'gypsum') || str_contains($name, 'asbes')
                ) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-005') ?? $defaultSupplier;
                } elseif (
                    str_starts_with($code, 'KBL-') || str_starts_with($code, 'SKP-') ||
                    str_starts_with($code, 'CGK-') || str_starts_with($code, 'MTR-') ||
                    str_starts_with($code, 'KRM-') || str_starts_with($code, 'KUS-') ||
                    str_starts_with($code, 'ROL-') || str_contains($name, 'kabel') || str_contains($name, 'sekop') || str_contains($name, 'cangkul') || str_contains($name, 'meteran') || str_contains($name, 'keramik') || str_contains($name, 'kuas')
                ) {
                    $resolvedSupplier = $supplierByCode->get('SUPP-008') ?? $defaultSupplier;
                } else {
                    $resolvedSupplier = $defaultSupplier;
                }
            }

            if ($resolvedSupplier) {
                $supplierMap->put($product->id, $resolvedSupplier);
                $updates[$product->id] = $resolvedSupplier->id;
            }
        }

        // Auto-heal database in background silently
        if (!empty($updates)) {
            try {
                foreach ($updates as $pId => $sId) {
                    Product::where('id', $pId)
                        ->whereNull('main_supplier_id')
                        ->update(['main_supplier_id' => $sId]);
                }
            } catch (\Throwable $e) {
                // Non-blocking auto-heal
            }
        }

        return $supplierMap;
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
        $street = $warehouse->street ?: $warehouse->branch?->street;
        $city = $warehouse->city ?: $warehouse->branch?->city;
        $province = $warehouse->province ?: $warehouse->branch?->province;
        $country = $warehouse->country ?: $warehouse->branch?->country;

        return collect([
            $street,
            $city,
            $province,
            $country,
        ])->filter()->implode(', ');
    }

}
