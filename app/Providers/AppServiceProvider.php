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
            if (\Illuminate\Support\Facades\Schema::hasTable('products')) {
                \Illuminate\Support\Facades\Schema::table('products', function (\Illuminate\Database\Schema\Blueprint $table): void {
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('products', 'item_condition')) {
                        $table->string('item_condition', 50)->default('normal')->after('product_type');
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('products', 'expiry_date')) {
                        $table->date('expiry_date')->nullable()->after('item_condition');
                    }
                    if (!\Illuminate\Support\Facades\Schema::hasColumn('products', 'condition_notes')) {
                        $table->text('condition_notes')->nullable()->after('expiry_date');
                    }
                });
            }
        } catch (\Throwable) {
            // Ignore during build / without DB
        }
    }
}
