<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('operation_documents')) {
            Schema::create('operation_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_type', 80)->index();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('counterpart_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
                $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
                $table->foreignId('payment_term_id')->nullable()->constrained('payment_terms')->nullOnDelete();
                $table->foreignId('primary_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('secondary_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();
                $table->foreignId('related_document_id')->nullable()->constrained('operation_documents')->nullOnDelete();
                $table->foreignId('responsible_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('document_number')->unique();
                $table->string('external_number')->nullable();
                $table->string('reference_number')->nullable();
                $table->string('numbering_type')->nullable();
                $table->string('status')->nullable();
                $table->string('process_type')->nullable();
                $table->string('payment_method')->nullable();
                $table->date('entry_date')->nullable();
                $table->date('due_date')->nullable();
                $table->date('shipping_date')->nullable();
                $table->date('check_date')->nullable();
                $table->date('effective_date')->nullable();
                $table->boolean('is_closed')->default(false);
                $table->decimal('subtotal', 18, 2)->default(0);
                $table->decimal('discount_total', 18, 2)->default(0);
                $table->decimal('tax_total', 18, 2)->default(0);
                $table->decimal('total_amount', 18, 2)->default(0);
                $table->decimal('paid_amount', 18, 2)->default(0);
                $table->decimal('outstanding_amount', 18, 2)->default(0);
                $table->json('flags')->nullable();
                $table->json('metadata')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('operation_document_lines')) {
            Schema::create('operation_document_lines', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('operation_document_id')->constrained('operation_documents')->cascadeOnDelete();
                $table->string('line_type')->nullable();
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->foreignId('fixed_asset_id')->nullable()->constrained('fixed_assets')->nullOnDelete();
                $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
                $table->string('description')->nullable();
                $table->string('reference_code')->nullable();
                $table->decimal('quantity', 18, 2)->nullable();
                $table->decimal('unit_price', 18, 2)->nullable();
                $table->decimal('discount_amount', 18, 2)->nullable();
                $table->decimal('tax_amount', 18, 2)->nullable();
                $table->decimal('debit_amount', 18, 2)->nullable();
                $table->decimal('credit_amount', 18, 2)->nullable();
                $table->decimal('total_amount', 18, 2)->nullable();
                $table->date('line_date')->nullable();
                $table->date('due_date')->nullable();
                $table->json('attributes')->nullable();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('operation_document_user')) {
            Schema::create('operation_document_user', function (Blueprint $table): void {
                $table->foreignId('operation_document_id')->constrained('operation_documents')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->primary(['operation_document_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_document_user');
        Schema::dropIfExists('operation_document_lines');
        Schema::dropIfExists('operation_documents');
    }
};
