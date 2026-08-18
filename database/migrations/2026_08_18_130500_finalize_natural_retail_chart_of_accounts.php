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

        // 2. Standardize Piutang (No "Rupiah")
        DB::table('accounts')
            ->where('name', 'like', '%Piutang Dagang%')
            ->update(['name' => 'Piutang Dagang Pelanggan']);

        DB::table('accounts')
            ->where('name', 'like', '%Piutang Karyawan%')
            ->update(['name' => 'Kasbon / Piutang Karyawan']);

        DB::table('accounts')
            ->where('name', 'Uang Muka Pembelian')
            ->update(['name' => 'Uang Muka Pembelian ke Pemasok']);

        // 3. Standardize Persediaan (Single universal Barang Dagang)
        DB::table('accounts')
            ->where('name', 'like', '%Persediaan%')
            ->where('account_type', 'Inventory')
            ->whereNotNull('parent_id')
            ->update(['name' => 'Persediaan Barang Dagang']);

        // 4. Standardize Aset Tetap, Akm. Penyusutan & Beban Penyusutan (No "POS", No "Kantor")
        DB::table('accounts')
            ->where('name', 'like', '%Gedung%')
            ->where('account_type', 'Fixed Asset')
            ->update(['name' => 'Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Peralatan%')
            ->orWhere('name', 'like', '%Kantor%')
            ->where('account_type', 'Fixed Asset')
            ->update(['name' => 'Peralatan Toko & Komputer Kasir']);

        DB::table('accounts')
            ->where('name', 'like', '%Akm%Gedung%')
            ->update(['name' => 'Akm. Peny. Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Akm%Peralatan%')
            ->orWhere('name', 'like', '%Akm%Kantor%')
            ->orWhere('name', 'like', '%Akm%POS%')
            ->update(['name' => 'Akm. Peny. Peralatan Toko & Komputer Kasir']);

        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan%Gedung%')
            ->update(['name' => 'Beban Penyusutan Bangunan Toko & Gudang']);

        DB::table('accounts')
            ->where('name', 'like', '%Beban Penyusutan%Peralatan%')
            ->orWhere('name', 'like', '%Beban Penyusutan%Kantor%')
            ->orWhere('name', 'like', '%Beban Penyusutan%POS%')
            ->update(['name' => 'Beban Penyusutan Peralatan Toko & Komputer Kasir']);

        // 5. Standardize Ekuitas & Modal (No TB Nur mention, Prive -> Ambil Uang Pribadi)
        DB::table('accounts')
            ->where('name', 'like', '%Modal Saham%')
            ->orWhere('name', 'like', '%Modal Usaha%')
            ->update(['name' => 'Modal Usaha / Pemilik']);

        DB::table('accounts')
            ->where('name', 'like', '%Prive%')
            ->update(['name' => 'Ambil Uang Pribadi (Owner)']);

        // 6. Standardize Pendapatan & HPP (Universal Barang Dagang)
        DB::table('accounts')
            ->where('name', 'like', '%Pendapatan Penjualan%')
            ->update(['name' => 'Pendapatan Penjualan Barang Dagang']);

        DB::table('accounts')
            ->where('name', 'like', '%Pendapatan Ongkos Kirim%')
            ->update(['name' => 'Pendapatan Ongkos Kirim Barang']);

        DB::table('accounts')
            ->where('name', 'like', '%Diskon Penjualan%')
            ->update(['name' => 'Potongan / Diskon Penjualan']);

        DB::table('accounts')
            ->where('name', 'like', '%HPP%')
            ->update(['name' => 'HPP Barang Dagang']);

        DB::table('accounts')
            ->where('name', 'like', '%Freight In%')
            ->orWhere('name', 'like', '%Beban Angkut Pembelian%')
            ->orWhere('name', 'like', '%Biaya Angkut Pembelian%')
            ->update(['name' => 'Biaya Angkut Pembelian Barang']);

        // 7. Standardize Beban Gaji & Utang Gaji (Single consolidated salary account)
        DB::table('accounts')
            ->where('name', 'like', '%Gaji%')
            ->where('account_type', 'Expense')
            ->update(['name' => 'Beban Gaji & Upah Karyawan']);

        DB::table('accounts')
            ->where('name', 'like', '%Gaji%')
            ->where('account_type', 'Other Current Liability')
            ->update(['name' => 'Utang Gaji & Upah Karyawan']);

        // 7. Delete all rent, leasing, PPN, loan, and non-operational dummy accounts
        $unwantedAccountNames = [
            'Goodwill',
            'Lisensi Sistem POS & Software',
            'Persediaan Barang Dalam Proses',
            'Persediaan Terkirim',
            'Persediaan Cat, Keramik & Sanitari',
            'Persediaan Material & Alat Bangunan',
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
