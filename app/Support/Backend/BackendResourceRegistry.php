<?php

namespace App\Support\Backend;

use App\Domain\Catalog\Models\Brand;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductCategory;
use App\Domain\Catalog\Models\SupplierPrice;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Finance\Models\Account;
use App\Domain\Finance\Models\Currency;
use App\Domain\Finance\Models\PaymentTerm;
use App\Domain\Finance\Models\SalaryAllowance;
use App\Domain\Finance\Models\Tax;
use App\Domain\Identity\Models\AccessGroup;
use App\Domain\Identity\Models\NumberingSequence;
use App\Domain\Identity\Models\Role;
use App\Domain\Identity\Models\TransactionApprovalRule;
use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use App\Domain\Organization\Models\Employee;
use App\Domain\Organization\Models\FobTerm;
use App\Domain\Organization\Models\ShippingMethod;
use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\CustomerCategory;
use App\Domain\Partner\Models\SalesCategory;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Partner\Models\SupplierCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class BackendResourceRegistry
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function all(): array
    {
        return [
            'roles' => new BackendResourceBlueprint(
                key: 'roles',
                label: 'Roles',
                modelClass: Role::class,
                searchColumns: ['code', 'name'],
                storeRules: [
                    'code' => ['required', 'string', 'max:50', 'unique:roles,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['required', 'string', 'max:50', Rule::unique('roles', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'access-groups' => new BackendResourceBlueprint(
                key: 'access-groups',
                label: 'Access Groups',
                modelClass: AccessGroup::class,
                searchColumns: ['code', 'name', 'description'],
                with: ['permissions', 'users'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:access_groups,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                    'permissions' => ['sometimes', 'array'],
                    'permissions.*.id' => ['sometimes', 'integer', 'exists:access_group_permissions,id'],
                    'permissions.*.menu_key' => ['required_with:permissions', 'string', 'max:120'],
                    'permissions.*.can_access' => ['sometimes', 'boolean'],
                    'permissions.*.can_create' => ['sometimes', 'boolean'],
                    'permissions.*.can_update' => ['sometimes', 'boolean'],
                    'permissions.*.can_delete' => ['sometimes', 'boolean'],
                    'permissions.*.can_view' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('access_groups', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                    'permissions' => ['sometimes', 'array'],
                    'permissions.*.id' => ['sometimes', 'integer', 'exists:access_group_permissions,id'],
                    'permissions.*.menu_key' => ['required_with:permissions', 'string', 'max:120'],
                    'permissions.*.can_access' => ['sometimes', 'boolean'],
                    'permissions.*.can_create' => ['sometimes', 'boolean'],
                    'permissions.*.can_update' => ['sometimes', 'boolean'],
                    'permissions.*.can_delete' => ['sometimes', 'boolean'],
                    'permissions.*.can_view' => ['sometimes', 'boolean'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('user_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                    }

                    if (array_key_exists('permissions', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'permissions',
                            $payload['permissions'],
                            ['menu_key', 'can_access', 'can_create', 'can_update', 'can_delete', 'can_view'],
                            fn (array $row): bool => filled($row['menu_key'] ?? null),
                        );
                    }
                },
            ),
            'users' => new BackendResourceBlueprint(
                key: 'users',
                label: 'Users',
                modelClass: User::class,
                searchColumns: ['name', 'email', 'phone'],
                with: ['roles', 'accessGroups', 'branches'],
                storeRules: [
                    'name' => ['required', 'string', 'max:160'],
                    'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                    'phone' => ['nullable', 'string', 'max:50'],
                    'password' => ['required', 'string', 'min:8'],
                    'is_active' => ['sometimes', 'boolean'],
                    'role_ids' => ['sometimes', 'array'],
                    'role_ids.*' => ['integer', 'exists:roles,id'],
                    'access_group_ids' => ['sometimes', 'array'],
                    'access_group_ids.*' => ['integer', 'exists:access_groups,id'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                ],
                updateRules: fn (Model $record) => [
                    'name' => ['required', 'string', 'max:160'],
                    'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($record)],
                    'phone' => ['nullable', 'string', 'max:50'],
                    'password' => ['nullable', 'string', 'min:8'],
                    'is_active' => ['sometimes', 'boolean'],
                    'role_ids' => ['sometimes', 'array'],
                    'role_ids.*' => ['integer', 'exists:roles,id'],
                    'access_group_ids' => ['sometimes', 'array'],
                    'access_group_ids.*' => ['integer', 'exists:access_groups,id'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('role_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'roles', $payload['role_ids']);
                    }

                    if (array_key_exists('access_group_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'accessGroups', $payload['access_group_ids']);
                    }

                    if (array_key_exists('branch_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'branches', $payload['branch_ids']);
                    }
                },
            ),
            'numbering-sequences' => new BackendResourceBlueprint(
                key: 'numbering-sequences',
                label: 'Numbering Sequences',
                modelClass: NumberingSequence::class,
                searchColumns: ['name', 'transaction_type', 'prefix', 'suffix'],
                with: ['components', 'users'],
                storeRules: [
                    'transaction_type' => ['required', 'string', 'max:120'],
                    'name' => ['required', 'string', 'max:120'],
                    'sequence_type' => ['required', 'string', 'max:50'],
                    'counter_digits' => ['required', 'integer', 'min:1', 'max:12'],
                    'current_counter' => ['sometimes', 'integer', 'min:0'],
                    'prefix' => ['nullable', 'string', 'max:50'],
                    'suffix' => ['nullable', 'string', 'max:50'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                    'components' => ['sometimes', 'array'],
                    'components.*.id' => ['sometimes', 'integer', 'exists:numbering_sequence_components,id'],
                    'components.*.component_key' => ['required_with:components', 'string', 'max:60'],
                    'components.*.component_value' => ['nullable', 'string', 'max:120'],
                    'components.*.sort_order' => ['sometimes', 'integer', 'min:0'],
                ],
                updateRules: fn (Model $record) => [
                    'transaction_type' => ['required', 'string', 'max:120'],
                    'name' => ['required', 'string', 'max:120'],
                    'sequence_type' => ['required', 'string', 'max:50'],
                    'counter_digits' => ['required', 'integer', 'min:1', 'max:12'],
                    'current_counter' => ['sometimes', 'integer', 'min:0'],
                    'prefix' => ['nullable', 'string', 'max:50'],
                    'suffix' => ['nullable', 'string', 'max:50'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                    'components' => ['sometimes', 'array'],
                    'components.*.id' => ['sometimes', 'integer', 'exists:numbering_sequence_components,id'],
                    'components.*.component_key' => ['required_with:components', 'string', 'max:60'],
                    'components.*.component_value' => ['nullable', 'string', 'max:120'],
                    'components.*.sort_order' => ['sometimes', 'integer', 'min:0'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('user_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                    }

                    if (array_key_exists('components', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'components',
                            $payload['components'],
                            ['component_key', 'component_value', 'sort_order'],
                            fn (array $row): bool => filled($row['component_key'] ?? null),
                        );
                    }
                },
            ),
            'transaction-approval-rules' => new BackendResourceBlueprint(
                key: 'transaction-approval-rules',
                label: 'Transaction Approval Rules',
                modelClass: TransactionApprovalRule::class,
                searchColumns: ['rule_name', 'transaction_type'],
                with: ['branch', 'steps'],
                storeRules: [
                    'rule_name' => ['required', 'string', 'max:120'],
                    'transaction_type' => ['required', 'string', 'max:120'],
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'threshold_amount' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['sometimes', 'boolean'],
                    'steps' => ['sometimes', 'array'],
                    'steps.*.id' => ['sometimes', 'integer', 'exists:transaction_approval_rule_steps,id'],
                    'steps.*.approver_user_id' => ['nullable', 'integer', 'exists:users,id'],
                    'steps.*.approver_role_id' => ['nullable', 'integer', 'exists:roles,id'],
                    'steps.*.step_order' => ['sometimes', 'integer', 'min:1'],
                    'steps.*.min_approvals' => ['sometimes', 'integer', 'min:1'],
                ],
                updateRules: fn (Model $record) => [
                    'rule_name' => ['required', 'string', 'max:120'],
                    'transaction_type' => ['required', 'string', 'max:120'],
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'threshold_amount' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['sometimes', 'boolean'],
                    'steps' => ['sometimes', 'array'],
                    'steps.*.id' => ['sometimes', 'integer', 'exists:transaction_approval_rule_steps,id'],
                    'steps.*.approver_user_id' => ['nullable', 'integer', 'exists:users,id'],
                    'steps.*.approver_role_id' => ['nullable', 'integer', 'exists:roles,id'],
                    'steps.*.step_order' => ['sometimes', 'integer', 'min:1'],
                    'steps.*.min_approvals' => ['sometimes', 'integer', 'min:1'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('steps', $payload)) {
                        BackendRelationSync::syncHasMany(
                            $record,
                            'steps',
                            $payload['steps'],
                            ['approver_user_id', 'approver_role_id', 'step_order', 'min_approvals'],
                            fn (array $row): bool => filled($row['approver_user_id'] ?? null) || filled($row['approver_role_id'] ?? null),
                        );
                    }
                },
            ),
            'branches' => new BackendResourceBlueprint(
                key: 'branches',
                label: 'Branches',
                modelClass: Branch::class,
                searchColumns: ['code', 'name', 'phone', 'email', 'city', 'province'],
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
                modelClass: Department::class,
                searchColumns: ['code', 'name', 'notes'],
                with: ['users'],
                storeRules: [
                    'code' => ['required', 'string', 'max:50', 'unique:departments,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'notes' => ['nullable', 'string'],
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
            'currencies' => new BackendResourceBlueprint(
                key: 'currencies',
                label: 'Currencies',
                modelClass: Currency::class,
                searchColumns: ['code', 'name', 'symbol'],
                storeRules: [
                    'code' => ['required', 'string', 'size:3', 'unique:currencies,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'symbol' => ['required', 'string', 'max:10'],
                    'exchange_rate' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['required', 'string', 'size:3', Rule::unique('currencies', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'symbol' => ['required', 'string', 'max:10'],
                    'exchange_rate' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'accounts' => new BackendResourceBlueprint(
                key: 'accounts',
                label: 'Accounts',
                modelClass: Account::class,
                searchColumns: ['code', 'name', 'account_type', 'notes'],
                with: ['parent', 'currency', 'branches', 'users'],
                storeRules: [
                    'parent_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:accounts,code'],
                    'name' => ['required', 'string', 'max:160'],
                    'account_type' => ['required', 'string', 'max:60'],
                    'notes' => ['nullable', 'string'],
                    'opening_balance' => ['nullable', 'numeric'],
                    'opening_balance_date' => ['nullable', 'date'],
                    'cash_bank_reference' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                updateRules: fn (Model $record) => [
                    'parent_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('accounts', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:160'],
                    'account_type' => ['required', 'string', 'max:60'],
                    'notes' => ['nullable', 'string'],
                    'opening_balance' => ['nullable', 'numeric'],
                    'opening_balance_date' => ['nullable', 'date'],
                    'cash_bank_reference' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('branch_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'branches', $payload['branch_ids']);
                    }

                    if (array_key_exists('user_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                    }
                },
            ),
            'taxes' => new BackendResourceBlueprint(
                key: 'taxes',
                label: 'Taxes',
                modelClass: Tax::class,
                searchColumns: ['code', 'name', 'tax_type'],
                with: ['outputAccount', 'inputAccount'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:taxes,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'tax_type' => ['required', 'string', 'max:60'],
                    'rate' => ['required', 'numeric', 'min:0'],
                    'output_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'input_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('taxes', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'tax_type' => ['required', 'string', 'max:60'],
                    'rate' => ['required', 'numeric', 'min:0'],
                    'output_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'input_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'payment-terms' => new BackendResourceBlueprint(
                key: 'payment-terms',
                label: 'Payment Terms',
                modelClass: PaymentTerm::class,
                searchColumns: ['code', 'name', 'notes'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:payment_terms,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'due_days' => ['nullable', 'integer', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('payment_terms', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'due_days' => ['nullable', 'integer', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'shipping-methods' => new BackendResourceBlueprint(
                key: 'shipping-methods',
                label: 'Shipping Methods',
                modelClass: ShippingMethod::class,
                searchColumns: ['code', 'name', 'notes'],
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
                modelClass: FobTerm::class,
                searchColumns: ['code', 'name', 'notes'],
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
            'salary-allowances' => new BackendResourceBlueprint(
                key: 'salary-allowances',
                label: 'Salary Allowances',
                modelClass: SalaryAllowance::class,
                searchColumns: ['code', 'name', 'allowance_type', 'notes'],
                with: ['account'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:salary_allowances,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'allowance_type' => ['required', 'string', 'max:60'],
                    'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('salary_allowances', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'allowance_type' => ['required', 'string', 'max:60'],
                    'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'employees' => new BackendResourceBlueprint(
                key: 'employees',
                label: 'Employees',
                modelClass: Employee::class,
                searchColumns: ['employee_code', 'full_name', 'position', 'email', 'mobile_phone'],
                with: ['branch', 'department', 'bankAccounts'],
                storeRules: [
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code'],
                    'salutation' => ['nullable', 'string', 'max:20'],
                    'full_name' => ['required', 'string', 'max:160'],
                    'position' => ['nullable', 'string', 'max:120'],
                    'email' => ['nullable', 'email', 'max:255'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'office_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'nationality' => ['nullable', 'string', 'max:50'],
                    'employment_status' => ['nullable', 'string', 'max:50'],
                    'joined_at' => ['nullable', 'date'],
                    'tax_status' => ['nullable', 'string', 'max:50'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'bank_accounts' => ['sometimes', 'array'],
                    'bank_accounts.*.id' => ['sometimes', 'integer', 'exists:employee_bank_accounts,id'],
                    'bank_accounts.*.bank_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:80'],
                    'bank_accounts.*.is_primary' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
                    'department_id' => ['nullable', 'integer', 'exists:departments,id'],
                    'employee_code' => ['required', 'string', 'max:50', Rule::unique('employees', 'employee_code')->ignore($record)],
                    'salutation' => ['nullable', 'string', 'max:20'],
                    'full_name' => ['required', 'string', 'max:160'],
                    'position' => ['nullable', 'string', 'max:120'],
                    'email' => ['nullable', 'email', 'max:255'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'office_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'nationality' => ['nullable', 'string', 'max:50'],
                    'employment_status' => ['nullable', 'string', 'max:50'],
                    'joined_at' => ['nullable', 'date'],
                    'tax_status' => ['nullable', 'string', 'max:50'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'bank_accounts' => ['sometimes', 'array'],
                    'bank_accounts.*.id' => ['sometimes', 'integer', 'exists:employee_bank_accounts,id'],
                    'bank_accounts.*.bank_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_name' => ['required_with:bank_accounts', 'string', 'max:120'],
                    'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:80'],
                    'bank_accounts.*.is_primary' => ['sometimes', 'boolean'],
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
            'customer-categories' => new BackendResourceBlueprint(
                key: 'customer-categories',
                label: 'Customer Categories',
                modelClass: CustomerCategory::class,
                searchColumns: ['code', 'name', 'notes'],
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
                modelClass: SupplierCategory::class,
                searchColumns: ['code', 'name', 'notes'],
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
                modelClass: SalesCategory::class,
                searchColumns: ['code', 'name', 'description'],
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
                modelClass: Customer::class,
                searchColumns: ['code', 'name', 'business_phone', 'mobile_phone', 'email'],
                with: ['category', 'currency', 'paymentTerm', 'branches'],
                storeRules: [
                    'category_id' => ['nullable', 'integer', 'exists:customer_categories,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'payment_term_id' => ['nullable', 'integer', 'exists:payment_terms,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:customers,code'],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', 'email', 'max:255'],
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
                    'payment_term_id' => ['nullable', 'integer', 'exists:payment_terms,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('customers', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', 'email', 'max:255'],
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
                modelClass: Supplier::class,
                searchColumns: ['code', 'name', 'business_phone', 'mobile_phone', 'email'],
                with: ['category', 'currency', 'paymentTerm', 'branches'],
                storeRules: [
                    'category_id' => ['nullable', 'integer', 'exists:supplier_categories,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'payment_term_id' => ['nullable', 'integer', 'exists:payment_terms,id'],
                    'code' => ['required', 'string', 'max:50', 'unique:suppliers,code'],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', 'email', 'max:255'],
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
                    'payment_term_id' => ['nullable', 'integer', 'exists:payment_terms,id'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('suppliers', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:160'],
                    'business_phone' => ['nullable', 'string', 'max:50'],
                    'mobile_phone' => ['nullable', 'string', 'max:50'],
                    'whatsapp_phone' => ['nullable', 'string', 'max:50'],
                    'email' => ['nullable', 'email', 'max:255'],
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
            'brands' => new BackendResourceBlueprint(
                key: 'brands',
                label: 'Brands',
                modelClass: Brand::class,
                searchColumns: ['code', 'name'],
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
                modelClass: Unit::class,
                searchColumns: ['code', 'name'],
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
                modelClass: ProductCategory::class,
                searchColumns: ['code', 'name', 'slug'],
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
                modelClass: Warehouse::class,
                searchColumns: ['code', 'name', 'warehouse_type'],
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
                modelClass: Product::class,
                searchColumns: ['code', 'barcode', 'name', 'product_type'],
                with: ['category', 'brand', 'baseUnit', 'purchaseUnit', 'salesUnit', 'unitConversions', 'prices'],
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
                modelClass: SupplierPrice::class,
                searchColumns: ['notes'],
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

    public static function find(string $key): ?BackendResourceBlueprint
    {
        return Arr::get(self::all(), $key);
    }
}
