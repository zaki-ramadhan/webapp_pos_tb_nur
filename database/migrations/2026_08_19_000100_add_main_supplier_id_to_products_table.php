<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('products') && ! Schema::hasColumn('products', 'main_supplier_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('main_supplier_id')->nullable()->after('sales_unit_id')->constrained('suppliers')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('products') && Schema::hasColumn('products', 'main_supplier_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropForeign(['main_supplier_id']);
                $table->dropColumn('main_supplier_id');
            });
        }
    }
};
