<?php

namespace App\Support\Analytics;

use Illuminate\Support\Facades\DB;

class AprioriAnalysisService
{
    /**
     * Jalankan Algoritma Apriori.
     *
     * @param float $minSupport
     * @param float $minConfidence
     * @return array
     */
    public function calculate(float $minSupport = 0.05, float $minConfidence = 0.4): array
    {
      // Ambil invoice penjualan

        $transactions = DB::table('operation_documents')
            ->where('document_type', 'sales_invoice')
            ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
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

      // Buat daftar transaksi item

        $transactionItems = [];
        $allProducts = [];

        if ($transactions->isNotEmpty()) {
            $transactionIds = $transactions->pluck('id')->toArray();

            $linesGrouped = DB::table('operation_document_lines')
                ->whereIn('operation_document_id', $transactionIds)
                ->whereNotNull('product_id')
                ->select('operation_document_id', 'product_id')
                ->get()
                ->groupBy('operation_document_id');

            foreach ($transactions as $t) {
                $lines = $linesGrouped->get($t->id);
                if (!$lines || $lines->isEmpty()) {
                    continue;
                }

                $pids = $lines->pluck('product_id')->unique()->toArray();
                $transactionItems[] = $pids;

                foreach ($pids as $pid) {
                    $allProducts[$pid] = ($allProducts[$pid] ?? 0) + 1;
                }
            }
        }

      // Hitung itemset 1-frequent

        $frequent1 = [];
        foreach ($allProducts as $pid => $count) {
            $support = $count / $n;
            if ($support >= $minSupport) {
                $frequent1[$pid] = $support;
            }
        }

      // Hitung itemset 2-frequent

        $frequent2 = [];
        $f1_keys = array_keys($frequent1);
        $num_f1 = count($f1_keys);

        for ($i = 0; $i < $num_f1; $i++) {
            for ($j = $i + 1; $j < $num_f1; $j++) {
                $pid1 = $f1_keys[$i];
                $pid2 = $f1_keys[$j];

              // Hitung kemunculan

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

      // Buat aturan asosiasi

        $rules = [];
        $ruleId = 1;

      // Peta kategori ABC

        $abcSalesData = DB::table('operation_document_lines')
            ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
            ->where('operation_documents.document_type', 'sales_invoice')
            ->whereIn('operation_documents.status', ['Posted', 'Lunas', 'Belum Lunas'])
            ->select(
                'operation_document_lines.product_id',
                DB::raw('SUM(operation_document_lines.total_amount) as revenue')
            )
            ->groupBy('operation_document_lines.product_id')
            ->orderByDesc('revenue')
            ->get();

        $totalRevenue = $abcSalesData->sum('revenue');
        $cumulativeRevenue = 0;
        $abcMap = [];
        $itemsA = 0;

        foreach ($abcSalesData as $row) {
            $revenue = (float) $row->revenue;
            $cumulativeRevenue += $revenue;
            $cumulativeShare = $totalRevenue > 0 ? ($cumulativeRevenue / $totalRevenue) * 100 : 100;

            if ($cumulativeShare <= 80 || $itemsA === 0) {
                $category = 'A';
                $color = '#2d77d1';
                $itemsA++;
            } elseif ($cumulativeShare <= 95) {
                $category = 'B';
                $color = '#4caf50';
            } else {
                $category = 'C';
                $color = '#f4a62a';
            }

            $abcMap[$row->product_id] = [
                'category' => $category,
                'color' => $color,
            ];
        }

      // Ambil nama produk

        $productNames = DB::table('products')
            ->pluck('name', 'id')
            ->toArray();

        foreach ($frequent2 as $f2) {
            $pid1 = $f2['items'][0];
            $pid2 = $f2['items'][1];
            $supportF2 = $f2['support'];

          // Aturan 1

            $support1 = $frequent1[$pid1];
            $support2 = $frequent1[$pid2];

            $confidence1 = $supportF2 / $support1;
            $lift1 = $confidence1 / $support2;

            if ($confidence1 >= $minConfidence) {
                $rules[] = [
                    'id' => 'rule-' . $ruleId++,
                    'antecedent' => $productNames[$pid1] ?? "Product #{$pid1}",
                    'consequent' => $productNames[$pid2] ?? "Product #{$pid2}",
                    'antecedentAbc' => $abcMap[$pid1]['category'] ?? 'C',
                    'antecedentColor' => $abcMap[$pid1]['color'] ?? '#f4a62a',
                    'consequentAbc' => $abcMap[$pid2]['category'] ?? 'C',
                    'consequentColor' => $abcMap[$pid2]['color'] ?? '#f4a62a',
                    'support' => number_format($supportF2 * 100, 1) . '%',
                    'confidence' => number_format($confidence1 * 100, 1) . '%',
                    'lift' => number_format($lift1, 2),
                    'confidenceValue' => (int) ($confidence1 * 100),
                    'supportValue' => (int) ($supportF2 * 100),
                ];
            }

          // Aturan 2

            $confidence2 = $supportF2 / $support2;
            $lift2 = $confidence2 / $support1;

            if ($confidence2 >= $minConfidence) {
                $rules[] = [
                    'id' => 'rule-' . $ruleId++,
                    'antecedent' => $productNames[$pid2] ?? "Product #{$pid2}",
                    'consequent' => $productNames[$pid1] ?? "Product #{$pid1}",
                    'antecedentAbc' => $abcMap[$pid2]['category'] ?? 'C',
                    'antecedentColor' => $abcMap[$pid2]['color'] ?? '#f4a62a',
                    'consequentAbc' => $abcMap[$pid1]['category'] ?? 'C',
                    'consequentColor' => $abcMap[$pid1]['color'] ?? '#2d77d1',
                    'support' => number_format($supportF2 * 100, 1) . '%',
                    'confidence' => number_format($confidence2 * 100, 1) . '%',
                    'lift' => number_format($lift2, 2),
                    'confidenceValue' => (int) ($confidence2 * 100),
                    'supportValue' => (int) ($supportF2 * 100),
                ];
            }
        }

      // Urutkan aturan dari confidence tertinggi

        usort($rules, function ($a, $b) {
            return $b['confidenceValue'] <=> $a['confidenceValue'];
        });

      // Ambil 7 aturan teratasHey, Cortana. Stop by the moment. Find my glove makes you saw and Sandman to let strange apartments for Christmas. I see. Besides, man I Love make some songs and send a man to let strangers bark for a few months. I. Hey, Cortana. Stop. Because. I. Hey, Cortana. I guess we'll never know. Hey, Cortana. Characteristic. Einstein. Like. Science. Implementer informacy. Characteristic. Like. Hey, Cortana. Play. Hello. Hey, Cortana. Does the sheep. The seat to a new super tower. Start Padmavathi. Owaisi. Shashank Ajit Anirudh. Yadav. What? Is. The. Hey, Cortana. Open Settings. Show Nakshatra movie. KRNDTS former. Do I love Patagonia to get a thing? MV Department of. Ajay Devgn. Doctor Shane. Tune into. Pratas. Kins. The Sunil comedy and. About Madhuri Dixit. Hey, Cortana. What are you drinking? Sohail Bhattacharjee. Uttar Pradesh. Pakistan. Pakistan. Speeches. Hey, Cortana. Ajmer movie to work on. Cortana. Hey, Cortana. Cortana. Sara Kalam says. Play. Hey, Cortana. HSBC. No. Please. It is. Begin. Hey, Cortana. Whatever. Hey, Cortana. Hey, Cortana. Pakistan. Hey, Cortana. What comes next? World War Two? US. USAA disrupts A. Hey, Cortana. World war is always. Pakistan. Hey, Cortana. Open. Hey, Cortana. Hello. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Cortana. Hello. What's up? Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hello. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hey, Cortana. Hello. Hello. Hey, Cortana. Hey, Cortana. Update. Hello. Cortana. Hey, Cortana. What's the weather? Hey, Cortana. Play. Hey,Hey, Cortana. Akhilesh Yadav. 2018. Connect to my. CSL by Leading PCI. How are you? Hey, Cortana. kueku Cortana. Hey, Cortana. Right. Hey, Cortana.

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
