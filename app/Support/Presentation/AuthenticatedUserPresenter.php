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

        if ($user->exists) {
            $user->loadMissing('accessGroups');
        }
        $isSuperAdmin = $user->isSystemAdmin();
        $isOwner = $user->isOwner();
        $isPrivileged = $user->isPrivileged();
        $hasAccessGroup = $isPrivileged || $user->accessGroups->isNotEmpty();

        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'role' => self::resolveRole($user),
            'isSuperAdmin' => $isSuperAdmin,
            'isOwner' => $isOwner,
            'isPrivileged' => $isPrivileged,
            'hasAccessGroup' => $hasAccessGroup,
            'abilities' => self::resolveAbilities($user),
            'status' => self::resolveStatus($user),
            'avatarUrl' => self::resolveAvatarUrl($user),
        ];
    }

    private static function resolveIsSuperAdmin(User $user): bool
    {
        try {
            return $user->isSystemAdmin();
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
            // 1. Administrator Sistem (Eksklusif Developer / Super Admin)
            if ($user->isSystemAdmin()) {
                return 'Administrator Sistem';
            }

            // 2. Owner Toko
            if ($user->isOwner()) {
                return 'Owner';
            }

            $groupName = $user->relationLoaded('accessGroups')
                ? $user->accessGroups->first()?->name
                : ($user->exists ? $user->accessGroups()->value('name') : null);
            if ($groupName) {
                return $groupName;
            }

            if (! $user->relationLoaded('roles')) {
                if (! $user->exists) {
                    return 'Pengguna (Belum Disetujui)';
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

        return 'Pengguna (Belum Disetujui)';
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
