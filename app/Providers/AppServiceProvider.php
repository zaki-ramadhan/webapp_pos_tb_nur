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
        if (app()->environment('production', 'staging') || str_starts_with(config('app.url', ''), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(300)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        try {
            if (! app()->runningInConsole() || app()->runningUnitTests()) {
                $hasConversionsTable = \Illuminate\Support\Facades\Cache::remember(
                    'schema_has_product_unit_conversions',
                    3600,
                    fn () => \Illuminate\Support\Facades\Schema::hasTable('product_unit_conversions')
                );

                if (! $hasConversionsTable) {
                    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                    \Illuminate\Support\Facades\Cache::forget('schema_has_product_unit_conversions');
                }
            }
        } catch (\Throwable) {
            // Silently ignore if database is temporarily unreachable
        }
    }
}
