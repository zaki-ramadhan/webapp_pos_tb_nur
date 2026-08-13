<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryEntitySeeder extends Seeder
{
    public function run(): void
    {
        // Seed brands
        $bGresik   = DB::table('brands')->insertGetId(['code' => 'SGR', 'name' => 'Semen Gresik', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bTigaRoda = DB::table('brands')->insertGetId(['code' => 'STR', 'name' => 'Semen Tiga Roda', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bRucika   = DB::table('brands')->insertGetId(['code' => 'RCK', 'name' => 'Rucika', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bAvian    = DB::table('brands')->insertGetId(['code' => 'AVN', 'name' => 'Avian / Avitex', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bDulux    = DB::table('brands')->insertGetId(['code' => 'DLX', 'name' => 'Dulux', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bOnda     = DB::table('brands')->insertGetId(['code' => 'OND', 'name' => 'Onda', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bEterna   = DB::table('brands')->insertGetId(['code' => 'ETN', 'name' => 'Eterna', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bPenguin  = DB::table('brands')->insertGetId(['code' => 'PNG', 'name' => 'Penguin', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bTekiro   = DB::table('brands')->insertGetId(['code' => 'TKR', 'name' => 'Tekiro', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $bAqua     = DB::table('brands')->insertGetId(['code' => 'AQP', 'name' => 'Aquaproof', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

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
        $uDus = DB::table('units')->insertGetId(['code' => 'DUS', 'name' => 'Dus / Box', 'precision' => 0, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        // Seed product categories
        $cUtama   = DB::table('product_categories')->insertGetId(['code' => 'MAT-UTM', 'name' => 'Bahan Bangunan Utama', 'slug' => 'bahan-bangunan-utama', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cBesi    = DB::table('product_categories')->insertGetId(['code' => 'BES-STR', 'name' => 'Besi & Struktur Baja', 'slug' => 'besi-struktur-baja', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cCat     = DB::table('product_categories')->insertGetId(['code' => 'CAT-THN', 'name' => 'Cat & Finishing', 'slug' => 'cat-finishing', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cPipa    = DB::table('product_categories')->insertGetId(['code' => 'PIP-SAN', 'name' => 'Perpipaan & Sanitasi', 'slug' => 'perpipaan-sanitasi', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cList    = DB::table('product_categories')->insertGetId(['code' => 'LIS-PER', 'name' => 'Kelistrikan & Alat Pertukangan', 'slug' => 'kelistrikan-pertukangan', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cAtap    = DB::table('product_categories')->insertGetId(['code' => 'ATP-PLF', 'name' => 'Atap, Seng & Plafon', 'slug' => 'atap-seng-plafon', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $cKeramik = DB::table('product_categories')->insertGetId(['code' => 'KRM-GRN', 'name' => 'Keramik & Perekat', 'slug' => 'keramik-perekat', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);

        // Seed 45+ Authentic products
        $products = [
            // 1. Bahan Bangunan Utama (Semen, Pasir, Bata, Kawat)
            ['category_id' => $cUtama, 'brand_id' => $bGresik,   'base_unit_id' => $uZak, 'code' => 'SMN-050', 'barcode' => '8990001001', 'name' => 'Semen Gresik PPC 50kg', 'default_purchase_price' => 68000, 'default_sale_price' => 78000, 'minimum_stock' => 50],
            ['category_id' => $cUtama, 'brand_id' => $bTigaRoda, 'base_unit_id' => $uZak, 'code' => 'SMN-040', 'barcode' => '8990001016', 'name' => 'Semen Tiga Roda 40kg', 'default_purchase_price' => 56000, 'default_sale_price' => 65000, 'minimum_stock' => 40],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uPup, 'code' => 'PSR-001', 'barcode' => '8990001014', 'name' => 'Pasir Pasang Lumajang (Pick Up)', 'default_purchase_price' => 350000, 'default_sale_price' => 450000, 'minimum_stock' => 10],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uPup, 'code' => 'PSR-002', 'barcode' => '8990001017', 'name' => 'Pasir Cor Hitam Lumajang (Pick Up)', 'default_purchase_price' => 380000, 'default_sale_price' => 480000, 'minimum_stock' => 8],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uPup, 'code' => 'SPL-001', 'barcode' => '8990001018', 'name' => 'Batu Split Cor 2/3 (Pick Up)', 'default_purchase_price' => 420000, 'default_sale_price' => 520000, 'minimum_stock' => 5],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uBuh, 'code' => 'BTA-001', 'barcode' => '8990001013', 'name' => 'Batu Bata Merah Jumbo Pres', 'default_purchase_price' => 850, 'default_sale_price' => 1200, 'minimum_stock' => 1000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uBuh, 'code' => 'BTK-001', 'barcode' => '8990001019', 'name' => 'Batako Semen Pres Super', 'default_purchase_price' => 3200, 'default_sale_price' => 4200, 'minimum_stock' => 300],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uKg,  'code' => 'KWT-001', 'barcode' => '8990001012', 'name' => 'Kawat Bendrat / Kawat Ikat 1kg', 'default_purchase_price' => 18000, 'default_sale_price' => 25000, 'minimum_stock' => 25],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'TPL-009', 'barcode' => '8990001005', 'name' => 'Triplek Meranti 9mm (122x244)', 'default_purchase_price' => 110000, 'default_sale_price' => 135000, 'minimum_stock' => 25],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'TPL-012', 'barcode' => '8990001020', 'name' => 'Triplek Cor 12mm (122x244)', 'default_purchase_price' => 145000, 'default_sale_price' => 175000, 'minimum_stock' => 15],

            // 2. Besi & Baja (Besi Beton, Wiremesh, Baja Ringan, Spandek)
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'code' => 'BES-008', 'barcode' => '8990001021', 'name' => 'Besi Beton Polos 8mm SNI', 'default_purchase_price' => 45000, 'default_sale_price' => 56000, 'minimum_stock' => 50],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'code' => 'BES-010', 'barcode' => '8990001004', 'name' => 'Besi Beton Polos 10mm SNI', 'default_purchase_price' => 72000, 'default_sale_price' => 88000, 'minimum_stock' => 40],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'code' => 'BES-012', 'barcode' => '8990001022', 'name' => 'Besi Beton Ulir 12mm SNI', 'default_purchase_price' => 105000, 'default_sale_price' => 128000, 'minimum_stock' => 30],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'code' => 'BJA-075', 'barcode' => '8990001023', 'name' => 'Baja Ringan Canal C75 0.75mm', 'default_purchase_price' => 78000, 'default_sale_price' => 95000, 'minimum_stock' => 60],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'code' => 'RNG-045', 'barcode' => '8990001024', 'name' => 'Reng Baja Ringan 0.45mm (6m)', 'default_purchase_price' => 38000, 'default_sale_price' => 48000, 'minimum_stock' => 60],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'WMH-006', 'barcode' => '8990001025', 'name' => 'Wiremesh M6 Roll (2.1x5.4m)', 'default_purchase_price' => 340000, 'default_sale_price' => 410000, 'minimum_stock' => 10],

            // 3. Atap & Plafon (Seng, Spandek, Asbes, Plafon)
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'SNG-020', 'barcode' => '8990001006', 'name' => 'Seng Gelombang Gajah 0.20', 'default_purchase_price' => 48000, 'default_sale_price' => 62000, 'minimum_stock' => 30],
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'SPD-030', 'barcode' => '8990001026', 'name' => 'Atap Spandek Galvalum 0.30mm (3m)', 'default_purchase_price' => 115000, 'default_sale_price' => 140000, 'minimum_stock' => 20],
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'ASB-180', 'barcode' => '8990001027', 'name' => 'Asbes Gelombang Jababes 180cm', 'default_purchase_price' => 52000, 'default_sale_price' => 66000, 'minimum_stock' => 25],
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'code' => 'GYP-009', 'barcode' => '8990001028', 'name' => 'Gypsum Board Jayaboard 9mm', 'default_purchase_price' => 65000, 'default_sale_price' => 82000, 'minimum_stock' => 30],

            // 4. Perpipaan & Sanitasi (Pipa, Kran, Lem, Toren)
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'code' => 'PIP-001', 'barcode' => '8990001029', 'name' => 'Pipa PVC Rucika AW 1/2 Inch (4m)', 'default_purchase_price' => 32000, 'default_sale_price' => 42000, 'minimum_stock' => 30],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'code' => 'PIP-002', 'barcode' => '8990001030', 'name' => 'Pipa PVC Rucika AW 3/4 Inch (4m)', 'default_purchase_price' => 42000, 'default_sale_price' => 54000, 'minimum_stock' => 30],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'code' => 'PIP-003', 'barcode' => '8990001002', 'name' => 'Pipa PVC Rucika AW 3 Inch (4m)', 'default_purchase_price' => 145000, 'default_sale_price' => 175000, 'minimum_stock' => 20],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'code' => 'PIP-004', 'barcode' => '8990001031', 'name' => 'Pipa PVC Rucika AW 4 Inch (4m)', 'default_purchase_price' => 220000, 'default_sale_price' => 265000, 'minimum_stock' => 15],
            ['category_id' => $cPipa,  'brand_id' => $bOnda,     'base_unit_id' => $uBuh, 'code' => 'KRN-001', 'barcode' => '8990001008', 'name' => 'Kran Air Onda 1/2 Inch Brass', 'default_purchase_price' => 32000, 'default_sale_price' => 45000, 'minimum_stock' => 15],
            ['category_id' => $cPipa,  'brand_id' => $bOnda,     'base_unit_id' => $uBuh, 'code' => 'STP-001', 'barcode' => '8990001032', 'name' => 'Stop Kran Ball Valve Onda 1/2"', 'default_purchase_price' => 28000, 'default_sale_price' => 38000, 'minimum_stock' => 15],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uTub, 'code' => 'LEM-045', 'barcode' => '8990001011', 'name' => 'Lem Pipa PVC Isaroplas 45gr', 'default_purchase_price' => 8500, 'default_sale_price' => 13000, 'minimum_stock' => 40],
            ['category_id' => $cPipa,  'brand_id' => $bPenguin,  'base_unit_id' => $uBuh, 'code' => 'TRN-550', 'barcode' => '8990001033', 'name' => 'Toren Air Penguin TB 55 (550L)', 'default_purchase_price' => 1250000, 'default_sale_price' => 1480000, 'minimum_stock' => 2],

            // 5. Cat & Finishing (Cat Tembok, Dulux, Thinner, Kuas, Waterproofing)
            ['category_id' => $cCat,   'brand_id' => $bAvian,    'base_unit_id' => $uGln, 'code' => 'CAT-005', 'barcode' => '8990001003', 'name' => 'Cat Tembok Avitex White 5kg', 'default_purchase_price' => 115000, 'default_sale_price' => 142000, 'minimum_stock' => 15],
            ['category_id' => $cCat,   'brand_id' => $bDulux,    'base_unit_id' => $uGln, 'code' => 'CAT-DLX', 'barcode' => '8990001034', 'name' => 'Cat Dulux Weathershield 2.5L', 'default_purchase_price' => 235000, 'default_sale_price' => 275000, 'minimum_stock' => 10],
            ['category_id' => $cCat,   'brand_id' => $bAvian,    'base_unit_id' => $uKlg, 'code' => 'CAT-KYU', 'barcode' => '8990001035', 'name' => 'Cat Kayu & Besi Avian 1L', 'default_purchase_price' => 62000, 'default_sale_price' => 76000, 'minimum_stock' => 20],
            ['category_id' => $cCat,   'brand_id' => $bAqua,     'base_unit_id' => $uGln, 'code' => 'AQP-004', 'barcode' => '8990001036', 'name' => 'Cat Pelapis Aquaproof 4kg', 'default_purchase_price' => 195000, 'default_sale_price' => 235000, 'minimum_stock' => 12],
            ['category_id' => $cCat,   'brand_id' => $bAvian,    'base_unit_id' => $uKlg, 'code' => 'THN-001', 'barcode' => '8990001015', 'name' => 'Thinner Super A High Gloss 1L', 'default_purchase_price' => 24000, 'default_sale_price' => 34000, 'minimum_stock' => 20],
            ['category_id' => $cCat,   'brand_id' => $bEterna,   'base_unit_id' => $uBuh, 'code' => 'KUS-002', 'barcode' => '8990001037', 'name' => 'Kuas Cat Eterna 2 Inch', 'default_purchase_price' => 8500, 'default_sale_price' => 13000, 'minimum_stock' => 30],
            ['category_id' => $cCat,   'brand_id' => $bEterna,   'base_unit_id' => $uBuh, 'code' => 'KUS-003', 'barcode' => '8990001009', 'name' => 'Kuas Cat Eterna 3 Inch', 'default_purchase_price' => 12000, 'default_sale_price' => 18000, 'minimum_stock' => 30],
            ['category_id' => $cCat,   'brand_id' => $bEterna,   'base_unit_id' => $uBuh, 'code' => 'ROL-CAT', 'barcode' => '8990001038', 'name' => 'Roll Cat Tembok Eterna Set', 'default_purchase_price' => 24000, 'default_sale_price' => 35000, 'minimum_stock' => 20],

            // 6. Kelistrikan & Alat Pertukangan (Paku, Kabel, Tekiro, Alat)
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uKg,  'code' => 'PAK-050', 'barcode' => '8990001007', 'name' => 'Paku Kayu 2 Inch (5cm)', 'default_purchase_price' => 16000, 'default_sale_price' => 22000, 'minimum_stock' => 20],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uKg,  'code' => 'PAK-SNG', 'barcode' => '8990001039', 'name' => 'Paku Payung Seng 1kg', 'default_purchase_price' => 26000, 'default_sale_price' => 34000, 'minimum_stock' => 15],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uKg,  'code' => 'PAK-BTN', 'barcode' => '8990001040', 'name' => 'Paku Beton Putih 3 Inch (1kg)', 'default_purchase_price' => 32000, 'default_sale_price' => 42000, 'minimum_stock' => 15],
            ['category_id' => $cList,  'brand_id' => $bEterna,   'base_unit_id' => $uRol, 'code' => 'KBL-002', 'barcode' => '8990001010', 'name' => 'Kabel NYM Eterna 2x1.5mm (100m)', 'default_purchase_price' => 480000, 'default_sale_price' => 580000, 'minimum_stock' => 5],
            ['category_id' => $cList,  'brand_id' => $bTekiro,   'base_unit_id' => $uBuh, 'code' => 'MTR-005', 'barcode' => '8990001041', 'name' => 'Meteran Tekiro 5 Meter Rubber', 'default_purchase_price' => 32000, 'default_sale_price' => 45000, 'minimum_stock' => 10],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uBuh, 'code' => 'SKP-001', 'barcode' => '8990001042', 'name' => 'Sekop Pasir Gagang Kayu', 'default_purchase_price' => 48000, 'default_sale_price' => 65000, 'minimum_stock' => 10],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uBuh, 'code' => 'CGK-001', 'barcode' => '8990001043', 'name' => 'Cangkul Tanah Cap Buaya', 'default_purchase_price' => 55000, 'default_sale_price' => 75000, 'minimum_stock' => 10],

            // 7. Keramik & Perekat (Semen Mortar, Keramik)
            ['category_id' => $cKeramik, 'brand_id' => null,     'base_unit_id' => $uZak, 'code' => 'MTR-300', 'barcode' => '8990001044', 'name' => 'Semen Mortar MU-300 Perekat Bata', 'default_purchase_price' => 82000, 'default_sale_price' => 95000, 'minimum_stock' => 20],
            ['category_id' => $cKeramik, 'brand_id' => null,     'base_unit_id' => $uDus, 'code' => 'KRM-404', 'barcode' => '8990001045', 'name' => 'Keramik Polos Putih 40x40 (1m2)', 'default_purchase_price' => 48000, 'default_sale_price' => 58000, 'minimum_stock' => 30],
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
