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
                'name' => 'JAKARTA',
                'phone' => '021-8273618',
                'email' => 'jakarta@tbnur.com',
                'street' => 'Jl. Salemba Raya No. 12',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SBY-02',
                'name' => 'SURABAYA',
                'phone' => '031-7261823',
                'email' => 'surabaya@tbnur.com',
                'street' => 'Jl. Kalijudan No. 98A',
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
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
                'name' => 'Gudang Utama Jakarta',
                'warehouse_type' => 'main',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'branch_id' => $branchSbyId,
                'code' => 'WH-SBY',
                'name' => 'Gudang Utama Surabaya',
                'warehouse_type' => 'main',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        DB::table('departments')->insert([
            [
                'code' => 'ACC',
                'name' => 'Accounting',
                'notes' => 'Departemen Keuangan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'HRD',
                'name' => 'Human Resources',
                'notes' => 'Departemen Personalia',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SLS',
                'name' => 'Sales & Marketing',
                'notes' => 'Departemen Penjualan dan Pemasaran',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ITD',
                'name' => 'Information Technology',
                'notes' => 'Departemen Teknologi Informasi',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'OPS',
                'name' => 'Operations & Logistics',
                'notes' => 'Departemen Operasional & Logistik',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
