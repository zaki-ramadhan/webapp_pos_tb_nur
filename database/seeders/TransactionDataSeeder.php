<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionDataSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        DB::table('operation_document_user')->truncate();
        DB::table('operation_document_lines')->truncate();
        DB::table('operation_documents')->truncate();
        DB::table('inventory_batches')->truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $branchId = DB::table('branches')->first()->id ?? 1;
        $warehouseId = DB::table('warehouses')->first()->id ?? 1;
        $currencyId = DB::table('currencies')->where('code', 'IDR')->value('id') ?? 1;

        $accKasKecil  = DB::table('accounts')->where('code', '110101')->value('id') ?? 1;
        $accBankBCA   = DB::table('accounts')->where('code', '110102')->value('id') ?? $accKasKecil;
        $accBankMnd   = DB::table('accounts')->where('code', '110103')->value('id') ?? $accKasKecil;

        $customersMap = DB::table('customers')->pluck('id', 'code')->toArray();
        $suppliersMap = DB::table('suppliers')->pluck('id', 'code')->toArray();
        $productsMap  = DB::table('products')->pluck('id', 'code')->toArray();
        $usersMap      = DB::table('users')->pluck('id', 'email')->toArray();

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

        // 1. Seed Inventory Batches FIFO for all products (Beginning from early 2025)
        DB::table('inventory_batches')->truncate();
        $allProducts = DB::table('products')->get();
        foreach ($allProducts as $p) {
            $remaining = 420;
            if ($p->code === 'BTA-001') {
                $remaining = 150;
            } elseif ($p->code === 'KBL-002') {
                $remaining = 2;
            }

            DB::table('inventory_batches')->insert([
                'product_id' => $p->id,
                'warehouse_id' => $warehouseId,
                'entry_date' => '2025-01-02 08:00:00',
                'qty_received' => 1000,
                'qty_remaining' => $remaining,
                'unit_cost' => $p->default_purchase_price,
                'source_type' => 'opening_balance',
                'source_id' => $p->id,
                'source_line_id' => null,
                'created_at' => '2025-01-02 08:00:00',
                'updated_at' => now(),
            ]);
        }

        // Helper closure to insert document lines
        $insertLine = function ($docId, $lineType, $productId, $qty, $price, $createdAt = null) use ($warehouseId) {
            $product = DB::table('products')->where('id', $productId)->first();
            $lineTotal = $price * $qty;
            $dt = $createdAt ?: now();
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
                'created_at' => $dt,
                'updated_at' => $dt,
            ]);
            return $lineTotal;
        };

        // 2. Sales Quotes (Penawaran Penjualan - 2025 & 2026)
        $quoteCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 2) {
                $quoteCount++;
                $entryDate = sprintf('%04d-%02d-10', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'sales_quote',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'customer_id' => ($quoteCount % 2 === 0) ? $c1 : $c4,
                    'currency_id' => $currencyId,
                    'responsible_user_id' => $userKasirId,
                    'document_number' => sprintf('SQ.%04d.%02d.%05d', $year, $m, $quoteCount),
                    'status' => ($quoteCount <= 4) ? 'Approved' : 'Pending',
                    'entry_date' => $entryDate,
                    'due_date' => date('Y-m-d', strtotime($entryDate . ' + 14 days')),
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => false,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'sales_quote', $pSemen, 10, 78000, $dt);
                $t2 = $insertLine($docId, 'sales_quote', $pPasir, 1, 450000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1 + $t2, 'total_amount' => $t1 + $t2]);
            }
        }

        // 3. Sales Orders (Pesanan Penjualan - 2025 & 2026)
        $orderCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $orderCount++;
                $entryDate = sprintf('%04d-%02d-15', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'sales_order',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'customer_id' => ($orderCount % 2 === 0) ? $c2 : $c3,
                    'currency_id' => $currencyId,
                    'responsible_user_id' => $userKasirId,
                    'document_number' => sprintf('SO.%04d.%02d.%05d', $year, $m, $orderCount),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'due_date' => date('Y-m-d', strtotime($entryDate . ' + 10 days')),
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => false,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'sales_order', $pCat, 3, 142000, $dt);
                $t2 = $insertLine($docId, 'sales_order', $pKuas, 3, 18000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1 + $t2, 'total_amount' => $t1 + $t2]);
            }
        }

        // 4. Sales Deliveries (Surat Jalan - 2025 & 2026)
        $delivCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 2) {
                $delivCount++;
                $entryDate = sprintf('%04d-%02d-18', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'sales_delivery',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'customer_id' => $c1,
                    'currency_id' => $currencyId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('DO.%04d.%02d.%05d', $year, $m, $delivCount),
                    'status' => 'Shipped',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'sales_delivery', $pPipa, 8, 175000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 5. Sales Invoices (Calibrated for ~Rp 250M / year in 2025 & steady growth in 2026)
        // Average invoice: ~Rp 2.5 - 4.5 Million (realistic village store orders)
        $salesPatterns = [
            // Semen, Pasir, Besi, Paku combinations
            [$pSemen => 12, $pPasir => 1, $pPaku => 2, $pBesi => 6,  $pKuas => 1],
            [$pSemen => 20, $pPasir => 2, $pPaku => 3, $pBesi => 10, $pKuas => 2],
            [$pSemen => 8,  $pPasir => 1, $pPaku => 1, $pThn => 1],
            [$pSemen => 15, $pPasir => 2, $pPaku => 3, $pThn => 2],
            [$pSemen => 25, $pPasir => 3, $pPaku => 4, $pBesi => 12],
            [$pSemen => 10, $pPasir => 1],
            [$pSemen => 18, $pPasir => 2],
            [$pSemen => 6,  $pPasir => 1],
            [$pSemen => 22, $pPasir => 2, $pBesi => 8],
            [$pSemen => 14, $pPasir => 1],
            [$pSemen => 16], // Semen berdiri sendiri (varies Semen->Pasir confidence to ~88%)
            [$pSemen => 10, $pBata => 500], // Semen + Bata (tanpa pasir)

            // Pipa, Kran, Lem combinations
            [$pPipa => 6,   $pLem => 2,   $pKran => 2],
            [$pPipa => 10,  $pLem => 3,   $pKran => 3],
            [$pPipa => 4,   $pLem => 1,   $pKran => 1],
            [$pPipa => 8,   $pLem => 2,   $pKran => 2],
            [$pPipa => 5,   $pKran => 2], // Pipa + Kran (tanpa lem)
            [$pKran => 3], // Kran saja (varies Kran->Pipa confidence to ~87%)
            [$pKran => 2,   $pKabel => 3], // Kran + Kabel (tanpa pipa/lem)
            [$pLem => 2],
            [$pPasir => 2,  $pPipa => 5,  $pBesi => 4],
            [$pPasir => 1,  $pPipa => 8,  $pBesi => 5],
            [$pSemen => 12, $pPipa => 4],

            // Cat, Kuas, Thinner combinations
            [$pCat => 3,    $pKuas => 2,  $pThn => 1],
            [$pCat => 2,    $pKuas => 2,  $pThn => 1],
            [$pCat => 4,    $pKuas => 3,  $pThn => 2],
            [$pCat => 3,    $pKuas => 2,  $pThn => 1],
            [$pCat => 2,    $pKuas => 1], // Cat + Kuas (tanpa thinner) -> varies Thinner confidence to ~83%
            [$pCat => 5], // Cat saja (varies Cat->Kuas confidence to ~91%)
            [$pCat => 3,    $pThn => 1], // Cat + Thinner (tanpa kuas)
            [$pCat => 2,    $pSemen => 5], // Cat + Semen

            // Miscellaneous hardware
            [$pPaku => 2,   $pBesi => 6],
            [$pPaku => 2,   $pBesi => 8],
            [$pKabel => 5,  $pKran => 1],
        ];

        $siIds = [];
        $invoiceSeq = 0;

        for ($year = 2025; $year <= 2026; $year++) {
            $maxMonth = ($year === 2026) ? 8 : 12;

            for ($m = 1; $m <= $maxMonth; $m++) {
                // Generate 6 invoices per month -> 72 invoices/year @ avg ~Rp 3.5M = ~Rp 250M/year!
                $invoicesThisMonth = 6;
                for ($k = 1; $k <= $invoicesThisMonth; $k++) {
                    $invoiceSeq++;
                    $day = min(28, 4 * $k + ($invoiceSeq % 2));
                    $entryDate = sprintf('%04d-%02d-%02d', $year, $m, $day);
                    $dt = Carbon::parse($entryDate);

                    $pattern = $salesPatterns[($invoiceSeq - 1) % count($salesPatterns)];
                    $docNo = sprintf('SI.%04d.%02d.%05d', $year, $m, $invoiceSeq);
                    $custId = ($invoiceSeq % 5 === 0) ? $c5 : (($invoiceSeq % 4 === 0) ? $c4 : (($invoiceSeq % 3 === 0) ? $c3 : (($invoiceSeq % 2 === 0) ? $c2 : $c1)));

                    $docId = DB::table('operation_documents')->insertGetId([
                        'document_type' => 'sales_invoice',
                        'branch_id' => $branchId,
                        'warehouse_id' => $warehouseId,
                        'customer_id' => $custId,
                        'currency_id' => $currencyId,
                        'responsible_user_id' => ($invoiceSeq % 2 === 0) ? $userAdminId : $userKasirId,
                        'document_number' => $docNo,
                        'status' => 'Posted',
                        'entry_date' => $entryDate,
                        'subtotal' => 0,
                        'discount_total' => 0,
                        'tax_total' => 0,
                        'total_amount' => 0,
                        'is_closed' => true,
                        'created_at' => $dt,
                        'updated_at' => $dt,
                    ]);
                    $siIds[$invoiceSeq] = $docId;

                    $totalAmount = 0;
                    foreach ($pattern as $productId => $qty) {
                        $product = DB::table('products')->where('id', $productId)->first();
                        $price = $product->default_sale_price ?? 50000;
                        $lineTotal = $price * $qty;
                        $totalAmount += $lineTotal;

                        DB::table('operation_document_lines')->insert([
                            'operation_document_id' => $docId,
                            'line_type' => 'sales_invoice',
                            'product_id' => $productId,
                            'unit_id' => $product->base_unit_id ?? 1,
                            'warehouse_id' => $warehouseId,
                            'description' => $product->name,
                            'quantity' => $qty,
                            'unit_price' => $price,
                            'total_amount' => $lineTotal,
                            'sort_order' => $productId,
                            'created_at' => $dt,
                            'updated_at' => $dt,
                        ]);
                    }

                    $isPaid = ($invoiceSeq % 4 !== 0);
                    DB::table('operation_documents')->where('id', $docId)->update([
                        'subtotal' => $totalAmount,
                        'total_amount' => $totalAmount,
                        'paid_amount' => $isPaid ? $totalAmount : 0,
                        'outstanding_amount' => $isPaid ? 0 : $totalAmount,
                        'due_date' => $isPaid ? null : date('Y-m-d', strtotime($entryDate . ' + 14 days')),
                        'status' => $isPaid ? 'Lunas' : 'Belum Lunas',
                    ]);
                }
            }
        }

        // 6. Sales Returns (2025 & 2026)
        $srCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 2; $m <= $maxM; $m += 3) {
                $srCount++;
                $entryDate = sprintf('%04d-%02d-20', $year, $m);
                $dt = Carbon::parse($entryDate);
                $refSiId = $siIds[$srCount] ?? $siIds[1];
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'sales_return',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'customer_id' => $c2,
                    'currency_id' => $currencyId,
                    'related_document_id' => $refSiId,
                    'responsible_user_id' => $userKasirId,
                    'document_number' => sprintf('SR.%04d.%02d.%05d', $year, $m, $srCount),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'sales_return', $pCat, 1, 142000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 7. Sales Deposits (Uang Muka Penjualan - 2025 & 2026)
        $sdCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 3) {
                $sdCount++;
                $entryDate = sprintf('%04d-%02d-05', $year, $m);
                $dt = Carbon::parse($entryDate);
                DB::table('operation_documents')->insert([
                    'document_type' => 'sales_deposit',
                    'branch_id' => $branchId,
                    'customer_id' => $c1,
                    'currency_id' => $currencyId,
                    'primary_account_id' => $accBankBCA,
                    'document_number' => sprintf('SD.%04d.%02d.%05d', $year, $m, $sdCount),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 1500000,
                    'total_amount' => 1500000,
                    'notes' => 'Uang Muka Proyek Toko',
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 8. Sales Receipts (Penerimaan Penjualan - 2025 & 2026)
        $receiptSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $receiptSeq++;
                $entryDate = sprintf('%04d-%02d-22', $year, $m);
                $dt = Carbon::parse($entryDate);
                $payAmount = 1250000;
                $refDocNo = sprintf('SI.%04d.%02d.%05d', $year, $m, $receiptSeq);
                $refSiId = $siIds[$receiptSeq] ?? null;

                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'sales_receipt',
                    'branch_id' => $branchId,
                    'customer_id' => ($receiptSeq % 5 === 0) ? $c5 : (($receiptSeq % 4 === 0) ? $c4 : (($receiptSeq % 3 === 0) ? $c3 : (($receiptSeq % 2 === 0) ? $c2 : $c1))),
                    'currency_id' => $currencyId,
                    'primary_account_id' => $accKasKecil,
                    'related_document_id' => $refSiId,
                    'document_number' => sprintf('CR.%04d.%02d.%05d', $year, $m, $receiptSeq),
                    'status' => 'Lunas',
                    'payment_method' => 'Kas',
                    'entry_date' => $entryDate,
                    'subtotal' => $payAmount,
                    'total_amount' => $payAmount,
                    'paid_amount' => $payAmount,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
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
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 9. Purchase Orders (2025 & 2026)
        $poCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 2) {
                $poCount++;
                $entryDate = sprintf('%04d-%02d-03', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'purchase_order',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'supplier_id' => ($poCount % 5 === 0) ? $s5 : (($poCount % 4 === 0) ? $s4 : (($poCount % 3 === 0) ? $s3 : (($poCount % 2 === 0) ? $s2 : $s1))),
                    'currency_id' => $currencyId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('PO.%04d.%02d.%05d', $year, $m, $poCount),
                    'status' => 'Approved',
                    'entry_date' => $entryDate,
                    'due_date' => date('Y-m-d', strtotime($entryDate . ' + 15 days')),
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => false,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'purchase_order', $pSemen, 60, 68000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 10. Goods Receipts (2025 & 2026)
        $grCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 2) {
                $grCount++;
                $entryDate = sprintf('%04d-%02d-06', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'goods_receipt',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'supplier_id' => ($grCount % 2 === 0) ? $s1 : $s4,
                    'currency_id' => $currencyId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('GR.%04d.%02d.%05d', $year, $m, $grCount),
                    'status' => 'Received',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'goods_receipt', $pSemen, 60, 68000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 11. Purchase Invoices (2025 & 2026 - Calibrated for ~Rp 190M HPP per year)
        $piIds = [];
        $piSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $piSeq++;
                $entryDate = sprintf('%04d-%02d-08', $year, $m);
                $dt = Carbon::parse($entryDate);
                $isPaid = ($piSeq % 3 !== 0);

                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'purchase_invoice',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'supplier_id' => ($piSeq % 5 === 0) ? $s5 : (($piSeq % 4 === 0) ? $s4 : (($piSeq % 3 === 0) ? $s3 : (($piSeq % 2 === 0) ? $s2 : $s1))),
                    'currency_id' => $currencyId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('PI.%04d.%02d.%05d', $year, $m, $piSeq),
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
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $piIds[] = $docId;

                $t1 = $insertLine($docId, 'purchase_invoice', $pSemen, 80 + ($m * 3), 75000, $dt);
                $t2 = $insertLine($docId, 'purchase_invoice', $pBata, 1200 + ($m * 50), 800, $dt);
                $subtotal = $t1 + $t2;

                DB::table('operation_documents')->where('id', $docId)->update([
                    'subtotal' => $subtotal,
                    'total_amount' => $subtotal,
                    'paid_amount' => $isPaid ? $subtotal : 0,
                    'outstanding_amount' => $isPaid ? 0 : $subtotal,
                ]);
            }
        }

        // 12. Purchase Returns (2025 & 2026)
        $prCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 3; $m <= $maxM; $m += 4) {
                $prCount++;
                $entryDate = sprintf('%04d-%02d-25', $year, $m);
                $dt = Carbon::parse($entryDate);
                $refPiId = $piIds[$prCount - 1] ?? null;
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'purchase_return',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'supplier_id' => $s1,
                    'currency_id' => $currencyId,
                    'related_document_id' => $refPiId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('PR.%04d.%02d.%05d', $year, $m, $prCount),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'purchase_return', $pSemen, 3, 68000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 13. Purchase Payments (2025 & 2026)
        $pySeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $pySeq++;
                $entryDate = sprintf('%04d-%02d-28', $year, $m);
                $dt = Carbon::parse($entryDate);
                $payAmount = 4500000;
                $refDocNo = sprintf('PI.%04d.%02d.%05d', $year, $m, $pySeq);
                $refPiId = $piIds[$pySeq - 1] ?? null;

                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'purchase_payment',
                    'branch_id' => $branchId,
                    'supplier_id' => $s1,
                    'currency_id' => $currencyId,
                    'primary_account_id' => $accBankMnd,
                    'related_document_id' => $refPiId,
                    'document_number' => sprintf('PY.%04d.%02d.%05d', $year, $m, $pySeq),
                    'status' => 'Posted',
                    'payment_method' => 'Transfer Bank',
                    'entry_date' => $entryDate,
                    'subtotal' => $payAmount,
                    'total_amount' => $payAmount,
                    'paid_amount' => $payAmount,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
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
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 14. Item Requests (2025 & 2026)
        $reqCount = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 3) {
                $reqCount++;
                $entryDate = sprintf('%04d-%02d-12', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'item_request',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'responsible_user_id' => $userKasirId,
                    'document_number' => sprintf('REQ.%04d.%02d.%05d', $year, $m, $reqCount),
                    'status' => 'Approved',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => false,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'item_request', $pPaku, 10, 22000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 15. Inventory Adjustments (2025 & 2026 Quarterly Opname)
        $iaSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 3; $m <= $maxM; $m += 3) {
                $iaSeq++;
                $entryDate = sprintf('%04d-%02d-29', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'inventory_adjustment',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('IA.%04d.%02d.%05d', $year, $m, $iaSeq),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 750000,
                    'total_amount' => 750000,
                    'notes' => 'Penyesuaian stok opname fisik berkala toko',
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
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
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 16. Stock Transfers (2025 & 2026)
        $trfSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 2) {
                $trfSeq++;
                $entryDate = sprintf('%04d-%02d-14', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'stock_transfer',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'counterpart_warehouse_id' => 2,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('TRF.%04d.%02d.%05d', $year, $m, $trfSeq),
                    'status' => 'Completed',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                $t1 = $insertLine($docId, 'stock_transfer', $pSemen, 15, 78000, $dt);
                DB::table('operation_documents')->where('id', $docId)->update(['subtotal' => $t1, 'total_amount' => $t1]);
            }
        }

        // 17. Cash Payments (2025 & 2026)
        $accPerlengkapan = DB::table('accounts')->where('code', '120101')->value('id') ?? 18;
        $cpSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $cpSeq++;
                $entryDate = sprintf('%04d-%02d-10', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'cash_payment',
                    'branch_id' => $branchId,
                    'currency_id' => $currencyId,
                    'primary_account_id' => $accKasKecil,
                    'document_number' => sprintf('CP.%04d.%02d.%05d', $year, $m, $cpSeq),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 200000,
                    'total_amount' => 200000,
                    'notes' => 'Pembelian perlengkapan toko',
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'cash_payment',
                    'account_id' => $accPerlengkapan,
                    'description' => 'Pembelian perlengkapan toko',
                    'reference_code' => '120101',
                    'quantity' => 1,
                    'unit_price' => 200000,
                    'total_amount' => 200000,
                    'sort_order' => 1,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 18. Cash Receipts (2025 & 2026)
        $accPendapatanLain = DB::table('accounts')->where('code', '410102')->value('id') ?? 47;
        $crSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $crSeq++;
                $entryDate = sprintf('%04d-%02d-11', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'cash_receipt',
                    'branch_id' => $branchId,
                    'currency_id' => $currencyId,
                    'primary_account_id' => $accKasKecil,
                    'document_number' => sprintf('CR-IN.%04d.%02d.%05d', $year, $m, $crSeq),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 300000,
                    'total_amount' => 300000,
                    'notes' => 'Penerimaan kas pendapatan lain-lain toko',
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'cash_receipt',
                    'account_id' => $accPendapatanLain,
                    'description' => 'Pendapatan Jasa Pengiriman / Lain-Lain',
                    'reference_code' => '410102',
                    'quantity' => 1,
                    'unit_price' => 300000,
                    'total_amount' => 300000,
                    'sort_order' => 1,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 19. Bank Transfers (2025 & 2026)
        $btSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m += 2) {
                $btSeq++;
                $entryDate = sprintf('%04d-%02d-20', $year, $m);
                $dt = Carbon::parse($entryDate);
                DB::table('operation_documents')->insert([
                    'document_type' => 'bank_transfer',
                    'branch_id' => $branchId,
                    'currency_id' => $currencyId,
                    'primary_account_id' => $accBankBCA,
                    'secondary_account_id' => $accBankMnd,
                    'document_number' => sprintf('BT.%04d.%02d.%05d', $year, $m, $btSeq),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 3000000,
                    'total_amount' => 3000000,
                    'notes' => 'Transfer dari Bank BCA ke Bank Mandiri toko',
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 20. General Journal Entries (2025 & 2026)
        $gjSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $gjSeq++;
                $entryDate = sprintf('%04d-%02d-27', $year, $m);
                $dt = Carbon::parse($entryDate);
                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'general_journal',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'responsible_user_id' => $userAdminId,
                    'document_number' => sprintf('GJ.%04d.%02d.%05d', $year, $m, $gjSeq),
                    'reference_number' => 'REF-OPS-' . $gjSeq,
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 500000,
                    'total_amount' => 500000,
                    'notes' => 'Jurnal penyesuaian operasional toko',
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);

                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'general_journal',
                    'account_id' => $accPerlengkapan,
                    'description' => 'Debet Perlengkapan Toko',
                    'reference_code' => '120101',
                    'debit_amount' => 500000,
                    'credit_amount' => 0,
                    'total_amount' => 500000,
                    'sort_order' => 1,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
                DB::table('operation_document_lines')->insert([
                    'operation_document_id' => $docId,
                    'line_type' => 'general_journal',
                    'account_id' => $accKasKecil,
                    'description' => 'Kredit Kas Kecil Toko',
                    'reference_code' => '110101',
                    'debit_amount' => 0,
                    'credit_amount' => 500000,
                    'total_amount' => 500000,
                    'sort_order' => 2,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);
            }
        }

        // 21. Expense Entries (FULL 2025 & 2026 Monthly Expenses - Calibrated for ~Rp 25M / year)
        $accUtangBeban = DB::table('accounts')->where('code', '210202')->value('id') ?? 35;
        $accBebanGaji = DB::table('accounts')->where('code', '610101')->value('id') ?? 54;
        $accBebanListrik = DB::table('accounts')->where('code', '610201')->value('id') ?? 66;

        $expenseTemplates = [
            ['desc' => 'Beban Listrik, Air & Telepon Toko Utama', 'amount' => 750000, 'acc' => $accBebanListrik, 'code' => '610201'],
            ['desc' => 'Beban Pemeliharaan & Servis Kendaraan Toko', 'amount' => 850000, 'acc' => $accBebanListrik, 'code' => '610201'],
            ['desc' => 'Beban Administrasi Kantor & Internet Wi-Fi', 'amount' => 450000, 'acc' => $accBebanListrik, 'code' => '610201'],
        ];

        $expSeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                foreach ($expenseTemplates as $tpl) {
                    $expSeq++;
                    $entryDate = sprintf('%04d-%02d-26', $year, $m);
                    $dueDate = date('Y-m-d', strtotime($entryDate . ' + 14 days'));
                    $dt = Carbon::parse($entryDate);
                    $isPaid = true;

                    $docId = DB::table('operation_documents')->insertGetId([
                        'document_type' => 'expense_entry',
                        'branch_id' => $branchId,
                        'warehouse_id' => $warehouseId,
                        'currency_id' => $currencyId,
                        'primary_account_id' => $accUtangBeban,
                        'document_number' => sprintf('EXP.%04d.%02d.%05d', $year, $m, $expSeq),
                        'status' => 'Terbayar',
                        'entry_date' => $entryDate,
                        'due_date' => $dueDate,
                        'subtotal' => $tpl['amount'],
                        'total_amount' => $tpl['amount'],
                        'paid_amount' => $tpl['amount'],
                        'outstanding_amount' => 0,
                        'notes' => $tpl['desc'],
                        'metadata' => json_encode([
                            'liability_account_label' => '[210202] Utang Beban Listrik & Air',
                        ]),
                        'is_closed' => true,
                        'created_at' => $dt,
                        'updated_at' => $dt,
                    ]);

                    DB::table('operation_document_lines')->insert([
                        'operation_document_id' => $docId,
                        'line_type' => 'expense_entry',
                        'account_id' => $tpl['acc'],
                        'description' => $tpl['desc'],
                        'reference_code' => $tpl['code'],
                        'quantity' => 1,
                        'unit_price' => $tpl['amount'],
                        'total_amount' => $tpl['amount'],
                        'sort_order' => 1,
                        'attributes' => json_encode([
                            'notes' => 'Rincian ' . $tpl['desc'],
                        ]),
                        'created_at' => $dt,
                        'updated_at' => $dt,
                    ]);
                }
            }
        }

        // 22. Payroll Entries (FULL 2025 & 2026 Monthly Payroll - Calibrated for ~Rp 3.5M / month)
        $employeesList = DB::table('employees')->get();
        $monthsList = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $paySeq = 0;
        for ($year = 2025; $year <= 2026; $year++) {
            $maxM = ($year === 2026) ? 8 : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $paySeq++;
                $entryDate = sprintf('%04d-%02d-28', $year, $m);
                $dt = Carbon::parse($entryDate);
                $monthName = $monthsList[$m];
                $totalDocAmount = 0;

                $docId = DB::table('operation_documents')->insertGetId([
                    'document_type' => 'payroll_entry',
                    'branch_id' => $branchId,
                    'warehouse_id' => $warehouseId,
                    'currency_id' => $currencyId,
                    'primary_account_id' => 34,
                    'document_number' => sprintf('PAY.%04d.%02d.%05d', $year, $m, $paySeq),
                    'status' => 'Posted',
                    'entry_date' => $entryDate,
                    'subtotal' => 0,
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'outstanding_amount' => 0,
                    'notes' => 'Gaji Pokok & Tunjangan Karyawan Periode ' . $monthName . ' ' . $year,
                    'metadata' => json_encode([
                        'payment_type' => 'Bulanan',
                        'period_month' => $monthName,
                        'period_year' => (string) $year,
                        'liability_account_id' => 34,
                    ]),
                    'is_closed' => true,
                    'created_at' => $dt,
                    'updated_at' => $dt,
                ]);

                foreach ($employeesList as $empIdx => $emp) {
                    $baseSal = 1800000 + ($empIdx * 300000);
                    $taxVal = 50000;
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
                            'positionAllowance' => 150000,
                            'mealAllowance' => 100000,
                            'transportAllowance' => 50000,
                            'grossIncomeRaw' => $baseSal,
                            'incomeTaxRaw' => $taxVal,
                            'paidSalaryRaw' => $netPaid,
                        ]),
                        'created_at' => $dt,
                        'updated_at' => $dt,
                    ]);
                }

                DB::table('operation_documents')->where('id', $docId)->update([
                    'subtotal' => $totalDocAmount,
                    'total_amount' => $totalDocAmount,
                    'paid_amount' => $totalDocAmount,
                ]);
            }
        }

        // 23. Seed operation_document_user pivot table
        DB::table('operation_document_user')->truncate();
        $allDocs = DB::table('operation_documents')->get();
        foreach ($allDocs as $doc) {
            $respUserId = $doc->responsible_user_id ?? $userAdminId;
            DB::table('operation_document_user')->insertOrIgnore([
                'operation_document_id' => $doc->id,
                'user_id' => $respUserId,
            ]);
            if ($respUserId !== $userAdminId) {
                DB::table('operation_document_user')->insertOrIgnore([
                    'operation_document_id' => $doc->id,
                    'user_id' => $userAdminId,
                ]);
            }
        }
    }
}
