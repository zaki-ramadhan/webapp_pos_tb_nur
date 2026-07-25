<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customers') && ! Schema::hasColumn('customers', 'contact_person')) {
            Schema::table('customers', function (Blueprint $table): void {
                $table->string('contact_person')->nullable()->after('name');
            });
        }
        if (Schema::hasTable('suppliers') && ! Schema::hasColumn('suppliers', 'contact_person')) {
            Schema::table('suppliers', function (Blueprint $table): void {
                $table->string('contact_person')->nullable()->after('name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('customers') && Schema::hasColumn('customers', 'contact_person')) {
            Schema::table('customers', function (Blueprint $table): void {
                $table->dropColumn('contact_person');
            });
        }
        if (Schema::hasTable('suppliers') && Schema::hasColumn('suppliers', 'contact_person')) {
            Schema::table('suppliers', function (Blueprint $table): void {
                $table->dropColumn('contact_person');
            });
        }
    }
};
