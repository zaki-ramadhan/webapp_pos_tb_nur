<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryEntitySeeder extends Seeder
{
    public function run(): void
    {
        // Seed brands
        $bGresik = DB::table('brands')->insertGetId(['code' => 'SGR', 'name' => 'Semen Gresik', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bRucika = DB::table('brands')->insertGetId(['code' => 'RCK', 'name' => 'Rucika', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bAvian  = DB::table('brands')->insertGetId(['code' => 'AVN', 'name' => 'Avian', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bOnda   = DB::table('brands')->insertGetId(['code' => 'OND', 'name' => 'Onda', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bEterna = DB::table('brands')->insertGetId(['code' => 'ETN', 'name' => 'Eterna', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        // Seed units
        $uZak = DB::table('units')->insertGetId(['code' => 'ZAK', 'name' => 'Zak', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uBtg = DB::table('units')->insertGetId(['code' => 'BTG', 'name' => 'Batang', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uGln = DB::table('units')->insertGetId(['code' => 'GLN', 'name' => 'Galon', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uLbr = DB::table('units')->insertGetId(['code' => 'LBR', 'name' => 'Lembar', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uKg  = DB::table('units')->insertGetId(['code' => 'KG',  'name' => 'Kilogram', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uBuh = DB::table('units')->insertGetId(['code' => 'BUH', 'name' => 'Buah', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uRol = DB::table('units')->insertGetId(['code' => 'ROL', 'name' => 'Roll', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uTub = DB::table('units')->insertGetId(['code' => 'TUB', 'name' => 'Tube', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uPup = DB::table('units')->insertGetId(['code' => 'PUP', 'name' => 'Pick Up', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uKlg = DB::table('units')->insertGetId(['code' => 'KLG', 'name' => 'Kaleng', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $uPkt = DB::table('units')->insertGetId(['code' => 'PKT', 'name' => 'Paket', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        // Seed product categories
        $cUtama = DB::table('product_categories')->insertGetId(['code' => 'MAT-UTM', 'name' => 'Bahan Bangunan Utama', 'slug' => 'bahan-bangunan-utama', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cCat   = DB::table('product_categories')->insertGetId(['code' => 'CAT-THN', 'name' => 'Cat & Finishing', 'slug' => 'cat-finishing', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cPipa  = DB::table('product_categories')->insertGetId(['code' => 'PIP-SAN', 'name' => 'Perpipaan & Sanitasi', 'slug' => 'perpipaan-sanitasi', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cList  = DB::table('product_categories')->insertGetId(['code' => 'LIS-PER', 'name' => 'Kelistrikan & Pertukangan', 'slug' => 'kelistrikan-pertukangan', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        // Seed products (15 authentic building materials)
        $products = [
            ['category_id' => $cUtama, 'brand_id' => $bGresik, 'base_unit_id' => $uZak, 'code' => 'SMN-050', 'barcode' => '8990001001', 'name' => 'Semen Gresik PPC 50kg', 'default_purchase_price' => 68000, 'default_sale_price' => 78000, 'minimum_stock' => 50],
            ['category_id' => $cPipa,  'brand_id' => $bRucika, 'base_unit_id' => $uBtg, 'code' => 'PIP-003', 'barcode' => '8990001002', 'name' => 'Pipa PVC Rucika AW 3 Inch (4m)', 'default_purchase_price' => 145000, 'default_sale_price' => 175000, 'minimum_stock' => 20],
            ['category_id' => $cCat,   'brand_id' => $bAvian,  'base_unit_id' => $uGln, 'code' => 'CAT-005', 'barcode' => '8990001003', 'name' => 'Cat Tembok Avitex White 5kg', 'default_purchase_price' => 115000, 'default_sale_price' => 142000, 'minimum_stock' => 15],
            ['category_id' => $cUtama, 'brand_id' => null,     'base_unit_id' => $uBtg, 'code' => 'BES-010', 'barcode' => '8990001004', 'name' => 'Besi Beton Polos 10mm SNI', 'default_purchase_price' => 72000, 'default_sale_price' => 88000, 'minimum_stock' => 40],
            ['category_id' => $cUtama, 'brand_id' => null,     'base_unit_id' => $uLbr, 'code' => 'TPL-009', 'barcode' => '8990001005', 'name' => 'Triplek Meranti 9mm (122x244)', 'default_purchase_price' => 110000, 'default_sale_price' => 135000, 'minimum_stock' => 25],
            ['category_id' => $cUtama, 'brand_id' => null,     'base_unit_id' => $uLbr, 'code' => 'SNG-020', 'barcode' => '8990001006', 'name' => 'Seng Gelombang Gajah 0.20', 'default_purchase_price' => 48000, 'default_sale_price' => 62000, 'minimum_stock' => 30],
            ['category_id' => $cList,  'brand_id' => null,     'base_unit_id' => $uKg,  'code' => 'PAK-050', 'barcode' => '8990001007', 'name' => 'Paku Kayu 2 Inch (5cm)', 'default_purchase_price' => 16000, 'default_sale_price' => 22000, 'minimum_stock' => 20],
            ['category_id' => $cPipa,  'brand_id' => $bOnda,   'base_unit_id' => $uBuh, 'code' => 'KRN-001', 'barcode' => '8990001008', 'name' => 'Kran Air Onda 1/2 Inch Brass', 'default_purchase_price' => 32000, 'default_sale_price' => 45000, 'minimum_stock' => 15],
            ['category_id' => $cCat,   'brand_id' => $bEterna, 'base_unit_id' => $uBuh, 'code' => 'KUS-003', 'barcode' => '8990001009', 'name' => 'Kuas Cat Eterna 3 Inch', 'default_purchase_price' => 12000, 'default_sale_price' => 18000, 'minimum_stock' => 30],
            ['category_id' => $cList,  'brand_id' => $bEterna, 'base_unit_id' => $uRol, 'code' => 'KBL-002', 'barcode' => '8990001010', 'name' => 'Kabel NYM Eterna 2x1.5mm (100m)', 'default_purchase_price' => 480000, 'default_sale_price' => 580000, 'minimum_stock' => 5],
            ['category_id' => $cPipa,  'brand_id' => $bRucika, 'base_unit_id' => $uTub, 'code' => 'LEM-045', 'barcode' => '8990001011', 'name' => 'Lem Pipa PVC Isaroplas 45gr', 'default_purchase_price' => 8500, 'default_sale_price' => 13000, 'minimum_stock' => 40],
            ['category_id' => $cUtama, 'brand_id' => null,     'base_unit_id' => $uKg,  'code' => 'KWT-001', 'barcode' => '8990001012', 'name' => 'Kawat Bendrat / Kawat Ikat 1kg', 'default_purchase_price' => 18000, 'default_sale_price' => 25000, 'minimum_stock' => 25],
            ['category_id' => $cUtama, 'brand_id' => null,     'base_unit_id' => $uBuh, 'code' => 'BTA-001', 'barcode' => '8990001013', 'name' => 'Batu Bata Merah Jumbo Pres', 'default_purchase_price' => 850, 'default_sale_price' => 1200, 'minimum_stock' => 1000],
            ['category_id' => $cUtama, 'brand_id' => null,     'base_unit_id' => $uPup, 'code' => 'PSR-001', 'barcode' => '8990001014', 'name' => 'Pasir Pasang Lumajang (Pick Up)', 'default_purchase_price' => 350000, 'default_sale_price' => 450000, 'minimum_stock' => 10],
            ['category_id' => $cCat,   'brand_id' => $bAvian,  'base_unit_id' => $uKlg, 'code' => 'THN-001', 'barcode' => '8990001015', 'name' => 'Thinner Super A High Gloss 1L', 'default_purchase_price' => 24000, 'default_sale_price' => 34000, 'minimum_stock' => 20],
        ];

        $productIds = [];
        foreach ($products as $p) {
            $id = DB::table('products')->insertGetId(array_merge($p, [
                'purchase_unit_id' => $p['base_unit_id'],
                'sales_unit_id' => $p['base_unit_id'],
                'product_type' => 'stock',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
            $productIds[$p['code']] = $id;
        }

        // Seed Group / Bundel Product
        $groupProdId = DB::table('products')->insertGetId([
            'category_id' => $cCat,
            'brand_id' => $bAvian,
            'base_unit_id' => $uPkt,
            'purchase_unit_id' => $uPkt,
            'sales_unit_id' => $uPkt,
            'code' => 'BND-CAT01',
            'barcode' => '8990002001',
            'name' => 'Paket Pengecatan Hemat (Cat Avitex + Kuas + Thinner)',
            'product_type' => 'group',
            'default_purchase_price' => 140000,
            'default_sale_price' => 185000,
            'minimum_stock' => 5,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if (DB::getSchemaBuilder()->hasTable('product_group_items')) {
            DB::table('product_group_items')->insert([
                ['parent_product_id' => $groupProdId, 'child_product_id' => $productIds['CAT-005'], 'unit_id' => $uGln, 'quantity' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['parent_product_id' => $groupProdId, 'child_product_id' => $productIds['KUS-003'], 'unit_id' => $uBuh, 'quantity' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['parent_product_id' => $groupProdId, 'child_product_id' => $productIds['THN-001'], 'unit_id' => $uKlg, 'quantity' => 1, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
}
