<?php

namespace App\Support\Auth;

final class AuthFeatureFlags
{
    public static function allowsPublicRegistration(): bool
    {
        return (bool) config('pos.auth.allow_public_registration', false);
    }
}
