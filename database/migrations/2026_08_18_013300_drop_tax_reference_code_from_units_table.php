<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('units') && Schema::hasColumn('units', 'tax_reference_code')) {
            Schema::table('units', function (Blueprint $table) {
                $table->dropColumn('tax_reference_code');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('units') && !Schema::hasColumn('units', 'tax_reference_code')) {
            Schema::table('units', function (Blueprint $table) {
                $table->string('tax_reference_code')->nullable()->after('precision');
            });
        }
    }
};
