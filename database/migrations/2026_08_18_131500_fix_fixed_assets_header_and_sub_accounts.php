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

        // 1. Fix 1201 Header/Parent to "Aset Tetap"
        DB::table('accounts')
            ->where('code', '1201')
            ->update(['name' => 'Aset Tetap']);

        // 2. Fix 1201 Sub-accounts
        DB::table('accounts')
            ->where('code', '120101')
            ->update(['name' => 'Peralatan Toko & Komputer Kasir']);

        DB::table('accounts')
            ->where('code', '120102')
            ->update(['name' => 'Kendaraan Operasional (Truk / Pick-up)']);

        DB::table('accounts')
            ->where('code', '120103')
            ->update(['name' => 'Bangunan Toko & Gudang']);

        // 3. Fix 1202 Header & Sub-accounts
        DB::table('accounts')
            ->where('code', '1202')
            ->update(['name' => 'Akumulasi Penyusutan']);

        DB::table('accounts')
            ->where('code', '120201')
            ->update(['name' => 'Akm. Peny. Peralatan Toko & Komputer Kasir']);

        DB::table('accounts')
            ->where('code', '120202')
            ->update(['name' => 'Akm. Peny. Kendaraan Operasional']);

        DB::table('accounts')
            ->where('code', '120203')
            ->update(['name' => 'Akm. Peny. Bangunan Toko & Gudang']);

        // 4. Fix 6102 Header & Sub-accounts
        DB::table('accounts')
            ->where('code', '6102')
            ->update(['name' => 'Beban Penyusutan']);

        DB::table('accounts')
            ->where('code', '610201')
            ->update(['name' => 'Beban Penyusutan Peralatan Toko & Komputer Kasir']);

        DB::table('accounts')
            ->where('code', '610202')
            ->update(['name' => 'Beban Penyusutan Kendaraan Operasional']);

        DB::table('accounts')
            ->where('code', '610203')
            ->update(['name' => 'Beban Penyusutan Bangunan Toko & Gudang']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
