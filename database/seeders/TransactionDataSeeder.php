<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionDataSeeder extends Seeder
{
    public function run(): void
    {
        $branchId = DB::table('branches')->first()->id ?? 1;
        $warehouseId = DB::table('warehouses')->first()->id ?? 1;
        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id') ?? 1;

        $accKasKecil  = DB::table('accounts')->where('code', '110101')->value('id') ?? 1;
        $accBankBCA   = DB::table('accounts')->where('code', '110102')->value('id') ?? $accKasKecil;
        $accBankMnd   = DB::table('accounts')->where('code', '110103')->value('id') ?? $accKasKecil;

        $customersMap = DB::table('customers')->pluck('id', 'code')->toArray();
        $suppliersMap = DB::table('suppliers')->pluck('id', 'code')->toArray();
        $productsMap = DB::table('products')->pluck('id', 'code')->toArray();
        $usersMap = DB::table('users')->pluck('id', 'email')->toArray();

        $c1 = $customersMap['CUST-001'] ?? 1;
        $c2 = $customersMap['CUST-002'] ?? 1;
        $c3 = $customersMap['CUST-003'] ?? 1;
        $c4 = $customersMap['CUST-004'] ?? 1;
        $c5 = $customersMap['CUST-005'] ?? 1;

        $s1 = $suppliersMap['SUPP-001'] ?? 1;
        $s2 = $suppliersMap['SUPP-002'] ?? 1;
        $s3 = $suppliersMap['SUPP-003'] ?? 1;
        $s4 = $suppliersMap['SUPP-004'] ?? 1;
        $s5 = $suppliersMap['SUPP-005'] ?? 1;

        $pSemen  = $productsMap['SMN-050'] ?? 1;
        $pPipa   = $productsMap['PIP-003'] ?? 2;
        $pCat    = $productsMap['CAT-005'] ?? 3;
        $pBesi   = $productsMap['BES-010'] ?? 4;
        $pTpl    = $productsMap['TPL-009'] ?? 5;
        $pSng    = $productsMap['SNG-020'] ?? 6;
        $pPaku   = $productsMap['PAK-050'] ?? 7;
        $pKran   = $productsMap['KRN-001'] ?? 8;
        $pKuas   = $productsMap['KUS-003'] ?? 9;
        $pKabel  = $productsMap['KBL-002'] ?? 10;
        $pLem    = $productsMap['LEM-045'] ?? 11;
        $pKawat  = $productsMap['KWT-001'] ?? 12;
        $pBata   = $productsMap['BTA-001'] ?? 13;
        $pPasir  = $productsMap['PSR-001'] ?? 14;
        $pThn    = $productsMap['THN-001'] ?? 15;

        $userAdminId = $usersMap['piscokpiscok2610@gmail.com'] ?? 1;
        $userKasirId = $usersMap['ahmad.fauzi.tb@gmail.com'] ?? $userAdminId;

        // 1. Seed Inventory Batches FIFO for all products
        DB::table('inventory_batches')->truncate();
        $allProducts = DB::table('products')->get();
        foreach ($allProducts as $p) {
            // Set 2 products to have lower stock than minimum stock to populate the Minimum Stock / Restock Required tab!
            $remaining = 420;
            if ($p->code === 'BTA-001') {
                $remaining = 150; // Minimum stock is 1000 -> Restock needed!
            } elseif ($p->code === 'KBL-002') {
                $remaining = 2;   // Minimum stock is 5 -> Restock needed!
            }

            DB::table('inventory_batches')->insert([
                'product_id' => $p->id,
                'warehouse_id' => $warehouseId,
                'entry_date' => now()->subDays(60)->format('Y-m-d H:i:s'),
                'qty_received' => 500,
                'qty_remaining' => $remaining,
                'unit_cost' => $p->default_purchase_price,
                'source_type' => 'opening_balance',
                'source_id' => $p->id,
                'source_line_id' => null,
                'created_at' => now()->subDays(60),
                'updated_at' => now(),
            ]);
        }

        // Helper closure to insert document lines
        $insertLine = function ($docId, $lineType, $productId, $qty, $price) use ($warehouseId) {
            $product = DB::table('products')->where('id', $productId)->first();
            $lineTotal = $price * $qty;
            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => $lineType,
                'product_id' => $productId,
                'unit_id' => $product->base_unit_id ?? 1,
                'warehouse_id' => $warehouseId,
                'description' => $product->name ?? 'Barang',
                'quantity' => $qty,
                'unit_price' => $price,
                'total_amount' => $lineTotal,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return $lineTotal;
        };

        // 2. Sales Quotes (Penawaran Penjualan)
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(25 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_quote',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => ($i % 2 === 0) ? $c1 : $c4,
                'currency_id' => $currencyId,
                'responsible_user_id' => $userKasirId,
                'document_number' => 'SQ.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => ($i <= 2) ? 'Approved' : 'Pending',
                'entry_date' => $entryDate,
                'due_date' => date('Y-m-d', strtotime($entryDate . ' + 14 days')),
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => false,
                'created_at' => now()->subDays(25 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'sales_quote', $pSemen, 20, 78000);
            $t2 = $insertLine($docId, 'sales_quote', $pPasir, 2, 450000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1 + $t2, 'total_amount' => $t1 + $t2]);
        }

        // 3. Sales Orders (Pesanan Penjualan)
        for ($i = 1; $i <= 6; $i++) {
            $entryDate = now()->subDays(20 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_order',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => ($i % 2 === 0) ? $c2 : $c3,
                'currency_id' => $currencyId,
                'responsible_user_id' => $userKasirId,
                'document_number' => 'SO.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'due_date' => date('Y-m-d', strtotime($entryDate . ' + 10 days')),
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => false,
                'created_at' => now()->subDays(20 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'sales_order', $pCat, 5, 142000);
            $t2 = $insertLine($docId, 'sales_order', $pKuas, 5, 18000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1 + $t2, 'total_amount' => $t1 + $t2]);
        }

        // 4. Sales Deliveries (Pengiriman Penjualan / Surat Jalan)
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(15 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_delivery',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => $c1,
                'currency_id' => $currencyId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'DO.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Shipped',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(15 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'sales_delivery', $pPipa, 15, 175000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 5. Sales Invoices (30 Correlated Sales Invoices for Apriori & ABC Pareto)
        $salesPattern = [
            1  => [$pSemen => 25, $pPasir => 3, $pPaku => 5, $pBesi => 15, $pKuas => 2],
            2  => [$pSemen => 40, $pPasir => 5, $pPaku => 8, $pBesi => 20, $pKuas => 3],
            3  => [$pSemen => 15, $pPasir => 2, $pPaku => 3, $pThn => 2],
            4  => [$pSemen => 30, $pPasir => 4, $pPaku => 6, $pThn => 3],
            5  => [$pSemen => 50, $pPasir => 6, $pPaku => 10, $pBesi => 25],
            6  => [$pSemen => 20, $pPasir => 2],
            7  => [$pSemen => 35, $pPasir => 4],
            8  => [$pSemen => 10, $pPasir => 1],
            9  => [$pSemen => 45, $pPasir => 5, $pBesi => 18],
            10 => [$pSemen => 28, $pPasir => 3],
            11 => [$pPasir => 4, $pPipa => 10, $pBesi => 8],  // Besi tanpa paku/semen
            12 => [$pPasir => 2, $pPipa => 14, $pBesi => 10], // Besi tanpa paku/semen
            13 => [$pSemen => 22, $pPipa => 8],
            14 => [$pPaku => 5, $pBesi => 10], 
            15 => [$pPaku => 3, $pBesi => 12], 
            16 => [$pPipa => 12, $pLem => 4, $pKran => 3],
            17 => [$pPipa => 20, $pLem => 6, $pKran => 5],
            18 => [$pPipa => 8,  $pLem => 2, $pKran => 2],
            19 => [$pPipa => 15, $pLem => 5, $pKran => 4],
            20 => [$pLem => 3],
            21 => [$pLem => 2],
            22 => [$pKran => 2],
            23 => [$pKran => 3],
            24 => [$pCat => 6, $pKuas => 5, $pThn => 3],
            25 => [$pCat => 4, $pKuas => 4, $pThn => 2],
            26 => [$pCat => 8, $pKuas => 6, $pThn => 4],
            27 => [$pCat => 7, $pKuas => 3, $pThn => 2],
            28 => [$pCat => 5], 
            29 => [$pCat => 7], 
            30 => [$pCat => 9], 
        ];

        $siIds = [];
        foreach ($salesPattern as $i => $items) {
            $docNo = 'SI.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT);
            $totalAmount = 0;
            $entryDate = now()->subDays(30 - $i)->format('Y-m-d');

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_invoice',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => ($i % 5 === 0) ? $c5 : (($i % 4 === 0) ? $c4 : (($i % 3 === 0) ? $c3 : (($i % 2 === 0) ? $c2 : $c1))),
                'currency_id' => $currencyId,
                'responsible_user_id' => ($i % 2 === 0) ? $userAdminId : $userKasirId,
                'document_number' => $docNo,
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(30 - $i),
                'updated_at' => now()->subDays(30 - $i),
            ]);
            $siIds[$i] = $docId;

            foreach ($items as $productId => $qty) {
                $product = DB::table('products')->where('id', $productId)->first();
                $lineTotal = $product->default_sale_price * $qty;
                $totalAmount += $lineTotal;

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'sales_invoice',
                    'product_id' => $productId,
                    'unit_id' => $product->base_unit_id ?? 1,
                    'warehouse_id' => $warehouseId,
                    'description' => $product->name,
                    'quantity' => $qty,
                    'unit_price' => $product->default_sale_price,
                    'total_amount' => $lineTotal,
                    'sort_order' => $productId,
                    'created_at' => now()->subDays(30 - $i),
                    'updated_at' => now()->subDays(30 - $i),
                ]);
            }

            // Guarantee EVERY customer has active unpaid piutang!
            $isPaid = ($i % 3 === 0);
            DB::table('operation_documents')->where('id', $docId)->update([
                'subtotal' => $totalAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $isPaid ? $totalAmount : 0,
                'outstanding_amount' => $isPaid ? 0 : $totalAmount,
                'due_date' => $isPaid ? null : date('Y-m-d', strtotime($entryDate . ' + 14 days')),
                'status' => $isPaid ? 'Lunas' : 'Belum Lunas',
            ]);
        }

        // 6. Sales Returns (Retur Penjualan)
        for ($i = 1; $i <= 4; $i++) {
            $entryDate = now()->subDays(10 - $i)->format('Y-m-d');
            $refSiId = $siIds[$i] ?? $siIds[1];
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_return',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'customer_id' => $c2,
                'currency_id' => $currencyId,
                'related_document_id' => $refSiId,
                'responsible_user_id' => $userKasirId,
                'document_number' => 'SR.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(10 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'sales_return', $pCat, 1, 142000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 7. Sales Deposits (Uang Muka Penjualan)
        for ($i = 1; $i <= 4; $i++) {
            $entryDate = now()->subDays(12 - $i)->format('Y-m-d');
            DB::table('operation_documents')->insert([
                'document_type' => 'sales_deposit',
                'branch_id' => $branchId,
                'customer_id' => $c1,
                'currency_id' => $currencyId,
                'primary_account_id' => $accBankBCA,
                'document_number' => 'SD.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 2500000,
                'total_amount' => 2500000,
                'notes' => 'Uang Muka Proyek #' . $i,
                'is_closed' => true,
                'created_at' => now()->subDays(12 - $i),
                'updated_at' => now(),
            ]);
        }

        // 8. Sales Receipts (Penerimaan Penjualan / Tagihan Kasir)
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(8 - $i)->format('Y-m-d');
            $payAmount = 1500000;
            $refDocNo = 'SI.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT);
            $refSiId = $siIds[$i] ?? null;

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'sales_receipt',
                'branch_id' => $branchId,
                'customer_id' => ($i % 5 === 0) ? $c5 : (($i % 4 === 0) ? $c4 : (($i % 3 === 0) ? $c3 : (($i % 2 === 0) ? $c2 : $c1))),
                'currency_id' => $currencyId,
                'primary_account_id' => $accKasKecil,
                'related_document_id' => $refSiId,
                'document_number' => 'CR.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Lunas',
                'payment_method' => 'Kas',
                'entry_date' => $entryDate,
                'subtotal' => $payAmount,
                'total_amount' => $payAmount,
                'paid_amount' => $payAmount,
                'is_closed' => true,
                'created_at' => now()->subDays(8 - $i),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'sales_receipt',
                'description' => $refDocNo,
                'reference_code' => $refDocNo,
                'quantity' => 1,
                'unit_price' => $payAmount,
                'total_amount' => $payAmount,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 9. Purchase Orders (Pesanan Pembelian)
        for ($i = 1; $i <= 6; $i++) {
            $entryDate = now()->subDays(25 - ($i * 2))->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'purchase_order',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'supplier_id' => ($i % 5 === 0) ? $s5 : (($i % 4 === 0) ? $s4 : (($i % 3 === 0) ? $s3 : (($i % 2 === 0) ? $s2 : $s1))),
                'currency_id' => $currencyId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'PO.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Approved',
                'entry_date' => $entryDate,
                'due_date' => date('Y-m-d', strtotime($entryDate . ' + 15 days')),
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => false,
                'created_at' => now()->subDays(25 - ($i * 2)),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'purchase_order', $pSemen, 100, 68000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 10. Goods Receipts (Penerimaan Barang / Surat Jalan Pemasok)
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(20 - ($i * 2))->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'goods_receipt',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'supplier_id' => ($i % 2 === 0) ? $s1 : $s4,
                'currency_id' => $currencyId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'GR.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Received',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(20 - ($i * 2)),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'goods_receipt', $pSemen, 100, 68000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 11. Purchase Invoices (10 Faktur Pembelian)
        $piIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $entryDate = now()->subDays(40 - ($i * 3))->format('Y-m-d');
            $isPaid = ($i % 2 === 0);

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'purchase_invoice',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'supplier_id' => ($i % 5 === 0) ? $s5 : (($i % 4 === 0) ? $s4 : (($i % 3 === 0) ? $s3 : (($i % 2 === 0) ? $s2 : $s1))),
                'currency_id' => $currencyId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'PI.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => $isPaid ? 'Lunas' : 'Belum Lunas',
                'entry_date' => $entryDate,
                'due_date' => $isPaid ? null : date('Y-m-d', strtotime($entryDate . ' + 30 days')),
                'subtotal' => 0,
                'discount_total' => 0,
                'tax_total' => 0,
                'total_amount' => 0,
                'paid_amount' => 0,
                'outstanding_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(40 - ($i * 3)),
                'updated_at' => now(),
            ]);
            $piIds[] = $docId;

            $t1 = $insertLine($docId, 'purchase_invoice', $pSemen, 100 + ($i * 10), 75000);
            $t2 = $insertLine($docId, 'purchase_invoice', $pBata, 2000 + ($i * 200), 800);
            $subtotal = $t1 + $t2;

            DB::table('operation_documents')->where('id', $docId)->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
                'paid_amount' => $isPaid ? $subtotal : 0,
                'outstanding_amount' => $isPaid ? 0 : $subtotal,
            ]);
        }

        // 12. Purchase Returns (Retur Pembelian)
        for ($i = 1; $i <= 3; $i++) {
            $entryDate = now()->subDays(15 - $i)->format('Y-m-d');
            $refPiId = $piIds[$i - 1] ?? null;
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'purchase_return',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'supplier_id' => $s1,
                'currency_id' => $currencyId,
                'related_document_id' => $refPiId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'PR.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(15 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'purchase_return', $pSemen, 5, 68000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 13. Purchase Payments (Pembayaran Pembelian)
        for ($i = 1; $i <= 4; $i++) {
            $entryDate = now()->subDays(10 - $i)->format('Y-m-d');
            $payAmount = 6800000;
            $refDocNo = 'PI.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT);
            $refPiId = $piIds[$i - 1] ?? null;

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'purchase_payment',
                'branch_id' => $branchId,
                'supplier_id' => $s1,
                'currency_id' => $currencyId,
                'primary_account_id' => $accBankMnd,
                'related_document_id' => $refPiId,
                'document_number' => 'PY.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'payment_method' => 'Transfer Bank',
                'entry_date' => $entryDate,
                'subtotal' => $payAmount,
                'total_amount' => $payAmount,
                'paid_amount' => $payAmount,
                'is_closed' => true,
                'created_at' => now()->subDays(10 - $i),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'purchase_payment',
                'description' => $refDocNo,
                'reference_code' => $refDocNo,
                'quantity' => 1,
                'unit_price' => $payAmount,
                'total_amount' => $payAmount,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 14. Item Requests (Permintaan Barang / Requisition)
        for ($i = 1; $i <= 4; $i++) {
            $entryDate = now()->subDays(18 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'item_request',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'responsible_user_id' => $userKasirId,
                'document_number' => 'REQ.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Approved',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => false,
                'created_at' => now()->subDays(18 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'item_request', $pPaku, 20, 22000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 15. Inventory Adjustments (Opname Result)
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(25 - ($i * 4))->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'inventory_adjustment',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'IA.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 1500000,
                'total_amount' => 1500000,
                'notes' => 'Penyesuaian stok opname fisik berkala #' . $i,
                'is_closed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'inventory_adjustment',
                'product_id' => $pSemen,
                'unit_id' => 1,
                'warehouse_id' => $warehouseId,
                'description' => 'Semen Gresik PPC 50kg',
                'quantity' => 2,
                'unit_price' => 78000,
                'total_amount' => 156000,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 16. Stock Transfers (Transfer Stok Antar Gudang)
        for ($i = 1; $i <= 4; $i++) {
            $entryDate = now()->subDays(14 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'stock_transfer',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'counterpart_warehouse_id' => 2,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'TRF.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Completed',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'is_closed' => true,
                'created_at' => now()->subDays(14 - $i),
                'updated_at' => now(),
            ]);
            $t1 = $insertLine($docId, 'stock_transfer', $pSemen, 25, 78000);
            DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
        }

        // 17. Cash Payments (Kas Keluar)
        $accPerlengkapan = DB::table('accounts')->where('code', '120101')->value('id') ?? 18;
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(15 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'cash_payment',
                'branch_id' => $branchId,
                'currency_id' => $currencyId,
                'primary_account_id' => $accKasKecil,
                'document_number' => 'CP.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 350000,
                'total_amount' => 350000,
                'notes' => 'Pembelian perlengkapan toko #' . $i,
                'is_closed' => true,
                'created_at' => now()->subDays(15 - $i),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'cash_payment',
                'account_id' => $accPerlengkapan,
                'description' => 'Pembelian perlengkapan toko #' . $i,
                'reference_code' => '120101',
                'quantity' => 1,
                'unit_price' => 350000,
                'total_amount' => 350000,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 18. Cash Receipts (Kas Masuk / Penerimaan Kas & Bank)
        $accPendapatanLain = DB::table('accounts')->where('code', '410102')->value('id') ?? 47;
        for ($i = 1; $i <= 5; $i++) {
            $entryDate = now()->subDays(15 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'cash_receipt',
                'branch_id' => $branchId,
                'currency_id' => $currencyId,
                'primary_account_id' => $accKasKecil,
                'document_number' => 'CR-IN.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 500000,
                'total_amount' => 500000,
                'notes' => 'Penerimaan kas pendapatan lain-lain #' . $i,
                'is_closed' => true,
                'created_at' => now()->subDays(15 - $i),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'cash_receipt',
                'account_id' => $accPendapatanLain,
                'description' => 'Pendapatan Jasa Pengiriman / Lain-Lain #' . $i,
                'reference_code' => '410102',
                'quantity' => 1,
                'unit_price' => 500000,
                'total_amount' => 500000,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 19. Bank Transfers (Transfer Bank)
        for ($i = 1; $i <= 4; $i++) {
            $entryDate = now()->subDays(10 - $i)->format('Y-m-d');
            DB::table('operation_documents')->insert([
                'document_type' => 'bank_transfer',
                'branch_id' => $branchId,
                'currency_id' => $currencyId,
                'primary_account_id' => $accBankBCA,
                'secondary_account_id' => $accBankMnd,
                'document_number' => 'BT.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 5000000,
                'total_amount' => 5000000,
                'notes' => 'Transfer dari Bank BCA ke Bank Mandiri #' . $i,
                'is_closed' => true,
                'created_at' => now()->subDays(10 - $i),
                'updated_at' => now(),
            ]);
        }

        // 20. General Journal Entries (Jurnal Umum)
        for ($i = 1; $i <= 8; $i++) {
            $entryDate = now()->subDays(20 - $i)->format('Y-m-d');
            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'general_journal',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'responsible_user_id' => $userAdminId,
                'document_number' => 'GJ.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'reference_number' => 'REF-OPS-' . $i,
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 1250000,
                'total_amount' => 1250000,
                'notes' => 'Jurnal penyesuaian operasional #' . $i,
                'is_closed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'general_journal',
                'account_id' => $accPerlengkapan,
                'description' => 'Debet Perlengkapan #' . $i,
                'reference_code' => '120101',
                'debit_amount' => 1250000,
                'credit_amount' => 0,
                'total_amount' => 1250000,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'general_journal',
                'account_id' => $accKasKecil,
                'description' => 'Kredit Kas Kecil #' . $i,
                'reference_code' => '110101',
                'debit_amount' => 0,
                'credit_amount' => 1250000,
                'total_amount' => 1250000,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 21. Expense Entries (Beban Operasional / Pencatatan Beban)
        $accUtangBeban = DB::table('accounts')->where('code', '210202')->value('id') ?? 35; // Utang Beban Listrik & Air
        $accBebanGaji = DB::table('accounts')->where('code', '610101')->value('id') ?? 54; // Beban Gaji Umum & Admin
        $accBebanListrik = DB::table('accounts')->where('code', '610201')->value('id') ?? 66; // Beban Penyusutan Peralatan / Operasional

        $expenseCategories = [
            ['desc' => 'Beban Listrik, Air & Telepon Toko Utama', 'amount' => 1750000, 'acc' => $accBebanListrik, 'code' => '610201'],
            ['desc' => 'Beban Konsumsi & Keperluan Kebersihan Operasional', 'amount' => 850000, 'acc' => $accBebanGaji, 'code' => '610101'],
            ['desc' => 'Beban Pemeliharaan & Servis Kendaraan Toko', 'amount' => 2400000, 'acc' => $accBebanListrik, 'code' => '610201'],
            ['desc' => 'Beban Cetak Nota & Perlengkapan Kasir', 'amount' => 650000, 'acc' => $accBebanGaji, 'code' => '610101'],
            ['desc' => 'Beban Biaya Sewa Gudang Tambahan', 'amount' => 3500000, 'acc' => $accBebanListrik, 'code' => '610201'],
            ['desc' => 'Beban Keamanan & Iuran Kebersihan Lingkungan', 'amount' => 450000, 'acc' => $accBebanGaji, 'code' => '610101'],
            ['desc' => 'Beban Administrasi Kantor & Internet Wi-Fi', 'amount' => 1200000, 'acc' => $accBebanListrik, 'code' => '610201'],
            ['desc' => 'Beban Pembelian Alat Tulis & Binder Toko', 'amount' => 380000, 'acc' => $accBebanGaji, 'code' => '610101'],
        ];

        foreach ($expenseCategories as $idx => $exp) {
            $i = $idx + 1;
            $entryDate = now()->subDays(10 - $i)->format('Y-m-d');
            $dueDate = date('Y-m-d', strtotime($entryDate . ' + 14 days'));
            $isPaid = ($i > 3);

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'expense_entry',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'currency_id' => $currencyId,
                'primary_account_id' => $accUtangBeban,
                'document_number' => 'EXP.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => $isPaid ? 'Terbayar' : 'Sedang diproses',
                'entry_date' => $entryDate,
                'due_date' => $dueDate,
                'subtotal' => $exp['amount'],
                'total_amount' => $exp['amount'],
                'paid_amount' => $isPaid ? $exp['amount'] : 0,
                'outstanding_amount' => $isPaid ? 0 : $exp['amount'],
                'notes' => $exp['desc'],
                'metadata' => json_encode([
                    'liability_account_label' => '[210202] Utang Beban Listrik & Air',
                ]),
                'is_closed' => $isPaid,
                'created_at' => now()->subDays(10 - $i),
                'updated_at' => now(),
            ]);

            DB::table('operation_document_lines')->insert([
                'operation_document_id' => $docId,
                'line_type' => 'expense_entry',
                'account_id' => $exp['acc'],
                'description' => $exp['desc'],
                'reference_code' => $exp['code'],
                'quantity' => 1,
                'unit_price' => $exp['amount'],
                'total_amount' => $exp['amount'],
                'sort_order' => 1,
                'attributes' => json_encode([
                    'notes' => 'Rincian ' . $exp['desc'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 22. Payroll Entries (Gaji Karyawan Toko)
        $employeesList = DB::table('employees')->get();
        $payrollPeriods = [
            ['title' => 'Gaji Pokok Kasir & Admin', 'month' => 'Agustus', 'year' => '2026'],
            ['title' => 'Gaji Driver Armada Pick Up', 'month' => 'Juli', 'year' => '2026'],
            ['title' => 'Gaji Staf Gudang & Bongkar Muat', 'month' => 'Juni', 'year' => '2026'],
            ['title' => 'Uang Makan & Lembur Karyawan', 'month' => 'Mei', 'year' => '2026'],
        ];

        foreach ($payrollPeriods as $idx => $period) {
            $i = $idx + 1;
            $entryDate = now()->subDays(15 - ($i * 2))->format('Y-m-d');
            $totalDocAmount = 0;

            $docId = DB::table('operation_documents')->insertGetId([
                'document_type' => 'payroll_entry',
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'currency_id' => $currencyId,
                'primary_account_id' => 34, // Utang Beban Gaji Karyawan
                'document_number' => 'PAY.' . date('Y.m') . '.' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'status' => 'Posted',
                'entry_date' => $entryDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'paid_amount' => 0,
                'outstanding_amount' => 0,
                'notes' => $period['title'] . ' Periode ' . $period['month'] . ' ' . $period['year'],
                'metadata' => json_encode([
                    'payment_type' => 'Bulanan',
                    'period_month' => $period['month'],
                    'period_year' => $period['year'],
                    'liability_account_id' => 34,
                ]),
                'is_closed' => true,
                'created_at' => now()->subDays(15 - ($i * 2)),
                'updated_at' => now(),
            ]);

            foreach ($employeesList as $empIdx => $emp) {
                $baseSal = 3500000 + ($empIdx * 500000);
                $taxVal = 150000;
                $netPaid = $baseSal - $taxVal;
                $totalDocAmount += $netPaid;

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'payroll_entry',
                    'description' => $emp->full_name,
                    'quantity' => 1,
                    'unit_price' => $baseSal,
                    'tax_amount' => $taxVal,
                    'total_amount' => $netPaid,
                    'sort_order' => $empIdx,
                    'attributes' => json_encode([
                        'employee_id' => $emp->id,
                        'employee_code' => $emp->employee_code,
                        'employee_name' => $emp->full_name,
                        'basicSalary' => $baseSal,
                        'taxAllowance' => 0,
                        'positionAllowance' => 250000,
                        'mealAllowance' => 150000,
                        'transportAllowance' => 100000,
                        'grossIncomeRaw' => $baseSal,
                        'incomeTaxRaw' => $taxVal,
                        'paidSalaryRaw' => $netPaid,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('operation_documents')->where('id', $docId)->update([
                'subtotal' => $totalDocAmount,
                'total_amount' => $totalDocAmount,
                'paid_amount' => $totalDocAmount,
            ]);
        }

        // 23. Seed operation_document_user pivot table (Relasi Multi-User Penanggung Jawab & Pemeriksa Dokumen)
        DB::table('operation_document_user')->truncate();
        $allDocs = DB::table('operation_documents')->get();
        foreach ($allDocs as $doc) {
            $respUserId = $doc->responsible_user_id ?? $userAdminId;
            DB::table('operation_document_user')->insertOrIgnore([
                'operation_document_id' => $doc->id,
                'user_id' => $respUserId,
            ]);
            // Add admin user as secondary reviewer if responsible user is kasir
            if ($respUserId !== $userAdminId) {
                DB::table('operation_document_user')->insertOrIgnore([
                    'operation_document_id' => $doc->id,
                    'user_id' => $userAdminId,
                ]);
            }
        }
    }
}
