<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('suppliers')) {
            $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id') ?? 1;
            $suppCatId = DB::table('supplier_categories')->value('id') ?? 1;

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

        if (Schema::hasTable('operation_documents')) {
            $suppliersMap = DB::table('suppliers')->pluck('id', 'code')->toArray();
            $s1 = $suppliersMap['SUPP-001'] ?? 1;
            $s2 = $suppliersMap['SUPP-002'] ?? 1;
            $s3 = $suppliersMap['SUPP-003'] ?? 1;
            $s4 = $suppliersMap['SUPP-004'] ?? 1;
            $s5 = $suppliersMap['SUPP-005'] ?? 1;
            $s6 = $suppliersMap['SUPP-006'] ?? 1;
            $s7 = $suppliersMap['SUPP-007'] ?? 1;
            $s8 = $suppliersMap['SUPP-008'] ?? 1;

            $supplierPool = [$s1, $s4, $s2, $s3, $s5, $s6, $s7, $s8];

            $docs = DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->orderBy('id', 'asc')
                ->get();

            $seq = 0;
            foreach ($docs as $doc) {
                $seq++;
                $date = $doc->entry_date ? \Carbon\Carbon::parse($doc->entry_date) : now();
                $year = (int) $date->format('Y');
                $m = (int) $date->format('m');

                $suppId = $supplierPool[($seq - 1) % count($supplierPool)];
                $supplierCode = DB::table('suppliers')->where('id', $suppId)->value('code') ?? 'SUPP-001';

                $supplierBillNo = match ($supplierCode) {
                    'SUPP-001' => sprintf('INV/NMP/%04d/%02d/%04d', $year, $m, 1000 + $seq),
                    'SUPP-002' => sprintf('SIB/INV/%04d-%02d%02d', $year, $m, $seq),
                    'SUPP-003' => sprintf('CUI/FAK/%02d/%04d/%03d', $m, $year, $seq),
                    'SUPP-004' => sprintf('MBP-INV-%04d%02d-%03d', $year, $m, $seq),
                    'SUPP-005' => sprintf('GIAS/PB/%04d/%02d/%03d', $year, $m, $seq),
                    'SUPP-006' => sprintf('PBA-NOTA-%04d%02d%02d', $year, $m, $seq),
                    'SUPP-007' => sprintf('PRI/INV/%04d/%02d/%03d', $year, $m, $seq),
                    'SUPP-008' => sprintf('RKM-INV-%02d%02d-%03d', (int) substr((string) $year, -2), $m, $seq),
                    default => sprintf('INV-SUP-%04d%02d-%03d', $year, $m, $seq),
                };

                DB::table('operation_documents')
                    ->where('id', $doc->id)
                    ->update([
                        'supplier_id' => $suppId,
                        'reference_number' => $supplierBillNo,
                    ]);
            }
        }
    }

    public function down(): void
    {
    }
};
