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

        // 1. Rename Gedung Toko -> Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Gedung Toko%')
            ->where('account_type', 'Fixed Asset')
            ->update(['name' => 'Bangunan Toko & Gudang']);

        // 2. Rename Akm. Peny. Gedung Toko -> Akm. Peny. Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Gedung Toko%')
            ->update(['name' => 'Akm. Peny. Bangunan Toko']);

        // 3. Rename Beban Penyusutan Gedung -> Beban Penyusutan Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan Gedung%')
            ->update(['name' => 'Beban Penyusutan Bangunan Toko']);

        // 4. Rename Modal Saham Toko Nur -> Modal Usaha (TB Nur)
        DB::table('accounts')
            ->where('name', 'like', '%Modal Saham%')
            ->update(['name' => 'Modal Usaha (TB Nur)']);

        // 5. Clean up / Rename Utang Obligasi & Utang Bank Mandiri -> Pinjaman Bank / Modal Kerja (KUR)
        DB::table('accounts')
            ->where('name', 'like', '%Utang Obligasi%')
            ->update(['name' => 'Pinjaman Bank / Modal Kerja (KUR)']);

        DB::table('accounts')
            ->where('name', 'Utang Bank Mandiri')
            ->update(['name' => 'Pinjaman Bank / Modal Kerja (KUR)']);

        // 6. Rename Deposit & Sewa
        DB::table('accounts')
            ->where('name', 'Uang Jaminan Sewa')
            ->orWhere('name', 'like', '%Uang Jaminan Sewa%')
            ->update(['name' => 'Deposit & Jaminan Sewa Tempat/Gudang']);

        // 7. Delete truly unused / irrelevant accounts (kurs, manufaktur, goodwill, retur terpisah)
        $unwantedAccountNames = [
            'Goodwill',
            'Lisensi Sistem POS & Software',
            'Persediaan Barang Dalam Proses',
            'Persediaan Terkirim',
            'Asuransi Dibayar Dimuka',
            'Beban Kerugian Selisih Kurs',
            'Pendapatan Bunga Deposito',
            'Pendapatan Keuntungan Kurs',
            'Utang Retur Pembelian',
            'Aset Tetap Tidak Digunakan',
        ];

        foreach ($unwantedAccountNames as $name) {
            $account = DB::table('accounts')->where('name', $name)->first();
            if ($account) {
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
