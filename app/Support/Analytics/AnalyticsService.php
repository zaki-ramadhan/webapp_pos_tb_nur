<?php

namespace App\Support\Analytics;

use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Perform ABC Analysis on Sales Data.
     *
     * @return array
     */
    public function getAbcAnalysis(): array
    {
        // 1. Query total sales amount and units sold per product
        $salesData = DB::table('operation_document_lines')
            ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
            ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
            ->leftJoin('units', 'products.base_unit_id', '=', 'units.id')
            ->where('operation_documents.document_type', 'sales_invoice')
            ->where('operation_documents.status', 'Posted')
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.code as product_code',
                DB::raw('SUM(operation_document_lines.quantity) as units_sold'),
                DB::raw('SUM(operation_document_lines.total_amount) as revenue'),
                'units.name as unit_name'
            )
            ->groupBy('products.id', 'products.name', 'products.code', 'units.name')
            ->orderByDesc('revenue')
            ->get();

        $totalRevenue = $salesData->sum('revenue');

        if ($totalRevenue <= 0) {
            return [
                'metrics' => [
                    ['label' => 'Item A', 'value' => '0', 'helper' => '0% kontribusi omzet', 'tone' => 'blue'],
                    ['label' => 'Item B', 'value' => '0', 'helper' => '0% kontribusi omzet', 'tone' => 'green'],
                    ['label' => 'Item C', 'value' => '0', 'helper' => '0% kontribusi omzet', 'tone' => 'amber'],
                    ['label' => 'Nilai Analisis', 'value' => 'Rp 0', 'helper' => 'Tidak ada transaksi', 'tone' => 'rose'],
                ],
                'distribution' => [],
                'topItems' => [],
                'insight' => 'Belum ada transaksi penjualan yang terdaftar.',
            ];
        }

        $cumulativeRevenue = 0;
        $itemsA = 0;
        $itemsB = 0;
        $itemsC = 0;
        
        $revenueA = 0;
        $revenueB = 0;
        $revenueC = 0;

        $topItems = [];

        foreach ($salesData as $row) {
            $revenue = (float) $row->revenue;
            $cumulativeRevenue += $revenue;
            $cumulativeShare = ($cumulativeRevenue / $totalRevenue) * 100;

            // ABC Classification: A (0-80%), B (80-95%), C (95-100%)
            if ($cumulativeShare <= 80 || $itemsA === 0) {
                $category = 'A';
                $color = '#2d77d1';
                $itemsA++;
                $revenueA += $revenue;
            } elseif ($cumulativeShare <= 95) {
                $category = 'B';
                $color = '#4caf50';
                $itemsB++;
                $revenueB += $revenue;
            } else {
                $category = 'C';
                $color = '#f4a62a';
                $itemsC++;
                $revenueC += $revenue;
            }

            // Top items list
            if (count($topItems) < 5) {
                $topItems[] = [
                    'name' => $row->product_name,
                    'code' => $row->product_code,
                    'unitsSold' => number_format($row->units_sold, 0, ',', '.') . ' ' . ($row->unit_name ?? 'pcs'),
                    'revenue' => 'Rp ' . number_format($revenue, 0, ',', '.') . ',00',
                    'share' => number_format(($revenue / $totalRevenue) * 100, 1, ',', '.') . '%',
                    'category' => $category,
                    'categoryColor' => $color,
                ];
            }
        }

        $pctA = $totalRevenue > 0 ? ($revenueA / $totalRevenue) * 100 : 0;
        $pctB = $totalRevenue > 0 ? ($revenueB / $totalRevenue) * 100 : 0;
        $pctC = $totalRevenue > 0 ? ($revenueC / $totalRevenue) * 100 : 0;

        $metrics = [
            [
                'label' => 'Item A',
                'value' => (string) $itemsA,
                'helper' => number_format($pctA, 0) . '% kontribusi omzet',
                'tone' => 'blue',
            ],
            [
                'label' => 'Item B',
                'value' => (string) $itemsB,
                'helper' => number_format($pctB, 0) . '% kontribusi omzet',
                'tone' => 'green',
            ],
            [
                'label' => 'Item C',
                'value' => (string) $itemsC,
                'helper' => number_format($pctC, 0) . '% kontribusi omzet',
                'tone' => 'amber',
            ],
            [
                'label' => 'Nilai Analisis',
                'value' => 'Rp ' . number_format($totalRevenue / 1000000, 1, ',', '.') . ' jt',
                'helper' => 'Berdasarkan penjualan material dan perlengkapan bangunan',
                'tone' => 'rose',
            ],
        ];

        $distribution = [
            [
                'label' => 'A',
                'title' => 'Material inti proyek dan renovasi',
                'share' => number_format($pctA, 0) . '%',
                'itemCount' => $itemsA . ' item',
                'barWidth' => number_format($pctA, 0) . '%',
                'color' => '#2d77d1',
            ],
            [
                'label' => 'B',
                'title' => 'Pelengkap bangunan yang tetap rutin bergerak',
                'share' => number_format($pctB, 0) . '%',
                'itemCount' => $itemsB . ' item',
                'barWidth' => number_format($pctB, 0) . '%',
                'color' => '#4caf50',
            ],
            [
                'label' => 'C',
                'title' => 'Aksesoris dan item lambat gerak',
                'share' => number_format($pctC, 0) . '%',
                'itemCount' => $itemsC . ' item',
                'barWidth' => number_format($pctC, 0) . '%',
                'color' => '#f4a62a',
            ],
        ];

        $primaryProduct = $salesData->first();
        $insight = $primaryProduct 
            ? "Stok {$primaryProduct->product_name} sebaiknya lebih diprioritaskan. Barang ini memberi porsi omzet paling besar."
            : "Stok semen, besi, dan cat sebaiknya lebih diprioritaskan.";

        return [
            'metrics' => $metrics,
            'distribution' => $distribution,
            'topItems' => $topItems,
            'insight' => $insight,
        ];
    }

    /**
     * Run Apriori Algorithm to find Association Rules.
     *
     * @param float $minSupport
     * @param float $minConfidence
     * @return array
     */
    public function getAprioriAnalysis(float $minSupport = 0.05, float $minConfidence = 0.4): array
    {
        // 1. Fetch all Posted sales invoices
        $transactions = DB::table('operation_documents')
            ->where('document_type', 'sales_invoice')
            ->where('status', 'Posted')
            ->select('id')
            ->get();

        $n = $transactions->count();

        if ($n <= 0) {
            return [
                'metrics' => [
                    ['label' => 'Transaksi', 'value' => '0', 'helper' => 'Periode Aktif', 'tone' => 'blue'],
                    ['label' => 'Min Support', 'value' => number_format($minSupport * 100, 0) . '%', 'helper' => 'Batas rule yang diproses', 'tone' => 'green'],
                    ['label' => 'Min Confidence', 'value' => number_format($minConfidence * 100, 0) . '%', 'helper' => 'Rule valid untuk dashboard', 'tone' => 'amber'],
                    ['label' => 'Rule Valid', 'value' => '0', 'helper' => 'Siap dipakai sebagai insight', 'tone' => 'rose'],
                ],
                'rules' => [],
                'insight' => 'Belum ada transaksi penjualan yang terdaftar.',
            ];
        }

        // 2. Build list of transactions with item sets
        $transactionItems = [];
        $allProducts = [];

        foreach ($transactions as $t) {
            $lines = DB::table('operation_document_lines')
                ->where('operation_document_id', $t->id)
                ->whereNotNull('product_id')
                ->pluck('product_id')
                ->toArray();

            if (empty($lines)) {
                continue;
            }

            // Store distinct product IDs in this transaction
            $itemset = array_unique($lines);
            $transactionItems[] = $itemset;

            foreach ($itemset as $pid) {
                $allProducts[$pid] = ($allProducts[$pid] ?? 0) + 1;
            }
        }

        // 3. Compute Frequent 1-Itemsets (F1)
        $frequent1 = [];
        foreach ($allProducts as $pid => $count) {
            $support = $count / $n;
            if ($support >= $minSupport) {
                $frequent1[$pid] = $support;
            }
        }

        // 4. Generate candidate 2-Itemsets and compute support
        $frequent2 = [];
        $f1_keys = array_keys($frequent1);
        $num_f1 = count($f1_keys);

        for ($i = 0; $i < $num_f1; $i++) {
            for ($j = $i + 1; $j < $num_f1; $j++) {
                $pid1 = $f1_keys[$i];
                $pid2 = $f1_keys[$j];

                // Count co-occurrences
                $coCount = 0;
                foreach ($transactionItems as $itemset) {
                    if (in_array($pid1, $itemset) && in_array($pid2, $itemset)) {
                        $coCount++;
                    }
                }

                $support = $coCount / $n;
                if ($support >= $minSupport) {
                    $frequent2[] = [
                        'items' => [$pid1, $pid2],
                        'support' => $support,
                    ];
                }
            }
        }

        // 5. Generate Association Rules from Frequent 2-Itemsets
        $rules = [];
        $ruleId = 1;

        // Fetch product names to make rules highly readable
        $productNames = DB::table('products')
            ->pluck('name', 'id')
            ->toArray();

        foreach ($frequent2 as $f2) {
            $pid1 = $f2['items'][0];
            $pid2 = $f2['items'][1];
            $supportF2 = $f2['support'];

            // Rule 1: pid1 -> pid2
            $support1 = $frequent1[$pid1];
            $support2 = $frequent1[$pid2];
            
            $confidence1 = $supportF2 / $support1;
            $lift1 = $confidence1 / $support2;

            if ($confidence1 >= $minConfidence) {
                $rules[] = [
                    'id' => 'rule-' . $ruleId++,
                    'antecedent' => $productNames[$pid1] ?? "Product #{$pid1}",
                    'consequent' => $productNames[$pid2] ?? "Product #{$pid2}",
                    'support' => number_format($supportF2 * 100, 1) . '%',
                    'confidence' => number_format($confidence1 * 100, 1) . '%',
                    'lift' => number_format($lift1, 2),
                    'confidenceValue' => (int) ($confidence1 * 100),
                    'supportValue' => (int) ($supportF2 * 100),
                ];
            }

            // Rule 2: pid2 -> pid1
            $confidence2 = $supportF2 / $support2;
            $lift2 = $confidence2 / $support1;

            if ($confidence2 >= $minConfidence) {
                $rules[] = [
                    'id' => 'rule-' . $ruleId++,
                    'antecedent' => $productNames[$pid2] ?? "Product #{$pid2}",
                    'consequent' => $productNames[$pid1] ?? "Product #{$pid1}",
                    'support' => number_format($supportF2 * 100, 1) . '%',
                    'confidence' => number_format($confidence2 * 100, 1) . '%',
                    'lift' => number_format($lift2, 2),
                    'confidenceValue' => (int) ($confidence2 * 100),
                    'supportValue' => (int) ($supportF2 * 100),
                ];
            }
        }

        // Sort rules by confidence descending
        usort($rules, function ($a, $b) {
            return $b['confidenceValue'] <=> $a['confidenceValue'];
        });

        // Take top 7 rules to keep UI neat
        $rules = array_slice($rules, 0, 7);

        $metrics = [
            [
                'label' => 'Transaksi',
                'value' => number_format($n, 0, ',', '.'),
                'helper' => 'Periode Aktif',
                'tone' => 'blue',
            ],
            [
                'label' => 'Min Support',
                'value' => number_format($minSupport * 100, 0) . '%',
                'helper' => 'Batas rule yang diproses',
                'tone' => 'green',
            ],
            [
                'label' => 'Min Confidence',
                'value' => number_format($minConfidence * 100, 0) . '%',
                'helper' => 'Rule valid untuk dashboard',
                'tone' => 'amber',
            ],
            [
                'label' => 'Rule Valid',
                'value' => (string) count($rules),
                'helper' => 'Siap dipakai sebagai insight',
                'tone' => 'rose',
            ],
        ];

        $topRule = $rules[0] ?? null;
        $insight = $topRule
            ? "Pelanggan yang membeli {$topRule['antecedent']} memiliki peluang {$topRule['confidence']} untuk membeli {$topRule['consequent']}. Buat paket bundling diskon!"
            : "Pasangkan barang terkait berdekatan di rak untuk memicu pembelian impulsif.";

        return [
            'metrics' => $metrics,
            'rules' => $rules,
            'insight' => $insight,
        ];
    }
}
