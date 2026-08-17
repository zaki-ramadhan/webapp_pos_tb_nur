<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update Gudang Utama jika ada
        DB::table('warehouses')
            ->where('code', 'WH-JKT')
            ->orWhere('name', 'like', '%Utama%')
            ->update([
                'street' => 'Jl. Raya Sunan Gunung Jati No. 45',
                'city' => 'Cirebon',
                'postal_code' => '45151',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'description' => 'Gudang Utama Toko (Display Depan)',
                'responsible_person' => null,
                'all_users' => true,
                'updated_at' => now(),
            ]);

        // 2. Update Gudang Material jika ada
        DB::table('warehouses')
            ->where('code', 'WH-SBY')
            ->orWhere('name', 'like', '%Material%')
            ->orWhere('name', 'like', '%Pasir%')
            ->update([
                'street' => 'Jl. Raya Tuparev No. 102',
                'city' => 'Cirebon',
                'postal_code' => '45151',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'description' => 'Gudang Terbuka Pasir & Batu Bata (Belakang Toko)',
                'responsible_person' => null,
                'all_users' => true,
                'updated_at' => now(),
            ]);

        // 3. Fallback untuk warehouse lain yang masih kosong alamatnya dari branch terkait
        $warehouses = DB::table('warehouses')
            ->whereNull('street')
            ->orWhere('street', '')
            ->get();

        foreach ($warehouses as $wh) {
            $branch = $wh->branch_id ? DB::table('branches')->where('id', $wh->branch_id)->first() : null;
            if ($branch) {
                DB::table('warehouses')->where('id', $wh->id)->update([
                    'street' => $branch->street ?? 'Jl. Raya Sunan Gunung Jati No. 45',
                    'city' => $branch->city ?? 'Cirebon',
                    'postal_code' => $branch->postal_code ?? '45151',
                    'province' => $branch->province ?? 'Jawa Barat',
                    'country' => $branch->country ?? 'Indonesia',
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
