<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('customer_categories')->nullOnDelete();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

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

        Schema::create('sales_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('customer_categories')->nullOnDelete();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->foreignId('payment_term_id')->nullable()->constrained('payment_terms')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('business_phone')->nullable();
            $table->string('mobile_phone')->nullable();
            $table->string('whatsapp_phone')->nullable();
            $table->string('email')->nullable();
            $table->string('fax')->nullable();
            $table->string('website')->nullable();
            $table->text('billing_address')->nullable();
            $table->text('shipping_address')->nullable();
            $table->decimal('credit_limit', 18, 2)->default(0);
            $table->string('tax_number')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('customer_branch', function (Blueprint $table): void {
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->primary(['customer_id', 'branch_id']);
        });

        Schema::create('suppliers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('supplier_categories')->nullOnDelete();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->foreignId('payment_term_id')->nullable()->constrained('payment_terms')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('business_phone')->nullable();
            $table->string('mobile_phone')->nullable();
            $table->string('whatsapp_phone')->nullable();
            $table->string('email')->nullable();
            $table->string('fax')->nullable();
            $table->string('website')->nullable();
            $table->text('billing_address')->nullable();
            $table->decimal('credit_limit', 18, 2)->default(0);
            $table->string('tax_number')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('branch_supplier', function (Blueprint $table): void {
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->primary(['supplier_id', 'branch_id']);
        });

        Schema::create('brands', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('units', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->unsignedTinyInteger('precision')->default(0);
            $table->string('tax_reference_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('product_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('warehouses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('warehouse_type')->default('main');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('base_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('purchase_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('sales_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->string('name');
            $table->string('product_type')->default('stock');
            $table->decimal('minimum_stock', 18, 2)->default(0);
            $table->decimal('default_purchase_price', 18, 2)->default(0);
            $table->decimal('default_sale_price', 18, 2)->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('product_unit_conversions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->decimal('quantity', 18, 4)->default(1);
            $table->timestamps();
        });

        Schema::create('product_prices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('price_type')->default('sale');
            $table->decimal('price', 18, 2)->default(0);
            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_prices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->decimal('price', 18, 2)->default(0);
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_prices');
        Schema::dropIfExists('product_prices');
        Schema::dropIfExists('product_unit_conversions');
        Schema::dropIfExists('products');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('units');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('branch_supplier');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('customer_branch');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('sales_categories');
        Schema::dropIfExists('supplier_categories');
        Schema::dropIfExists('customer_categories');
    }
};
