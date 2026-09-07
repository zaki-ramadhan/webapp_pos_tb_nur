<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products') || ! Schema::hasTable('suppliers')) {
            return;
        }

        $suppliers = DB::table('suppliers')->get()->keyBy('code');
        if ($suppliers->isEmpty()) {
            return;
        }

        $suppNiaga    = $suppliers->get('SUPP-001')?->id ?? $suppliers->first()?->id;
        $suppSolusi   = $suppliers->get('SUPP-002')?->id ?? $suppNiaga;
        $suppIndowarna= $suppliers->get('SUPP-003')?->id ?? $suppNiaga;
        $suppMegaBaja = $suppliers->get('SUPP-004')?->id ?? $suppNiaga;
        $suppGias     = $suppliers->get('SUPP-005')?->id ?? $suppNiaga;
        $suppPasir    = $suppliers->get('SUPP-006')?->id ?? $suppNiaga;
        $suppPropan   = $suppliers->get('SUPP-007')?->id ?? $suppIndowarna;
        $suppRkm      = $suppliers->get('SUPP-008')?->id ?? $suppNiaga;

        $mappings = [
            // Semen -> PT Niaga Manunggal Perkasa
            ['prefixes' => ['SMN-'], 'supplier_id' => $suppNiaga],
            // Pasir, Batu, Bata, Batako -> CV Pasir Berkah Arjawinangun
            ['prefixes' => ['PSR-', 'SPL-', 'BTA-', 'BTK-'], 'supplier_id' => $suppPasir],
            // Besi, Baja Ringan, Wiremesh, Kawat, Paku -> PT Mega Baja Palimanan
            ['prefixes' => ['BES-', 'BJA-', 'RNG-', 'WMH-', 'KWT-', 'PAK-'], 'supplier_id' => $suppMegaBaja],
            // Cat, Waterproofing, Thinner, Paket Cat -> PT Central Utama Indowarna
            ['prefixes' => ['CAT-', 'AQP-', 'THN-', 'BND-'], 'supplier_id' => $suppIndowarna],
            // Pipa, Sanitasi, Kran, Lem Pipa, Toren Air -> PT Solusi Inti Bersama
            ['prefixes' => ['PIP-', 'KRN-', 'STP-', 'LEM-', 'TRN-'], 'supplier_id' => $suppSolusi],
            // Triplek, Seng, Spandek, Asbes, Gypsum -> CV Grahaprana Irasentosa
            ['prefixes' => ['TPL-', 'SNG-', 'SPD-', 'ASB-', 'GYP-'], 'supplier_id' => $suppGias],
            // Kuas, Roll Cat, Kabel, Meteran, Alat, Keramik, Mortar -> Toko RKM Plered Cirebon
            ['prefixes' => ['KUS-', 'ROL-', 'KBL-', 'MTR-', 'SKP-', 'CGK-', 'KRM-'], 'supplier_id' => $suppRkm],
        ];

        foreach ($mappings as $mapping) {
            foreach ($mapping['prefixes'] as $prefix) {
                DB::table('products')
                    ->where('code', 'like', $prefix . '%')
                    ->update(['main_supplier_id' => $mapping['supplier_id']]);
            }
        }

        // Fallback for any product remaining with null supplier
        DB::table('products')
            ->whereNull('main_supplier_id')
            ->update(['main_supplier_id' => $suppNiaga]);

        // Populate supplier_prices if table exists and missing records
        if (Schema::hasTable('supplier_prices')) {
            $products = DB::table('products')
                ->whereNotNull('main_supplier_id')
                ->get(['id', 'main_supplier_id', 'purchase_unit_id', 'base_unit_id', 'default_purchase_price']);

            $existingProductIds = DB::table('supplier_prices')->pluck('product_id')->flip()->all();

            $priceRows = [];
            foreach ($products as $p) {
                if (! isset($existingProductIds[$p->id])) {
                    $priceRows[] = [
                        'supplier_id' => $p->main_supplier_id,
                        'product_id' => $p->id,
                        'unit_id' => $p->purchase_unit_id ?? $p->base_unit_id,
                        'price' => (float) ($p->default_purchase_price ?? 0),
                        'effective_from' => now()->toDateString(),
                        'notes' => 'Harga awal seeder / master produk',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if (! empty($priceRows)) {
                DB::table('supplier_prices')->insert($priceRows);
            }
        }
    }

    public function down(): void
    {
        // Safe reversible migration
    }
};
