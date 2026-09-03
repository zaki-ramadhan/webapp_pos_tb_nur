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

        $user->loadMissing('accessGroups');
        $hasAccessGroup = self::resolveIsSuperAdmin($user) || $user->accessGroups->isNotEmpty();

        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'role' => self::resolveRole($user),
            'isSuperAdmin' => self::resolveIsSuperAdmin($user),
            'hasAccessGroup' => $hasAccessGroup,
            'abilities' => self::resolveAbilities($user),
            'status' => self::resolveStatus($user),
            'avatarUrl' => self::resolveAvatarUrl($user),
        ];
    }

    private static function resolveIsSuperAdmin(User $user): bool
    {
        try {
            $email = strtolower((string) $user->email);
            return in_array($email, ['piscokpiscok2610@gmail.com', 'zakiram4dhan@gmail.com'], true);
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
            $email = strtolower((string) $user->email);

            // 1. Administrator Sistem (Eksklusif Developer Whitelist)
            if (in_array($email, ['piscokpiscok2610@gmail.com', 'zakiram4dhan@gmail.com'], true)) {
                return 'Administrator Sistem';
            }

            // 2. Owner Toko (berdasarkan role admin/owner/super_admin non-dev, access group OWNER, atau email owner awal)
            $user->loadMissing('accessGroups');
            $isOwner = $user->hasAnyRoleCodes(['admin', 'owner', 'super_admin'])
                || ($user->accessGroups && $user->accessGroups->contains(fn ($g) => strtoupper($g->code ?? '') === 'OWNER'))
                || (in_array($email, ['nurhayati.karya@gmail.com'], true));

            if ($isOwner) {
                return 'Owner';
            }

            $groupName = $user->accessGroups->first()?->name;
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
