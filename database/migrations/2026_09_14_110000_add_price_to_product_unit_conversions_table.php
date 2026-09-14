<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('product_unit_conversions') && ! Schema::hasColumn('product_unit_conversions', 'price')) {
            Schema::table('product_unit_conversions', function (Blueprint $table): void {
                $table->decimal('price', 18, 2)->default(0)->after('quantity');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('product_unit_conversions') && Schema::hasColumn('product_unit_conversions', 'price')) {
            Schema::table('product_unit_conversions', function (Blueprint $table): void {
                $table->dropColumn('price');
            });
        }
    }
};
