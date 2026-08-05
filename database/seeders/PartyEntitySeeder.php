<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartyEntitySeeder extends Seeder
{
    public function run(): void
    {
        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id');
        $accBebanGajiId = DB::table('accounts')->where('code', '611.002-01')->value('id') 
            ?? DB::table('accounts')->value('id') ?? 1;

        $branchId = DB::table('branches')->first()->id ?? 1;

        // Seed salary allowances
        DB::table('salary_allowances')->insert([
            ['code' => 'ALL-TJ', 'name' => 'Tunjangan Jabatan', 'allowance_type' => 'Tunjangan Jabatan & Operasional', 'account_id' => $accBebanGajiId, 'notes' => 'Tunjangan struktural jabatan', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ALL-TR', 'name' => 'Tunjangan Transportasi', 'allowance_type' => 'Tunjangan Makan & Transport', 'account_id' => $accBebanGajiId, 'notes' => 'Tunjangan transportasi harian', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ALL-MK', 'name' => 'Tunjangan Uang Makan', 'allowance_type' => 'Tunjangan Makan & Transport', 'account_id' => $accBebanGajiId, 'notes' => 'Tunjangan makan siang karyawan', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ALL-BPJS', 'name' => 'Tunjangan BPJS Kesehatan', 'allowance_type' => 'Tunjangan Jabatan & Operasional', 'account_id' => $accBebanGajiId, 'notes' => 'Subsidi kesehatan BPJS', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed employees
        $emp1Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'employee_code' => 'EMP-001',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Ahmad Fauzi',
            'position' => 'Sales & Kasir Senior',
            'email' => 'ahmad.fauzi.tb@gmail.com',
            'mobile_phone' => '081298765431',
            'street' => 'Jl. Tomang Raya No. 45',
            'city' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
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
            'position' => 'Admin Keuangan & Akuntansi',
            'email' => 'siti.rahmawati.tb@gmail.com',
            'mobile_phone' => '081298765432',
            'street' => 'Jl. Kebon Jeruk No. 12',
            'city' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
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
            'position' => 'Kepala Gudang & Logistik',
            'email' => 'bambang.suryono88@gmail.com',
            'mobile_phone' => '081298765433',
            'street' => 'Jl. Raya Meruya No. 88',
            'city' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
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
            'position' => 'Staff Sales Lapangan',
            'email' => 'diki.dermawan92@gmail.com',
            'mobile_phone' => '081298765434',
            'street' => 'Jl. Slipi Jaya No. 22',
            'city' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
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

        // Seed customers (real buyers)
        DB::table('customers')->insert([
            ['category_id' => $custCatProject, 'currency_id' => $currencyId, 'code' => 'CUST-001', 'name' => 'CV. Nur Jaya Karya', 'business_phone' => '021-5829102', 'email' => 'nurjaya.karya@gmail.com', 'billing_address' => 'Jl. Tomang Raya No. 100, Jakarta Barat', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatRetail, 'currency_id' => $currencyId, 'code' => 'CUST-002', 'name' => 'Toko Bangunan Subur', 'business_phone' => '081234567891', 'email' => 'toko.subur.terusan@gmail.com', 'billing_address' => 'Jl. Kebon Jeruk Utama No. 45, Jakarta Barat', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatRetail, 'currency_id' => $currencyId, 'code' => 'CUST-003', 'name' => 'H. Bambang Suryono', 'business_phone' => '081388776655', 'email' => 'bambang.suryono88@gmail.com', 'billing_address' => 'Jl. Meruya Indah Blok B4, Jakarta Barat', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatProject, 'currency_id' => $currencyId, 'code' => 'CUST-004', 'name' => 'Ir. Ahmad Rifai (Proyek Perumahan)', 'business_phone' => '081599887766', 'email' => 'ahmad.rifai.proyek@gmail.com', 'billing_address' => 'Kawasan Proyek Perum Asri, Jakarta Barat', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $custCatRetail, 'currency_id' => $currencyId, 'code' => 'CUST-005', 'name' => 'Pak Eko Prasetyo', 'business_phone' => '081711223344', 'email' => 'eko.prasetyo.renovasi@gmail.com', 'billing_address' => 'Jl. Pos Pengumben No. 18, Jakarta Barat', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed suppliers (real manufacturers)
        DB::table('suppliers')->insert([
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-001', 'name' => 'PT. Semen Indonesia Tbk', 'business_phone' => '021-9988771', 'email' => 'sales.semenindonesia@gmail.com', 'billing_address' => 'Gedung Utama Semen Indonesia, Jakarta', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-002', 'name' => 'PT. Rucika Plumbing Systems', 'business_phone' => '021-9988772', 'email' => 'sales.rucika@gmail.com', 'billing_address' => 'Kawasan Industri Pulo Gadung, Jakarta', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-003', 'name' => 'PT. Avia Avian Tbk', 'business_phone' => '021-9988773', 'email' => 'sales.avian@gmail.com', 'billing_address' => 'Kawasan Industri Jababeka, Cikarang', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-004', 'name' => 'PT. Krakatau Steel Tbk', 'business_phone' => '021-9988774', 'email' => 'sales.krakatausteel@gmail.com', 'billing_address' => 'Kawasan Industri Cilegon, Banten', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $suppCatMat, 'currency_id' => $currencyId, 'code' => 'SUPP-005', 'name' => 'PT. Eterna Kabel Indonesia', 'business_phone' => '021-9988775', 'email' => 'sales.eternakabel@gmail.com', 'billing_address' => 'Kawasan Industri Tangerang, Banten', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
