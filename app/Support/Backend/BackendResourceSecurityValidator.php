<?php

namespace App\Support\Backend;

use App\Models\User;
use App\Support\Backend\BackendResourceRegistry;
use App\Domain\Identity\Models\Role;
use Illuminate\Auth\Access\AuthorizationException;

class BackendResourceSecurityValidator
{
    public function __construct(
        protected BackendResourceAccessService $access
    ) {}

    /**
     * Validate that a non-super-admin does not spoof branch assignment.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $payload
     * @return void
     * @throws AuthorizationException
     */
    public function validateBranchAssignment(User $user, array $payload): void
    {
        if ($user->hasAnyRoleCodes(['super_admin'])) {
            return;
        }

        if (isset($payload['branch_id'])) {
            if ($user->branches()->exists()) {
                $allowedBranchIds = $user->branches->pluck('id')->toArray();
                if (! in_array((int) $payload['branch_id'], $allowedBranchIds, true)) {
                    throw new AuthorizationException('You are not allowed to assign records to this branch.');
                }
            }
        }
    }

    /**
     * Validate that a non-super-admin does not escalate privileges via roles or access groups.
     *
     * @param  User  $user
     * @param  string  $resource
     * @param  array<string, mixed>  $payload
     * @return void
     * @throws AuthorizationException
     */
    public function validatePrivilegeEscalation(User $user, string $resource, array $payload): void
    {
        if ($user->hasAnyRoleCodes(['super_admin'])) {
            return;
        }

        // 1. Prevent non-super-admin from assigning super_admin role
        if ($resource === 'users' && isset($payload['role_ids'])) {
            $superAdminRoleId = Role::where('code', 'super_admin')->value('id');
            if ($superAdminRoleId && in_array($superAdminRoleId, $payload['role_ids'])) {
                throw new AuthorizationException('You cannot assign the super_admin role.');
            }
        }

        // 2. Prevent non-super-admin from granting permissions they do not possess
        if ($resource === 'access-groups' && isset($payload['permissions'])) {
            foreach ($payload['permissions'] as $perm) {
                $menuKey = $perm['menu_key'] ?? '';
                if ($menuKey === '*') {
                    throw new AuthorizationException('Only super admins can grant wildcard permissions.');
                }

                $targetBlueprint = BackendResourceRegistry::find($menuKey);
                if ($targetBlueprint) {
                    if (! empty($perm['can_create']) && ! $this->access->can($user, $targetBlueprint, 'create')) {
                        throw new AuthorizationException("You cannot grant create permission for {$targetBlueprint->label} because you do not have it.");
                    }
                    if (! empty($perm['can_update']) && ! $this->access->can($user, $targetBlueprint, 'update')) {
                        throw new AuthorizationException("You cannot grant update permission for {$targetBlueprint->label} because you do not have it.");
                    }
                    if (! empty($perm['can_delete']) && ! $this->access->can($user, $targetBlueprint, 'delete')) {
                        throw new AuthorizationException("You cannot grant delete permission for {$targetBlueprint->label} because you do not have it.");
                    }
                    if (! empty($perm['can_view']) && ! $this->access->can($user, $targetBlueprint, 'view')) {
                        throw new AuthorizationException("You cannot grant view permission for {$targetBlueprint->label} because you do not have it.");
                    }
                }
            }
        }
    }
}
