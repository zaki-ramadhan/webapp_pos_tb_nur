<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('accounts')) {
            return;
        }

        // 1. Standardize Bangunan Toko & Gudang
        DB::table('accounts')
            ->where('name', 'like', '%Gedung Toko%')
            ->where('account_type', 'Fixed Asset')
            ->update(['name' => 'Bangunan Toko & Gudang']);

        // 2. Standardize Akumulasi Penyusutan
        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Gedung Toko%')
            ->update(['name' => 'Akm. Peny. Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Peralatan%')
            ->update(['name' => 'Akm. Peny. Peralatan & Komputer POS']);

        // 3. Standardize Beban Penyusutan
        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan Gedung%')
            ->update(['name' => 'Beban Penyusutan Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan Peralatan%')
            ->update(['name' => 'Beban Penyusutan Peralatan & Komputer POS']);

        // 4. Standardize Modal Usaha (TB Nur)
        DB::table('accounts')
            ->where('name', 'like', '%Modal Saham%')
            ->update(['name' => 'Modal Usaha (TB Nur)']);

        // 5. Standardize Pinjaman Modal Kerja
        DB::table('accounts')
            ->where('name', 'like', '%Utang Obligasi%')
            ->orWhere('name', 'Utang Bank Mandiri')
            ->update(['name' => 'Pinjaman Bank / Modal Kerja (KUR)']);

        // 6. Delete all rent, leasing, unwanted dummy accounts
        $unwantedAccountNames = [
            'Goodwill',
            'Lisensi Sistem POS & Software',
            'Persediaan Barang Dalam Proses',
            'Persediaan Terkirim',
            'Asuransi Dibayar Dimuka',
            'Sewa Dibayar Dimuka',
            'Sewa Ruko/Gudang Dibayar Dimuka',
            'Uang Jaminan Sewa',
            'Uang Jaminan Sewa Tempat / Gudang',
            'Deposit & Jaminan Sewa Tempat/Gudang',
            'Deposit Listrik & Utilitas (PLN/PDAM)',
            'Aset Tetap Tidak Digunakan',
            'Utang Pembiayaan Kendaraan (Leasing)',
            'Utang Pembiayaan Kendaraan (Leasing Truk)',
            'Utang Retur Pembelian',
            'Beban Kerugian Selisih Kurs',
            'Pendapatan Bunga Deposito',
            'Pendapatan Keuntungan Kurs',
            'Aset Lainnya', // Header 1301
        ];

        foreach ($unwantedAccountNames as $name) {
            $accounts = DB::table('accounts')->where('name', $name)->get();
            foreach ($accounts as $account) {
                $isUsedInLines = Schema::hasTable('operation_document_lines')
                    ? DB::table('operation_document_lines')->where('account_id', $account->id)->exists()
                    : false;

                $isUsedInDocs = Schema::hasTable('operation_documents')
                    ? DB::table('operation_documents')
                        ->where('primary_account_id', $account->id)
                        ->orWhere('secondary_account_id', $account->id)
                        ->exists()
                    : false;

                if (!$isUsedInLines && !$isUsedInDocs) {
                    DB::table('accounts')->where('id', $account->id)->delete();
                } else {
                    DB::table('accounts')->where('id', $account->id)->update(['is_active' => false]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructive rollback needed
    }
};
