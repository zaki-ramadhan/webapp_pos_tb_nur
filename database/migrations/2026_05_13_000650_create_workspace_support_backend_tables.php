<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('preference_settings')) {
            Schema::create('preference_settings', function (Blueprint $table): void {
                $table->id();
                $table->string('group_key', 80)->index();
                $table->string('setting_key', 120)->index();
                $table->string('scope_type', 80)->nullable();
                $table->string('scope_key', 120)->nullable();
                $table->string('label')->nullable();
                $table->string('data_type', 40)->nullable();
                $table->json('value')->nullable();
                $table->boolean('is_active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->unique(['group_key', 'setting_key', 'scope_type', 'scope_key'], 'preference_settings_unique_key');
            });
        }

        if (! Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table): void {
                $table->id();
                $table->string('log_group', 80)->nullable()->index();
                $table->string('resource_key', 120)->index();
                $table->string('resource_label')->nullable();
                $table->string('permission_key', 120)->nullable()->index();
                $table->string('action', 20)->index();
                $table->string('subject_type', 200)->nullable();
                $table->unsignedBigInteger('subject_id')->nullable()->index();
                $table->string('subject_label')->nullable();
                $table->string('document_number', 120)->nullable()->index();
                $table->text('description')->nullable();
                $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('actor_name')->nullable();
                $table->string('actor_email')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->timestamp('occurred_at')->index();
                $table->json('before_payload')->nullable();
                $table->json('after_payload')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('report_catalogs')) {
            Schema::create('report_catalogs', function (Blueprint $table): void {
                $table->id();
                $table->string('category_key', 80)->index();
                $table->string('section_key', 80)->nullable()->index();
                $table->string('report_key', 120)->unique();
                $table->string('title');
                $table->string('section_label')->nullable();
                $table->string('icon', 60)->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('sales_checkins')) {
            Schema::create('sales_checkins', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->foreignId('sales_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('related_document_id')->nullable()->constrained('operation_documents')->nullOnDelete();
                $table->string('checkin_number')->unique();
                $table->string('transaction_name')->nullable();
                $table->timestamp('checked_in_at')->index();
                $table->text('notes')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_checkins');
        Schema::dropIfExists('report_catalogs');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('preference_settings');
    }
};
