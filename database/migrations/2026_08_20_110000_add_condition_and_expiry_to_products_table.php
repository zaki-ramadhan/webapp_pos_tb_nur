<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint ): void {
            if (!Schema::hasColumn('products', 'item_condition')) {
                ->string('item_condition', 50)->default('normal')->after('product_type');
            }
            if (!Schema::hasColumn('products', 'expiry_date')) {
                ->date('expiry_date')->nullable()->after('item_condition');
            }
            if (!Schema::hasColumn('products', 'condition_notes')) {
                ->text('condition_notes')->nullable()->after('expiry_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint ): void {
            if (Schema::hasColumn('products', 'condition_notes')) {
                ->dropColumn('condition_notes');
            }
            if (Schema::hasColumn('products', 'expiry_date')) {
                ->dropColumn('expiry_date');
            }
            if (Schema::hasColumn('products', 'item_condition')) {
                ->dropColumn('item_condition');
            }
        });
    }
};
