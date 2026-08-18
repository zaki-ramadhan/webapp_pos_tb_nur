<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartyEntitySeeder extends Seeder
{
    public function run(): void
    {
        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id') ?? DB::table('currencies')->value('id') ?? 1;
        $accBebanGajiId = DB::table('accounts')->where('code', '610101')->value('id')
            ?? DB::table('accounts')->where('code', '611.002-01')->value('id')
            ?? DB::table('accounts')->value('id');

        $branchId = DB::table('branches')->first()->id ?? 1;

        // Seed salary allowances
        DB::table('salary_allowances')->insert([
            ['code' => 'ALL-MK', 'name' => 'Uang Makan', 'allowance_type' => 'Tunjangan Makan & Transport', 'account_id' => $accBebanGajiId, 'notes' => 'Uang makan harian karyawan', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ALL-TR', 'name' => 'Uang Transport / Bensin', 'allowance_type' => 'Tunjangan Makan & Transport', 'account_id' => $accBebanGajiId, 'notes' => 'Uang transportasi dan bensin pengiriman', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ALL-LB', 'name' => 'Upah Lembur / Bongkar Muat', 'allowance_type' => 'Tunjangan Operasional', 'account_id' => $accBebanGajiId, 'notes' => 'Upah lembur dan bongkar muat barang', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed employees
        $emp1Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'employee_code' => 'EMP-001',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Ahmad Fauzi',
            'position' => 'Kasir Toko',
            'email' => 'ahmad.fauzi87@gmail.com',
            'mobile_phone' => '081289765431',
            'street' => 'Jl. Raya Desa No. 45',
            'city' => 'Kecamatan Utama',
            'province' => 'Jawa Barat',
            'country' => 'Indonesia',
            'employment_status' => 'Pegawai Tetap',
            'joined_at' => '2021-03-01',
            'tax_status' => 'K/1',
            'subject_to_income_tax' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp2Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'employee_code' => 'EMP-002',
            'employee_id_type' => 'KTP',
            'salutation' => 'Ibu',
            'full_name' => 'Siti Rahmawati',
            'position' => 'Kasir Toko',
            'email' => 'siti.rahmawati95@gmail.com',
            'mobile_phone' => '081376543210',
            'street' => 'Jl. Kebon Jeruk No. 12',
            'city' => 'Kecamatan Utama',
            'province' => 'Jawa Barat',
            'country' => 'Indonesia',
            'employment_status' => 'Pegawai Tetap',
            'joined_at' => '2022-01-15',
            'tax_status' => 'TK/0',
            'subject_to_income_tax' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp3Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'employee_code' => 'EMP-003',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Bambang Suryono',
            'position' => 'Staf Gudang & Muat',
            'email' => 'bambang.suryono88@gmail.com',
            'mobile_phone' => '085712345678',
            'street' => 'Jl. Raya Meruya No. 88',
            'city' => 'Kecamatan Utama',
            'province' => 'Jawa Barat',
            'country' => 'Indonesia',
            'employment_status' => 'Pegawai Tetap',
            'joined_at' => '2020-05-10',
            'tax_status' => 'K/2',
            'subject_to_income_tax' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp4Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'employee_code' => 'EMP-004',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Diki Dermawan',
            'position' => 'Sopir Pengiriman',
            'email' => 'diki.dermawan92@gmail.com',
            'mobile_phone' => '082198761234',
            'street' => 'Jl. Pasar Desa No. 22',
            'city' => 'Kecamatan Utama',
            'province' => 'Jawa Barat',
            'country' => 'Indonesia',
            'employment_status' => 'Pegawai Tetap',
            'joined_at' => '2023-02-01',
            'tax_status' => 'TK/1',
            'subject_to_income_tax' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed employee bank accounts
        DB::table('employee_bank_accounts')->insert([
            ['employee_id' => $emp1Id, 'bank_name' => 'Bank BCA', 'account_name' => 'Ahmad Fauzi', 'account_number' => '8012345678', 'is_primary' => true, 'created_at' => now(), 'updated_at' => now()],
            ['employee_id' => $emp2Id, 'bank_name' => 'Bank Mandiri', 'account_name' => 'Siti Rahmawati', 'account_number' => '1240009876543', 'is_primary' => true, 'created_at' => now(), 'updated_at' => now()],
            ['employee_id' => $emp3Id, 'bank_name' => 'Bank BNI', 'account_name' => 'Bambang Suryono', 'account_number' => '0987654321', 'is_primary' => true, 'created_at' => now(), 'updated_at' => now()],
            ['employee_id' => $emp4Id, 'bank_name' => 'Bank BRI', 'account_name' => 'Diki Dermawan', 'account_number' => '2049018273645', 'is_primary' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed customer & supplier categories
        $custCatRetail = DB::table('customer_categories')->insertGetId(['code' => 'RET', 'name' => 'Pelanggan Eceran', 'is_default' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $custCatProject = DB::table('customer_categories')->insertGetId(['code' => 'PRJ', 'name' => 'Kontraktor & Proyek', 'is_default' => false, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        $suppCatMat = DB::table('supplier_categories')->insertGetId(['code' => 'MAT', 'name' => 'Produsen Material Utama', 'is_default' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        // Seed customers (real local buyers in Cirebon area)
        DB::table('customers')->insert([
            ['category_id' => $custCatProject, 'currency_id' => $currencyId, 'code' => 'CUST-001', 'name' => 'CV Nur Jaya Karya', 'business_phone' => '081258291020', 'mobile_phone' => '081258291020', 'email' => 'nurjaya.karya@gmail.com', 'billing_address' => 'Jl. Raya Guwa Kidul No. 100, Kaliwedi, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatRetail, 'currency_id' => $currencyId, 'code' => 'CUST-002', 'name' => 'Toko Bangunan Subur', 'business_phone' => '081234567891', 'mobile_phone' => '081234567891', 'email' => 'toko.subur.cirebon@gmail.com', 'billing_address' => 'Jl. By Pass Arjawinangun No. 45, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatRetail, 'currency_id' => $currencyId, 'code' => 'CUST-003', 'name' => 'H. Bambang Suryono', 'business_phone' => '081388776655', 'mobile_phone' => '081388776655', 'email' => 'bambang.suryono88@gmail.com', 'billing_address' => 'Jl. Fatahillah No. 12, Plered, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatProject, 'currency_id' => $currencyId, 'code' => 'CUST-004', 'name' => 'Ir. Ahmad Rifai (Proyek Perumahan)', 'business_phone' => '081599887766', 'mobile_phone' => '081599887766', 'email' => 'ahmad.rifai.proyek@gmail.com', 'billing_address' => 'Kawasan Perumahan Asri, Kedawung, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatRetail, 'currency_id' => $currencyId, 'code' => 'CUST-005', 'name' => 'Pak Eko Prasetyo', 'business_phone' => '081711223344', 'mobile_phone' => '081711223344', 'email' => 'eko.prasetyo.renovasi@gmail.com', 'billing_address' => 'Jl. Panembahan Ratu No. 18, Weru, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed suppliers (real distributors & suppliers in Cirebon region)
        DB::table('suppliers')->insert([
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-001', 'name' => 'PT Niaga Manunggal Perkasa', 'business_phone' => '085224744480', 'mobile_phone' => '085224744480', 'email' => 'sales@niagamanunggal.co.id', 'billing_address' => 'Jl. Raya Cirebon - Bandung KM 20, Palimanan, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-002', 'name' => 'PT Solusi Inti Bersama', 'business_phone' => '081299887722', 'mobile_phone' => '081299887722', 'email' => 'cirebon@solusiintibersama.com', 'billing_address' => 'Jl. Raya Plered - Cirebon No. 45, Plered, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-003', 'name' => 'PT Central Utama Indowarna', 'business_phone' => '02312520650', 'mobile_phone' => '081399887733', 'email' => 'depocirebon@cui.co.id', 'billing_address' => 'Jl. Ir. H. Juanda No. 88, Pilangsari, Kedawung, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-004', 'name' => 'PT Mega Baja Palimanan', 'business_phone' => '081333388474', 'mobile_phone' => '081333388474', 'email' => 'palimanan@megabaja.co.id', 'billing_address' => 'Jl. DR. Setiabudi No. 319, Lungbenda, Palimanan, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-005', 'name' => 'CV Grahaprana Irasentosa', 'business_phone' => '02318302111', 'mobile_phone' => '081799887755', 'email' => 'cirebon@gias.co.id', 'billing_address' => 'Komplek Pergudangan Royal Techno Park Blok B-12, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-006', 'name' => 'CV Pasir Berkah Arjawinangun', 'business_phone' => '087712345678', 'mobile_phone' => '087712345678', 'email' => 'pasirberkah.arjawinangun@gmail.com', 'billing_address' => 'Jl. By Pass Arjawinangun No. 15, Arjawinangun, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-007', 'name' => 'PT Propan Raya ICC Cirebon', 'business_phone' => '0231488921', 'mobile_phone' => '081234567890', 'email' => 'psc.cirebon@propanraya.com', 'billing_address' => 'Jl. Brigjen Dharsono No. 12, Sunyaragi, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-008', 'name' => 'Toko RKM Plered Cirebon', 'business_phone' => '0231321456', 'mobile_phone' => '081987654321', 'email' => 'rkm.plered@rkm.co.id', 'billing_address' => 'Jl. Otto Iskandardinata No. 77, Tegalsari, Plered, Cirebon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
