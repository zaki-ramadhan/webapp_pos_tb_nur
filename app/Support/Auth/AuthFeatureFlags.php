<?php

namespace App\Support\Auth;

final class AuthFeatureFlags
{
    public static function allowsPublicRegistration(): bool
    {
        return (bool) config('pos.auth.allow_public_registration', false);
    }

    public static function allowsLocalAutoLogin(): bool
    {
        return app()->environment(['local', 'testing'])
            && (bool) config('pos.auth.allow_local_auto_login', false);
    }

    public static function localAutoLoginEmail(): ?string
    {
        $email = trim((string) config('pos.auth.local_auto_login_email'));

        return $email !== '' ? $email : null;
    }
}
