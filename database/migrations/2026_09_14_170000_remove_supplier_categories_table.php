<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('suppliers') && Schema::hasColumn('suppliers', 'category_id')) {
            Schema::table('suppliers', function (Blueprint $table): void {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });
        }

        Schema::dropIfExists('supplier_categories');
    }

    public function down(): void
    {
        Schema::create('supplier_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('supplier_categories')->nullOnDelete();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        if (Schema::hasTable('suppliers') && !Schema::hasColumn('suppliers', 'category_id')) {
            Schema::table('suppliers', function (Blueprint $table): void {
                $table->foreignId('category_id')->nullable()->constrained('supplier_categories')->nullOnDelete();
            });
        }
    }
};
