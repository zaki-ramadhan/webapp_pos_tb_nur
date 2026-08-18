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

        // 1. Rename Gedung Toko Utama -> Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Gedung Toko%')
            ->where('account_type', 'Fixed Asset')
            ->update(['name' => 'Bangunan Toko']);

        // 2. Rename Akm. Peny. Gedung Toko -> Akm. Peny. Bangunan Toko
        DB::table('accounts')
            ->where('name', 'like', '%Akm. Peny. Gedung Toko%')
            ->update(['name' => 'Akm. Peny. Bangunan Toko']);

        // 3. Clean up / Rename Utang Obligasi -> Pinjaman Modal Kerja / KUR
        DB::table('accounts')
            ->where('name', 'like', '%Utang Obligasi%')
            ->update(['name' => 'Pinjaman Modal Kerja / KUR']);

        // 4. Clean up Goodwill -> Lisensi Sistem POS & Software
        DB::table('accounts')
            ->where('name', 'like', '%Goodwill%')
            ->update(['name' => 'Lisensi Sistem POS & Software']);

        // 5. Clean up Aset Tetap Tidak Digunakan -> Deposit Listrik & Utilitas (PLN/PDAM)
        DB::table('accounts')
            ->where('name', 'like', '%Aset Tetap Tidak Digunakan%')
            ->update(['name' => 'Deposit Listrik & Utilitas (PLN/PDAM)']);

        // 6. Rename Uang Jaminan Sewa -> Uang Jaminan Sewa Tempat / Gudang
        DB::table('accounts')
            ->where('name', 'Uang Jaminan Sewa')
            ->update(['name' => 'Uang Jaminan Sewa Tempat / Gudang']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No destructive reversal needed
    }
};
