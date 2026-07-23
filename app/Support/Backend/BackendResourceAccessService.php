<?php

namespace App\Support\Backend;

use App\Domain\Identity\Models\AccessGroupPermission;
use App\Domain\Identity\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;

class BackendResourceAccessService
{
    /**
     * @var list<string>
     */
    protected array $privilegedRoleCodes = ['super_admin'];

    protected ?bool $bootstrapMode = null;

    public function authorize(User $user, BackendResourceBlueprint $blueprint, string $ability): void
    {
        if (! $this->can($user, $blueprint, $ability)) {
            throw new AuthorizationException('Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.');
        }
    }

    public function can(User $user, BackendResourceBlueprint $blueprint, string $ability): bool
    {
        if (in_array($ability, ['create', 'update', 'delete'], true) && ! $blueprint->canMutate()) {
            return false;
        }

        if ($this->isBootstrapMode()) {
            return true;
        }

        if ($this->supportsUserActivation() && ! (bool) $user->getAttribute('is_active')) {
            return false;
        }

        if ($user->hasAnyRoleCodes($this->privilegedRoleCodes)) {
            return true;
        }

        $permissions = $this->permissionsFor($user, $blueprint->permissionKey());

        if ($permissions->isEmpty()) {
            return false;
        }

        return match ($ability) {
            'view' => $permissions->contains(fn (AccessGroupPermission $permission) => $this->canView($permission)),
            'create' => $permissions->contains(fn (AccessGroupPermission $permission) => $this->canMutate($permission, 'can_create')),
            'update' => $permissions->contains(fn (AccessGroupPermission $permission) => $this->canMutate($permission, 'can_update')),
            'delete' => $permissions->contains(fn (AccessGroupPermission $permission) => $this->canMutate($permission, 'can_delete')),
            default => false,
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function visibleResourcesFor(User $user): array
    {
        return array_values(array_filter(array_map(
            function (BackendResourceBlueprint $blueprint) use ($user): ?array {
                if (! $this->can($user, $blueprint, 'view')) {
                    return null;
                }

                return [
                    'key' => $blueprint->key,
                    'label' => $blueprint->label,
                    'abilities' => [
                        'view' => true,
                        'create' => $this->can($user, $blueprint, 'create'),
                        'update' => $this->can($user, $blueprint, 'update'),
                        'delete' => $this->can($user, $blueprint, 'delete'),
                    ],
                ];
            },
            BackendResourceRegistry::all(),
        )));
    }

    /**
     * Mapping alias antara ID baris matriks UI dan permissionKey resource backend.
     * @var array<string, list<string>>
     */
    protected array $permissionAliases = [
        'departments' => ['departments', 'department'],
        'employees' => ['employees'],
        'salary-allowances' => ['salary-allowances', 'salary-allowance'],
        'activity-log' => ['activity-log'],
        'preferences' => ['preferences'],
        'accounts' => ['accounts', 'account-list'],
        'customers' => ['customers'],
        'sales-commissions' => ['sales-commissions', 'sales-commission'],
        'sales-checkins' => ['sales-checkins', 'sales-checkin'],
        'supplier-prices' => ['supplier-prices'],
        'suppliers' => ['suppliers'],
        'item-requests' => ['item-requests', 'item-request'],
        'products' => ['products', 'items-services'],
        'warehouses' => ['warehouses', 'warehouse-master'],
        'units' => ['units', 'item-unit'],
        'brands' => ['brands', 'item-brand'],
        'product-categories' => ['product-categories', 'item-category'],
        'item-location' => ['item-location'],
        'minimum-stock' => ['minimum-stock'],
        'sales-invoices' => ['sales-invoices', 'sales-invoice'],
        'sales-receipts' => ['sales-receipts', 'sales-receipt'],
        'sales-returns' => ['sales-returns', 'sales-return'],
        'purchase-invoices' => ['purchase-invoices', 'purchase-invoice'],
        'purchase-payments' => ['purchase-payments', 'purchase-payment'],
        'purchase-returns' => ['purchase-returns', 'purchase-return'],
        'stock-opname-orders' => ['stock-opname-orders', 'inventory-adjustment', 'stock-opname'],
        'stock-opname-results' => ['stock-opname-results', 'inventory-adjustment', 'stock-opname'],
        'stock-transfers' => ['stock-transfers', 'stock-transfer'],
        'roles' => ['roles'],
        'access-groups' => ['access-groups', 'group-access'],
        'users' => ['users'],
    ];

    /**
     * @return Collection<int, AccessGroupPermission>
     */
    protected function permissionsFor(User $user, string $permissionKey): Collection
    {
        $user->loadMissing('accessGroups.permissions');

        $allowedKeys = array_merge(
            $this->permissionAliases[$permissionKey] ?? [$permissionKey],
            ['*']
        );

        return $user->accessGroups
            ->filter(fn ($group) => (bool) $group->is_active && $this->isGroupWithinTimeLimits($group))
            ->flatMap(fn ($group) => $group->permissions)
            ->filter(function (AccessGroupPermission $permission) use ($allowedKeys): bool {
                return in_array($permission->menu_key, $allowedKeys, true);
            })
            ->values();
    }

    protected function isGroupWithinTimeLimits($group): bool
    {
        if ($group->access_limit_type !== 'limited-time') {
            return true;
        }

        $now = \Illuminate\Support\Carbon::now('Asia/Jakarta');
        $dayOfWeek = $now->dayOfWeek;

        $daysLimit = $group->access_limit_days;
        if ($daysLimit === 'Senin-Jumat') {
            if ($dayOfWeek < 1 || $dayOfWeek > 5) {
                return false;
            }
        } elseif ($daysLimit === 'Senin-Sabtu') {
            if ($dayOfWeek < 1 || $dayOfWeek > 6) {
                return false;
            }
        }

        $startHour = (int) $group->access_limit_start_hour;
        $endHour = (int) $group->access_limit_end_hour;
        $currentTimeDecimal = $now->hour + ($now->minute / 60.0) + ($now->second / 3600.0);

        if ($startHour <= $endHour) {
            return ($currentTimeDecimal >= $startHour && $currentTimeDecimal < $endHour);
        } else {
            return ($currentTimeDecimal >= $startHour || $currentTimeDecimal < $endHour);
        }
    }

    protected function canView(AccessGroupPermission $permission): bool
    {
        return (bool) $permission->can_access
            && ((bool) $permission->can_view
                || (bool) $permission->can_create
                || (bool) $permission->can_update
                || (bool) $permission->can_delete);
    }

    protected function canMutate(AccessGroupPermission $permission, string $column): bool
    {
        return (bool) $permission->can_access && (bool) $permission->{$column};
    }

    protected function isBootstrapMode(): bool
    {
        if ($this->bootstrapMode !== null) {
            return $this->bootstrapMode;
        }

        if (! (bool) config('pos.backend.allow_bootstrap_open_access', false)) {
            return $this->bootstrapMode = false;
        }

        if (! $this->supportsPermissionTables()) {
            return $this->bootstrapMode = true;
        }

        $this->bootstrapMode = ! Role::query()->exists()
            && ! AccessGroupPermission::query()->exists();

        return $this->bootstrapMode;
    }

    protected function supportsPermissionTables(): bool
    {
        return Schema::hasTable('roles')
            && Schema::hasTable('access_group_permissions')
            && Schema::hasTable('access_group_user')
            && Schema::hasTable('role_user');
    }

    protected function supportsUserActivation(): bool
    {
        return Schema::hasColumn('users', 'is_active');
    }

    public function canAccessRecord(User $user, Model $record): bool
    {
        if ($user->hasAnyRoleCodes($this->privilegedRoleCodes)) {
            return true;
        }

        if (isset($record->branch_id) && $record->branch_id !== null) {
            if ($user->branches()->exists()) {
                $allowedBranchIds = $user->branches->pluck('id')->toArray();
                if (! in_array((int) $record->branch_id, $allowedBranchIds, true)) {
                    return false;
                }
            }
        }

        return true;
    }
}
