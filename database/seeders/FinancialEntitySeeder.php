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


        // Seed accounts (Accurate Online Chart of Accounts Standard)
        $accountMap = [];
        // Level 0
        $accountMap['111.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '111.000-00',
            'name' => 'Kas dan Setara Kas',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['112.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '112.000-00',
            'name' => 'Piutang',
            'account_type' => 'Receivable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['113.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '113.000-00',
            'name' => 'Uang Muka Pembelian',
            'account_type' => 'Receivable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['114.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '114.000-00',
            'name' => 'Piutang Diluar Usaha',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['115.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '115.000-00',
            'name' => 'Persediaan Barang Dagang',
            'account_type' => 'Inventory',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['116.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '116.000-00',
            'name' => 'Biaya Dibayar Dimuka',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['117.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '117.000-00',
            'name' => 'Pajak Dibayar Dimuka',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['121.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '121.000-00',
            'name' => 'Asset Tetap',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['122.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '122.000-00',
            'name' => 'Akumulasi Penyusutan',
            'account_type' => 'Accumulated Depreciation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['123.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '123.000-00',
            'name' => 'Asset Lainnya',
            'account_type' => 'Other Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['211.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '211.000-00',
            'name' => 'Hutang',
            'account_type' => 'Payable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['212.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '212.000-00',
            'name' => 'Uang Muka Penjualan',
            'account_type' => 'Payable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['213.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '213.000-00',
            'name' => 'Hutang Diluar Usaha',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '214.000-00',
            'name' => 'Biaya Yang Masih Harus Dibayar',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['215.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '215.000-00',
            'name' => 'Hutang Pajak',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['221.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '221.000-00',
            'name' => 'Hutang Jangka Panjang',
            'account_type' => 'Long Term Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['311.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '311.000-00',
            'name' => 'Ekuitas',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['411.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '411.000-00',
            'name' => 'Penjualan',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['421.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '421.000-00',
            'name' => 'Potongan Penjualan Barang',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['422.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '422.000-00',
            'name' => 'Potongan Penjualan Faktur',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['431.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '431.000-00',
            'name' => 'Retur Penjualan',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['511.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '511.000-00',
            'name' => 'Beban Pokok Penjualan',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['512.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '512.000-00',
            'name' => 'Potongan Pembelian',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '611.000-00',
            'name' => 'Beban',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '711.000-00',
            'name' => 'Biaya Diluar Usaha',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['811.000-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => null,
            'currency_id' => $currencyId,
            'code' => '811.000-00',
            'name' => 'Pendapatan Diluar Usaha',
            'account_type' => 'Other Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // Level 1
        $accountMap['111.101-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['111.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '111.101-00',
            'name' => 'Kas',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['111.102-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['111.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '111.102-00',
            'name' => 'Bank',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['112.101-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['112.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '112.101-00',
            'name' => 'Piutang Usaha IDR',
            'account_type' => 'Receivable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['112.103-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['112.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '112.103-00',
            'name' => 'Piutang Tidak Tertagih IDR',
            'account_type' => 'Receivable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['113.101-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['113.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '113.101-00',
            'name' => 'Uang Muka Pembelian Barang',
            'account_type' => 'Receivable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['114.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['114.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '114.100-01',
            'name' => 'Piutang Direksi',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['114.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['114.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '114.100-02',
            'name' => 'Piutang Karyawan',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['114.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['114.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '114.100-03',
            'name' => 'Piutang Lain-lain',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['116.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['116.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '116.100-01',
            'name' => 'Gaji Dibayar Dimuka',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['116.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['116.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '116.100-02',
            'name' => 'Sewa Dibayar Dimuka',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['116.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['116.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '116.100-03',
            'name' => 'Asuransi Dibayar Dimuka',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['117.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['117.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '117.000-01',
            'name' => 'PPN Masukan',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['117.000-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['117.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '117.000-02',
            'name' => 'PPh Pasal 23',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['117.000-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['117.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '117.000-03',
            'name' => 'PPh Pasal 25',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['117.000-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['117.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '117.000-04',
            'name' => 'PPh Pasal 22',
            'account_type' => 'Other Current Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['121.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['121.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '121.100-01',
            'name' => 'Tanah',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['121.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['121.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '121.100-02',
            'name' => 'Bangunan',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['121.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['121.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '121.100-03',
            'name' => 'Kendaraan',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['121.100-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['121.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '121.100-04',
            'name' => 'Peralatan & Perlengkapan Kantor',
            'account_type' => 'Fixed Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['122.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['122.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '122.100-01',
            'name' => 'Akm. Peny. Bangunan',
            'account_type' => 'Accumulated Depreciation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['122.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['122.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '122.100-02',
            'name' => 'Akm. Peny. Kendaraan',
            'account_type' => 'Accumulated Depreciation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['122.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['122.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '122.100-03',
            'name' => 'Akm. Peny. Peralatan & Perlengkapan',
            'account_type' => 'Accumulated Depreciation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['123.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['123.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '123.100-01',
            'name' => 'Asset Dalam Proses',
            'account_type' => 'Other Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['123.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['123.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '123.100-02',
            'name' => 'Pembangunan Dalam Proses',
            'account_type' => 'Other Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['123.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['123.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '123.100-03',
            'name' => 'Pembiayaan Pra Operasional',
            'account_type' => 'Other Asset',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['211.101-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['211.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '211.101-00',
            'name' => 'Hutang Usaha IDR',
            'account_type' => 'Payable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['211.103-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['211.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '211.103-00',
            'name' => 'Hutang Tidak Tertagih IDR',
            'account_type' => 'Payable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['212.101-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['212.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '212.101-00',
            'name' => 'Uang Muka Penjualan Barang IDR',
            'account_type' => 'Payable',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['213.000-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['213.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '213.000-99',
            'name' => 'Penerimaan Belum Tertagih',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['213.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['213.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '213.100-01',
            'name' => 'Hutang Pemegang Saham',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['213.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['213.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '213.100-02',
            'name' => 'Hutang Deviden',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['213.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['213.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '213.100-03',
            'name' => 'Hutang Leasing',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['213.100-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['213.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '213.100-04',
            'name' => 'Hutang diluar Usaha Lainnya',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-01',
            'name' => 'BYMD - Gaji',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-02',
            'name' => 'BYMD - Asuransi',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-03',
            'name' => 'BYMD - BPJS Kesehatan',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-04',
            'name' => 'BYMD - BPJS Ketenagakerjaan',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-05',
            'name' => 'BYMD - Sewa',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-06'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-06',
            'name' => 'BYMD - Telepon dan Internet',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-07'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-07',
            'name' => 'BYMD - Listrik dan PDAM Air',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['214.100-08'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['214.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '214.100-08',
            'name' => 'BYMD - Hutang Bunga Bank',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['215.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['215.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '215.000-01',
            'name' => 'PPn Keluaran',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['215.000-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['215.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '215.000-02',
            'name' => 'Hutang Pajak PPh Ps 21',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['215.000-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['215.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '215.000-03',
            'name' => 'Hutang Pajak PPh Ps 23',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['215.000-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['215.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '215.000-04',
            'name' => 'Hutang Pajak PPh Ps 29',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['215.000-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['215.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '215.000-05',
            'name' => 'Hutang Pajak PPh Ps 4 (2)',
            'account_type' => 'Other Current Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['221.100-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['221.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '221.100-01',
            'name' => 'Hutang Bank BCA',
            'account_type' => 'Long Term Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['221.100-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['221.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '221.100-02',
            'name' => 'Hutang Sewa Guna Usaha',
            'account_type' => 'Long Term Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['221.100-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['221.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '221.100-03',
            'name' => 'Hutang Jangka Panjang Pihak Ketiga',
            'account_type' => 'Long Term Liability',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['311.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['311.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '311.000-01',
            'name' => 'Modal Setoran Awal',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['311.000-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['311.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '311.000-02',
            'name' => 'Modal Saham',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['311.000-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['311.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '311.000-03',
            'name' => 'Deviden',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['311.000-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['311.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '311.000-04',
            'name' => 'Laba ditahan',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['311.000-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['311.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '311.000-05',
            'name' => 'Prive',
            'account_type' => 'Equity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['411.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['411.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '411.000-01',
            'name' => 'Penjualan Barang Dagang',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['411.000-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['411.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '411.000-99',
            'name' => 'Pendapatan Jasa',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['421.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['421.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '421.000-01',
            'name' => 'Potongan Penjualan Barang',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['421.000-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['421.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '421.000-99',
            'name' => 'Potongan Pendapatan Jasa',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['422.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['422.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '422.000-01',
            'name' => 'Potongan Penjualan IDR',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['431.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['431.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '431.000-01',
            'name' => 'Retur Penjualan Barang',
            'account_type' => 'Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['511.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['511.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '511.000-01',
            'name' => 'Beban Pokok Penjualan Barang Dagang',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['511.000-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['511.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '511.000-05',
            'name' => 'Beban Selisih Nilai barang (Item Transfer)',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['511.000-06'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['511.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '511.000-06',
            'name' => 'Beban Selisih Pembelian Barang',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['512.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['512.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '512.000-01',
            'name' => 'Potongan Pembelian Barang',
            'account_type' => 'Cost of Sales',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-00',
            'name' => 'Beban Penjualan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-00',
            'name' => 'Beban Umum dan Administrasi',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['612.001-00'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '612.001-00',
            'name' => 'Beban Penyusutan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-01',
            'name' => 'Biaya Administrasi Bank',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-02',
            'name' => 'Biaya Zakat dan Donasi',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-03',
            'name' => 'Bunga Pinjaman',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-04',
            'name' => 'Beban Pajak Penghasilan',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-05',
            'name' => 'Laba/Rugi Penghentian Asset',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-98'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-98',
            'name' => 'Biaya Selisih Penyesuaian Persediaan',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['711.000-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['711.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '711.000-99',
            'name' => 'Biaya Diluar Usaha Lainnya',
            'account_type' => 'Other Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['811.000-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['811.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '811.000-01',
            'name' => 'Pendapatan Bunga Bank',
            'account_type' => 'Other Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['811.000-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['811.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '811.000-02',
            'name' => 'Pendapatan Bunga Deposito',
            'account_type' => 'Other Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['811.000-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['811.000-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '811.000-99',
            'name' => 'Pendapatan Diluar Usaha Lainnya',
            'account_type' => 'Other Revenue',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // Level 2
        $accountMap['111.101-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['111.101-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '111.101-01',
            'name' => 'Kas Kecil Kantor',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['111.101-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['111.101-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '111.101-02',
            'name' => 'Kas Besar Kantor',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['111.102-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['111.102-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '111.102-01',
            'name' => 'Bank BCA',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['111.102-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['111.102-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '111.102-04',
            'name' => 'Bank Mandiri',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-01',
            'name' => 'Beban Gaji Penjualan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-02',
            'name' => 'Beban Komisi Penjualan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-03',
            'name' => 'Beban Konsumsi',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-04',
            'name' => 'Beban Angkut Pembelian',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-05',
            'name' => 'Beban Kesehatan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-06'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-06',
            'name' => 'Beban Asuransi',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-07'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-07',
            'name' => 'Beban Komunikasi',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-08'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-08',
            'name' => 'Beban Bensin, Tol dan Parkir',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-09'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-09',
            'name' => 'Beban Transportasi',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-10'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-10',
            'name' => 'Beban Tunjangan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-11'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-11',
            'name' => 'Beban Entertaiment',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-12'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-12',
            'name' => 'Beban Iklan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-13'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-13',
            'name' => 'Beban Perbaikan dan Perawatan Asset',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.001-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.001-99',
            'name' => 'Beban Penjualan Lainnya',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-01',
            'name' => 'Beban Gaji Umum & Admin',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-02',
            'name' => 'Beban Listrik dan Air',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-03',
            'name' => 'Beban Sewa',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-04'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-04',
            'name' => 'Beban Telepon',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-05'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-05',
            'name' => 'Beban Internet',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-06'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-06',
            'name' => 'Beban Konsumsi Umum & Admin',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-07'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-07',
            'name' => 'Beban Transportasi Umum & Admin',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-08'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-08',
            'name' => 'Beban Alat Tulis Kantor',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-09'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-09',
            'name' => 'Beban Rumah Tangga Kantor',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-10'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-10',
            'name' => 'Beban Perlengkapan Kantor',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-11'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-11',
            'name' => 'Beban Langganan Majalah & Koran',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-12'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-12',
            'name' => 'Beban Bensin, Tol dan Parkir Umum & Admin',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-13'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-13',
            'name' => 'Beban Perbaikan dan Perawatan Asset Umum & admin',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-14'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-14',
            'name' => 'Beban Denda Pajak',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-15'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-15',
            'name' => 'Beban Bonus',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-16'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-16',
            'name' => 'Beban Tunjangan Hari Raya',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['611.002-99'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['611.002-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '611.002-99',
            'name' => 'Beban Umum & Admin Lainnya',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['612.001-01'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['612.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '612.001-01',
            'name' => 'Beban Penyusutan Bangunan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['612.001-02'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['612.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '612.001-02',
            'name' => 'Beban Penyusutan Kendaraan',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $accountMap['612.001-03'] = DB::table('accounts')->insertGetId([
            'parent_id' => $accountMap['612.001-00'] ?? null,
            'currency_id' => $currencyId,
            'code' => '612.001-03',
            'name' => 'Beban Penyusutan Peralatan & Perlengkapan Kantor',
            'account_type' => 'Expense',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed taxes
        DB::table('taxes')->insert([
            [
                'code' => 'PPN-11',
                'name' => 'PPN 11%',
                'tax_type' => 'Standard',
                'rate' => 11.0,
                'output_account_id' => $accountMap['215.000-01'] ?? null,
                'input_account_id' => $accountMap['117.000-01'] ?? null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'PPN-12',
                'name' => 'PPN 12%',
                'tax_type' => 'Standard',
                'rate' => 12.0,
                'output_account_id' => $accountMap['215.000-01'] ?? null,
                'input_account_id' => $accountMap['117.000-01'] ?? null,
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
        $assetAcc = DB::table('accounts')->where('code', '121.100-03')->value('id');

        $startYear = (int) date('Y') - 1;

        if (DB::getSchemaBuilder()->hasTable('fixed_assets')) {
            DB::table('fixed_assets')->insert([
            [
                'branch_id' => $branchId,
                'asset_account_id' => $assetAcc,
                'code' => 'AST-001',
                'name' => 'Mobil Pick Up Mitsubishi L300 Pengangkut Material',
                'purchase_date' => sprintf('%04d-01-10', $startYear),
                'usage_date' => sprintf('%04d-01-15', $startYear),
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
                'purchase_date' => sprintf('%04d-02-01', $startYear),
                'usage_date' => sprintf('%04d-02-01', $startYear),
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
                'purchase_date' => sprintf('%04d-03-05', $startYear),
                'usage_date' => sprintf('%04d-03-05', $startYear),
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
                'purchase_date' => sprintf('%04d-01-20', $startYear),
                'usage_date' => sprintf('%04d-01-25', $startYear),
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
}
