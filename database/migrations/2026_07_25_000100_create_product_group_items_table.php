<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'print_group_details')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->boolean('print_group_details')->default(true)->after('is_active');
                $table->boolean('allow_edit_group_quantity')->default(false)->after('print_group_details');
                $table->boolean('use_group_price')->default(true)->after('allow_edit_group_quantity');
            });
        }

        if (! Schema::hasTable('product_group_items')) {
            Schema::create('product_group_items', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('parent_product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('child_product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
                $table->decimal('quantity', 18, 4)->default(1);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_group_items');

        if (Schema::hasColumn('products', 'print_group_details')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->dropColumn(['print_group_details', 'allow_edit_group_quantity', 'use_group_price']);
            });
        }
    }
};
