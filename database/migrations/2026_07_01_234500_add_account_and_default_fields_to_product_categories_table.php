<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table): void {
            $table->boolean('is_default')->default(false)->after('slug');
            
            $table->foreignId('inventory_account_id')->nullable()->after('is_default')->constrained('accounts')->nullOnDelete();
            $table->foreignId('expense_account_id')->nullable()->after('inventory_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('sales_account_id')->nullable()->after('expense_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('sales_return_account_id')->nullable()->after('sales_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('sales_discount_account_id')->nullable()->after('sales_return_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('goods_in_transit_account_id')->nullable()->after('sales_discount_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('cost_of_goods_sold_account_id')->nullable()->after('goods_in_transit_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('purchase_return_account_id')->nullable()->after('cost_of_goods_sold_account_id')->constrained('accounts')->nullOnDelete();
            $table->foreignId('unbilled_purchase_account_id')->nullable()->after('purchase_return_account_id')->constrained('accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table): void {
            $table->dropForeign(['unbilled_purchase_account_id']);
            $table->dropForeign(['purchase_return_account_id']);
            $table->dropForeign(['cost_of_goods_sold_account_id']);
            $table->dropForeign(['goods_in_transit_account_id']);
            $table->dropForeign(['sales_discount_account_id']);
            $table->dropForeign(['sales_return_account_id']);
            $table->dropForeign(['sales_account_id']);
            $table->dropForeign(['expense_account_id']);
            $table->dropForeign(['inventory_account_id']);
            
            $table->dropColumn([
                'is_default',
                'inventory_account_id',
                'expense_account_id',
                'sales_account_id',
                'sales_return_account_id',
                'sales_discount_account_id',
                'goods_in_transit_account_id',
                'cost_of_goods_sold_account_id',
                'purchase_return_account_id',
                'unbilled_purchase_account_id',
            ]);
        });
    }
};
