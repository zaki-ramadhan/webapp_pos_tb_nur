<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('inventory_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('sales_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('sales_return_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('sales_discount_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('delivered_goods_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('cogs_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('purchase_return_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('uninvoiced_purchase_account_id')->nullable()->constrained('accounts')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['inventory_account_id']);
            $table->dropColumn('inventory_account_id');
            $table->dropForeign(['sales_account_id']);
            $table->dropColumn('sales_account_id');
            $table->dropForeign(['sales_return_account_id']);
            $table->dropColumn('sales_return_account_id');
            $table->dropForeign(['sales_discount_account_id']);
            $table->dropColumn('sales_discount_account_id');
            $table->dropForeign(['delivered_goods_account_id']);
            $table->dropColumn('delivered_goods_account_id');
            $table->dropForeign(['cogs_account_id']);
            $table->dropColumn('cogs_account_id');
            $table->dropForeign(['purchase_return_account_id']);
            $table->dropColumn('purchase_return_account_id');
            $table->dropForeign(['uninvoiced_purchase_account_id']);
            $table->dropColumn('uninvoiced_purchase_account_id');
        });
    }
};
