<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RealisticDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Clear existing data in correct order
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('operation_document_user')->truncate();
        DB::table('operation_document_lines')->truncate();
        DB::table('operation_documents')->truncate();
        DB::table('fixed_asset_locations')->truncate();
        DB::table('fixed_asset_expenses')->truncate();
        DB::table('fixed_assets')->truncate();
        DB::table('asset_tax_categories')->truncate();
        DB::table('asset_categories')->truncate();
        DB::table('products')->truncate();
        DB::table('product_categories')->truncate();
        DB::table('units')->truncate();
        DB::table('brands')->truncate();
        DB::table('customers')->truncate();
        DB::table('suppliers')->truncate();
        DB::table('customer_categories')->truncate();
        DB::table('supplier_categories')->truncate();
        DB::table('sales_categories')->truncate();
        DB::table('salary_allowances')->truncate();
        DB::table('accounts')->truncate();
        DB::table('currencies')->truncate();
        DB::table('taxes')->truncate();
        DB::table('payment_terms')->truncate();
        DB::table('shipping_methods')->truncate();
        DB::table('fob_terms')->truncate();
        DB::table('employee_bank_accounts')->truncate();
        DB::table('employees')->truncate();
        DB::table('departments')->truncate();
        DB::table('warehouses')->truncate();
        DB::table('branches')->truncate();
        DB::table('role_user')->truncate();
        DB::table('roles')->truncate();
        DB::table('access_group_user')->truncate();
        DB::table('access_group_permissions')->truncate();
        DB::table('access_groups')->truncate();
        DB::table('activity_logs')->truncate();
        DB::table('users')->truncate();
        DB::table('report_catalogs')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Seed Organization & Finance
        $branchId = DB::table('branches')->insertGetId([
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
        ]);

        $branchSbyId = DB::table('branches')->insertGetId([
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
        ]);

        $warehouseId = DB::table('warehouses')->insertGetId([
            'branch_id' => $branchId,
            'code' => 'WH-JKT',
            'name' => 'Gudang Utama Jakarta',
            'warehouse_type' => 'main',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $warehouseSbyId = DB::table('warehouses')->insertGetId([
            'branch_id' => $branchSbyId,
            'code' => 'WH-SBY',
            'name' => 'Gudang Utama Surabaya',
            'warehouse_type' => 'main',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed multiple departments
        $deptId = DB::table('departments')->insertGetId([
            'code' => 'ACC',
            'name' => 'Accounting',
            'notes' => 'Departemen Keuangan',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $deptHrdId = DB::table('departments')->insertGetId([
            'code' => 'HRD',
            'name' => 'Human Resources',
            'notes' => 'Departemen Personalia',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $deptSlsId = DB::table('departments')->insertGetId([
            'code' => 'SLS',
            'name' => 'Sales & Marketing',
            'notes' => 'Departemen Penjualan dan Pemasaran',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $deptItdId = DB::table('departments')->insertGetId([
            'code' => 'ITD',
            'name' => 'Information Technology',
            'notes' => 'Departemen Teknologi Informasi',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $deptOpsId = DB::table('departments')->insertGetId([
            'code' => 'OPS',
            'name' => 'Operations & Logistics',
            'notes' => 'Departemen Operasional & Logistik',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed multiple currencies
        $currencyId = DB::table('currencies')->insertGetId([
            'code' => 'IDR',
            'name' => 'Rupiah',
            'symbol' => 'Rp',
            'exchange_rate' => 1.0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('currencies')->insert([
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 16300.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SGD',
                'name' => 'Singapore Dollar',
                'symbol' => 'S$',
                'exchange_rate' => 12100.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 17600.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'JPY',
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'exchange_rate' => 104.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Accounts Table
        $accAssetId = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '121.200-04',
            'name' => 'Peralatan & Perlengkapan Kantor Surabaya',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $accAkmPenyId = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '122.200-03',
            'name' => 'Akm. Peny. Peralatan & Perlengkapan Surabaya',
            'account_type' => 'Accumulated Depreciation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $accBebanPenyId = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '612.001-03',
            'name' => 'Beban Penyusutan Peralatan & Perlengkapan Kantor',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $accBebanGajiId = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '611.002-01',
            'name' => 'Beban Gaji Umum & Admin',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $accKasId = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '111.001-01',
            'name' => 'Kas Kecil Jakarta',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed Salary Allowances
        DB::table('salary_allowances')->insert([
            [
                'code' => 'ALL-TJ',
                'name' => 'Tunjangan Jabatan',
                'allowance_type' => 'Allowance',
                'account_id' => $accBebanGajiId,
                'notes' => 'Tunjangan struktural jabatan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ALL-TR',
                'name' => 'Tunjangan Transportasi',
                'allowance_type' => 'Allowance',
                'account_id' => $accBebanGajiId,
                'notes' => 'Tunjangan transportasi harian',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ALL-MK',
                'name' => 'Tunjangan Uang Makan',
                'allowance_type' => 'Allowance',
                'account_id' => $accBebanGajiId,
                'notes' => 'Tunjangan makan siang karyawan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ALL-BPJS',
                'name' => 'Tunjangan BPJS Kesehatan',
                'allowance_type' => 'Allowance',
                'account_id' => $accBebanGajiId,
                'notes' => 'Subsidi BPJS Kesehatan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'DED-PPH',
                'name' => 'Potongan PPh 21',
                'allowance_type' => 'Deduction',
                'account_id' => $accBebanGajiId,
                'notes' => 'Potongan pajak penghasilan karyawan',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed Taxes
        $taxId = DB::table('taxes')->insertGetId([
            'code' => 'PPN-11',
            'name' => 'PPN 11%',
            'tax_type' => 'Standard',
            'rate' => 11.0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('taxes')->insert([
            [
                'code' => 'PPN-12',
                'name' => 'PPN 12%',
                'tax_type' => 'Standard',
                'rate' => 12.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'PPH-21',
                'name' => 'PPh 21',
                'tax_type' => 'Standard',
                'rate' => 5.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'PPH-23',
                'name' => 'PPh 23',
                'tax_type' => 'Standard',
                'rate' => 2.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'NON-TAX',
                'name' => 'Non Pajak',
                'tax_type' => 'Standard',
                'rate' => 0.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed Employees
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

        // Seed Employee Bank Accounts
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

        $paymentTermId = DB::table('payment_terms')->insertGetId([
            'code' => 'COD',
            'name' => 'Tunai Saat Pengiriman',
            'due_days' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Categories & Partner Master
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

        $customerId = DB::table('customers')->insertGetId([
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

        $supplierId = DB::table('suppliers')->insertGetId([
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

        // 3. Brand & Units
        $brandId = DB::table('brands')->insertGetId([
            'code' => 'TGA',
            'name' => 'Tiga Roda',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitZakId = DB::table('units')->insertGetId([
            'code' => 'ZAK',
            'name' => 'Zak',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitBatangId = DB::table('units')->insertGetId([
            'code' => 'BTG',
            'name' => 'Batang',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitPailId = DB::table('units')->insertGetId([
            'code' => 'PAL',
            'name' => 'Pail',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitPcsId = DB::table('units')->insertGetId([
            'code' => 'PCS',
            'name' => 'Pcs',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Product Category
        $prodCatId = DB::table('product_categories')->insertGetId([
            'code' => 'MAT-BGN',
            'name' => 'Material Bangunan',
            'slug' => 'material-bangunan',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Products Master
        $pSemen = DB::table('products')->insertGetId([
            'category_id' => $prodCatId,
            'brand_id' => $brandId,
            'base_unit_id' => $unitZakId,
            'purchase_unit_id' => $unitZakId,
            'sales_unit_id' => $unitZakId,
            'code' => 'SMN-050',
            'barcode' => '8990001001',
            'name' => 'Semen Portland 50 Kg',
            'product_type' => 'stock',
            'minimum_stock' => 10,
            'default_purchase_price' => 62000,
            'default_sale_price' => 73000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pBesi = DB::table('products')->insertGetId([
            'category_id' => $prodCatId,
            'base_unit_id' => $unitBatangId,
            'purchase_unit_id' => $unitBatangId,
            'sales_unit_id' => $unitBatangId,
            'code' => 'BSH-404',
            'barcode' => '8990001002',
            'name' => 'Besi Hollow 4x4',
            'product_type' => 'stock',
            'minimum_stock' => 20,
            'default_purchase_price' => 95000,
            'default_sale_price' => 125000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pCat = DB::table('products')->insertGetId([
            'category_id' => $prodCatId,
            'base_unit_id' => $unitPailId,
            'purchase_unit_id' => $unitPailId,
            'sales_unit_id' => $unitPailId,
            'code' => 'CAT-250',
            'barcode' => '8990001003',
            'name' => 'Cat Tembok Interior 25 Kg',
            'product_type' => 'stock',
            'minimum_stock' => 5,
            'default_purchase_price' => 220000,
            'default_sale_price' => 280000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pKuas = DB::table('products')->insertGetId([
            'category_id' => $prodCatId,
            'base_unit_id' => $unitPcsId,
            'purchase_unit_id' => $unitPcsId,
            'sales_unit_id' => $unitPcsId,
            'code' => 'KUS-300',
            'barcode' => '8990001004',
            'name' => 'Kuas Cat 3 Inch',
            'product_type' => 'stock',
            'minimum_stock' => 30,
            'default_purchase_price' => 12000,
            'default_sale_price' => 18000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $pPaku = DB::table('products')->insertGetId([
            'category_id' => $prodCatId,
            'base_unit_id' => $unitPcsId,
            'purchase_unit_id' => $unitPcsId,
            'sales_unit_id' => $unitPcsId,
            'code' => 'PAK-500',
            'barcode' => '8990001005',
            'name' => 'Paku Kayu 5 Cm (1 Kg)',
            'product_type' => 'stock',
            'minimum_stock' => 15,
            'default_purchase_price' => 15000,
            'default_sale_price' => 22000,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Build Sales Transaction Patterns for Apriori Analysis (Support/Confidence)
        // We will seed 15 sales invoices.
        // Let's create transactions that form clear rules:
        // Pattern 1: Semen (SMN-050) & Besi Hollow (BSH-404) -> Frequently bought together (6 times)
        // Pattern 2: Cat Tembok (CAT-250) & Kuas Cat (KUS-300) -> Frequently bought together (4 times)
        
        $salesPattern = [
            // Semen & Besi
            1 => [$pSemen => 10, $pBesi => 5],
            2 => [$pSemen => 15, $pBesi => 8, $pPaku => 2],
            3 => [$pSemen => 20, $pBesi => 12],
            4 => [$pSemen => 8, $pBesi => 4],
            5 => [$pSemen => 30, $pBesi => 15, $pPaku => 5],
            6 => [$pSemen => 12, $pBesi => 6],
            
            // Cat & Kuas
            7 => [$pCat => 2, $pKuas => 2],
            8 => [$pCat => 3, $pKuas => 3, $pPaku => 1],
            9 => [$pCat => 1, $pKuas => 1],
            10 => [$pCat => 5, $pKuas => 4],
            
            // Misc
            11 => [$pSemen => 25, $pPaku => 3],
            12 => [$pBesi => 10, $pPaku => 4],
            13 => [$pCat => 2, $pPaku => 2],
            14 => [$pSemen => 5],
            15 => [$pKuas => 2],
        ];

        foreach ($salesPattern as $i => $items) {
            $docNo = 'SI.' . date('Y.m.d') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT);
            $totalAmount = 0;
            
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_invoice',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => $customerId,
                'currency_id' => $currencyId,
                'payment_term_id' => $paymentTermId,
                'document_number' => $docNo,
                'status' => 'Posted',
                'entry_date' => now()->subDays(15 - $i)->format('Y-m-d'),
                'subtotal' => 0,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($items as $productId => $qty) {
                $product = DB::table('products')->where('id', $productId)->first();
                $lineTotal = $product->default_sale_price * $qty;
                $totalAmount += $lineTotal;

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'sales_invoice',
                    'product_id' => $productId,
                    'unit_id' => $product->base_unit_id,
                    'warehouse_id' => $warehouseId,
                    'description' => $product->name,
                    'quantity' => $qty,
                    'unit_price' => $product->default_sale_price,
                    'total_amount' => $lineTotal,
                    'sort_order' => $productId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('operation_documents')->where('id', $docId)->update([
                'subtotal' => $totalAmount,
                'total_amount' => $totalAmount,
            ]);
        }

        // 6. Seed Advanced Finance Operational Documents (Budgets & Payroll)
        // Budgets
        DB::table('operation_documents')->insertGetId([
            'document_type' => 'budget',
            'branch_id' => $branchId,
            'department_id' => $deptId,
            'primary_account_id' => $accBebanGajiId,
            'document_number' => 'BGT.2026.00001',
            'status' => 'Posted',
            'entry_date' => '2026-04-01',
            'total_amount' => 50000000.00,
            'notes' => 'Anggaran Biaya Gaji Q2 2026',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Payroll
        DB::table('operation_documents')->insertGetId([
            'document_type' => 'payroll_entry',
            'branch_id' => $branchId,
            'department_id' => $deptId,
            'primary_account_id' => $accBebanGajiId,
            'secondary_account_id' => $accKasId,
            'document_number' => 'PAY.2026.04001',
            'status' => 'Posted',
            'entry_date' => '2026-04-30',
            'total_amount' => 45000000.00,
            'notes' => 'Gaji Karyawan Bulan April 2026',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 7. Seed Fixed Assets
        $assetCatId = DB::table('asset_categories')->insertGetId([
            'code' => 'OFF-EQP',
            'name' => 'Peralatan Kantor',
            'depreciation_method' => 'Metode Garis Lurus',
            'asset_life_months' => 48,
            'depreciation_rate' => 25.0,
            'asset_account_id' => $accAssetId,
            'accumulated_depreciation_account_id' => $accAkmPenyId,
            'depreciation_expense_account_id' => $accBebanPenyId,
            'notes' => 'Kategori untuk Peralatan Kantor',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assetTaxCatId = DB::table('asset_tax_categories')->insertGetId([
            'code' => 'TAX-G1',
            'name' => 'Gol 1 [Garis Lurus]',
            'depreciation_method' => 'Metode Garis Lurus',
            'asset_life_months' => 48,
            'depreciation_rate' => 25.0,
            'notes' => 'Pajak Golongan 1',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assetId = DB::table('fixed_assets')->insertGetId([
            'asset_category_id' => $assetCatId,
            'asset_tax_category_id' => $assetTaxCatId,
            'branch_id' => $branchId,
            'department_id' => $deptId,
            'asset_account_id' => $accAssetId,
            'accumulated_depreciation_account_id' => $accAkmPenyId,
            'depreciation_expense_account_id' => $accBebanPenyId,
            'code' => '0502009',
            'name' => 'Komputer 09',
            'purchase_date' => '2016-03-17',
            'usage_date' => '2016-03-17',
            'depreciation_method' => 'Metode Garis Lurus',
            'quantity' => 1,
            'asset_life_years' => 4,
            'asset_life_months' => 0,
            'depreciation_ratio' => 25.0,
            'residual_value' => 0,
            'acquisition_cost' => 7350000,
            'book_value' => 5818750,
            'tax_enabled' => true,
            'initial_location_name' => 'SURABAYA',
            'initial_location_address' => 'Gedung Pawitra Lt 2 NO. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
            'notes' => 'Aset Kantor Surabaya',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('fixed_asset_expenses')->insert([
            'fixed_asset_id' => $assetId,
            'account_id' => $accAssetId,
            'code' => '300001',
            'description' => 'Equitas Saldo Awal',
            'expense_date' => '2016-03-17',
            'amount' => 7350000,
            'notes' => 'Initial balance',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('fixed_asset_locations')->insert([
            'fixed_asset_id' => $assetId,
            'location_name' => 'SURABAYA',
            'location_address' => 'Gedung Pawitra Lt 2 NO. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
            'quantity' => 1,
            'is_current' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed some Asset Changes and Disposals to operation_documents
        DB::table('operation_documents')->insertGetId([
            'document_type' => 'asset_change',
            'branch_id' => $branchId,
            'document_number' => 'AST-CHG-0001',
            'status' => 'Posted',
            'entry_date' => '2026-04-10',
            'total_amount' => 0,
            'notes' => 'Perubahan nilai sisa aset tetap',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('operation_documents')->insertGetId([
            'document_type' => 'asset_disposal',
            'branch_id' => $branchId,
            'document_number' => 'AST-DSP-0001',
            'status' => 'Posted',
            'entry_date' => '2026-04-15',
            'total_amount' => 1500000,
            'notes' => 'Disposisi printer rusak',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 9. Seed Preference Settings
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('preference_settings')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $settings = [
            // Company Info
            ['group_key' => 'company_info', 'setting_key' => 'company-name', 'value' => 'UD. TB Nur', 'label' => 'Nama Perusahaan'],
            ['group_key' => 'company_info', 'setting_key' => 'business-category', 'value' => 'GROSIR / WHOLESALER', 'label' => 'Kategori Usaha'],
            ['group_key' => 'company_info', 'setting_key' => 'business-field', 'value' => 'Bahan Bangunan', 'label' => 'Bidang Usaha'],
            ['group_key' => 'company_info', 'setting_key' => 'phone', 'value' => '021-56693463', 'label' => 'Telepon'],
            ['group_key' => 'company_info', 'setting_key' => 'fax', 'value' => '021-56693463', 'label' => 'Faksimili'],
            ['group_key' => 'company_info', 'setting_key' => 'email', 'value' => 'admin@tbnur.com', 'label' => 'Email'],
            ['group_key' => 'company_info', 'setting_key' => 'start-date', 'value' => '01/06/2025', 'label' => 'Tanggal Mulai Data'],
            ['group_key' => 'company_info', 'setting_key' => 'accounting-period', 'value' => 'Januari - Desember', 'label' => 'Periode Akuntansi'],
            ['group_key' => 'company_info', 'setting_key' => 'currency', 'value' => 'Indonesian Rupiah', 'label' => 'Mata Uang Dasar'],

            // Company Address
            ['group_key' => 'company_info', 'setting_key' => 'street', 'value' => 'Jl. Tomang Raya No. 35', 'label' => 'Jalan'],
            ['group_key' => 'company_info', 'setting_key' => 'city', 'value' => 'Kab. Badung', 'label' => 'Kota'],
            ['group_key' => 'company_info', 'setting_key' => 'province', 'value' => 'Bali', 'label' => 'Provinsi'],
            ['group_key' => 'company_info', 'setting_key' => 'postal-code', 'value' => '80361', 'label' => 'Kode Pos'],
            ['group_key' => 'company_info', 'setting_key' => 'country', 'value' => 'Indonesia', 'label' => 'Negara'],

            // Basic Features
            ['group_key' => 'features', 'setting_key' => 'multi-branch', 'value' => 'false', 'label' => 'Multi Cabang'],
            ['group_key' => 'features', 'setting_key' => 'multi-currency', 'value' => 'true', 'label' => 'Multi Mata Uang'],
            ['group_key' => 'features', 'setting_key' => 'tax-feature', 'value' => 'true', 'label' => 'Pajak'],
            ['group_key' => 'features', 'setting_key' => 'approval-feature', 'value' => 'true', 'label' => 'Persetujuan'],
            ['group_key' => 'features', 'setting_key' => 'asset-feature', 'value' => 'true', 'label' => 'Pencatatan Aset'],
            ['group_key' => 'features', 'setting_key' => 'budget-feature', 'value' => 'true', 'label' => 'Anggaran'],
        ];

        foreach ($settings as $setting) {
            DB::table('preference_settings')->insert(array_merge($setting, [
                'scope_type' => 'company',
                'scope_key' => 'default',
                'data_type' => 'string',
                'value' => json_encode($setting['value']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 10. Seed Roles
        $superAdminRoleId = DB::table('roles')->insertGetId([
            'code' => 'super_admin',
            'name' => 'Super Admin',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownerRoleId = DB::table('roles')->insertGetId([
            'code' => 'owner_manager',
            'name' => 'Owner Manager',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashierRoleId = DB::table('roles')->insertGetId([
            'code' => 'cashier',
            'name' => 'Kasir',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $warehouseRoleId = DB::table('roles')->insertGetId([
            'code' => 'warehouse',
            'name' => 'Staf Gudang',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $financeRoleId = DB::table('roles')->insertGetId([
            'code' => 'finance',
            'name' => 'Finance & Accounting',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 11. Seed Access Groups & Permissions
        $adminGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'ADMIN',
            'name' => 'Administrator',
            'description' => 'Akses penuh ke semua modul sistem',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('access_group_permissions')->insert([
            'access_group_id' => $adminGroupId,
            'menu_key' => '*',
            'can_access' => true,
            'can_view' => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownerGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'OWNER',
            'name' => 'Owner',
            'description' => 'Manajemen pemilik dengan akses pengawasan dan laporan',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('access_group_permissions')->insert([
            'access_group_id' => $ownerGroupId,
            'menu_key' => '*',
            'can_access' => true,
            'can_view' => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashierGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'KASIR',
            'name' => 'Kasir Utama',
            'description' => 'Akses untuk modul POS, kasir, dan daftar barang',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashierMenus = ['sales-invoices', 'sales-receipts', 'customers', 'products'];
        foreach ($cashierMenus as $menu) {
            DB::table('access_group_permissions')->insert([
                'access_group_id' => $cashierGroupId,
                'menu_key' => $menu,
                'can_access' => true,
                'can_view' => true,
                'can_create' => true,
                'can_update' => true,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $warehouseGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'GUDANG',
            'name' => 'Staf Gudang',
            'description' => 'Akses pengelolaan persediaan barang dan gudang',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $whMenus = ['products', 'warehouses', 'units', 'product-categories', 'item-requests', 'inventory-adjustments'];
        foreach ($whMenus as $menu) {
            DB::table('access_group_permissions')->insert([
                'access_group_id' => $warehouseGroupId,
                'menu_key' => $menu,
                'can_access' => true,
                'can_view' => true,
                'can_create' => true,
                'can_update' => true,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $financeGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'FINANCE',
            'name' => 'Finance & Accounting',
            'description' => 'Akses akuntansi, pembayaran, penerimaan, dan buku besar',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $finMenus = ['accounts', 'currencies', 'taxes', 'cash-payments', 'cash-receipts', 'general-journals', 'budgets', 'bank-statements', 'bank-histories', 'bank-reconciliations'];
        foreach ($finMenus as $menu) {
            DB::table('access_group_permissions')->insert([
                'access_group_id' => $financeGroupId,
                'menu_key' => $menu,
                'can_access' => true,
                'can_view' => true,
                'can_create' => true,
                'can_update' => true,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 12. Seed Users
        $usersData = [
            [
                'name' => 'Zaki Ramadhan',
                'email' => 'piscokpiscok2610@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'H. Nurhasan (Owner)',
                'email' => 'owner@tbnur.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Aminah (Kasir)',
                'email' => 'siti@tbnur.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Joko Widodo (Gudang)',
                'email' => 'joko@tbnur.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Budi Santoso (Finance)',
                'email' => 'budi@tbnur.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        $usersMap = [];
        foreach ($usersData as $userData) {
            $uId = DB::table('users')->insertGetId($userData);
            $usersMap[$userData['email']] = $uId;
        }

        // Attach Roles & Groups to Users
        DB::table('role_user')->insert(['role_id' => $superAdminRoleId, 'user_id' => $usersMap['piscokpiscok2610@gmail.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $adminGroupId, 'user_id' => $usersMap['piscokpiscok2610@gmail.com']]);

        DB::table('role_user')->insert(['role_id' => $superAdminRoleId, 'user_id' => $usersMap['test@example.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $adminGroupId, 'user_id' => $usersMap['test@example.com']]);

        DB::table('role_user')->insert(['role_id' => $ownerRoleId, 'user_id' => $usersMap['owner@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $ownerGroupId, 'user_id' => $usersMap['owner@tbnur.com']]);

        DB::table('role_user')->insert(['role_id' => $cashierRoleId, 'user_id' => $usersMap['siti@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $cashierGroupId, 'user_id' => $usersMap['siti@tbnur.com']]);

        DB::table('role_user')->insert(['role_id' => $warehouseRoleId, 'user_id' => $usersMap['joko@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $warehouseGroupId, 'user_id' => $usersMap['joko@tbnur.com']]);

        DB::table('role_user')->insert(['role_id' => $financeRoleId, 'user_id' => $usersMap['budi@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $financeGroupId, 'user_id' => $usersMap['budi@tbnur.com']]);

        // 13. Seed Activity Logs
        $logs = [
            [
                'log_group' => 'general',
                'resource_key' => 'preferences',
                'resource_label' => 'Preferences',
                'permission_key' => 'preference',
                'action' => 'update',
                'subject_type' => 'App\\Domain\\Support\\Models\\PreferenceSetting',
                'subject_id' => 1,
                'subject_label' => 'Nama Perusahaan',
                'document_number' => null,
                'description' => 'Mengubah nama profil perusahaan menjadi UD. TB Nur',
                'actor_user_id' => $usersMap['piscokpiscok2610@gmail.com'],
                'actor_name' => 'Zaki Ramadhan',
                'actor_email' => 'piscokpiscok2610@gmail.com',
                'ip_address' => '127.0.0.1',
                'occurred_at' => now()->subHours(5),
                'created_at' => now()->subHours(5),
                'updated_at' => now()->subHours(5),
            ],
            [
                'log_group' => 'general',
                'resource_key' => 'products',
                'resource_label' => 'Products',
                'permission_key' => 'product',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Catalog\\Models\\Product',
                'subject_id' => 1,
                'subject_label' => 'Semen Portland 50 Kg',
                'document_number' => null,
                'description' => 'Membuat produk baru: Semen Portland 50 Kg',
                'actor_user_id' => $usersMap['piscokpiscok2610@gmail.com'],
                'actor_name' => 'Zaki Ramadhan',
                'actor_email' => 'piscokpiscok2610@gmail.com',
                'ip_address' => '127.0.0.1',
                'occurred_at' => now()->subHours(4),
                'created_at' => now()->subHours(4),
                'updated_at' => now()->subHours(4),
            ],
            [
                'log_group' => 'general',
                'resource_key' => 'employees',
                'resource_label' => 'Employees',
                'permission_key' => 'employee',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Organization\\Models\\Employee',
                'subject_id' => 1,
                'subject_label' => 'Budi Santoso',
                'document_number' => null,
                'description' => 'Menambahkan data karyawan baru: Budi Santoso',
                'actor_user_id' => $usersMap['owner@tbnur.com'],
                'actor_name' => 'H. Nurhasan (Owner)',
                'actor_email' => 'owner@tbnur.com',
                'ip_address' => '192.168.1.10',
                'occurred_at' => now()->subHours(3),
                'created_at' => now()->subHours(3),
                'updated_at' => now()->subHours(3),
            ],
            // Journal Logs
            [
                'log_group' => 'journal',
                'resource_key' => 'general-journals',
                'resource_label' => 'General Journals',
                'permission_key' => 'general-journal',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Finance\\Models\\GeneralJournal',
                'subject_id' => 1,
                'subject_label' => 'Jurnal Penyesuaian Saldo Awal',
                'document_number' => 'GJ.2026.00001',
                'description' => 'Membuat entri jurnal umum GJ.2026.00001 untuk Saldo Awal',
                'actor_user_id' => $usersMap['budi@tbnur.com'],
                'actor_name' => 'Budi Santoso (Finance)',
                'actor_email' => 'budi@tbnur.com',
                'ip_address' => '192.168.1.15',
                'occurred_at' => now()->subHours(2),
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
            [
                'log_group' => 'journal',
                'resource_key' => 'budgets',
                'resource_label' => 'Budgets',
                'permission_key' => 'budget',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Finance\\Models\\Budget',
                'subject_id' => 1,
                'subject_label' => 'Anggaran Biaya Gaji Q2 2026',
                'document_number' => 'BGT.2026.00001',
                'description' => 'Membuat anggaran biaya BGT.2026.00001 senilai Rp 50.000.000,00',
                'actor_user_id' => $usersMap['owner@tbnur.com'],
                'actor_name' => 'H. Nurhasan (Owner)',
                'actor_email' => 'owner@tbnur.com',
                'ip_address' => '192.168.1.10',
                'occurred_at' => now()->subHours(1),
                'created_at' => now()->subHours(1),
                'updated_at' => now()->subHours(1),
            ],
        ];

        DB::table('activity_logs')->insert($logs);

        // 14. Seed Report Catalogs
        $reportCatalogs = [
            // Memorize
            [
                'category_key' => 'memorize',
                'report_key' => 'memorize-sales-by-customer',
                'title' => 'Penjualan Barang per Pelanggan',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penjualan barang per pelanggan.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Keuangan (Finance)
            [
                'category_key' => 'finance',
                'report_key' => 'finance-cashflow',
                'title' => 'Arus Kas Ringkas',
                'section_label' => 'Keuangan',
                'icon' => 'reports',
                'description' => 'Ringkasan arus kas masuk dan keluar per periode.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'finance',
                'report_key' => 'finance-profit-loss',
                'title' => 'Laba Rugi Standar',
                'section_label' => 'Keuangan',
                'icon' => 'ledger',
                'description' => 'Menampilkan laporan laba rugi standar periode ini.',
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'finance',
                'report_key' => 'finance-balance-sheet',
                'title' => 'Neraca Standar',
                'section_label' => 'Keuangan',
                'icon' => 'ledger',
                'description' => 'Menampilkan neraca saldo standar untuk menilai posisi keuangan.',
                'sort_order' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Pusat Laba & Biaya (Profit Center)
            [
                'category_key' => 'profit-center',
                'report_key' => 'profit-center-summary',
                'title' => 'Laba Rugi per Departemen',
                'section_label' => 'Analisa',
                'icon' => 'ledger',
                'description' => 'Memantau kontribusi laba rugi berdasarkan departemen dan pusat biaya.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'profit-center',
                'report_key' => 'profit-center-distribution',
                'title' => 'Distribusi Beban Departemen',
                'section_label' => 'Analisa',
                'icon' => 'reports',
                'description' => 'Menganalisis distribusi beban operasional untuk setiap departemen.',
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Buku Besar (Ledger)
            [
                'category_key' => 'ledger',
                'report_key' => 'ledger-account-mutation',
                'title' => 'Mutasi Akun Perkiraan',
                'section_label' => 'Buku Besar',
                'icon' => 'ledger',
                'description' => 'Menampilkan histori mutasi akun perkiraan lengkap dengan saldo berjalan.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'ledger',
                'report_key' => 'ledger-general-journal',
                'title' => 'Jurnal Umum Lengkap',
                'section_label' => 'Buku Besar',
                'icon' => 'document',
                'description' => 'Daftar semua jurnal transaksi keuangan per periode.',
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'ledger',
                'report_key' => 'ledger-detail',
                'title' => 'Buku Besar Rincian',
                'section_label' => 'Buku Besar',
                'icon' => 'ledger',
                'description' => 'Rincian mutasi debit dan kredit seluruh akun perkiraan secara kronologis.',
                'sort_order' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Kas & Bank (Cash & Bank)
            [
                'category_key' => 'cash-bank',
                'report_key' => 'cash-bank-daily-balance',
                'title' => 'Saldo Harian Bank',
                'section_label' => 'Kas & Bank',
                'icon' => 'ledger',
                'description' => 'Memantau saldo dan mutasi kas/bank per hari.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'cash-bank-history',
                'report_key' => 'cash-bank-history-report',
                'title' => 'Histori Transaksi Bank',
                'section_label' => 'Kas & Bank',
                'icon' => 'document',
                'description' => 'Daftar mutasi kas masuk dan keluar secara rinci.',
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Piutang (Receivable)
            [
                'category_key' => 'receivable',
                'report_key' => 'receivable-aging',
                'title' => 'Umur Piutang Pelanggan',
                'section_label' => 'Piutang',
                'icon' => 'ledger',
                'description' => 'Membantu menilai jatuh tempo piutang dan tagihan tertunda.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'receivable',
                'report_key' => 'receivable-outstanding',
                'title' => 'Rincian Piutang Belum Lunas',
                'section_label' => 'Piutang',
                'icon' => 'document',
                'description' => 'Menampilkan daftar piutang aktif yang belum terselesaikan.',
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Penjualan (Sales) - 22 reports matching Photo 2
            [
                'category_key' => 'sales',
                'report_key' => 'sales-by-customer',
                'title' => 'Penjualan per Pelanggan',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan daftar nilai penjualan per pelanggan',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-by-item',
                'title' => 'Penjualan per Barang',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan daftar nilai penjualan per barang',
                'sort_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-by-brand',
                'title' => 'Penjualan per Merek',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penjualan per merk barang',
                'sort_order' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-item-by-customer',
                'title' => 'Penjualan Barang per Pelanggan',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan daftar nilai penjualan barang per pelanggan',
                'sort_order' => 40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-item-by-warehouse',
                'title' => 'Penjualan Barang per Gudang',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penjualan barang per gudang',
                'sort_order' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-customer-by-item',
                'title' => 'Penjualan Pelanggan per Barang',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penjualan pelanggan per barang',
                'sort_order' => 60,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-process-history',
                'title' => 'Histori Proses Penjualan',
                'section_label' => 'Penjualan',
                'icon' => 'activity',
                'description' => 'Menampilkan rantai proses penjualan dari penawaran hingga pembayaran',
                'sort_order' => 70,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-detail-by-customer',
                'title' => 'Rincian Penjualan per Pelanggan',
                'section_label' => 'Penjualan',
                'icon' => 'document',
                'description' => 'Menampilkan rincian nilai penjualan per pelanggan',
                'sort_order' => 80,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-detail-by-item',
                'title' => 'Rincian Penjualan per Barang',
                'section_label' => 'Penjualan',
                'icon' => 'document',
                'description' => 'Menampilkan rincian nilai penjualan per barang',
                'sort_order' => 90,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-by-branch',
                'title' => 'Penjualan per Cabang',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan daftar nilai penjualan per cabang',
                'sort_order' => 100,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-item-by-branch',
                'title' => 'Penjualan Barang per Cabang',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penjualan barang per cabang',
                'sort_order' => 110,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-return-by-item',
                'title' => 'Retur Penjualan per Barang',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai retur penjualan per barang',
                'sort_order' => 120,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-monthly-chart',
                'title' => 'Grafik Penjualan Bulanan',
                'section_label' => 'Penjualan',
                'icon' => 'reports',
                'description' => 'Menampilkan grafik batang penjualan per bulan',
                'sort_order' => 130,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-share-by-customer',
                'title' => 'Porsi Penjualan per Pelanggan',
                'section_label' => 'Penjualan',
                'icon' => 'reports',
                'description' => 'Menampilkan porsi penjualan dari pelanggan',
                'sort_order' => 140,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-share-by-item',
                'title' => 'Porsi Penjualan per Barang',
                'section_label' => 'Penjualan',
                'icon' => 'reports',
                'description' => 'Menampilkan porsi penjualan dari barang',
                'sort_order' => 150,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-quote-by-customer-unprocessed',
                'title' => 'Penawaran per Pelanggan (Belum Proses)',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penawaran penjualan yang belum di proses per pelanggan',
                'sort_order' => 160,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-quote-by-item-unprocessed',
                'title' => 'Penawaran per Barang (Belum Proses)',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai penawaran penjualan yang belum di proses per barang',
                'sort_order' => 170,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-order-by-customer-unprocessed',
                'title' => 'Pesanan per Pelanggan (Belum Proses)',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai pesanan penjualan yang belum di proses per pelanggan',
                'sort_order' => 180,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-order-by-item-unprocessed',
                'title' => 'Pesanan per Barang (Belum Proses)',
                'section_label' => 'Penjualan',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai pesanan penjualan yang belum di proses per barang',
                'sort_order' => 190,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-advance-payment',
                'title' => 'Uang Muka Penjualan',
                'section_label' => 'Penjualan',
                'icon' => 'document',
                'description' => 'Menampilkan daftar uang muka penjualan grup per pelanggan',
                'sort_order' => 200,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-target-item',
                'title' => 'Target Penjualan Barang',
                'section_label' => 'Penjualan',
                'icon' => 'document',
                'description' => 'Target Penjualan Barang',
                'sort_order' => 210,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_key' => 'sales',
                'report_key' => 'sales-target-category',
                'title' => 'Target Penjualan per Kategori',
                'section_label' => 'Penjualan',
                'icon' => 'document',
                'description' => 'Target Penjualan per Kategori',
                'sort_order' => 220,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Tenaga Penjual (Salesperson)
            [
                'category_key' => 'salesperson',
                'report_key' => 'salesperson-performance',
                'title' => 'Kinerja Tenaga Penjual',
                'section_label' => 'Tenaga Penjual',
                'icon' => 'reports',
                'description' => 'Menampilkan pencapaian omzet, margin, dan target per tenaga penjual.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Utang (Payable)
            [
                'category_key' => 'payable',
                'report_key' => 'payable-aging',
                'title' => 'Umur Utang Pemasok',
                'section_label' => 'Utang',
                'icon' => 'ledger',
                'description' => 'Membantu memetakan tagihan pemasok yang segera jatuh tempo.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Pembelian (Purchase)
            [
                'category_key' => 'purchase',
                'report_key' => 'purchase-by-supplier',
                'title' => 'Pembelian per Pemasok',
                'section_label' => 'Pembelian',
                'icon' => 'ledger',
                'description' => 'Meringkas total pembelian, retur, dan saldo pembelian per pemasok.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Persediaan (Inventory)
            [
                'category_key' => 'inventory',
                'report_key' => 'inventory-movement',
                'title' => 'Pergerakan Stok Barang',
                'section_label' => 'Persediaan',
                'icon' => 'ledger',
                'description' => 'Melihat stok masuk, keluar, dan saldo akhir per barang.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Gudang (Warehouse)
            [
                'category_key' => 'warehouse',
                'report_key' => 'warehouse-stock-value',
                'title' => 'Nilai Stok per Gudang',
                'section_label' => 'Gudang',
                'icon' => 'ledger',
                'description' => 'Ringkasan kuantitas dan nilai stok per gudang.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Aset Tetap (Fixed Assets)
            [
                'category_key' => 'fixed-assets',
                'report_key' => 'fixed-assets-depreciation',
                'title' => 'Penyusutan Aset Tetap',
                'section_label' => 'Aset Tetap',
                'icon' => 'ledger',
                'description' => 'Menampilkan nilai buku, penyusutan, dan umur aset tetap.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Pajak (Tax)
            [
                'category_key' => 'tax',
                'report_key' => 'tax-vat-summary',
                'title' => 'Ringkasan PPN Keluaran dan Masukan',
                'section_label' => 'Pajak',
                'icon' => 'ledger',
                'description' => 'Meringkas perhitungan PPN untuk kebutuhan pelaporan pajak.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Pemeriksaan (Inspection)
            [
                'category_key' => 'inspection',
                'report_key' => 'inspection-audit-trail',
                'title' => 'Jejak Audit Transaksi',
                'section_label' => 'Pemeriksaan',
                'icon' => 'document',
                'description' => 'Menampilkan aktivitas perubahan transaksi untuk kebutuhan pemeriksaan.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Lain-lain (Others)
            [
                'category_key' => 'others',
                'report_key' => 'others-custom-form',
                'title' => 'Daftar Form Kustom',
                'section_label' => 'Lain-lain',
                'icon' => 'document',
                'description' => 'Kumpulan laporan pendukung dan utilitas tambahan.',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('report_catalogs')->insert($reportCatalogs);
    }
}
