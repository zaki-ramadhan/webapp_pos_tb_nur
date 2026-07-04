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
                'phone' => '021-8273618',
                'email' => 'toko.utama@tbnur.com',
                'street' => 'Jl. Raya Sunan Gunung Jati No. 45',
                'city' => 'Cirebon',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SBY-02',
                'name' => 'CABANG KEDUA',
                'phone' => '031-7261823',
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
                'warehouse_type' => 'main',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'branch_id' => $branchSbyId,
                'code' => 'WH-SBY',
                'name' => 'Gudang Material',
                'warehouse_type' => 'main',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        DB::table('departments')->insert([
            [
                'code' => 'OWN',
                'name' => 'Pengelola / Owner',
                'notes' => 'Pemilik dan pengelola bisnis',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'TKO',
                'name' => 'Staf Toko & Kasir',
                'notes' => 'Staf pelayanan toko dan kasir',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'GDG',
                'name' => 'Staf Gudang & Sopir',
                'notes' => 'Staf operasional gudang, pengiriman, dan armada',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
