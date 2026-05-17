<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        Schema::table('employees', function (Blueprint $table): void {
            if (! Schema::hasColumn('employees', 'employee_id_type')) {
                $table->string('employee_id_type', 50)->nullable()->after('employee_code');
            }

            if (! Schema::hasColumn('employees', 'home_phone')) {
                $table->string('home_phone')->nullable()->after('office_phone');
            }

            if (! Schema::hasColumn('employees', 'website')) {
                $table->string('website')->nullable()->after('whatsapp_phone');
            }

            if (! Schema::hasColumn('employees', 'identity_number')) {
                $table->string('identity_number', 100)->nullable()->after('website');
            }

            if (! Schema::hasColumn('employees', 'street')) {
                $table->string('street')->nullable()->after('identity_number');
            }

            if (! Schema::hasColumn('employees', 'city')) {
                $table->string('city')->nullable()->after('street');
            }

            if (! Schema::hasColumn('employees', 'postal_code')) {
                $table->string('postal_code', 20)->nullable()->after('city');
            }

            if (! Schema::hasColumn('employees', 'province')) {
                $table->string('province')->nullable()->after('postal_code');
            }

            if (! Schema::hasColumn('employees', 'country')) {
                $table->string('country')->nullable()->after('province');
            }

            if (! Schema::hasColumn('employees', 'subject_to_income_tax')) {
                $table->boolean('subject_to_income_tax')->default(true)->after('tax_status');
            }

            if (! Schema::hasColumn('employees', 'tax_number')) {
                $table->string('tax_number', 100)->nullable()->after('subject_to_income_tax');
            }

            if (! Schema::hasColumn('employees', 'tax_allowance_applies')) {
                $table->string('tax_allowance_applies', 50)->nullable()->after('tax_number');
            }

            if (! Schema::hasColumn('employees', 'tax_allowance_status')) {
                $table->string('tax_allowance_status', 120)->nullable()->after('tax_allowance_applies');
            }

            if (! Schema::hasColumn('employees', 'tax_start_month')) {
                $table->string('tax_start_month', 20)->nullable()->after('tax_allowance_status');
            }

            if (! Schema::hasColumn('employees', 'tax_start_year')) {
                $table->string('tax_start_year', 10)->nullable()->after('tax_start_month');
            }

            if (! Schema::hasColumn('employees', 'previous_income')) {
                $table->decimal('previous_income', 18, 2)->nullable()->after('tax_start_year');
            }

            if (! Schema::hasColumn('employees', 'previous_tax')) {
                $table->decimal('previous_tax', 18, 2)->nullable()->after('previous_income');
            }

            if (! Schema::hasColumn('employees', 'is_salesperson')) {
                $table->boolean('is_salesperson')->default(false)->after('previous_tax');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        Schema::table('employees', function (Blueprint $table): void {
            $columns = [
                'employee_id_type',
                'home_phone',
                'website',
                'identity_number',
                'street',
                'city',
                'postal_code',
                'province',
                'country',
                'subject_to_income_tax',
                'tax_number',
                'tax_allowance_applies',
                'tax_allowance_status',
                'tax_start_month',
                'tax_start_year',
                'previous_income',
                'previous_tax',
                'is_salesperson',
            ];

            $existingColumns = array_values(array_filter($columns, fn (string $column) => Schema::hasColumn('employees', $column)));

            if ($existingColumns !== []) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
