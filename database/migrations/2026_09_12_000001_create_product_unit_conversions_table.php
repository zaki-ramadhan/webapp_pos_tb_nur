<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('product_unit_conversions')) {
            Schema::create('product_unit_conversions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
                $table->decimal('quantity', 18, 4)->default(1);
                $table->timestamps();

                $table->index(['product_id', 'unit_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_unit_conversions');
    }
};
