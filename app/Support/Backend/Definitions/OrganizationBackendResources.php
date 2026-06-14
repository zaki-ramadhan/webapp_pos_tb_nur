<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use App\Domain\Organization\Models\Employee;
use App\Domain\Organization\Models\FobTerm;
use App\Domain\Organization\Models\ShippingMethod;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class OrganizationBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'branches' => new BackendResourceBlueprint(
                key: 'branches',
                label: 'Branches',
                searchColumns: ['code', 'name', 'phone', 'email', 'city', 'province'],
                modelClass: Branch::class,
                with: ['users'],
                storeRules: [
                    'code' => ['required', 'string', 'max:50', 'unique:branches,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', 'email', 'max:255'],
                    'street' => ['nullable', 'string', 'max:255'],
                    'city' => ['nullable', 'string', 'max:120'],
                    'postal_code' => ['nullable', 'string', 'max:20'],
                    'province' => ['nullable', 'string', 'max:120'],
                    'country' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['required', 'string', 'max:50', Rule::unique('branches', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', 'email', 'max:255'],
                    'street' => ['nullable', 'string', 'max:255'],
                    'city' => ['nullable', 'string', 'max:120'],
                    'postal_code' => ['nullable', 'string', 'max:20'],
                    'province' => ['nullable', 'string', 'max:120'],
                    'country' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('user_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                    }
                },
            ),
            'departments' => new BackendResourceBlueprint(
                key: 'departments',
                label: 'Departments',
                searchColumns: ['code', 'name', 'notes'],
                modelClass: Department::class,
                with: ['users', 'parentDepartment'],
                storeRules: [
                    'code' => ['required', 'string', 'max:50', 'unique:departments,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'parent_department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'parent_department_id' => ['nullable', 'integer', 'exists:departments,id', Rule::notIn([$record->getKey()])],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('user_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                    }
                },
            ),
            'shipping-methods' => new BackendResourceBlueprint(
                key: 'shipping-methods',
                label: 'Shipping Methods',
                searchColumns: ['code', 'name', 'notes'],
                modelClass: ShippingMethod::class,
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:shipping_methods,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('shipping_methods', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'fob-terms' => new BackendResourceBlueprint(
                key: 'fob-terms',
                label: 'FOB Terms',
                searchColumns: ['code', 'name', 'notes'],
                modelClass: FobTerm::class,
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:fob_terms,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('fob_terms', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'employees' => new BackendResourceBlueprint(
                key: 'employees',
                label: 'Employees',
                searchColumns: ['employee_code', 'full_name', 'position', 'email', 'mobile_phone'],
                modelClass: Employee::class,
                with: ['branch', 'department', 'bankAccounts', 'user', 'attachments'],
                storeRules: [
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code'],
                    'employee_id_type' => ['nullable', 'string', 'max:50'],
                    'salutation' => ['nullable', 'string', 'max:20'],
                    'full_name' => ['required', 'string', 'max:160'],
                    'position' => ['nullable', 'string', 'max:120'],
                    'email' => ['nullable', 'email', 'max:255'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'office_phone' => ['nullable', 'string', 'max:50'],
                    'home_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'website' => ['nullable', 'url', 'max:255'],
                    'identity_number' => ['nullable', 'string', 'max:100'],
                    'street' => ['nullable', 'string', 'max:255'],
                    'city' => ['nullable', 'string', 'max:120'],
                    'postal_code' => ['nullable', 'string', 'max:20'],
                    'province' => ['nullable', 'string', 'max:120'],
                    'country' => ['nullable', 'string', 'max:120'],
                    'nationality' => ['nullable', 'string', 'max:50'],
                    'employment_status' => ['nullable', 'string', 'max:50'],
                    'joined_at' => ['nullable', 'date'],
                    'tax_status' => ['nullable', 'string', 'max:50'],
                    'subject_to_income_tax' => ['sometimes', 'boolean'],
                    'tax_number' => ['nullable', 'string', 'max:100'],
                    'tax_allowance_applies' => ['nullable', 'string', 'max:50'],
                    'tax_allowance_status' => ['nullable', 'string', 'max:120'],
                    'tax_start_month' => ['nullable', 'string', 'max:20'],
                    'tax_start_year' => ['nullable', 'string', 'max:10'],
                    'previous_income' => ['nullable', 'numeric', 'min:0'],
                    'previous_tax' => ['nullable', 'numeric', 'min:0'],
                    'is_salesperson' => ['sometimes', 'boolean'],
                    'user_id' => ['nullable', 'integer', 'exists:users,id'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'bank_accounts' => ['sometimes', 'array'],
                    'bank_accounts.*.id' => ['sometimes', 'integer', 'exists:employee_bank_accounts,id'],
                    'bank_accounts.*.bank_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:80'],
                    'bank_accounts.*.is_primary' => ['sometimes', 'boolean'],
                    'attachment_ids' => ['sometimes', 'array'],
                    'attachment_ids.*' => ['integer', 'exists:attachments,id'],
                ],
                updateRules: fn (Model $record) => [
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'employee_code' => ['required', 'string', 'max:50', Rule::unique('employees', 'employee_code')->ignore($record)],
                    'employee_id_type' => ['nullable', 'string', 'max:50'],
                    'salutation' => ['nullable', 'string', 'max:20'],
                    'full_name' => ['required', 'string', 'max:160'],
                    'position' => ['nullable', 'string', 'max:120'],
                    'email' => ['nullable', 'email', 'max:255'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'office_phone' => ['nullable', 'string', 'max:50'],
                    'home_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'website' => ['nullable', 'url', 'max:255'],
                    'identity_number' => ['nullable', 'string', 'max:100'],
                    'street' => ['nullable', 'string', 'max:255'],
                    'city' => ['nullable', 'string', 'max:120'],
                    'postal_code' => ['nullable', 'string', 'max:20'],
                    'province' => ['nullable', 'string', 'max:120'],
                    'country' => ['nullable', 'string', 'max:120'],
                    'nationality' => ['nullable', 'string', 'max:50'],
                    'employment_status' => ['nullable', 'string', 'max:50'],
                    'joined_at' => ['nullable', 'date'],
                    'tax_status' => ['nullable', 'string', 'max:50'],
                    'subject_to_income_tax' => ['sometimes', 'boolean'],
                    'tax_number' => ['nullable', 'string', 'max:100'],
                    'tax_allowance_applies' => ['nullable', 'string', 'max:50'],
                    'tax_allowance_status' => ['nullable', 'string', 'max:120'],
                    'tax_start_month' => ['nullable', 'string', 'max:20'],
                    'tax_start_year' => ['nullable', 'string', 'max:10'],
                    'previous_income' => ['nullable', 'numeric', 'min:0'],
                    'previous_tax' => ['nullable', 'numeric', 'min:0'],
                    'is_salesperson' => ['sometimes', 'boolean'],
                    'user_id' => ['nullable', 'integer', 'exists:users,id'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'bank_accounts' => ['sometimes', 'array'],
                    'bank_accounts.*.id' => ['sometimes', 'integer', 'exists:employee_bank_accounts,id'],
                    'bank_accounts.*.bank_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:80'],
                    'bank_accounts.*.is_primary' => ['sometimes', 'boolean'],
                    'attachment_ids' => ['sometimes', 'array'],
                    'attachment_ids.*' => ['integer', 'exists:attachments,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('bank_accounts', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'bankAccounts',
                            $payload['bank_accounts'],
                            ['bank_name', 'account_name', 'account_number', 'is_primary'],
                            fn (array $row): bool => filled($row['bank_name'] ?? null) && filled($row['account_number'] ?? null),
                        );
                    }
                },
            ),
        ];
    }
}
