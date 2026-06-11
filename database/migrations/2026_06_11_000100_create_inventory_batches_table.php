<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inventory_batches')) {
            Schema::create('inventory_batches', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
                $table->dateTime('entry_date')->index();
                $table->decimal('qty_received', 14, 4);
                $table->decimal('qty_remaining', 14, 4)->index();
                $table->decimal('unit_cost', 18, 4);
                $table->string('source_type')->index();
                $table->unsignedBigInteger('source_id')->index();
                $table->unsignedBigInteger('source_line_id')->nullable()->index();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
