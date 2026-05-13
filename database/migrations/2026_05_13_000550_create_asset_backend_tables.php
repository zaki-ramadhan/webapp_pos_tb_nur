<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('asset_categories')) {
            Schema::create('asset_categories', function (Blueprint $table): void {
                $table->id();
                $table->string('code')->nullable()->unique();
                $table->string('name');
                $table->string('depreciation_method')->nullable();
                $table->unsignedInteger('asset_life_months')->default(0);
                $table->decimal('depreciation_rate', 10, 4)->default(0);
                $table->foreignId('asset_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('accumulated_depreciation_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('depreciation_expense_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('asset_tax_categories')) {
            Schema::create('asset_tax_categories', function (Blueprint $table): void {
                $table->id();
                $table->string('code')->nullable()->unique();
                $table->string('name');
                $table->string('depreciation_method')->nullable();
                $table->unsignedInteger('asset_life_months')->default(0);
                $table->decimal('depreciation_rate', 10, 4)->default(0);
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('fixed_assets')) {
            Schema::create('fixed_assets', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('asset_category_id')->nullable()->constrained('asset_categories')->nullOnDelete();
                $table->foreignId('asset_tax_category_id')->nullable()->constrained('asset_tax_categories')->nullOnDelete();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->foreignId('asset_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('accumulated_depreciation_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->foreignId('depreciation_expense_account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->string('code')->unique();
                $table->string('name');
                $table->date('purchase_date')->nullable();
                $table->date('usage_date')->nullable();
                $table->boolean('is_intangible')->default(false);
                $table->string('depreciation_method')->nullable();
                $table->unsignedInteger('quantity')->default(1);
                $table->unsignedInteger('asset_life_years')->default(0);
                $table->unsignedInteger('asset_life_months')->default(0);
                $table->decimal('depreciation_ratio', 10, 4)->default(0);
                $table->decimal('residual_value', 18, 2)->default(0);
                $table->decimal('acquisition_cost', 18, 2)->default(0);
                $table->decimal('book_value', 18, 2)->default(0);
                $table->boolean('tax_enabled')->default(false);
                $table->date('last_depreciation_at')->nullable();
                $table->string('initial_location_name')->nullable();
                $table->text('initial_location_address')->nullable();
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('fixed_asset_expenses')) {
            Schema::create('fixed_asset_expenses', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('fixed_asset_id')->constrained('fixed_assets')->cascadeOnDelete();
                $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
                $table->string('code')->nullable();
                $table->string('description')->nullable();
                $table->date('expense_date')->nullable();
                $table->decimal('amount', 18, 2)->default(0);
                $table->text('notes')->nullable();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('fixed_asset_locations')) {
            Schema::create('fixed_asset_locations', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('fixed_asset_id')->constrained('fixed_assets')->cascadeOnDelete();
                $table->string('location_name');
                $table->text('location_address')->nullable();
                $table->unsignedInteger('quantity')->default(1);
                $table->boolean('is_current')->default(true);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_asset_locations');
        Schema::dropIfExists('fixed_asset_expenses');
        Schema::dropIfExists('fixed_assets');
        Schema::dropIfExists('asset_tax_categories');
        Schema::dropIfExists('asset_categories');
    }
};
