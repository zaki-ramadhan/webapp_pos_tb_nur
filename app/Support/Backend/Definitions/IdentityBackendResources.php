<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Identity\Models\AccessGroup;
use App\Domain\Identity\Models\NumberingSequence;
use App\Domain\Identity\Models\Role;
use App\Domain\Identity\Models\TransactionApprovalRule;
use App\Models\User;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class IdentityBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'roles' => new BackendResourceBlueprint(
                key: 'roles',
                label: 'Roles',
                searchColumns: ['code', 'name'],
                modelClass: Role::class,
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
                searchColumns: ['code', 'name', 'description'],
                modelClass: AccessGroup::class,
                with: ['permissions', 'users'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:access_groups,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                    'access_limit_type' => ['sometimes', 'string', 'in:follow-preference,limited-time'],
                    'access_limit_days' => ['nullable', 'required_if:access_limit_type,limited-time', 'string', 'in:Senin-Jumat,Senin-Sabtu,Setiap Hari'],
                    'access_limit_start_hour' => ['nullable', 'required_if:access_limit_type,limited-time', 'string', 'regex:/^[0-2][0-9]$/'],
                    'access_limit_end_hour' => ['nullable', 'required_if:access_limit_type,limited-time', 'string', 'regex:/^[0-2][0-9]$/'],
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
                    'access_limit_type' => ['sometimes', 'string', 'in:follow-preference,limited-time'],
                    'access_limit_days' => ['nullable', 'required_if:access_limit_type,limited-time', 'string', 'in:Senin-Jumat,Senin-Sabtu,Setiap Hari'],
                    'access_limit_start_hour' => ['nullable', 'required_if:access_limit_type,limited-time', 'string', 'regex:/^[0-2][0-9]$/'],
                    'access_limit_end_hour' => ['nullable', 'required_if:access_limit_type,limited-time', 'string', 'regex:/^[0-2][0-9]$/'],
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
                searchColumns: ['name', 'email', 'phone'],
                modelClass: User::class,
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
                searchColumns: ['name', 'transaction_type', 'prefix', 'suffix'],
                modelClass: NumberingSequence::class,
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
                searchColumns: ['rule_name', 'transaction_type'],
                modelClass: TransactionApprovalRule::class,
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
        ];
    }
}
