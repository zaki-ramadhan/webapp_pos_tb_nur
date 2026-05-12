<?php

namespace App\Support\Backend;

use App\Domain\Identity\Models\AccessGroupPermission;
use App\Domain\Identity\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class BackendResourceAccessService
{
    /**
     * @var list<string>
     */
    protected array $privilegedRoleCodes = ['super_admin', 'owner_manager'];

    protected ?bool $bootstrapMode = null;

    public function authorize(User $user, BackendResourceBlueprint $blueprint, string $ability): void
    {
        if (! $this->can($user, $blueprint, $ability)) {
            throw new AuthorizationException('You are not allowed to perform this action.');
        }
    }

    public function can(User $user, BackendResourceBlueprint $blueprint, string $ability): bool
    {
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
     * @return Collection<int, AccessGroupPermission>
     */
    protected function permissionsFor(User $user, string $permissionKey): Collection
    {
        $user->loadMissing('accessGroups.permissions');

        return $user->accessGroups
            ->filter(fn ($group) => (bool) $group->is_active)
            ->flatMap(fn ($group) => $group->permissions)
            ->filter(function (AccessGroupPermission $permission) use ($permissionKey): bool {
                return in_array($permission->menu_key, [$permissionKey, '*'], true);
            })
            ->values();
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
}
