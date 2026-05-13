<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inventory_documents')) {
            Schema::create('inventory_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_type', 60)->index();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('counterpart_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('related_document_id')->nullable()->constrained('inventory_documents')->nullOnDelete();
                $table->foreignId('product_category_id')->nullable()->constrained('product_categories')->nullOnDelete();
                $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
                $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
                $table->foreignId('responsible_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('document_number')->unique();
                $table->string('reference_number')->nullable();
                $table->string('request_type')->nullable();
                $table->string('process_type')->nullable();
                $table->string('numbering_type')->nullable();
                $table->string('status')->nullable();
                $table->date('document_date')->nullable();
                $table->date('effective_date')->nullable();
                $table->boolean('is_closed')->default(false);
                $table->text('notes')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inventory_document_lines')) {
            Schema::create('inventory_document_lines', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('inventory_document_id')->constrained('inventory_documents')->cascadeOnDelete();
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->string('item_name')->nullable();
                $table->string('item_code')->nullable();
                $table->decimal('quantity', 18, 2)->default(0);
                $table->decimal('system_quantity', 18, 2)->nullable();
                $table->decimal('counted_quantity', 18, 2)->nullable();
                $table->date('line_date')->nullable();
                $table->text('notes')->nullable();
                $table->json('attributes')->nullable();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('inventory_document_user')) {
            Schema::create('inventory_document_user', function (Blueprint $table): void {
                $table->foreignId('inventory_document_id')->constrained('inventory_documents')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->primary(['inventory_document_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_document_user');
        Schema::dropIfExists('inventory_document_lines');
        Schema::dropIfExists('inventory_documents');
    }
};
