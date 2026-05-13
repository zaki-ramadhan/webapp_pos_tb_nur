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
            'status' => self::resolveStatus($user),
            'avatarUrl' => self::resolveAvatarUrl($user),
        ];
    }

    private static function resolveRole(User $user): ?string
    {
        try {
            if (! $user->relationLoaded('roles')) {
                if (! $user->exists) {
                    return null;
                }

                $user->loadMissing('roles');
            }
        } catch (Throwable) {
            return null;
        }

        return $user->roles
            ->first(fn ($role) => (bool) ($role->is_active ?? true))
            ?->name;
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
