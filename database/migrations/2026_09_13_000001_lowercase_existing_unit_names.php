<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('units')) {
            DB::table('units')->update([
                'name' => DB::raw('LOWER(TRIM(name))'),
            ]);
        }
    }

    public function down(): void
    {
        // No reverse needed for lowercase normalization
    }
};
