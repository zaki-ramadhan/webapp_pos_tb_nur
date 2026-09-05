<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            'phone' => '087724985885',
            'fax' => '087724985885',
            'street' => 'Jl. P. Anggabaya No.22, Guwa Kidul, Kec. Kaliwedi',
            'city' => 'Kab. Cirebon',
            'province' => 'Jawa Barat',
            'postal-code' => '45165',
            'country' => 'Indonesia',
        ];

        if (Schema::hasTable('preference_settings')) {
            foreach ($settings as $key => $val) {
                DB::table('preference_settings')
                    ->where('group_key', 'company_info')
                    ->where('setting_key', $key)
                    ->update(['value' => json_encode($val), 'updated_at' => now()]);
            }
        }

        if (Schema::hasTable('branches')) {
            DB::table('branches')
                ->where('code', 'JKT-01')
                ->orWhere('name', 'like', '%Utama%')
                ->update([
                    'phone' => '087724985885',
                    'street' => 'Jl. P. Anggabaya No.22, Guwa Kidul, Kec. Kaliwedi',
                    'city' => 'Kab. Cirebon',
                    'postal_code' => '45165',
                    'province' => 'Jawa Barat',
                    'country' => 'Indonesia',
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructive rollback needed
    }
};
