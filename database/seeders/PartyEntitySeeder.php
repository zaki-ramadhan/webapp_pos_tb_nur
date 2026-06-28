<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PartyEntitySeeder extends Seeder
{
    public function run(): void
    {
        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id');
        $paymentTermId = DB::table('payment_terms')->where('code', 'COD')->value('id');
        $accBebanGajiId = DB::table('accounts')->where('code', '611.002-01')->value('id');

        $branchId = DB::table('branches')->where('code', 'JKT-01')->value('id');
        $branchSbyId = DB::table('branches')->where('code', 'SBY-02')->value('id');

        $deptId = DB::table('departments')->where('code', 'ACC')->value('id');
        $deptHrdId = DB::table('departments')->where('code', 'HRD')->value('id');
        $deptSlsId = DB::table('departments')->where('code', 'SLS')->value('id');
        $deptItdId = DB::table('departments')->where('code', 'ITD')->value('id');
        $deptOpsId = DB::table('departments')->where('code', 'OPS')->value('id');

        // Seed salary allowances
        DB::table('salary_allowances')->insert([
            [
                'code' => 'ALL-TJ',
                'name' => 'Tunjangan Jabatan',
                'allowance_type' => 'Tunjangan Jabatan & Operasional',
                'account_id' => $accBebanGajiId,
                'notes' => 'Tunjangan struktural jabatan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ALL-TR',
                'name' => 'Tunjangan Transportasi',
                'allowance_type' => 'Tunjangan Makan & Transport',
                'account_id' => $accBebanGajiId,
                'notes' => 'Tunjangan transportasi harian',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ALL-MK',
                'name' => 'Tunjangan Uang Makan',
                'allowance_type' => 'Tunjangan Makan & Transport',
                'account_id' => $accBebanGajiId,
                'notes' => 'Tunjangan makan siang karyawan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ALL-BPJS',
                'name' => 'Tunjangan BPJS Kesehatan',
                'allowance_type' => 'Tunjangan Jabatan & Operasional',
                'account_id' => $accBebanGajiId,
                'notes' => 'Subsidi BPJS Kesehatan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'DED-PPH',
                'name' => 'Potongan PPh 21',
                'allowance_type' => 'Potongan (Kasbon / Absensi)',
                'account_id' => $accBebanGajiId,
                'notes' => 'Potongan pajak penghasilan karyawan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed employees
        $emp1Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'department_id' => $deptId,
            'employee_code' => 'EMP-001',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Budi Santoso',
            'position' => 'Finance Manager',
            'email' => 'budi.santoso@tbnur.com',
            'mobile_phone' => '081234567890',
            'street' => 'Jl. Merdeka No. 10',
            'city' => 'Jakarta Pusat',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
            'joined_at' => '2020-01-15',
            'tax_status' => 'TK/0',
            'subject_to_income_tax' => true,
            'is_salesperson' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp2Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'department_id' => $deptHrdId,
            'employee_code' => 'EMP-002',
            'employee_id_type' => 'KTP',
            'salutation' => 'Ibu',
            'full_name' => 'Rina Wijaya',
            'position' => 'HR Specialist',
            'email' => 'rina.wijaya@tbnur.com',
            'mobile_phone' => '081234567891',
            'street' => 'Jl. Sudirman Kav 21',
            'city' => 'Jakarta Selatan',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
            'joined_at' => '2021-03-10',
            'tax_status' => 'K/0',
            'subject_to_income_tax' => true,
            'is_salesperson' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp3Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchSbyId,
            'department_id' => $deptSlsId,
            'employee_code' => 'EMP-003',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Andi Pratama',
            'position' => 'Senior Sales Executive',
            'email' => 'andi.pratama@tbnur.com',
            'mobile_phone' => '081234567892',
            'street' => 'Jl. Dharmahusada No. 45',
            'city' => 'Surabaya',
            'province' => 'Jawa Timur',
            'country' => 'Indonesia',
            'employment_status' => 'Contract',
            'joined_at' => '2022-06-01',
            'tax_status' => 'TK/1',
            'subject_to_income_tax' => true,
            'is_salesperson' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp4Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'department_id' => $deptItdId,
            'employee_code' => 'EMP-004',
            'employee_id_type' => 'KTP',
            'salutation' => 'Ibu',
            'full_name' => 'Siti Aminah',
            'position' => 'IT Support Specialist',
            'email' => 'siti.aminah@tbnur.com',
            'mobile_phone' => '081234567893',
            'street' => 'Jl. Gatot Subroto No. 50',
            'city' => 'Jakarta Barat',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
            'joined_at' => '2023-09-15',
            'tax_status' => 'TK/0',
            'subject_to_income_tax' => true,
            'is_salesperson' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp5Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchSbyId,
            'department_id' => $deptOpsId,
            'employee_code' => 'EMP-005',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Joko Widodo',
            'position' => 'Logistics Supervisor',
            'email' => 'joko.widodo@tbnur.com',
            'mobile_phone' => '081234567894',
            'street' => 'Jl. Mulyosari No. 12',
            'city' => 'Surabaya',
            'province' => 'Jawa Timur',
            'country' => 'Indonesia',
            'employment_status' => 'Permanent',
            'joined_at' => '2021-11-20',
            'tax_status' => 'K/2',
            'subject_to_income_tax' => true,
            'is_salesperson' => false,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $emp6Id = DB::table('employees')->insertGetId([
            'branch_id' => $branchId,
            'department_id' => $deptSlsId,
            'employee_code' => 'EMP-006',
            'employee_id_type' => 'KTP',
            'salutation' => 'Bpk',
            'full_name' => 'Rudi Hermawan',
            'position' => 'Junior Sales Executive',
            'email' => 'rudi.hermawan@tbnur.com',
            'mobile_phone' => '081234567895',
            'street' => 'Jl. Bubutan No. 12',
            'city' => 'Surabaya',
            'province' => 'Jawa Timur',
            'country' => 'Indonesia',
            'employment_status' => 'Contract',
            'joined_at' => '2023-01-10',
            'tax_status' => 'TK/0',
            'subject_to_income_tax' => true,
            'is_salesperson' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed employee bank accounts
        DB::table('employee_bank_accounts')->insert([
            [
                'employee_id' => $emp1Id,
                'bank_name' => 'Bank Mandiri',
                'account_name' => 'Budi Santoso',
                'account_number' => '1240009876543',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'employee_id' => $emp2Id,
                'bank_name' => 'Bank BCA',
                'account_name' => 'Rina Wijaya',
                'account_number' => '8012345678',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'employee_id' => $emp3Id,
                'bank_name' => 'Bank BNI',
                'account_name' => 'Andi Pratama',
                'account_number' => '0987654321',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'employee_id' => $emp4Id,
                'bank_name' => 'Bank BRI',
                'account_name' => 'Siti Aminah',
                'account_number' => '2049018273645',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'employee_id' => $emp5Id,
                'bank_name' => 'Bank BCA',
                'account_name' => 'Joko Widodo',
                'account_number' => '7261829301',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed categories & parties
        $custCatId = DB::table('customer_categories')->insertGetId([
            'code' => 'RET',
            'name' => 'Retail',
            'is_default' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $suppCatId = DB::table('supplier_categories')->insertGetId([
            'code' => 'MAT',
            'name' => 'Pemasok Material',
            'is_default' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('customers')->insert([
            'category_id' => $custCatId,
            'currency_id' => $currencyId,
            'payment_term_id' => $paymentTermId,
            'code' => 'CUST-001',
            'name' => 'Bpk. Ahmad Junaedi',
            'business_phone' => '08123456789',
            'email' => 'ahmad@gmail.com',
            'billing_address' => 'Jl. Kebon Jeruk No. 5, Jakarta West',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('suppliers')->insert([
            'category_id' => $suppCatId,
            'currency_id' => $currencyId,
            'payment_term_id' => $paymentTermId,
            'code' => 'SUPP-001',
            'name' => 'PT Semen Sentosa',
            'business_phone' => '021-998877',
            'email' => 'sales@semensentosa.com',
            'billing_address' => 'Kawasan Industri Cibinong Blok D',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
