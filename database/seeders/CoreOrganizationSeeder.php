<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoreOrganizationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('branches')->insert([
            [
                'code' => 'JKT-01',
                'name' => 'TOKO UTAMA',
                'phone' => '087724985885',
                'email' => 'toko.utama@tbnur.com',
                'street' => 'Jl. P. Anggabaya No.22, Guwa Kidul, Kec. Kaliwedi',
                'city' => 'Kabupaten Cirebon',
                'postal_code' => '45165',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SBY-02',
                'name' => 'CABANG KEDUA',
                'phone' => '0317261823',
                'email' => 'cabang.kedua@tbnur.com',
                'street' => 'Jl. Raya Tuparev No. 102',
                'city' => 'Cirebon',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        $branchId = DB::table('branches')->where('code', 'JKT-01')->value('id');
        $branchSbyId = DB::table('branches')->where('code', 'SBY-02')->value('id');

        DB::table('warehouses')->insert([
            [
                'branch_id' => $branchId,
                'code' => 'WH-JKT',
                'name' => 'Gudang Utama',
                'description' => 'Gudang Utama Toko (Display Depan)',
                'responsible_person' => null,
                'warehouse_type' => 'main',
                'is_active' => true,
                'street' => 'Jl. Raya Sunan Gunung Jati No. 45',
                'city' => 'Cirebon',
                'postal_code' => '45151',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'all_users' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'branch_id' => $branchSbyId,
                'code' => 'WH-SBY',
                'name' => 'Gudang Material',
                'description' => 'Gudang Terbuka Pasir & Batu Bata (Belakang Toko)',
                'responsible_person' => null,
                'warehouse_type' => 'main',
                'is_active' => true,
                'street' => 'Jl. Raya Tuparev No. 102',
                'city' => 'Cirebon',
                'postal_code' => '45151',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'all_users' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
