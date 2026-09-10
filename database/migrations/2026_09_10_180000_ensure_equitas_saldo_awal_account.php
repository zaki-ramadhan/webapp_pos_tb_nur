<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $existing = DB::table('accounts')
            ->where('code', '300001')
            ->orWhere('name', 'Equitas Saldo Awal')
            ->orWhere('name', 'Ekuitas Saldo Awal')
            ->first();

        if (! $existing) {
            $parentEquity = DB::table('accounts')
                ->where('code', '3101')
                ->orWhere(function ($q) {
                    $q->whereNull('parent_id')
                      ->where('account_type', 'Equity');
                })
                ->value('id');

            $currencyId = DB::table('currencies')->value('id') ?? 1;

            DB::table('accounts')->insert([
                'parent_id' => $parentEquity,
                'currency_id' => $currencyId,
                'code' => '300001',
                'name' => 'Equitas Saldo Awal',
                'account_type' => 'Equity',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('accounts')->where('code', '300001')->delete();
    }
};
