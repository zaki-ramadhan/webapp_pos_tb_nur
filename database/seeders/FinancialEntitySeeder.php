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

        // Seed accounts
        DB::table('accounts')->insert([
            [
                'currency_id' => $currencyId,
                'code' => '121.200-04',
                'name' => 'Peralatan & Perlengkapan Kantor Surabaya',
                'account_type' => 'Fixed Asset',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'currency_id' => $currencyId,
                'code' => '122.200-03',
                'name' => 'Akm. Peny. Peralatan & Perlengkapan Surabaya',
                'account_type' => 'Accumulated Depreciation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'currency_id' => $currencyId,
                'code' => '612.001-03',
                'name' => 'Beban Penyusutan Peralatan & Perlengkapan Kantor',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'currency_id' => $currencyId,
                'code' => '611.002-01',
                'name' => 'Beban Gaji Umum & Admin',
                'account_type' => 'Expense',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'currency_id' => $currencyId,
                'code' => '111.001-01',
                'name' => 'Kas Kecil Jakarta',
                'account_type' => 'Cash/Bank',
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
