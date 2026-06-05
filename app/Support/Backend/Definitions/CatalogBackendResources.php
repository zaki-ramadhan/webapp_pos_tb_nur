<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Catalog\Models\Brand;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductCategory;
use App\Domain\Catalog\Models\SupplierPrice;
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
            'brands' => new BackendResourceBlueprint(
                key: 'brands',
                label: 'Brands',
                searchColumns: ['code', 'name'],
                modelClass: Brand::class,
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:brands,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('brands', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
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
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'parent_id' => ['nullable', 'integer', 'exists:product_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('product_categories', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'slug' => ['nullable', 'string', 'max:160', Rule::unique('product_categories', 'slug')->ignore($record)],
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
                    'branch_id' => ['required', 'integer', 'exists:branches,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:warehouses,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'warehouse_type' => ['required', 'string', 'max:50'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'branch_id' => ['required', 'integer', 'exists:branches,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('warehouses', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'warehouse_type' => ['required', 'string', 'max:50'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'products' => new BackendResourceBlueprint(
                key: 'products',
                label: 'Products',
                searchColumns: ['code', 'barcode', 'name', 'product_type'],
                modelClass: Product::class,
                with: ['category', 'brand', 'baseUnit', 'purchaseUnit', 'salesUnit', 'unitConversions', 'prices', 'attachments'],
                storeRules: [
                    'category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
                    'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                    'base_unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'purchase_unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'sales_unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:products,code'],
                    'barcode' => ['nullable', 'string', 'max:100', 'unique:products,barcode'],
                    'name' => ['required', 'string', 'max:160'],
                    'product_type' => ['required', 'string', 'max:50'],
                    'minimum_stock' => ['nullable', 'numeric', 'min:0'],
                    'default_purchase_price' => ['nullable', 'numeric', 'min:0'],
                    'default_sale_price' => ['nullable', 'numeric', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'unit_conversions' => ['sometimes', 'array'],
                    'unit_conversions.*.id' => ['sometimes', 'integer', 'exists:product_unit_conversions,id'],
                    'unit_conversions.*.unit_id' => ['required_with:unit_conversions', 'integer', 'exists:units,id'],
                    'unit_conversions.*.quantity' => ['required_with:unit_conversions', 'numeric', 'gt:0'],
                    'prices' => ['sometimes', 'array'],
                    'prices.*.id' => ['sometimes', 'integer', 'exists:product_prices,id'],
                    'prices.*.unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'prices.*.price_type' => ['required_with:prices', 'string', 'max:40'],
                    'prices.*.price' => ['required_with:prices', 'numeric', 'min:0'],
                    'prices.*.effective_from' => ['nullable', 'date'],
                    'prices.*.effective_until' => ['nullable', 'date'],
                ],
                updateRules: fn (Model $record) => [
                    'category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
                    'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                    'base_unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'purchase_unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'sales_unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('products', 'code')->ignore($record)],
                    'barcode' => ['nullable', 'string', 'max:100', Rule::unique('products', 'barcode')->ignore($record)],
                    'name' => ['required', 'string', 'max:160'],
                    'product_type' => ['required', 'string', 'max:50'],
                    'minimum_stock' => ['nullable', 'numeric', 'min:0'],
                    'default_purchase_price' => ['nullable', 'numeric', 'min:0'],
                    'default_sale_price' => ['nullable', 'numeric', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'unit_conversions' => ['sometimes', 'array'],
                    'unit_conversions.*.id' => ['sometimes', 'integer', 'exists:product_unit_conversions,id'],
                    'unit_conversions.*.unit_id' => ['required_with:unit_conversions', 'integer', 'exists:units,id'],
                    'unit_conversions.*.quantity' => ['required_with:unit_conversions', 'numeric', 'gt:0'],
                    'prices' => ['sometimes', 'array'],
                    'prices.*.id' => ['sometimes', 'integer', 'exists:product_prices,id'],
                    'prices.*.unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'prices.*.price_type' => ['required_with:prices', 'string', 'max:40'],
                    'prices.*.price' => ['required_with:prices', 'numeric', 'min:0'],
                    'prices.*.effective_from' => ['nullable', 'date'],
                    'prices.*.effective_until' => ['nullable', 'date'],
                ],
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
                },
            ),
            'supplier-prices' => new BackendResourceBlueprint(
                key: 'supplier-prices',
                label: 'Supplier Prices',
                searchColumns: ['notes'],
                modelClass: SupplierPrice::class,
                with: ['supplier', 'product', 'unit'],
                storeRules: [
                    'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
                    'product_id' => ['required', 'integer', 'exists:products,id'],
                    'unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'price' => ['required', 'numeric', 'min:0'],
                    'effective_from' => ['required', 'date'],
                    'effective_until' => ['nullable', 'date', 'after_or_equal:effective_from'],
                    'notes' => ['nullable', 'string'],
                ],
                updateRules: fn (Model $record) => [
                    'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
                    'product_id' => ['required', 'integer', 'exists:products,id'],
                    'unit_id' => ['nullable', 'integer', 'exists:units,id'],
                    'price' => ['required', 'numeric', 'min:0'],
                    'effective_from' => ['required', 'date'],
                    'effective_until' => ['nullable', 'date', 'after_or_equal:effective_from'],
                    'notes' => ['nullable', 'string'],
                ],
            ),
        ];
    }
}
