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
            if (! Schema::hasColumn('employees', 'liability_account_label')) {
                $table->string('liability_account_label')->nullable()->after('notes');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        Schema::table('employees', function (Blueprint $table): void {
            if (Schema::hasColumn('employees', 'liability_account_label')) {
                $table->dropColumn('liability_account_label');
            }
        });
    }
};
