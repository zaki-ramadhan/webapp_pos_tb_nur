<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryEntitySeeder extends Seeder
{
    public function run(): void
    {
        // Seed brands
        $brandId = DB::table('brands')->insertGetId([
            'code' => 'TGA',
            'name' => 'Tiga Roda',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed units
        $unitZakId = DB::table('units')->insertGetId([
            'code' => 'ZAK',
            'name' => 'Zak',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitBatangId = DB::table('units')->insertGetId([
            'code' => 'BTG',
            'name' => 'Batang',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitPailId = DB::table('units')->insertGetId([
            'code' => 'PAL',
            'name' => 'Pail',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitPcsId = DB::table('units')->insertGetId([
            'code' => 'PCS',
            'name' => 'Pcs',
            'precision' => 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed product categories
        $prodCatId = DB::table('product_categories')->insertGetId([
            'code' => 'MAT-BGN',
            'name' => 'Material Bangunan',
            'slug' => 'material-bangunan',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed products
        DB::table('products')->insert([
            [
                'category_id' => $prodCatId,
                'brand_id' => $brandId,
                'base_unit_id' => $unitZakId,
                'purchase_unit_id' => $unitZakId,
                'sales_unit_id' => $unitZakId,
                'code' => 'SMN-050',
                'barcode' => '8990001001',
                'name' => 'Semen Portland 50 Kg',
                'product_type' => 'stock',
                'minimum_stock' => 10,
                'default_purchase_price' => 62000,
                'default_sale_price' => 73000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => $prodCatId,
                'brand_id' => null,
                'base_unit_id' => $unitBatangId,
                'purchase_unit_id' => $unitBatangId,
                'sales_unit_id' => $unitBatangId,
                'code' => 'BSH-404',
                'barcode' => '8990001002',
                'name' => 'Besi Hollow 4x4',
                'product_type' => 'stock',
                'minimum_stock' => 20,
                'default_purchase_price' => 95000,
                'default_sale_price' => 125000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => $prodCatId,
                'brand_id' => null,
                'base_unit_id' => $unitPailId,
                'purchase_unit_id' => $unitPailId,
                'sales_unit_id' => $unitPailId,
                'code' => 'CAT-250',
                'barcode' => '8990001003',
                'name' => 'Cat Tembok Interior 25 Kg',
                'product_type' => 'stock',
                'minimum_stock' => 5,
                'default_purchase_price' => 220000,
                'default_sale_price' => 280000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => $prodCatId,
                'brand_id' => null,
                'base_unit_id' => $unitPcsId,
                'purchase_unit_id' => $unitPcsId,
                'sales_unit_id' => $unitPcsId,
                'code' => 'KUS-300',
                'barcode' => '8990001004',
                'name' => 'Kuas Cat 3 Inch',
                'product_type' => 'stock',
                'minimum_stock' => 30,
                'default_purchase_price' => 12000,
                'default_sale_price' => 18000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => $prodCatId,
                'brand_id' => null,
                'base_unit_id' => $unitPcsId,
                'purchase_unit_id' => $unitPcsId,
                'sales_unit_id' => $unitPcsId,
                'code' => 'PAK-500',
                'barcode' => '8990001005',
                'name' => 'Paku Kayu 5 Cm (1 Kg)',
                'product_type' => 'stock',
                'minimum_stock' => 15,
                'default_purchase_price' => 15000,
                'default_sale_price' => 22000,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
