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
                'name' => 'Kas Kecil Jakarta',
                'account_type' => 'Cash/Bank',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentKas,
                'currency_id' => $currencyId,
                'code' => '110102',
                'name' => 'Bank BCA Jakarta',
                'account_type' => 'Cash/Bank',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentKas,
                'currency_id' => $currencyId,
                'code' => '110103',
                'name' => 'Bank Mandiri Jakarta',
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

        // 3. Persediaan (Induk 1103, Detail minimal 3 anak)
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
                'name' => 'Persediaan Bahan Bangunan',
                'account_type' => 'Inventory',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentInventory,
                'currency_id' => $currencyId,
                'code' => '110302',
                'name' => 'Persediaan Barang Dalam Proses',
                'account_type' => 'Inventory',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentInventory,
                'currency_id' => $currencyId,
                'code' => '110303',
                'name' => 'Persediaan Terkirim',
                'account_type' => 'Inventory',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 4. Aset Lancar Lainnya (Induk 1104, Detail minimal 3 anak)
        $parentOca = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1104',
            'name' => 'Aset Lancar Lainnya',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentOca,
                'currency_id' => $currencyId,
                'code' => '110401',
                'name' => 'PPN Masukan',
                'account_type' => 'Other Current Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOca,
                'currency_id' => $currencyId,
                'code' => '110402',
                'name' => 'Sewa Dibayar Dimuka',
                'account_type' => 'Other Current Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOca,
                'currency_id' => $currencyId,
                'code' => '110403',
                'name' => 'Asuransi Dibayar Dimuka',
                'account_type' => 'Other Current Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 5. Aset Tetap (Induk 1201, Detail minimal 3 anak)
        $parentAsset = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1201',
            'name' => 'Aset Tetap - Peralatan & Perlengkapan',
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
                'name' => 'Peralatan & Perlengkapan Kantor Surabaya',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentAsset,
                'currency_id' => $currencyId,
                'code' => '120102',
                'name' => 'Kendaraan Operasional Toko',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentAsset,
                'currency_id' => $currencyId,
                'code' => '120103',
                'name' => 'Gedung Toko Utama',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 6. Akumulasi Penyusutan (Induk 1202, Detail minimal 3 anak)
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
                'name' => 'Akm. Peny. Peralatan & Perlengkapan Surabaya',
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
                'name' => 'Akm. Peny. Gedung Toko',
                'account_type' => 'Accumulated Depreciation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 7. Aset Lainnya (Induk 1301, Detail minimal 3 anak)
        $parentOtherAsset = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '1301',
            'name' => 'Aset Lainnya',
            'account_type' => 'Other Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentOtherAsset,
                'currency_id' => $currencyId,
                'code' => '130101',
                'name' => 'Uang Jaminan Sewa',
                'account_type' => 'Other Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherAsset,
                'currency_id' => $currencyId,
                'code' => '130102',
                'name' => 'Aset Tetap Tidak Digunakan',
                'account_type' => 'Other Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherAsset,
                'currency_id' => $currencyId,
                'code' => '130103',
                'name' => 'Goodwill',
                'account_type' => 'Other Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 8. Utang Usaha (Induk 2101, Detail minimal 3 anak)
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
                'name' => 'Utang Retur Pembelian',
                'account_type' => 'Payable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentPayable,
                'currency_id' => $currencyId,
                'code' => '210103',
                'name' => 'Uang Muka Penjualan Pelanggan',
                'account_type' => 'Payable',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 9. Liabilitas Jangka Pendek (Induk 2102, Detail minimal 3 anak)
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
            ],
            [
                'parent_id' => $parentOcl,
                'currency_id' => $currencyId,
                'code' => '210203',
                'name' => 'PPN Keluaran',
                'account_type' => 'Other Current Liability',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 10. Liabilitas Jangka Panjang (Induk 2201, Detail minimal 3 anak)
        $parentLtl = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '2201',
            'name' => 'Liabilitas Jangka Panjang',
            'account_type' => 'Long Term Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('accounts')->insert([
            [
                'parent_id' => $parentLtl,
                'currency_id' => $currencyId,
                'code' => '220101',
                'name' => 'Utang Bank Mandiri',
                'account_type' => 'Long Term Liability',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentLtl,
                'currency_id' => $currencyId,
                'code' => '220102',
                'name' => 'Utang Pembiayaan Kendaraan (Leasing)',
                'account_type' => 'Long Term Liability',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentLtl,
                'currency_id' => $currencyId,
                'code' => '220103',
                'name' => 'Utang Obligasi',
                'account_type' => 'Long Term Liability',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 11. Modal (Induk 3101, Detail minimal 3 anak)
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
                'name' => 'Modal Saham Toko Nur',
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
                'name' => 'Prive Pemilik (Penarikan Modal)',
                'account_type' => 'Equity',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 12. Pendapatan (Induk 4101, Detail minimal 3 anak)
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
                'name' => 'Pendapatan Penjualan Semen/Besi',
                'account_type' => 'Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentRevenue,
                'currency_id' => $currencyId,
                'code' => '410102',
                'name' => 'Pendapatan Jasa Pengiriman',
                'account_type' => 'Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentRevenue,
                'currency_id' => $currencyId,
                'code' => '410103',
                'name' => 'Diskon Penjualan Barang',
                'account_type' => 'Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 13. Beban Pokok Penjualan (Induk 5101, Detail minimal 3 anak)
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
                'name' => 'HPP Semen & Besi',
                'account_type' => 'Cost of Sales',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentCos,
                'currency_id' => $currencyId,
                'code' => '510102',
                'name' => 'HPP Bahan Bangunan Lainnya',
                'account_type' => 'Cost of Sales',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentCos,
                'currency_id' => $currencyId,
                'code' => '510103',
                'name' => 'Beban Angkut Pembelian (Freight In)',
                'account_type' => 'Cost of Sales',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 14. Beban (Induk 6101, Detail minimal 3 anak)
        $parentGaji = DB::table('accounts')->insertGetId([
            'currency_id' => $currencyId,
            'code' => '6101',
            'name' => 'Beban Gaji',
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
                'name' => 'Beban Gaji Umum & Admin',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentGaji,
                'currency_id' => $currencyId,
                'code' => '610102',
                'name' => 'Beban Gaji Karyawan Toko',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentGaji,
                'currency_id' => $currencyId,
                'code' => '610103',
                'name' => 'Beban Gaji Supir & Pengirim',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 15. Beban Lainnya (Induk 7101, Detail minimal 3 anak)
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
                'name' => 'Beban Bunga Bank',
                'account_type' => 'Other Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherExpense,
                'currency_id' => $currencyId,
                'code' => '710102',
                'name' => 'Beban Administrasi Bank',
                'account_type' => 'Other Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherExpense,
                'currency_id' => $currencyId,
                'code' => '710103',
                'name' => 'Beban Kerugian Selisih Kurs',
                'account_type' => 'Other Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 16. Pendapatan Lainnya (Induk 8101, Detail minimal 3 anak)
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
                'name' => 'Pendapatan Bunga Deposito',
                'account_type' => 'Other Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherRevenue,
                'currency_id' => $currencyId,
                'code' => '810102',
                'name' => 'Pendapatan Keuntungan Kurs',
                'account_type' => 'Other Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentOtherRevenue,
                'currency_id' => $currencyId,
                'code' => '810103',
                'name' => 'Pendapatan Komisi / Cashback Pemasok',
                'account_type' => 'Other Revenue',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 17. Beban Penyusutan (Induk 6102, Detail minimal 3 anak)
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
                'name' => 'Beban Penyusutan Peralatan & Perlengkapan Kantor',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentPeny,
                'currency_id' => $currencyId,
                'code' => '610202',
                'name' => 'Beban Penyusutan Kendaraan',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $parentPeny,
                'currency_id' => $currencyId,
                'code' => '610203',
                'name' => 'Beban Penyusutan Gedung',
                'account_type' => 'Expense',
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

        // Seed payment terms
        DB::table('payment_terms')->insert([
            [
                'code' => 'COD',
                'name' => 'Tunai Saat Pengiriman',
                'due_days' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'C.O.D',
                'name' => 'Tunai saat pengantaran (C.O.D)',
                'due_days' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'Set Manual',
                'name' => 'Set syarat pembayaran manual',
                'due_days' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'net 7',
                'name' => 'Jatuh Tempo 7 Hari',
                'due_days' => 7,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'net 15',
                'name' => 'Jatuh Tempo 15 Hari',
                'due_days' => 15,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'net 30',
                'name' => 'Jatuh Tempo 30 Hari',
                'due_days' => 30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'net 45',
                'name' => 'Jatuh Tempo 45 Hari',
                'due_days' => 45,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'net 60',
                'name' => 'Jatuh Tempo 60 Hari',
                'due_days' => 60,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
