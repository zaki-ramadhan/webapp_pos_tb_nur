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

        // 1. Standardize Kas & Bank
        DB::table('accounts')
            ->where('name', 'Kas Kecil')
            ->update(['name' => 'Kas Tunai / Kasir']);

        DB::table('accounts')
            ->whereIn('name', ['Bank BCA', 'Bank Mandiri'])
            ->update(['name' => 'Bank BRI']);

        // 2. Standardize Bangunan Toko & Gudang
        DB::table('accounts')
            ->where('name', 'like', '%Gedung Toko%')
            ->where('account_type', 'Fixed Asset')
            ->update(['name' => 'Bangunan Toko & Gudang']);

        // 3. Standardize Akumulasi Penyusutan & Beban Penyusutan
        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Gedung Toko%')
            ->update(['name' => 'Akm. Peny. Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Peralatan%')
            ->update(['name' => 'Akm. Peny. Perlengkapan & Komputer POS']);

        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan Gedung%')
            ->update(['name' => 'Beban Penyusutan Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan Peralatan%')
            ->update(['name' => 'Beban Penyusutan Perlengkapan & Komputer POS']);

        // 4. Standardize Ekuitas & Modal (No TB Nur mention, Prive -> Ambil Uang Pribadi)
        DB::table('accounts')
            ->where('name', 'like', '%Modal Saham%')
            ->orWhere('name', 'like', '%Modal Usaha%')
            ->update(['name' => 'Modal Usaha / Pemilik']);

        DB::table('accounts')
            ->where('name', 'like', '%Prive%')
            ->update(['name' => 'Ambil Uang Pribadi (Owner)']);

        // 5. Standardize HPP / Freight In -> Biaya Angkut Pembelian Material
        DB::table('accounts')
            ->where('name', 'like', '%Freight In%')
            ->orWhere('name', 'like', '%Beban Angkut Pembelian%')
            ->update(['name' => 'Biaya Angkut Pembelian Material']);

        // 6. Delete all rent, leasing, PPN, loan, and non-operational dummy accounts
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
            'PPN Masukan',
            'PPN Keluaran',
            'Uang Muka Operasional Toko',
            'Aset Lancar Lainnya', // Header 1104
            'Aset Lainnya', // Header 1301
            'Liabilitas Jangka Panjang', // Header 2201
            'Utang Obligasi',
            'Pinjaman Bank / Modal Kerja (KUR)',
            'Pinjaman Modal Kerja / KUR',
            'Beban Bunga Bank',
            'Beban Bunga Pinjaman Bank',
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
