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
            ->update(['name' => 'Bangunan Toko']);

        // 2. Rename Akm. Peny. Gedung Toko -> Akm. Peny. Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Gedung Toko%')
            ->update(['name' => 'Akm. Peny. Bangunan Toko']);

        // 3. Rename Beban Penyusutan Gedung -> Beban Penyusutan Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan Gedung%')
            ->update(['name' => 'Beban Penyusutan Bangunan Toko']);

        // 4. Clean up / Rename Utang Obligasi -> Pinjaman Modal Kerja / KUR
        DB::table('accounts')
            ->where('name', 'like', '%Utang Obligasi%')
            ->update(['name' => 'Pinjaman Modal Kerja / KUR']);

        // 5. Clean up Aset Tetap Tidak Digunakan -> Deposit Listrik & Utilitas (PLN/PDAM)
        DB::table('accounts')
            ->where('name', 'like', '%Aset Tetap Tidak Digunakan%')
            ->update(['name' => 'Deposit Listrik & Utilitas (PLN/PDAM)']);

        // 6. Rename Uang Jaminan Sewa -> Uang Jaminan Sewa Tempat / Gudang
        DB::table('accounts')
            ->where('name', 'Uang Jaminan Sewa')
            ->update(['name' => 'Uang Jaminan Sewa Tempat / Gudang']);

        // 7. Delete truly unused / irrelevant accounts (kurs, manufaktur, goodwill) if they have no transaction lines
        $unwantedAccountNames = [
            'Goodwill',
            'Lisensi Sistem POS & Software',
            'Persediaan Barang Dalam Proses',
            'Persediaan Terkirim',
            'Asuransi Dibayar Dimuka',
            'Beban Kerugian Selisih Kurs',
            'Pendapatan Bunga Deposito',
            'Pendapatan Keuntungan Kurs',
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
