<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryEntitySeeder extends Seeder
{
    public function run(): void
    {
        // Seed brands
        $getOrInsertBrand = function (string $code, string $name) {
            $existing = DB::table('brands')->where('code', $code)->first();
            if ($existing) return $existing->id;
            return DB::table('brands')->insertGetId(['code' => $code, 'name' => $name, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        };
        $bGresik   = $getOrInsertBrand('SGR', 'Semen Gresik');
        $bTigaRoda = $getOrInsertBrand('STR', 'Semen Tiga Roda');
        $bRucika   = $getOrInsertBrand('RCK', 'Rucika');
        $bAvian    = $getOrInsertBrand('AVN', 'Avian / Avitex');
        $bDulux    = $getOrInsertBrand('DLX', 'Dulux');
        $bOnda     = $getOrInsertBrand('OND', 'Onda');
        $bEterna   = $getOrInsertBrand('ETN', 'Eterna');
        $bPenguin  = $getOrInsertBrand('PNG', 'Penguin');
        $bTekiro   = $getOrInsertBrand('TKR', 'Tekiro');
        $bAqua     = $getOrInsertBrand('AQP', 'Aquaproof');

        // Seed units
        $getOrInsertUnit = function (string $code, string $name, int $precision = 0) {
            $existing = DB::table('units')->where('code', $code)->first();
            if ($existing) return $existing->id;
            return DB::table('units')->insertGetId(['code' => $code, 'name' => $name, 'precision' => $precision, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        };
        $uZak = $getOrInsertUnit('ZAK', 'Zak', 0);
        $uBtg = $getOrInsertUnit('BTG', 'Batang', 0);
        $uGln = $getOrInsertUnit('GLN', 'Galon', 0);
        $uLbr = $getOrInsertUnit('LBR', 'Lembar', 0);
        $uKg  = $getOrInsertUnit('KG',  'Kilogram', 0);
        $uBuh = $getOrInsertUnit('BUH', 'Buah', 0);
        $uRol = $getOrInsertUnit('ROL', 'Roll', 0);
        $uTub = $getOrInsertUnit('TUB', 'Tube', 0);
        $uPup = $getOrInsertUnit('PUP', 'Pick Up', 0);
        $uKlg = $getOrInsertUnit('KLG', 'Kaleng', 0);
        $uPkt = $getOrInsertUnit('PKT', 'Paket', 0);
        $uDus = $getOrInsertUnit('DUS', 'Dus / Box', 0);

        // Seed product categories
        $getOrInsertCat = function (string $code, string $name, string $slug) {
            $existing = DB::table('product_categories')->where('code', $code)->first();
            if ($existing) return $existing->id;
            return DB::table('product_categories')->insertGetId(['code' => $code, 'name' => $name, 'slug' => $slug, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        };
        $cUtama   = $getOrInsertCat('MAT-UTM', 'Bahan Bangunan Utama', 'bahan-bangunan-utama');
        $cBesi    = $getOrInsertCat('BES-STR', 'Besi & Struktur Baja', 'besi-struktur-baja');
        $cCat     = $getOrInsertCat('CAT-THN', 'Cat & Finishing', 'cat-finishing');
        $cPipa    = $getOrInsertCat('PIP-SAN', 'Perpipaan & Sanitasi', 'perpipaan-sanitasi');
        $cList    = $getOrInsertCat('LIS-PER', 'Kelistrikan & Alat Pertukangan', 'kelistrikan-pertukangan');
        $cAtap    = $getOrInsertCat('ATP-PLF', 'Atap, Seng & Plafon', 'atap-seng-plafon');
        $cKeramik = $getOrInsertCat('KRM-GRN', 'Keramik & Perekat', 'keramik-perekat');

        // Fetch seeded suppliers
        $suppliers = DB::table('suppliers')->get()->keyBy('code');
        $firstSupplierId = DB::table('suppliers')->value('id');
        $suppNiaga    = $suppliers->get('SUPP-001')?->id ?? $firstSupplierId;
        $suppSolusi   = $suppliers->get('SUPP-002')?->id ?? $firstSupplierId;
        $suppIndowarna= $suppliers->get('SUPP-003')?->id ?? $firstSupplierId;
        $suppMegaBaja = $suppliers->get('SUPP-004')?->id ?? $firstSupplierId;
        $suppGias     = $suppliers->get('SUPP-005')?->id ?? $firstSupplierId;
        $suppPasir    = $suppliers->get('SUPP-006')?->id ?? $firstSupplierId;
        $suppPropan   = $suppliers->get('SUPP-007')?->id ?? $firstSupplierId;
        $suppRkm      = $suppliers->get('SUPP-008')?->id ?? $firstSupplierId;

        // Seed 45+ Authentic products
        $products = [
            // 1. Bahan Bangunan Utama (Semen, Pasir, Bata, Kawat)
            ['category_id' => $cUtama, 'brand_id' => $bGresik,   'base_unit_id' => $uZak, 'main_supplier_id' => $suppNiaga,    'code' => 'SMN-050', 'barcode' => '8990001001', 'name' => 'Semen Gresik PPC 50kg', 'default_purchase_price' => 68000, 'default_sale_price' => 78000, 'minimum_stock' => 50, 'length' => 65.0, 'width' => 40.0, 'height' => 15.0, 'weight' => 50000],
            ['category_id' => $cUtama, 'brand_id' => $bTigaRoda, 'base_unit_id' => $uZak, 'main_supplier_id' => $suppNiaga,    'code' => 'SMN-040', 'barcode' => '8990001016', 'name' => 'Semen Tiga Roda 40kg', 'default_purchase_price' => 56000, 'default_sale_price' => 65000, 'minimum_stock' => 40, 'length' => 55.0, 'width' => 38.0, 'height' => 13.0, 'weight' => 40000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uPup, 'main_supplier_id' => $suppPasir,    'code' => 'PSR-001', 'barcode' => '8990001014', 'name' => 'Pasir Pasang Lumajang (Pick Up)', 'default_purchase_price' => 350000, 'default_sale_price' => 450000, 'minimum_stock' => 10, 'length' => 210.0, 'width' => 150.0, 'height' => 50.0, 'weight' => 1800000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uPup, 'main_supplier_id' => $suppPasir,    'code' => 'PSR-002', 'barcode' => '8990001017', 'name' => 'Pasir Cor Hitam Lumajang (Pick Up)', 'default_purchase_price' => 380000, 'default_sale_price' => 480000, 'minimum_stock' => 8, 'length' => 210.0, 'width' => 150.0, 'height' => 50.0, 'weight' => 1900000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uPup, 'main_supplier_id' => $suppPasir,    'code' => 'SPL-001', 'barcode' => '8990001018', 'name' => 'Batu Split Cor 2/3 (Pick Up)', 'default_purchase_price' => 420000, 'default_sale_price' => 520000, 'minimum_stock' => 5, 'length' => 210.0, 'width' => 150.0, 'height' => 50.0, 'weight' => 2000000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uBuh, 'main_supplier_id' => $suppPasir,    'code' => 'BTA-001', 'barcode' => '8990001013', 'name' => 'Batu Bata Merah Jumbo Pres', 'default_purchase_price' => 850, 'default_sale_price' => 1200, 'minimum_stock' => 1000, 'length' => 20.0, 'width' => 10.0, 'height' => 5.0, 'weight' => 1500],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uBuh, 'main_supplier_id' => $suppPasir,    'code' => 'BTK-001', 'barcode' => '8990001019', 'name' => 'Batako Semen Pres Super', 'default_purchase_price' => 3200, 'default_sale_price' => 4200, 'minimum_stock' => 300, 'length' => 36.0, 'width' => 10.0, 'height' => 18.0, 'weight' => 8500],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uKg,  'main_supplier_id' => $suppMegaBaja, 'code' => 'KWT-001', 'barcode' => '8990001012', 'name' => 'Kawat Bendrat / Kawat Ikat 1kg', 'default_purchase_price' => 18000, 'default_sale_price' => 25000, 'minimum_stock' => 25, 'length' => 20.0, 'width' => 20.0, 'height' => 5.0, 'weight' => 1000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppGias,     'code' => 'TPL-009', 'barcode' => '8990001005', 'name' => 'Triplek Meranti 9mm (122x244)', 'default_purchase_price' => 110000, 'default_sale_price' => 135000, 'minimum_stock' => 25, 'length' => 244.0, 'width' => 122.0, 'height' => 0.9, 'weight' => 15000],
            ['category_id' => $cUtama, 'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppGias,     'code' => 'TPL-012', 'barcode' => '8990001020', 'name' => 'Triplek Cor 12mm (122x244)', 'default_purchase_price' => 145000, 'default_sale_price' => 175000, 'minimum_stock' => 15, 'length' => 244.0, 'width' => 122.0, 'height' => 1.2, 'weight' => 20000],

            // 2. Besi & Baja (Besi Beton, Wiremesh, Baja Ringan, Spandek)
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'main_supplier_id' => $suppMegaBaja, 'code' => 'BES-008', 'barcode' => '8990001021', 'name' => 'Besi Beton Polos 8mm SNI', 'default_purchase_price' => 45000, 'default_sale_price' => 56000, 'minimum_stock' => 50, 'length' => 1200.0, 'width' => 0.8, 'height' => 0.8, 'weight' => 4740],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'main_supplier_id' => $suppMegaBaja, 'code' => 'BES-010', 'barcode' => '8990001004', 'name' => 'Besi Beton Polos 10mm SNI', 'default_purchase_price' => 72000, 'default_sale_price' => 88000, 'minimum_stock' => 40, 'length' => 1200.0, 'width' => 1.0, 'height' => 1.0, 'weight' => 7400],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'main_supplier_id' => $suppMegaBaja, 'code' => 'BES-012', 'barcode' => '8990001022', 'name' => 'Besi Beton Ulir 12mm SNI', 'default_purchase_price' => 105000, 'default_sale_price' => 128000, 'minimum_stock' => 30, 'length' => 1200.0, 'width' => 1.2, 'height' => 1.2, 'weight' => 10660],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'main_supplier_id' => $suppMegaBaja, 'code' => 'BJA-075', 'barcode' => '8990001023', 'name' => 'Baja Ringan Canal C75 0.75mm', 'default_purchase_price' => 78000, 'default_sale_price' => 95000, 'minimum_stock' => 60, 'length' => 600.0, 'width' => 7.5, 'height' => 3.5, 'weight' => 4500],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uBtg, 'main_supplier_id' => $suppMegaBaja, 'code' => 'RNG-045', 'barcode' => '8990001024', 'name' => 'Reng Baja Ringan 0.45mm (6m)', 'default_purchase_price' => 38000, 'default_sale_price' => 48000, 'minimum_stock' => 60, 'length' => 600.0, 'width' => 3.0, 'height' => 3.0, 'weight' => 1800],
            ['category_id' => $cBesi,  'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppMegaBaja, 'code' => 'WMH-006', 'barcode' => '8990001025', 'name' => 'Wiremesh M6 Roll (2.1x5.4m)', 'default_purchase_price' => 340000, 'default_sale_price' => 410000, 'minimum_stock' => 10, 'length' => 540.0, 'width' => 210.0, 'height' => 0.6, 'weight' => 24000],

            // 3. Atap & Plafon (Seng, Spandek, Asbes, Plafon)
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppGias,     'code' => 'SNG-020', 'barcode' => '8990001006', 'name' => 'Seng Gelombang Gajah 0.20', 'default_purchase_price' => 48000, 'default_sale_price' => 62000, 'minimum_stock' => 30, 'length' => 180.0, 'width' => 80.0, 'height' => 0.5, 'weight' => 2200],
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppGias,     'code' => 'SPD-030', 'barcode' => '8990001026', 'name' => 'Atap Spandek Galvalum 0.30mm (3m)', 'default_purchase_price' => 115000, 'default_sale_price' => 140000, 'minimum_stock' => 20, 'length' => 300.0, 'width' => 100.0, 'height' => 2.5, 'weight' => 7200],
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppGias,     'code' => 'ASB-180', 'barcode' => '8990001027', 'name' => 'Asbes Gelombang Jababes 180cm', 'default_purchase_price' => 52000, 'default_sale_price' => 66000, 'minimum_stock' => 25, 'length' => 180.0, 'width' => 105.0, 'height' => 3.0, 'weight' => 11000],
            ['category_id' => $cAtap,  'brand_id' => null,       'base_unit_id' => $uLbr, 'main_supplier_id' => $suppGias,     'code' => 'GYP-009', 'barcode' => '8990001028', 'name' => 'Gypsum Board Jayaboard 9mm', 'default_purchase_price' => 65000, 'default_sale_price' => 82000, 'minimum_stock' => 30, 'length' => 240.0, 'width' => 120.0, 'height' => 0.9, 'weight' => 15000],

            // 4. Perpipaan & Sanitasi (Pipa, Kran, Lem, Toren)
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'main_supplier_id' => $suppSolusi,   'code' => 'PIP-001', 'barcode' => '8990001029', 'name' => 'Pipa PVC Rucika AW 1/2 Inch (4m)', 'default_purchase_price' => 32000, 'default_sale_price' => 42000, 'minimum_stock' => 30, 'length' => 400.0, 'width' => 2.2, 'height' => 2.2, 'weight' => 1100],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'main_supplier_id' => $suppSolusi,   'code' => 'PIP-002', 'barcode' => '8990001030', 'name' => 'Pipa PVC Rucika AW 3/4 Inch (4m)', 'default_purchase_price' => 42000, 'default_sale_price' => 54000, 'minimum_stock' => 30, 'length' => 400.0, 'width' => 2.6, 'height' => 2.6, 'weight' => 1400],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'main_supplier_id' => $suppSolusi,   'code' => 'PIP-003', 'barcode' => '8990001002', 'name' => 'Pipa PVC Rucika AW 3 Inch (4m)', 'default_purchase_price' => 145000, 'default_sale_price' => 175000, 'minimum_stock' => 20, 'length' => 400.0, 'width' => 8.9, 'height' => 8.9, 'weight' => 5800],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uBtg, 'main_supplier_id' => $suppSolusi,   'code' => 'PIP-004', 'barcode' => '8990001031', 'name' => 'Pipa PVC Rucika AW 4 Inch (4m)', 'default_purchase_price' => 220000, 'default_sale_price' => 265000, 'minimum_stock' => 15, 'length' => 400.0, 'width' => 11.4, 'height' => 11.4, 'weight' => 8900],
            ['category_id' => $cPipa,  'brand_id' => $bOnda,     'base_unit_id' => $uBuh, 'main_supplier_id' => $suppSolusi,   'code' => 'KRN-001', 'barcode' => '8990001008', 'name' => 'Kran Air Onda 1/2 Inch Brass', 'default_purchase_price' => 32000, 'default_sale_price' => 45000, 'minimum_stock' => 15, 'length' => 12.0, 'width' => 8.0, 'height' => 4.0, 'weight' => 250],
            ['category_id' => $cPipa,  'brand_id' => $bOnda,     'base_unit_id' => $uBuh, 'main_supplier_id' => $suppSolusi,   'code' => 'STP-001', 'barcode' => '8990001032', 'name' => 'Stop Kran Ball Valve Onda 1/2"', 'default_purchase_price' => 28000, 'default_sale_price' => 38000, 'minimum_stock' => 15, 'length' => 9.0, 'width' => 6.0, 'height' => 4.0, 'weight' => 220],
            ['category_id' => $cPipa,  'brand_id' => $bRucika,   'base_unit_id' => $uTub, 'main_supplier_id' => $suppSolusi,   'code' => 'LEM-045', 'barcode' => '8990001011', 'name' => 'Lem Pipa PVC Isaroplas 45gr', 'default_purchase_price' => 8500, 'default_sale_price' => 13000, 'minimum_stock' => 40, 'length' => 14.0, 'width' => 4.0, 'height' => 2.5, 'weight' => 55],
            ['category_id' => $cPipa,  'brand_id' => $bPenguin,  'base_unit_id' => $uBuh, 'main_supplier_id' => $suppSolusi,   'code' => 'TRN-550', 'barcode' => '8990001033', 'name' => 'Toren Air Penguin TB 55 (550L)', 'default_purchase_price' => 1250000, 'default_sale_price' => 1480000, 'minimum_stock' => 2, 'length' => 83.0, 'width' => 83.0, 'height' => 118.0, 'weight' => 18000],

            // 5. Cat & Finishing (Cat Tembok, Dulux, Thinner, Kuas, Waterproofing)
            ['category_id' => $cCat,   'brand_id' => $bAvian,    'base_unit_id' => $uGln, 'main_supplier_id' => $suppIndowarna,'code' => 'CAT-005', 'barcode' => '8990001003', 'name' => 'Cat Tembok Avitex White 5kg', 'default_purchase_price' => 115000, 'default_sale_price' => 142000, 'minimum_stock' => 15, 'length' => 22.0, 'width' => 22.0, 'height' => 24.0, 'weight' => 5200],
            ['category_id' => $cCat,   'brand_id' => $bDulux,    'base_unit_id' => $uGln, 'main_supplier_id' => $suppIndowarna,'code' => 'CAT-DLX', 'barcode' => '8990001034', 'name' => 'Cat Dulux Weathershield 2.5L', 'default_purchase_price' => 235000, 'default_sale_price' => 275000, 'minimum_stock' => 10, 'length' => 18.0, 'width' => 18.0, 'height' => 20.0, 'weight' => 3500],
            ['category_id' => $cCat,   'brand_id' => $bAvian,    'base_unit_id' => $uKlg, 'main_supplier_id' => $suppIndowarna,'code' => 'CAT-KYU', 'barcode' => '8990001035', 'name' => 'Cat Kayu & Besi Avian 1L', 'default_purchase_price' => 62000, 'default_sale_price' => 76000, 'minimum_stock' => 20, 'length' => 12.0, 'width' => 12.0, 'height' => 14.0, 'weight' => 1100],
            ['category_id' => $cCat,   'brand_id' => $bAqua,     'base_unit_id' => $uGln, 'main_supplier_id' => $suppIndowarna,'code' => 'AQP-004', 'barcode' => '8990001036', 'name' => 'Cat Pelapis Aquaproof 4kg', 'default_purchase_price' => 195000, 'default_sale_price' => 235000, 'minimum_stock' => 12, 'length' => 20.0, 'width' => 20.0, 'height' => 22.0, 'weight' => 4200],
            ['category_id' => $cCat,   'brand_id' => $bAvian,    'base_unit_id' => $uKlg, 'main_supplier_id' => $suppIndowarna,'code' => 'THN-001', 'barcode' => '8990001015', 'name' => 'Thinner Super A High Gloss 1L', 'default_purchase_price' => 24000, 'default_sale_price' => 34000, 'minimum_stock' => 20, 'length' => 10.0, 'width' => 10.0, 'height' => 15.0, 'weight' => 900],
            ['category_id' => $cCat,   'brand_id' => $bEterna,   'base_unit_id' => $uBuh, 'main_supplier_id' => $suppRkm,      'code' => 'KUS-002', 'barcode' => '8990001037', 'name' => 'Kuas Cat Eterna 2 Inch', 'default_purchase_price' => 8500, 'default_sale_price' => 13000, 'minimum_stock' => 30, 'length' => 21.0, 'width' => 5.0, 'height' => 1.5, 'weight' => 60],
            ['category_id' => $cCat,   'brand_id' => $bEterna,   'base_unit_id' => $uBuh, 'main_supplier_id' => $suppRkm,      'code' => 'KUS-003', 'barcode' => '8990001009', 'name' => 'Kuas Cat Eterna 3 Inch', 'default_purchase_price' => 12000, 'default_sale_price' => 18000, 'minimum_stock' => 30, 'length' => 23.0, 'width' => 7.5, 'height' => 1.8, 'weight' => 90],
            ['category_id' => $cCat,   'brand_id' => $bEterna,   'base_unit_id' => $uBuh, 'main_supplier_id' => $suppRkm,      'code' => 'ROL-CAT', 'barcode' => '8990001038', 'name' => 'Roll Cat Tembok Eterna Set', 'default_purchase_price' => 24000, 'default_sale_price' => 35000, 'minimum_stock' => 20, 'length' => 32.0, 'width' => 24.0, 'height' => 7.0, 'weight' => 280],

            // 6. Kelistrikan & Alat Pertukangan (Paku, Kabel, Tekiro, Alat)
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uKg,  'main_supplier_id' => $suppMegaBaja, 'code' => 'PAK-050', 'barcode' => '8990001007', 'name' => 'Paku Kayu 2 Inch (5cm)', 'default_purchase_price' => 16000, 'default_sale_price' => 22000, 'minimum_stock' => 20, 'length' => 15.0, 'width' => 10.0, 'height' => 8.0, 'weight' => 1000],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uKg,  'main_supplier_id' => $suppMegaBaja, 'code' => 'PAK-SNG', 'barcode' => '8990001039', 'name' => 'Paku Payung Seng 1kg', 'default_purchase_price' => 26000, 'default_sale_price' => 34000, 'minimum_stock' => 15, 'length' => 15.0, 'width' => 12.0, 'height' => 8.0, 'weight' => 1000],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uKg,  'main_supplier_id' => $suppMegaBaja, 'code' => 'PAK-BTN', 'barcode' => '8990001040', 'name' => 'Paku Beton Putih 3 Inch (1kg)', 'default_purchase_price' => 32000, 'default_sale_price' => 42000, 'minimum_stock' => 15, 'length' => 15.0, 'width' => 10.0, 'height' => 8.0, 'weight' => 1000],
            ['category_id' => $cList,  'brand_id' => $bEterna,   'base_unit_id' => $uRol, 'main_supplier_id' => $suppRkm,      'code' => 'KBL-002', 'barcode' => '8990001010', 'name' => 'Kabel NYM Eterna 2x1.5mm (100m)', 'default_purchase_price' => 480000, 'default_sale_price' => 580000, 'minimum_stock' => 5, 'length' => 35.0, 'width' => 35.0, 'height' => 12.0, 'weight' => 9500],
            ['category_id' => $cList,  'brand_id' => $bTekiro,   'base_unit_id' => $uBuh, 'main_supplier_id' => $suppRkm,      'code' => 'MTR-005', 'barcode' => '8990001041', 'name' => 'Meteran Tekiro 5 Meter Rubber', 'default_purchase_price' => 32000, 'default_sale_price' => 45000, 'minimum_stock' => 10, 'length' => 8.0, 'width' => 7.5, 'height' => 4.0, 'weight' => 250],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uBuh, 'main_supplier_id' => $suppRkm,      'code' => 'SKP-001', 'barcode' => '8990001042', 'name' => 'Sekop Pasir Gagang Kayu', 'default_purchase_price' => 48000, 'default_sale_price' => 65000, 'minimum_stock' => 10, 'length' => 105.0, 'width' => 25.0, 'height' => 18.0, 'weight' => 1900],
            ['category_id' => $cList,  'brand_id' => null,       'base_unit_id' => $uBuh, 'main_supplier_id' => $suppRkm,      'code' => 'CGK-001', 'barcode' => '8990001043', 'name' => 'Cangkul Tanah Cap Buaya', 'default_purchase_price' => 55000, 'default_sale_price' => 75000, 'minimum_stock' => 10, 'length' => 85.0, 'width' => 20.0, 'height' => 15.0, 'weight' => 1800],

            // 7. Keramik & Perekat (Semen Mortar, Keramik)
            ['category_id' => $cKeramik, 'brand_id' => null,     'base_unit_id' => $uZak, 'main_supplier_id' => $suppRkm,      'code' => 'MTR-300', 'barcode' => '8990001044', 'name' => 'Semen Mortar MU-300 Perekat Bata', 'default_purchase_price' => 82000, 'default_sale_price' => 95000, 'minimum_stock' => 20, 'length' => 60.0, 'width' => 38.0, 'height' => 12.0, 'weight' => 40000],
            ['category_id' => $cKeramik, 'brand_id' => null,     'base_unit_id' => $uDus, 'main_supplier_id' => $suppRkm,      'code' => 'KRM-404', 'barcode' => '8990001045', 'name' => 'Keramik Polos Putih 40x40 (1m2)', 'default_purchase_price' => 48000, 'default_sale_price' => 58000, 'minimum_stock' => 30, 'length' => 40.0, 'width' => 40.0, 'height' => 6.0, 'weight' => 16500],
        ];

        $productIds = [];
        $supplierPriceRows = [];
        foreach ($products as $p) {
            $existing = DB::table('products')->where('code', $p['code'])->first();
            if ($existing) {
                DB::table('products')->where('id', $existing->id)->update(array_merge($p, [
                    'updated_at' => now(),
                ]));
                $id = $existing->id;
            } else {
                $id = DB::table('products')->insertGetId(array_merge($p, [
                    'product_type' => 'stock',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
            $productIds[$p['code']] = $id;

            if (isset($p['main_supplier_id'])) {
                $supplierPriceRows[] = [
                    'supplier_id' => $p['main_supplier_id'],
                    'product_id' => $id,
                    'unit_id' => $p['base_unit_id'],
                    'price' => (float) ($p['default_purchase_price'] ?? 0),
                    'effective_from' => now()->toDateString(),
                    'notes' => 'Harga awal seeder',
                ];
            }
        }

        // Seed Group / Bundel Product
        $existingGroup = DB::table('products')->where('code', 'BND-CAT01')->first();
        $groupData = [
            'category_id' => $cCat,
            'brand_id' => $bAvian,
            'base_unit_id' => $uPkt,
            'main_supplier_id' => $suppIndowarna,
            'code' => 'BND-CAT01',
            'barcode' => '8990002001',
            'name' => 'Paket Pengecatan Hemat (Cat Avitex + Kuas + Thinner)',
            'product_type' => 'group',
            'default_purchase_price' => 140000,
            'default_sale_price' => 185000,
            'minimum_stock' => 5,
            'length' => 30.0,
            'width' => 25.0,
            'height' => 28.0,
            'weight' => 6200,
            'is_active' => true,
            'updated_at' => now(),
        ];
        if ($existingGroup) {
            DB::table('products')->where('id', $existingGroup->id)->update($groupData);
            $groupProdId = $existingGroup->id;
        } else {
            $groupProdId = DB::table('products')->insertGetId(array_merge($groupData, [
                'created_at' => now(),
            ]));
        }

        $supplierPriceRows[] = [
            'supplier_id' => $suppIndowarna,
            'product_id' => $groupProdId,
            'unit_id' => $uPkt,
            'price' => 140000,
            'effective_from' => now()->toDateString(),
            'notes' => 'Harga awal seeder',
        ];

        if (DB::getSchemaBuilder()->hasTable('supplier_prices') && ! empty($supplierPriceRows)) {
            foreach ($supplierPriceRows as $sp) {
                DB::table('supplier_prices')->updateOrInsert(
                    [
                        'supplier_id' => $sp['supplier_id'],
                        'product_id' => $sp['product_id'],
                        'unit_id' => $sp['unit_id'],
                    ],
                    array_merge($sp, [
                        'updated_at' => now(),
                    ])
                );
            }
        }

        if (DB::getSchemaBuilder()->hasTable('product_group_items')) {
            $groupItems = [
                ['parent_product_id' => $groupProdId, 'child_product_id' => $productIds['CAT-005'], 'unit_id' => $uGln, 'quantity' => 1],
                ['parent_product_id' => $groupProdId, 'child_product_id' => $productIds['KUS-003'], 'unit_id' => $uBuh, 'quantity' => 1],
                ['parent_product_id' => $groupProdId, 'child_product_id' => $productIds['THN-001'], 'unit_id' => $uKlg, 'quantity' => 1],
            ];
            foreach ($groupItems as $gi) {
                DB::table('product_group_items')->updateOrInsert(
                    [
                        'parent_product_id' => $gi['parent_product_id'],
                        'child_product_id' => $gi['child_product_id'],
                    ],
                    array_merge($gi, [
                        'updated_at' => now(),
                    ])
                );
            }
        }

        if (DB::getSchemaBuilder()->hasTable('product_unit_conversions')) {
            $conversions = [
                [
                    'product_id' => $productIds['PAK-050'],
                    'unit_id' => $uDus,
                    'quantity' => 20,
                    'price' => 410000,
                ],
                [
                    'product_id' => $productIds['LEM-045'],
                    'unit_id' => $uDus,
                    'quantity' => 24,
                    'price' => 285000,
                ],
                [
                    'product_id' => $productIds['KUS-003'],
                    'unit_id' => $uDus,
                    'quantity' => 12,
                    'price' => 200000,
                ],
                [
                    'product_id' => $productIds['KRN-001'],
                    'unit_id' => $uDus,
                    'quantity' => 10,
                    'price' => 420000,
                ],
                [
                    'product_id' => $productIds['KWT-001'],
                    'unit_id' => $uRol,
                    'quantity' => 25,
                    'price' => 575000,
                ],
            ];
            foreach ($conversions as $conv) {
                DB::table('product_unit_conversions')->updateOrInsert(
                    [
                        'product_id' => $conv['product_id'],
                        'unit_id' => $conv['unit_id'],
                    ],
                    array_merge($conv, [
                        'updated_at' => now(),
                    ])
                );
            }
        }
    }
}
