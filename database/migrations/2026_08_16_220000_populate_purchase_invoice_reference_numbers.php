<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Safe data population for existing deployments without breaking migrate:fresh
        if (Schema::hasTable('suppliers') && DB::table('suppliers')->exists()) {
            $realSuppliers = [
                ['code' => 'SUPP-001', 'name' => 'PT Niaga Manunggal Perkasa', 'business_phone' => '085224744480', 'mobile_phone' => '085224744480', 'email' => 'sales@niagamanunggal.co.id', 'billing_address' => 'Jl. Raya Cirebon - Bandung KM 20, Palimanan, Cirebon'],
                ['code' => 'SUPP-002', 'name' => 'PT Solusi Inti Bersama', 'business_phone' => '081299887722', 'mobile_phone' => '081299887722', 'email' => 'cirebon@solusiintibersama.com', 'billing_address' => 'Jl. Raya Plered - Cirebon No. 45, Plered, Cirebon'],
                ['code' => 'SUPP-003', 'name' => 'PT Central Utama Indowarna', 'business_phone' => '02312520650', 'mobile_phone' => '081399887733', 'email' => 'depocirebon@cui.co.id', 'billing_address' => 'Jl. Ir. H. Juanda No. 88, Pilangsari, Kedawung, Cirebon'],
                ['code' => 'SUPP-004', 'name' => 'PT Mega Baja Palimanan', 'business_phone' => '081333388474', 'mobile_phone' => '081333388474', 'email' => 'palimanan@megabaja.co.id', 'billing_address' => 'Jl. DR. Setiabudi No. 319, Lungbenda, Palimanan, Cirebon'],
                ['code' => 'SUPP-005', 'name' => 'CV Grahaprana Irasentosa', 'business_phone' => '02318302111', 'mobile_phone' => '081799887755', 'email' => 'cirebon@gias.co.id', 'billing_address' => 'Komplek Pergudangan Royal Techno Park Blok B-12, Cirebon'],
                ['code' => 'SUPP-006', 'name' => 'CV Pasir Berkah Arjawinangun', 'business_phone' => '087712345678', 'mobile_phone' => '087712345678', 'email' => 'pasirberkah.arjawinangun@gmail.com', 'billing_address' => 'Jl. By Pass Arjawinangun No. 15, Arjawinangun, Cirebon'],
                ['code' => 'SUPP-007', 'name' => 'PT Propan Raya ICC Cirebon', 'business_phone' => '0231488921', 'mobile_phone' => '081234567890', 'email' => 'psc.cirebon@propanraya.com', 'billing_address' => 'Jl. Brigjen Dharsono No. 12, Sunyaragi, Cirebon'],
                ['code' => 'SUPP-008', 'name' => 'Toko RKM Plered Cirebon', 'business_phone' => '0231321456', 'mobile_phone' => '081987654321', 'email' => 'rkm.plered@rkm.co.id', 'billing_address' => 'Jl. Otto Iskandardinata No. 77, Tegalsari, Plered, Cirebon'],
            ];

            $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id') ?? 1;
            $suppCatId = DB::table('supplier_categories')->value('id') ?? 1;

            foreach ($realSuppliers as $supp) {
                $exists = DB::table('suppliers')->where('code', $supp['code'])->first();
                if ($exists) {
                    DB::table('suppliers')->where('id', $exists->id)->update([
                        'name' => $supp['name'],
                        'business_phone' => $supp['business_phone'],
                        'mobile_phone' => $supp['mobile_phone'],
                        'email' => $supp['email'],
                        'billing_address' => $supp['billing_address'],
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('suppliers')->insert(array_merge($supp, [
                        'category_id' => $suppCatId,
                        'currency_id' => $currencyId,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                }
            }
        }
    }

    public function down(): void
    {
    }
};
