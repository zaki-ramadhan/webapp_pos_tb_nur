<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrasi service aplikasi.
     */
    public function register(): void
    {

    }

    /**
     * Inisialisasi service aplikasi.
     */
    public function boot(): void
    {
        if (app()->environment('production') || str_contains((string) request()->header('host'), 'tb-nur.shop')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(300)->by(
                $request->user()?->id ?: $request->ip()
            );
        });
    }
}
