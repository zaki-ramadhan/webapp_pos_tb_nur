<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinancialEntitySeeder extends Seeder
{
    public function run(): void
    {
        // Seed currencies
        DB::table('currencies')->insert([
            [
                'code' => 'IDR',
                'name' => 'Rupiah',
                'symbol' => 'Rp',
                'exchange_rate' => 1.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
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

        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id');

        // Seed accounts (Header & Detail)
        // 1. Kas & Bank (Induk 1101, Detail minimal 3 anak)
        $parentKas = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1101',
            'name' => 'Kas & Bank',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentKas,
                'currency_id' => $currencyId,
                'code' => '110101',
                'name' => 'Kas Tunai / Kasir',
                'account_type' => 'Cash/Bank',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentKas,
                'currency_id' => $currencyId,
                'code' => '110102',
                'name' => 'Bank BRI',
                'account_type' => 'Cash/Bank',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 2. Piutang Usaha (Induk 1102, Detail minimal 3 anak)
        $parentReceivable = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1102',
            'name' => 'Piutang Usaha',
            'account_type' => 'Receivable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentReceivable,
                'currency_id' => $currencyId,
                'code' => '110201',
                'name' => 'Piutang Dagang Rupiah',
                'account_type' => 'Receivable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentReceivable,
                'currency_id' => $currencyId,
                'code' => '110202',
                'name' => 'Piutang Karyawan Toko',
                'account_type' => 'Receivable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentReceivable,
                'currency_id' => $currencyId,
                'code' => '110203',
                'name' => 'Uang Muka Pembelian',
                'account_type' => 'Receivable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 3. Persediaan (Induk 1103)
        $parentInventory = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1103',
            'name' => 'Persediaan',
            'account_type' => 'Inventory',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentInventory,
                'currency_id' => $currencyId,
                'code' => '110301',
                'name' => 'Persediaan Semen, Besi & Baja',
                'account_type' => 'Inventory',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentInventory,
                'currency_id' => $currencyId,
                'code' => '110302',
                'name' => 'Persediaan Cat, Keramik & Sanitari',
                'account_type' => 'Inventory',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentInventory,
                'currency_id' => $currencyId,
                'code' => '110303',
                'name' => 'Persediaan Material & Alat Bangunan',
                'account_type' => 'Inventory',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);


        // 5. Aset Tetap (Induk 1201)
        $parentAsset = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1201',
            'name' => 'Aset Tetap Operasional',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentAsset,
                'currency_id' => $currencyId,
                'code' => '120101',
                'name' => 'Bangunan Toko & Gudang',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentAsset,
                'currency_id' => $currencyId,
                'code' => '120102',
                'name' => 'Kendaraan Operasional (Truk / Pick-up)',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentAsset,
                'currency_id' => $currencyId,
                'code' => '120103',
                'name' => 'Peralatan & Komputer POS Kasir',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 6. Akumulasi Penyusutan (Induk 1202)
        $parentDepr = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1202',
            'name' => 'Akumulasi Penyusutan',
            'account_type' => 'Accumulated Depreciation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentDepr,
                'currency_id' => $currencyId,
                'code' => '120201',
                'name' => 'Akm. Peny. Bangunan Toko & Gudang',
                'account_type' => 'Accumulated Depreciation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentDepr,
                'currency_id' => $currencyId,
                'code' => '120202',
                'name' => 'Akm. Peny. Kendaraan Operasional',
                'account_type' => 'Accumulated Depreciation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentDepr,
                'currency_id' => $currencyId,
                'code' => '120203',
                'name' => 'Akm. Peny. Peralatan & Komputer POS',
                'account_type' => 'Accumulated Depreciation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 7. Utang Usaha (Induk 2101)
        $parentPayable = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '2101',
            'name' => 'Utang Usaha',
            'account_type' => 'Payable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentPayable,
                'currency_id' => $currencyId,
                'code' => '210101',
                'name' => 'Utang Pemasok Bahan Bangunan',
                'account_type' => 'Payable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentPayable,
                'currency_id' => $currencyId,
                'code' => '210102',
                'name' => 'Uang Muka Penjualan Pelanggan',
                'account_type' => 'Payable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 8. Liabilitas Jangka Pendek (Induk 2102)
        $parentOcl = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '2102',
            'name' => 'Liabilitas Jangka Pendek',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentOcl,
                'currency_id' => $currencyId,
                'code' => '210201',
                'name' => 'Utang Beban Gaji Karyawan',
                'account_type' => 'Other Current Liability',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOcl,
                'currency_id' => $currencyId,
                'code' => '210202',
                'name' => 'Utang Beban Listrik & Air',
                'account_type' => 'Other Current Liability',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 9. Ekuitas & Modal (Induk 3101)
        $parentEquity = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '3101',
            'name' => 'Ekuitas & Modal',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentEquity,
                'currency_id' => $currencyId,
                'code' => '310101',
                'name' => 'Modal Usaha / Pemilik',
                'account_type' => 'Equity',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentEquity,
                'currency_id' => $currencyId,
                'code' => '310102',
                'name' => 'Laba Ditahan Tahun Lalu',
                'account_type' => 'Equity',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentEquity,
                'currency_id' => $currencyId,
                'code' => '310103',
                'name' => 'Ambil Uang Pribadi (Owner)',
                'account_type' => 'Equity',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 10. Pendapatan Usaha (Induk 4101)
        $parentRevenue = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '4101',
            'name' => 'Pendapatan Usaha',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentRevenue,
                'currency_id' => $currencyId,
                'code' => '410101',
                'name' => 'Pendapatan Penjualan Material',
                'account_type' => 'Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentRevenue,
                'currency_id' => $currencyId,
                'code' => '410102',
                'name' => 'Pendapatan Ongkos Kirim Material',
                'account_type' => 'Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentRevenue,
                'currency_id' => $currencyId,
                'code' => '410103',
                'name' => 'Potongan / Diskon Penjualan',
                'account_type' => 'Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 11. Beban Pokok Penjualan (Induk 5101)
        $parentCos = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '5101',
            'name' => 'Beban Pokok Penjualan',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentCos,
                'currency_id' => $currencyId,
                'code' => '510101',
                'name' => 'HPP Bahan Bangunan & Material',
                'account_type' => 'Cost of Sales',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentCos,
                'currency_id' => $currencyId,
                'code' => '510102',
                'name' => 'Biaya Angkut Pembelian Material',
                'account_type' => 'Cost of Sales',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 12. Beban Operasional (Induk 6101)
        $parentGaji = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '6101',
            'name' => 'Beban Operasional & Gaji',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentGaji,
                'currency_id' => $currencyId,
                'code' => '610101',
                'name' => 'Beban Gaji Karyawan & Supir',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentGaji,
                'currency_id' => $currencyId,
                'code' => '610102',
                'name' => 'Beban Listrik, Air & Internet Toko',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentGaji,
                'currency_id' => $currencyId,
                'code' => '610103',
                'name' => 'Beban Bahan Bakar & Perawatan Truk',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 13. Beban Penyusutan (Induk 6102)
        $parentPeny = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '6102',
            'name' => 'Beban Penyusutan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentPeny,
                'currency_id' => $currencyId,
                'code' => '610201',
                'name' => 'Beban Penyusutan Bangunan Toko & Gudang',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentPeny,
                'currency_id' => $currencyId,
                'code' => '610202',
                'name' => 'Beban Penyusutan Kendaraan Operasional',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentPeny,
                'currency_id' => $currencyId,
                'code' => '610203',
                'name' => 'Beban Penyusutan Perlengkapan & Komputer POS',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 14. Beban Lainnya (Induk 7101)
        $parentOtherExpense = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '7101',
            'name' => 'Beban Non-Operasional',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentOtherExpense,
                'currency_id' => $currencyId,
                'code' => '710101',
                'name' => 'Biaya Administrasi Bank',
                'account_type' => 'Other Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherExpense,
                'currency_id' => $currencyId,
                'code' => '710102',
                'name' => 'Biaya Lain-lain',
                'account_type' => 'Other Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 15. Pendapatan Lainnya (Induk 8101)
        $parentOtherRevenue = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '8101',
            'name' => 'Pendapatan Non-Operasional',
            'account_type' => 'Other Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentOtherRevenue,
                'currency_id' => $currencyId,
                'code' => '810101',
                'name' => 'Pendapatan Komisi / Cashback Pemasok',
                'account_type' => 'Other Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherRevenue,
                'currency_id' => $currencyId,
                'code' => '810102',
                'name' => 'Pendapatan Lain-lain',
                'account_type' => 'Other Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed taxes
        DB::table('taxes')->insert([
            [
                'code' => 'PPN-11',
                'name' => 'PPN 11%',
                'tax_type' => 'Standard',
                'rate' => 11.0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
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

        // Seed fixed assets
        $branchId = DB::table('branches')->first()?->id;
        $assetAcc = DB::table('accounts')->where('code', '1201')->value('id');

        DB::table('fixed_assets')->insert([
            [
                'branch_id' => $branchId,
                'asset_account_id' => $assetAcc,
                'code' => 'AST-001',
                'name' => 'Mobil Pick Up Mitsubishi L300 Pengangkut Material',
                'purchase_date' => '2025-01-10',
                'usage_date' => '2025-01-15',
                'depreciation_method' => 'Straight Line',
                'quantity' => 1,
                'asset_life_years' => 8,
                'acquisition_cost' => 210000000.00,
                'book_value' => 183750000.00,
                'initial_location_name' => 'Garasi Armada Toko',
                'initial_location_address' => 'Jl. Raya Sepatan No. 45, Tangerang',
                'notes' => 'Armada utama pengiriman semen, pasir, dan besi beton.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'branch_id' => $branchId,
                'asset_account_id' => $assetAcc,
                'code' => 'AST-002',
                'name' => 'Set Komputer Kasir POS Touchscreen & Thermal Printer',
                'purchase_date' => '2025-02-01',
                'usage_date' => '2025-02-01',
                'depreciation_method' => 'Straight Line',
                'quantity' => 2,
                'asset_life_years' => 4,
                'acquisition_cost' => 15500000.00,
                'book_value' => 11625000.00,
                'initial_location_name' => 'Meja Kasir Toko',
                'initial_location_address' => 'Area Depan Toko',
                'notes' => 'Perangkat POS utama cetak nota kasir.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'branch_id' => $branchId,
                'asset_account_id' => $assetAcc,
                'code' => 'AST-003',
                'name' => 'Timbangan Digital Industri 500kg',
                'purchase_date' => '2025-03-05',
                'usage_date' => '2025-03-05',
                'depreciation_method' => 'Straight Line',
                'quantity' => 1,
                'asset_life_years' => 5,
                'acquisition_cost' => 8200000.00,
                'book_value' => 6560000.00,
                'initial_location_name' => 'Gudang Material Berat',
                'initial_location_address' => 'Area Gudang Belakang',
                'notes' => 'Timbangan paku, kawat, dan cat galon.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'branch_id' => $branchId,
                'asset_account_id' => $assetAcc,
                'code' => 'AST-004',
                'name' => 'Forklift Mini Toyota 2.5 Ton',
                'purchase_date' => '2025-01-20',
                'usage_date' => '2025-01-25',
                'depreciation_method' => 'Straight Line',
                'quantity' => 1,
                'asset_life_years' => 10,
                'acquisition_cost' => 185000000.00,
                'book_value' => 166500000.00,
                'initial_location_name' => 'Area Muat Barang / Loading Dock',
                'initial_location_address' => 'Gudang Bahan Bangunan Sepatan',
                'notes' => 'Alat bongkar muat semen paletan dari truk distributor.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
