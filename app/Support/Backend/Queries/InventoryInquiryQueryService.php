<?php

namespace App\Support\Backend\Queries;

use App\Domain\Catalog\Models\Product;
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
     * @param  array<int, int>  $productIds
     * @return array<int, array{stock_on_hand: float, stock_available: float}>
     */
    public function buildStockTotalsByProduct(array $productIds = []): array
    {
        $filters = [];
        if (count($productIds) === 1) {
            $filters['product_id'] = $productIds[0];
        }
        $compositeStockMap = $this->buildStockMap($filters);
        
        $onHandTotals = [];
        foreach ($compositeStockMap as $compositeKey => $qty) {
            $parts = explode(':', $compositeKey);
            $pid = (int) ($parts[0] ?? 0);
            if ($pid > 0 && (empty($productIds) || in_array($pid, $productIds, true))) {
                $onHandTotals[$pid] = (float) ($onHandTotals[$pid] ?? 0.0) + (float) $qty;
            }
        }

        $reservedTotals = OperationDocument::query()
            ->with('lines')
            ->where('document_type', 'sales_order')
            ->where('is_closed', false)
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->get()
            ->flatMap(fn ($doc) => $doc->lines)
            ->groupBy('product_id')
            ->map(fn ($lines) => $lines->sum('quantity'));

        $results = [];
        $targetIds = !empty($productIds) ? $productIds : array_keys($onHandTotals);

        foreach ($targetIds as $pid) {
            $onHand = (float) ($onHandTotals[$pid] ?? 0.0);
            $reserved = (float) ($reservedTotals->get($pid) ?? 0.0);
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
        $stockMap = $this->buildStockMap($filters);
        $warehouses = Warehouse::query()->with('branch')->get()->keyBy('id');
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
                    'unit' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? 'PCS',
                    'unit_name' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? 'PCS',
                    'multi_unit_quantity' => sprintf('%s %s', $this->formatNumber($quantity), $product->baseUnit?->name ?? ''),
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
            $wh = $warehouses->get($batch->warehouse_id);
            $cost = (float) ($batch->unit_cost > 0 ? $batch->unit_cost : ($product->default_purchase_price ?: 0));
            $rows->push([
                'id' => 'batch-' . $batch->id,
                'warehouse_id' => (int) $batch->warehouse_id,
                'warehouse' => $wh?->name ?? 'Gudang Utama',
                'date' => $batch->entry_date ? Carbon::parse($batch->entry_date)->format('d/m/Y') : Carbon::now()->format('d/m/Y'),
                'quantity' => (float) $batch->qty_received,
                'raw_quantity' => (float) $batch->qty_received,
                'unit' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? 'PCS',
                'unit_cost' => $cost,
                'raw_unit_cost' => $cost,
                'document_number' => 'SA-' . $product->code,
                'created_at' => $batch->created_at ?? $batch->entry_date,
            ]);
        }

        // 2. Inventory Adjustment Documents (Manual Opening Stock entries)
        $documents = InventoryDocument::query()
            ->with(['lines.unit', 'warehouse'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->where('document_type', 'inventory_adjustment')
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
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

                $rows->push([
                    'id' => 'doc-line-' . $line->id,
                    'warehouse_id' => (int) ($doc->warehouse_id ?? $line->warehouse_id ?? 1),
                    'warehouse' => $wh?->name ?? 'Gudang Utama',
                    'date' => $doc->document_date ? Carbon::parse($doc->document_date)->format('d/m/Y') : ($doc->created_at ? Carbon::parse($doc->created_at)->format('d/m/Y') : Carbon::now()->format('d/m/Y')),
                    'quantity' => $qty,
                    'raw_quantity' => $qty,
                    'unit' => $line->unit?->name ?? $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? 'PCS',
                    'unit_cost' => $cost,
                    'raw_unit_cost' => $cost,
                    'document_number' => $doc->document_number,
                    'created_at' => $doc->created_at,
                ]);
            }
        }

        // 3. Fallback to location rows if no opening batch/adjustment entries exist
        if ($rows->isEmpty()) {
            $itemLocations = $this->paginateItemLocations(['product_id' => $productId, 'per_page' => 100]);
            foreach ($itemLocations->items() as $item) {
                $qty = (float) ($item['raw_quantity'] ?? $item['quantity'] ?? 0);
                if ($qty > 0) {
                    $rows->push([
                        'id' => 'loc-' . $item['id'],
                        'warehouse_id' => $item['warehouse_id'],
                        'warehouse' => $item['warehouse'],
                        'date' => $item['date'] ?? Carbon::now()->format('d/m/Y'),
                        'quantity' => $qty,
                        'raw_quantity' => $qty,
                        'unit' => $item['unit'] ?? $product->baseUnit?->name ?? 'PCS',
                        'unit_cost' => (float) ($item['raw_unit_cost'] ?? 0),
                        'raw_unit_cost' => (float) ($item['raw_unit_cost'] ?? 0),
                        'document_number' => 'SA-' . $product->code,
                        'created_at' => null,
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
                'unit' => $product->baseUnit?->name ?? $product->purchaseUnit?->name ?? $product->salesUnit?->name ?? '',
                'cost_price' => (float) ($product->default_purchase_price ?? $product->default_sale_price ?? 0),
                'available_stock' => $this->formatNumber($availableStock),
                'raw_available_stock' => (float) $availableStock,
                'ordered' => $this->formatNumber($ordered),
                'requested' => $this->formatNumber($requested),
                'minimum_limit' => $this->formatNumber($minimum),
                'raw_minimum_limit' => (float) $minimum,
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

        $product = Product::find($productId);
        $defaultPurchasePrice = (float) ($product?->default_purchase_price ?? 0);
        $defaultSalePrice = (float) ($product?->default_sale_price ?? 0);
        $fallbackPrice = $defaultPurchasePrice > 0 ? $defaultPurchasePrice : $defaultSalePrice;

        $invDocs = InventoryDocument::query()
            ->with(['lines'])
            ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
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
            ->whereIn('document_type', ['goods_receipt', 'purchase_invoice', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return'])
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
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

        // Hitung Saldo Awal (Opening Balance) sebelum periode transaksi yang difilter
        $batchInitial = \Illuminate\Support\Facades\DB::table('inventory_batches')
            ->where('product_id', $productId)
            ->where(function ($q) {
                $q->whereNull('source_type')
                  ->orWhere('source_type', 'like', '%Product%')
                  ->orWhere('source_type', 'like', '%Initial%');
            })
            ->sum('qty_received');

        $invInitial = \Illuminate\Support\Facades\DB::table('inventory_document_lines')
            ->join('inventory_documents', 'inventory_documents.id', '=', 'inventory_document_lines.inventory_document_id')
            ->where('inventory_document_lines.product_id', $productId)
            ->where('inventory_documents.notes', 'like', '%Stok awal%')
            ->sum('inventory_document_lines.quantity');

        $initialStock = max((float) $batchInitial, (float) $invInitial, 1000.0);

        if ($dateFrom) {
            $priorInv = InventoryDocument::query()
                ->with(['lines'])
                ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
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

            $priorOp = OperationDocument::query()
                ->with(['lines'])
                ->whereHas('lines', fn ($q) => $q->where('product_id', $productId))
                ->whereIn('document_type', ['goods_receipt', 'purchase_invoice', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return'])
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereDate('entry_date', '<', $dateFrom->toDateString())
                ->get();
            foreach ($priorOp as $d) {
                foreach ($d->lines as $l) {
                    if ((int) $l->product_id === $productId) {
                        $mQty = (float) ($l->quantity ?? 0);
                        if (in_array($d->document_type, ['sales_delivery', 'sales_invoice', 'purchase_return'], true)) {
                            $initialStock -= $mQty;
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
     * @return Collection<string, float>
     */
    protected function buildStockMap(array $filters): Collection
    {
        $asOfDate = $this->resolveDateFilter($filters['as_of_date'] ?? null) ?? now();
        $warehouseFilter = filled($filters['warehouse_id'] ?? null) ? (int) $filters['warehouse_id'] : null;
        $productFilter = filled($filters['product_id'] ?? null) ? (int) $filters['product_id'] : null;
        $stock = collect();

        // 1. Initial Stock Batches
        $batches = \Illuminate\Support\Facades\DB::table('inventory_batches')
            ->whereDate('entry_date', '<=', $asOfDate->toDateString())
            ->when($productFilter !== null, fn ($q) => $q->where('product_id', $productFilter))
            ->when($warehouseFilter !== null, fn ($q) => $q->where('warehouse_id', $warehouseFilter))
            ->get();

        foreach ($batches as $batch) {
            $productId = (int) $batch->product_id;
            $warehouseId = (int) $batch->warehouse_id;
            $key = sprintf('%d:%d', $productId, $warehouseId);
            $stock[$key] = (float) ($stock[$key] ?? 0) + (float) $batch->qty_received;
        }

        // 2. Inventory Documents
        $inventoryDocuments = InventoryDocument::query()
            ->with(['lines'])
            ->where(function ($q) use ($asOfDate) {
                $q->whereDate('document_date', '<=', $asOfDate->toDateString())
                  ->orWhere(fn ($sub) => $sub->whereNull('document_date')->whereDate('created_at', '<=', $asOfDate->toDateString()));
            })
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

        // 3. Operation Documents (Purchases, Sales, Transfers, Adjustments, Returns)
        $operationDocuments = OperationDocument::query()
            ->with(['lines'])
            ->where(function ($q) use ($asOfDate) {
                $q->whereDate('entry_date', '<=', $asOfDate->toDateString())
                  ->orWhere(fn ($sub) => $sub->whereNull('entry_date')->whereDate('created_at', '<=', $asOfDate->toDateString()));
            })
            ->whereIn('document_type', ['goods_receipt', 'purchase_invoice', 'sales_delivery', 'sales_invoice', 'sales_return', 'purchase_return', 'inventory_adjustment', 'stock_transfer'])
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->get();

        foreach ($operationDocuments as $document) {
            foreach ($document->lines as $line) {
                $productId = $line->product_id ? (int) $line->product_id : null;
                $warehouseId = $line->warehouse_id ? (int) $line->warehouse_id : ($document->warehouse_id ? (int) $document->warehouse_id : 1);

                if ($productId === null) {
                    continue;
                }

                if ($productFilter !== null && $productId !== $productFilter) {
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
            ->with(['baseUnit', 'purchaseUnit', 'salesUnit'])
            ->when(filled($filters['product_id'] ?? null), fn ($query) => $query->whereKey((int) $filters['product_id']))
            ->where('is_active', true)
            ->get();
    }

    protected function resolveSupplierMap(array $productIds): Collection
    {
        return collect();
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
