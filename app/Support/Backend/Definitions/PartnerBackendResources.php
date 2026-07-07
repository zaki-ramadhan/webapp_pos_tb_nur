<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\CustomerCategory;
use App\Domain\Partner\Models\SalesCategory;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Partner\Models\SupplierCategory;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class PartnerBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'customer-categories' => new BackendResourceBlueprint(
                key: 'customer-categories',
                label: 'Customer Categories',
                searchColumns: ['code', 'name', 'notes'],
                modelClass: CustomerCategory::class,
                storeRules: [
                    'parent_id' => ['nullable', 'integer', 'exists:customer_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', 'unique:customer_categories,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'is_default' => ['sometimes', 'boolean'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'parent_id' => ['nullable', 'integer', 'exists:customer_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('customer_categories', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'is_default' => ['sometimes', 'boolean'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'supplier-categories' => new BackendResourceBlueprint(
                key: 'supplier-categories',
                label: 'Supplier Categories',
                searchColumns: ['code', 'name', 'notes'],
                modelClass: SupplierCategory::class,
                storeRules: [
                    'parent_id' => ['nullable', 'integer', 'exists:supplier_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', 'unique:supplier_categories,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'is_default' => ['sometimes', 'boolean'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'parent_id' => ['nullable', 'integer', 'exists:supplier_categories,id'],
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('supplier_categories', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'is_default' => ['sometimes', 'boolean'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'sales-categories' => new BackendResourceBlueprint(
                key: 'sales-categories',
                label: 'Sales Categories',
                searchColumns: ['code', 'name', 'description'],
                modelClass: SalesCategory::class,
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:sales_categories,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('sales_categories', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'customers' => new BackendResourceBlueprint(
                key: 'customers',
                label: 'Customers',
                searchColumns: ['code', 'name', 'business_phone', 'mobile_phone', 'email'],
                modelClass: Customer::class,
                with: ['category', 'currency', 'branches'],
                storeRules: [
                    'category_id' => ['nullable', 'integer', 'exists:customer_categories,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:customers,code'],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', app()->environment('testing') ? 'email' : 'email:rfc,dns', 'max:255'],
                    'fax' => ['nullable', 'string', 'max:50'],
                    'website' => ['nullable', 'string', 'max:255'],
                    'billing_address' => ['nullable', 'string'],
                    'shipping_address' => ['nullable', 'string'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'tax_number' => ['nullable', 'string', 'max:100'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                ],
                updateRules: fn (Model $record) => [
                    'category_id' => ['nullable', 'integer', 'exists:customer_categories,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('customers', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', app()->environment('testing') ? 'email' : 'email:rfc,dns', 'max:255'],
                    'fax' => ['nullable', 'string', 'max:50'],
                    'website' => ['nullable', 'string', 'max:255'],
                    'billing_address' => ['nullable', 'string'],
                    'shipping_address' => ['nullable', 'string'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'tax_number' => ['nullable', 'string', 'max:100'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('branch_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'branches', $payload['branch_ids']);
                    }
                },
            ),
            'suppliers' => new BackendResourceBlueprint(
                key: 'suppliers',
                label: 'Suppliers',
                searchColumns: ['code', 'name', 'business_phone', 'mobile_phone', 'email'],
                modelClass: Supplier::class,
                with: ['category', 'currency', 'branches'],
                storeRules: [
                    'category_id' => ['nullable', 'integer', 'exists:supplier_categories,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:suppliers,code'],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', app()->environment('testing') ? 'email' : 'email:rfc,dns', 'max:255'],
                    'fax' => ['nullable', 'string', 'max:50'],
                    'website' => ['nullable', 'string', 'max:255'],
                    'billing_address' => ['nullable', 'string'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'tax_number' => ['nullable', 'string', 'max:100'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                ],
                updateRules: fn (Model $record) => [
                    'category_id' => ['nullable', 'integer', 'exists:supplier_categories,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('suppliers', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', app()->environment('testing') ? 'email' : 'email:rfc,dns', 'max:255'],
                    'fax' => ['nullable', 'string', 'max:50'],
                    'website' => ['nullable', 'string', 'max:255'],
                    'billing_address' => ['nullable', 'string'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'tax_number' => ['nullable', 'string', 'max:100'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('branch_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'branches', $payload['branch_ids']);
                    }
                },
            ),
        ];
    }
}
