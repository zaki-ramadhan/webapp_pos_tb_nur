<?php

namespace App\Support\Presentation;

use App\Models\User;
use Throwable;

final class AuthenticatedUserPresenter
{
    public static function present(?User $user): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'role' => self::resolveRole($user),
            'isSuperAdmin' => self::resolveIsSuperAdmin($user),
            'abilities' => self::resolveAbilities($user),
            'status' => self::resolveStatus($user),
            'avatarUrl' => self::resolveAvatarUrl($user),
        ];
    }

    private static function resolveIsSuperAdmin(User $user): bool
    {
        try {
            return $user->hasAnyRoleCodes(['super_admin'])
                || ($user->roles && $user->roles->contains(fn ($r) => strtolower($r->name ?? '') === 'super admin'));
        } catch (Throwable) {
            return false;
        }
    }

    private static function resolveAbilities(User $user): array
    {
        try {
            return app(\App\Support\Backend\BackendResourceAccessService::class)->abilitiesMapFor($user);
        } catch (Throwable) {
            return [];
        }
    }

    private static function resolveRole(User $user): string
    {
        try {
            $user->loadMissing('accessGroups');
            $groupName = $user->accessGroups->first()?->name;
            if ($groupName) {
                return $groupName;
            }

            if ($user->hasAnyRoleCodes(['super_admin'])) {
                return 'Owner';
            }

            if (! $user->relationLoaded('roles')) {
                if (! $user->exists) {
                    return 'Kasir';
                }

                $user->loadMissing('roles');
            }

            $roleName = $user->roles->first(fn ($role) => (bool) ($role->is_active ?? true))?->name;
            if ($roleName) {
                return $roleName;
            }
        } catch (Throwable) {
            // Fallback
        }

        return 'Kasir';
    }

    private static function resolveStatus(User $user): string
    {
        return $user->getAttribute('is_active') === false ? 'inactive' : 'active';
    }

    private static function resolveAvatarUrl(User $user): ?string
    {
        $avatarUrl = trim((string) $user->getAttribute('google_avatar'));

        return $avatarUrl !== '' ? $avatarUrl : null;
    }
}
