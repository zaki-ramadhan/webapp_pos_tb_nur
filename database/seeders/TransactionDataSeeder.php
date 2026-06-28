<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionDataSeeder extends Seeder
{
    public function run(): void
    {
        $branchId = DB::table('branches')->where('code', 'JKT-01')->value('id');
        $branchSbyId = DB::table('branches')->where('code', 'SBY-02')->value('id');

        $warehouseId = DB::table('warehouses')->where('code', 'WH-JKT')->value('id');
        $warehouseSbyId = DB::table('warehouses')->where('code', 'WH-SBY')->value('id');

        $deptId = DB::table('departments')->where('code', 'ACC')->value('id');

        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id');
        $paymentTermId = DB::table('payment_terms')->where('code', 'COD')->value('id');

        $accAssetId = DB::table('accounts')->where('code', '121.200-04')->value('id');
        $accAkmPenyId = DB::table('accounts')->where('code', '122.200-03')->value('id');
        $accBebanPenyId = DB::table('accounts')->where('code', '612.001-03')->value('id');
        $accBebanGajiId = DB::table('accounts')->where('code', '611.002-01')->value('id');
        $accKasId = DB::table('accounts')->where('code', '111.001-01')->value('id');

        $customerId = DB::table('customers')->where('code', 'CUST-001')->value('id');
        $supplierId = DB::table('suppliers')->where('code', 'SUPP-001')->value('id');

        $pSemen = DB::table('products')->where('code', 'SMN-050')->value('id');
        $pBesi = DB::table('products')->where('code', 'BSH-404')->value('id');
        $pCat = DB::table('products')->where('code', 'CAT-250')->value('id');
        $pKuas = DB::table('products')->where('code', 'KUS-300')->value('id');
        $pPaku = DB::table('products')->where('code', 'PAK-500')->value('id');

        $usersMap = DB::table('users')->pluck('id', 'email')->toArray();

        // Seed 15 sales invoices
        $salesPattern = [
            1 => [$pSemen => 10, $pBesi => 5],
            2 => [$pSemen => 15, $pBesi => 8, $pPaku => 2],
            3 => [$pSemen => 20, $pBesi => 12],
            4 => [$pSemen => 8, $pBesi => 4],
            5 => [$pSemen => 30, $pBesi => 15, $pPaku => 5],
            6 => [$pSemen => 12, $pBesi => 6],
            7 => [$pCat => 2, $pKuas => 2],
            8 => [$pCat => 3, $pKuas => 3, $pPaku => 1],
            9 => [$pCat => 1, $pKuas => 1],
            10 => [$pCat => 5, $pKuas => 4],
            11 => [$pSemen => 25, $pPaku => 3],
            12 => [$pBesi => 10, $pPaku => 4],
            13 => [$pCat => 2, $pPaku => 2],
            14 => [$pSemen => 5],
            15 => [$pKuas => 2],
        ];

        foreach ($salesPattern as $i => $items) {
            $docNo = 'SI.' . date('Y.m.d') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT);
            $totalAmount = 0;

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_invoice',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => $customerId,
                'currency_id' => $currencyId,
                'payment_term_id' => $paymentTermId,
                'document_number' => $docNo,
                'status' => 'Posted',
                'entry_date' => now()->subDays(15 - $i)->format('Y-m-d'),
                'subtotal' => 0,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($items as $productId => $qty) {
                $product = DB::table('products')->where('id', $productId)->first();
                $lineTotal = $product->default_sale_price * $qty;
                $totalAmount += $lineTotal;

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'sales_invoice',
                    'product_id' => $productId,
                    'unit_id' => $product->base_unit_id,
                    'warehouse_id' => $warehouseId,
                    'description' => $product->name,
                    'quantity' => $qty,
                    'unit_price' => $product->default_sale_price,
                    'total_amount' => $lineTotal,
                    'sort_order' => $productId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $isPaid = ($i % 2 === 0);
            $paidAmount = $isPaid ? $totalAmount : 0;
            $outstandingAmount = $isPaid ? 0 : $totalAmount;
            $entryDate = now()->subDays(15 - $i)->format('Y-m-d');
            $dueDate = $isPaid ? null : date('Y-m-d', strtotime($entryDate . ' + 30 days'));

            DB::table('operation_documents')->where('id', $docId)->update([
                'subtotal' => $totalAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'outstanding_amount' => $outstandingAmount,
                'due_date' => $dueDate,
            ]);
        }

        // Set responsible user for sales invoices
        $salesInvoices = DB::table('operation_documents')
            ->where('document_type', 'sales_invoice')
            ->get();

        foreach ($salesInvoices as $index => $si) {
            $userEmail = ($index % 2 === 0) ? 'andi@tbnur.com' : 'rudi@tbnur.com';
            if (isset($usersMap[$userEmail])) {
                DB::table('operation_documents')
                    ->where('id', $si->id)
                    ->update(['responsible_user_id' => $usersMap[$userEmail]]);
            }
        }

        // Seed budget & payroll entries
        DB::table('operation_documents')->insert([
            [
                'document_type' => 'budget',
                'branch_id' => $branchId,
                'department_id' => $deptId,
                'primary_account_id' => $accBebanGajiId,
                'secondary_account_id' => null,
                'document_number' => 'BGT.2026.00001',
                'status' => 'Posted',
                'entry_date' => '2026-04-01',
                'total_amount' => 50000000.00,
                'notes' => 'Anggaran Biaya Gaji Q2 2026',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'document_type' => 'payroll_entry',
                'branch_id' => $branchId,
                'department_id' => $deptId,
                'primary_account_id' => $accBebanGajiId,
                'secondary_account_id' => $accKasId,
                'document_number' => 'PAY.2026.04001',
                'status' => 'Posted',
                'entry_date' => '2026-04-30',
                'total_amount' => 45000000.00,
                'notes' => 'Gaji Karyawan Bulan April 2026',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed fixed assets categories & taxes
        $assetCatId = DB::table('asset_categories')->insertGetId([
            'code' => 'OFF-EQP',
            'name' => 'Peralatan Kantor',
            'depreciation_method' => 'Metode Garis Lurus',
            'asset_life_months' => 48,
            'depreciation_rate' => 25.0,
            'asset_account_id' => $accAssetId,
            'accumulated_depreciation_account_id' => $accAkmPenyId,
            'depreciation_expense_account_id' => $accBebanPenyId,
            'notes' => 'Kategori untuk Peralatan Kantor',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assetTaxCatId = DB::table('asset_tax_categories')->insertGetId([
            'code' => 'TAX-G1',
            'name' => 'Gol 1 [Garis Lurus]',
            'depreciation_method' => 'Metode Garis Lurus',
            'asset_life_months' => 48,
            'depreciation_rate' => 25.0,
            'notes' => 'Pajak Golongan 1',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assetId = DB::table('fixed_assets')->insertGetId([
            'asset_category_id' => $assetCatId,
            'asset_tax_category_id' => $assetTaxCatId,
            'branch_id' => $branchId,
            'department_id' => $deptId,
            'asset_account_id' => $accAssetId,
            'accumulated_depreciation_account_id' => $accAkmPenyId,
            'depreciation_expense_account_id' => $accBebanPenyId,
            'code' => '0502009',
            'name' => 'Komputer 09',
            'purchase_date' => '2016-03-17',
            'usage_date' => '2016-03-17',
            'depreciation_method' => 'Metode Garis Lurus',
            'quantity' => 1,
            'asset_life_years' => 4,
            'asset_life_months' => 0,
            'depreciation_ratio' => 25.0,
            'residual_value' => 0,
            'acquisition_cost' => 7350000,
            'book_value' => 5818750,
            'tax_enabled' => true,
            'initial_location_name' => 'SURABAYA',
            'initial_location_address' => 'Gedung Pawitra Lt 2 NO. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
            'notes' => 'Aset Kantor Surabaya',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('fixed_asset_expenses')->insert([
            'fixed_asset_id' => $assetId,
            'account_id' => $accAssetId,
            'code' => '300001',
            'description' => 'Equitas Saldo Awal',
            'expense_date' => '2016-03-17',
            'amount' => 7350000,
            'notes' => 'Initial balance',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('fixed_asset_locations')->insert([
            'fixed_asset_id' => $assetId,
            'location_name' => 'SURABAYA',
            'location_address' => 'Gedung Pawitra Lt 2 NO. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
            'quantity' => 1,
            'is_current' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed asset change & disposal documents
        DB::table('operation_documents')->insert([
            [
                'document_type' => 'asset_change',
                'branch_id' => $branchId,
                'warehouse_id' => null,
                'customer_id' => null,
                'currency_id' => null,
                'payment_term_id' => null,
                'document_number' => 'AST-CHG-0001',
                'status' => 'Posted',
                'entry_date' => '2026-04-10',
                'total_amount' => 0,
                'notes' => 'Perubahan nilai sisa aset tetap',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'document_type' => 'asset_disposal',
                'branch_id' => $branchId,
                'warehouse_id' => null,
                'customer_id' => null,
                'currency_id' => null,
                'payment_term_id' => null,
                'document_number' => 'AST-DSP-0001',
                'status' => 'Posted',
                'entry_date' => '2026-04-15',
                'total_amount' => 1500000,
                'notes' => 'Disposisi printer rusak',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed 10 purchase invoices
        for ($i = 1; $i <= 10; $i++) {
            $totalVal = rand(5000000, 25000000);
            $isPaid = ($i % 2 === 0);
            $paidAmount = $isPaid ? $totalVal : 0;
            $outstandingAmount = $isPaid ? 0 : $totalVal;
            $entryDate = now()->subDays(15 - $i)->format('Y-m-d');
            $dueDate = $isPaid ? null : date('Y-m-d', strtotime($entryDate . ' + 30 days'));

            DB::table('operation_documents')->insert([
                'document_type' => 'purchase_invoice',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'supplier_id' => $supplierId,
                'currency_id' => $currencyId,
                'payment_term_id' => $paymentTermId,
                'document_number' => 'PI.' . date('Y.m.d') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'due_date' => $dueDate,
                'subtotal' => $totalVal,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => $totalVal,
                'paid_amount' => $paidAmount,
                'outstanding_amount' => $outstandingAmount,
                'is_closed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed 8 expense entries
        for ($i = 1; $i <= 8; $i++) {
            $totalVal = rand(1000000, 5000000);
            $entryDate = now()->subDays(10 - $i)->format('Y-m-d');

            DB::table('operation_documents')->insert([
                'document_type' => 'expense_entry',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'currency_id' => $currencyId,
                'payment_term_id' => $paymentTermId,
                'document_number' => 'EXP.' . date('Y.m.d') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => $totalVal,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => $totalVal,
                'paid_amount' => $totalVal,
                'outstanding_amount' => 0,
                'is_closed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed 6 sales orders
        for ($i = 1; $i <= 6; $i++) {
            $totalVal = rand(3000000, 15000000);
            $status = ($i <= 3) ? 'Draft' : 'Posted';
            $entryDate = now()->subDays(10 - $i)->format('Y-m-d');
            $dueDate = date('Y-m-d', strtotime($entryDate . ' + ' . ($i * 2 - 5) . ' days'));

            DB::table('operation_documents')->insert([
                'document_type' => 'sales_order',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => $customerId,
                'currency_id' => $currencyId,
                'payment_term_id' => $paymentTermId,
                'document_number' => 'SO.' . date('Y.m.d') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => $status,
                'entry_date' => $entryDate,
                'due_date' => $dueDate,
                'subtotal' => $totalVal,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => $totalVal,
                'paid_amount' => 0,
                'outstanding_amount' => $totalVal,
                'is_closed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
