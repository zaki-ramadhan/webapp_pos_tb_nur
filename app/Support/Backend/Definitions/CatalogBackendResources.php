<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductCategory;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class CatalogBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'units' => new BackendResourceBlueprint(
                key: 'units',
                label: 'Units',
                searchColumns: ['code', 'name'],
                modelClass: Unit::class,
                with: ['tax'],
                storeRules: [
                    'tax_id' => ['nullable', 'integer', 'exists:taxes,id'],
                    'code' => ['nullable', 'string', 'max:50', 'unique:units,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'precision' => ['nullable', 'integer', 'min:0', 'max:6'],
                    'tax_reference_code' => ['nullable', 'string', 'max:100'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'tax_id' => ['nullable', 'integer', 'exists:taxes,id'],
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('units', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'precision' => ['nullable', 'integer', 'min:0', 'max:6'],
                    'tax_reference_code' => ['nullable', 'string', 'max:100'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'product-categories' => new BackendResourceBlueprint(
                key: 'product-categories',
                label: 'Product Categories',
                searchColumns: ['code', 'name', 'slug'],
                modelClass: ProductCategory::class,
                with: ['parent'],
                storeRules: [
                    'parent_id' => ['nullable', 'integer', 'exists:product_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', 'unique:product_categories,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'slug' => ['nullable', 'string', 'max:160', 'unique:product_categories,slug'],
                    'is_default' => ['sometimes', 'boolean'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'parent_id' => ['nullable', 'integer', 'exists:product_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('product_categories', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'slug' => ['nullable', 'string', 'max:160', Rule::unique('product_categories', 'slug')->ignore($record)],
                    'is_default' => ['sometimes', 'boolean'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'warehouses' => new BackendResourceBlueprint(
                key: 'warehouses',
                label: 'Warehouses',
                searchColumns: ['code', 'name', 'warehouse_type'],
                modelClass: Warehouse::class,
                with: ['branch'],
                storeRules: [
                    'branch_id'          => ['required', 'integer', 'exists:branches,id'],
                    'code'               => ['required', 'string', 'max:50', 'unique:warehouses,code'],
                    'name'               => ['required', 'string', 'max:120'],
                    'description'        => ['nullable', 'string'],
                    'responsible_person' => ['nullable', 'string', 'max:120'],
                    'warehouse_type'     => ['required', 'string', 'max:50'],
                    'is_active'          => ['sometimes', 'boolean'],
                    'street'             => ['nullable', 'string'],
                    'city'               => ['nullable', 'string', 'max:100'],
                    'postal_code'        => ['nullable', 'string', 'max:20'],
                    'province'           => ['nullable', 'string', 'max:100'],
                    'country'            => ['nullable', 'string', 'max:100'],
                    'all_users'          => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'branch_id'          => ['required', 'integer', 'exists:branches,id'],
                    'code'               => ['required', 'string', 'max:50', Rule::unique('warehouses', 'code')->ignore($record)],
                    'name'               => ['required', 'string', 'max:120'],
                    'description'        => ['nullable', 'string'],
                    'responsible_person' => ['nullable', 'string', 'max:120'],
                    'warehouse_type'     => ['required', 'string', 'max:50'],
                    'is_active'          => ['sometimes', 'boolean'],
                    'street'             => ['nullable', 'string'],
                    'city'               => ['nullable', 'string', 'max:100'],
                    'postal_code'        => ['nullable', 'string', 'max:20'],
                    'province'           => ['nullable', 'string', 'max:100'],
                    'country'            => ['nullable', 'string', 'max:100'],
                    'all_users'          => ['sometimes', 'boolean'],
                ],
            ),
            'products' => new BackendResourceBlueprint(
                key: 'products',
                label: 'Products',
                searchColumns: ['code', 'barcode', 'name', 'product_type'],
                modelClass: Product::class,
                with: [
                    'category', 'brand', 'baseUnit', 'purchaseUnit', 'salesUnit', 'attachments',
                    'groupItems', 'groupItems.childProduct', 'groupItems.unit',
                ],
                storeRules: self::productRules(),
                updateRules: fn (Model $record) => self::productRules($record),
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('unit_conversions', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'unitConversions',
                            $payload['unit_conversions'],
                            ['unit_id', 'quantity'],
                            fn (array $row): bool => filled($row['unit_id'] ?? null),
                        );
                    }

                    if (array_key_exists('prices', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'prices',
                            $payload['prices'],
                            ['unit_id', 'price_type', 'price', 'effective_from', 'effective_until'],
                            fn (array $row): bool => filled($row['price_type'] ?? null),
                        );
                    }

                    if (array_key_exists('group_items', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'groupItems',
                            $payload['group_items'],
                            ['child_product_id', 'unit_id', 'quantity'],
                            fn (array $row): bool => filled($row['child_product_id'] ?? null),
                        );
                    }


                    if (array_key_exists('opening_stock_rows', $payload) && is_array($payload['opening_stock_rows'])) {
                        foreach ($payload['opening_stock_rows'] as $stockRow) {
                            $qty = (float) ($stockRow['quantity'] ?? 0);
                            $cost = (float) ($stockRow['unit_cost'] ?? $stockRow['unitCost'] ?? $record->default_purchase_price ?? 0);
                            if ($qty > 0) {
                                $warehouseId = !empty($stockRow['warehouse_id']) ? (int) $stockRow['warehouse_id'] : null;
                                if (!$warehouseId && !empty($stockRow['warehouse'])) {
                                    $warehouseName = trim((string) $stockRow['warehouse']);
                                    $warehouseId = \App\Domain\Catalog\Models\Warehouse::where('name', $warehouseName)
                                        ->orWhere('code', $warehouseName)
                                        ->orWhere('name', 'like', '%' . $warehouseName . '%')
                                        ->value('id');
                                }
                                if (!$warehouseId && !empty($stockRow['warehouse_name'])) {
                                    $warehouseName = trim((string) $stockRow['warehouse_name']);
                                    $warehouseId = \App\Domain\Catalog\Models\Warehouse::where('name', $warehouseName)
                                        ->orWhere('code', $warehouseName)
                                        ->orWhere('name', 'like', '%' . $warehouseName . '%')
                                        ->value('id');
                                }
                                if (!$warehouseId) {
                                    $warehouseId = \App\Domain\Catalog\Models\Warehouse::where('is_active', true)->value('id') ?? 1;
                                }

                                $rawDate = $stockRow['date'] ?? null;
                                $docDate = now()->toDateString();
                                if (!empty($rawDate) && $rawDate !== '-') {
                                    try {
                                        if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', trim($rawDate))) {
                                            $docDate = \Carbon\Carbon::createFromFormat('d/m/Y', trim($rawDate))->toDateString();
                                        } else {
                                            $docDate = \Carbon\Carbon::parse($rawDate)->toDateString();
                                        }
                                    } catch (\Throwable) {
                                        $docDate = now()->toDateString();
                                    }
                                }

                                $doc = \App\Domain\Inventory\Models\InventoryDocument::create([
                                    'document_type' => 'inventory_adjustment',
                                    'document_number' => 'SA-' . ($record->code ?? $record->id) . '-' . time() . '-' . rand(10, 99),
                                    'warehouse_id' => $warehouseId,
                                    'status' => 'posted',
                                    'document_date' => $docDate,
                                    'notes' => 'Stok awal barang: ' . $record->name,
                                ]);

                                $doc->lines()->create([
                                    'product_id' => $record->id,
                                    'unit_id' => $record->base_unit_id,
                                    'quantity' => $qty,
                                    'warehouse_id' => $warehouseId,
                                    'notes' => 'Stok awal ' . $record->name,
                                    'attributes' => [
                                        'unit_price' => $cost,
                                        'total_amount' => $qty * $cost,
                                        'adjustment_type' => 'Penambahan',
                                    ],
                                ]);
                            }
                        }
                    }
                },
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function productRules(?Model $record = null): array
    {
        return [
            'category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'base_unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'purchase_unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'sales_unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'main_supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'inventory_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'sales_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'sales_return_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'sales_discount_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'delivered_goods_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'cogs_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'purchase_return_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'uninvoiced_purchase_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'code' => ['required', 'string', 'max:50', $record ? Rule::unique('products', 'code')->ignore($record) : 'unique:products,code'],
            'barcode' => ['nullable', 'string', 'max:100', $record ? Rule::unique('products', 'barcode')->ignore($record) : 'unique:products,barcode'],
            'name' => ['required', 'string', 'max:160'],
            'product_type' => ['required', 'string', 'max:50'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'default_purchase_price' => ['nullable', 'numeric', 'min:0'],
            'default_sale_price' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'use_group_price' => ['sometimes', 'boolean'],
            'group_items' => ['sometimes', 'array'],
            'group_items.*.id' => ['sometimes', 'integer', 'exists:product_group_items,id'],
            'group_items.*.child_product_id' => ['required_with:group_items', 'integer', 'exists:products,id'],
            'group_items.*.unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'group_items.*.quantity' => ['required_with:group_items', 'numeric', 'gt:0'],
            'opening_stock_rows' => ['sometimes', 'array'],
            'opening_stock_rows.*.warehouse_id' => ['nullable'],
            'opening_stock_rows.*.warehouse_name' => ['nullable'],
            'opening_stock_rows.*.warehouse' => ['nullable'],
            'opening_stock_rows.*.quantity' => ['nullable'],
            'opening_stock_rows.*.unit_cost' => ['nullable'],
            'opening_stock_rows.*.unit_name' => ['nullable'],
            'opening_stock_rows.*.date' => ['nullable'],
            'unit_conversions' => ['sometimes', 'array'],
            'unit_conversions.*.id' => ['nullable'],
            'unit_conversions.*.unit_id' => ['nullable'],
            'unit_conversions.*.quantity' => ['nullable'],
        ];
    }
}
