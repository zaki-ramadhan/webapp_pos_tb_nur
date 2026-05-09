<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('street')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('province')->nullable();
            $table->string('country')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('branch_user', function (Blueprint $table): void {
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['branch_id', 'user_id']);
        });

        Schema::create('departments', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('department_user', function (Blueprint $table): void {
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['department_id', 'user_id']);
        });

        Schema::create('currencies', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name');
            $table->string('symbol', 10);
            $table->decimal('exchange_rate', 18, 6)->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('account_type');
            $table->text('notes')->nullable();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->date('opening_balance_date')->nullable();
            $table->string('cash_bank_reference')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('account_branch', function (Blueprint $table): void {
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->primary(['account_id', 'branch_id']);
        });

        Schema::create('account_user', function (Blueprint $table): void {
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['account_id', 'user_id']);
        });

        Schema::create('taxes', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->string('tax_type');
            $table->decimal('rate', 10, 4)->default(0);
            $table->foreignId('output_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('input_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('payment_terms', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->unsignedInteger('due_days')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shipping_methods', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('fob_terms', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('salary_allowances', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->string('allowance_type');
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('employee_code')->unique();
            $table->string('salutation', 20)->nullable();
            $table->string('full_name');
            $table->string('position')->nullable();
            $table->string('email')->nullable();
            $table->string('mobile_phone')->nullable();
            $table->string('office_phone')->nullable();
            $table->string('whatsapp_phone')->nullable();
            $table->string('nationality')->nullable();
            $table->string('employment_status')->nullable();
            $table->date('joined_at')->nullable();
            $table->string('tax_status')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employee_bank_accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        Schema::create('transaction_approval_rules', function (Blueprint $table): void {
            $table->id();
            $table->string('rule_name');
            $table->string('transaction_type');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->decimal('threshold_amount', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('transaction_approval_rule_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('transaction_approval_rule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approver_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approver_role_id')->nullable()->constrained('roles')->nullOnDelete();
            $table->unsignedSmallInteger('step_order')->default(1);
            $table->unsignedSmallInteger('min_approvals')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_approval_rule_steps');
        Schema::dropIfExists('transaction_approval_rules');
        Schema::dropIfExists('employee_bank_accounts');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('salary_allowances');
        Schema::dropIfExists('fob_terms');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('payment_terms');
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('account_user');
        Schema::dropIfExists('account_branch');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('currencies');
        Schema::dropIfExists('department_user');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('branch_user');
        Schema::dropIfExists('branches');
    }
};
