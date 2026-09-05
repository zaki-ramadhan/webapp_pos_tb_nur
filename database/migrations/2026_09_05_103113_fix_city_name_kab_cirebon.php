<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('preference_settings')) {
            DB::table('preference_settings')
                ->where('group_key', 'company_info')
                ->where('setting_key', 'city')
                ->where('value', json_encode('Kabupaten Cirebon'))
                ->update(['value' => json_encode('Kab. Cirebon'), 'updated_at' => now()]);
        }

        if (Schema::hasTable('branches')) {
            DB::table('branches')
                ->where('city', 'Kabupaten Cirebon')
                ->update(['city' => 'Kab. Cirebon', 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('preference_settings')) {
            DB::table('preference_settings')
                ->where('group_key', 'company_info')
                ->where('setting_key', 'city')
                ->where('value', json_encode('Kab. Cirebon'))
                ->update(['value' => json_encode('Kabupaten Cirebon'), 'updated_at' => now()]);
        }

        if (Schema::hasTable('branches')) {
            DB::table('branches')
                ->where('city', 'Kab. Cirebon')
                ->update(['city' => 'Kabupaten Cirebon', 'updated_at' => now()]);
        }
    }
};
