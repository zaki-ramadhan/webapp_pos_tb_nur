<?php

namespace App\Support\Presentation;

use App\Support\Presentation\Blueprints\PageBlueprintRegistry;
use App\Support\Presentation\PosBlueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class DashboardBlueprintProvider
{
    public static function get(?array $abc = null, ?array $apriori = null, bool $loadData = true, ?string $asOfDate = null): array
    {
        $attachmentsNotice = [
            'parts' => [
                ['text' => 'Silahkan pilih Menu Transaksi yang '],
                ['text' => 'MEWAJIBKAN', 'emphasis' => true],
                ['text' => ' pengguna menyertakan lampiran saat menyimpan transaksi.'],
            ],
        ];

        $analytics = \App\Support\Presentation\Queries\DashboardAnalyticsQueryService::getAnalytics($loadData, $asOfDate);
        extract($analytics);

        $jan1ThisYear = date('Y-01-01', strtotime($latestSalesInvoiceDate));
        $jan1LastYear = date('Y-01-01', strtotime($latestSalesInvoiceDate . ' -1 year'));
        $monthStartThisYear = date('Y-m-01', strtotime($latestSalesInvoiceDate));

        $navigationModules = PosBlueprint::navigationModules();
        $navigationPages = PosBlueprint::buildNavigationPages($navigationModules);

        $data = [
            'toolbar' => [],
            'searchModal' => [
                    'closeLabel' => 'Tutup pencarian menu',
                    'searchPlaceholder' => 'Cari...',
                    'topLabel' => 'Menu Teratas',
                    'resultLabel' => 'Hasil Pencarian',
                    'emptyLabel' => 'Tidak ada menu yang cocok dengan kata kunci tersebut.',
                    'topItemIds' => [
                        'group-access',
                        'preferences',
                        'recurring-transactions',
                        'employees',
                        'fob-master',
                        'salary-allowance',
                        'department',
                        'contacts',
                        'activity-log',
                    ],
                ],
            'sidebar' => [
                'items' => PosBlueprint::buildSidebarItems($navigationModules),
            ],
            'pages' => array_replace(
                [
                    'dashboard' => [
                        'id' => 'dashboard',
                        'label' => 'Dashboard',
                    ],
                ],
                $navigationPages,
                PageBlueprintRegistry::all($navigationPages, $transactionTypeOptions)
            ),
            'widgets' => [
                [
                    'id' => 'integrated-analysis',
                    'title' => 'Analisis Kombinasi Produk & Prioritas Omzet (Metode Apriori & ABC)',
                    'subtitle' => 'Strategi display produk sering dibeli bersama (Apriori) & prioritas stok penyumbang omzet (ABC)',
                    'type' => 'integrated-analysis',
                    'metrics' => [
                        [
                            'label' => 'Transaksi',
                            'value' => '2.184',
                            'helper' => 'Periode April 2026',
                            'tone' => 'blue',
                        ],
                        [
                            'label' => 'Rule Siap Pakai',
                            'value' => '7',
                            'helper' => 'Pola asosiasi kuat',
                            'tone' => 'rose',
                        ],
                        [
                            'label' => 'Fokus Stok (Kat A)',
                            'value' => '14',
                            'helper' => '76% kontribusi omzet',
                            'tone' => 'blue',
                        ],
                    ],
                    'distribution' => [
                        'labels' => ['Kategori A', 'Kategori B', 'Kategori C'],
                        'datasets' => [
                            [
                                'data' => [14, 18, 68],
                                'backgroundColor' => ['#ffd15d', '#86c7ff', '#ff8463'],
                            ],
                        ],
                    ],
                    'rules' => [
                        [
                            'id' => 'rule-1',
                            'segment' => 'Top Rule',
                            'transactionBase' => 'Rule Valid',
                            'antecedent' => 'Semen Padang 50kg',
                            'consequent' => 'Pasir Cor 1 Colt',
                            'antecedentAbc' => 'A',
                            'antecedentColor' => '#ffd15d',
                            'consequentAbc' => 'A',
                            'consequentColor' => '#ffd15d',
                            'support' => '42%',
                            'confidence' => '78%',
                            'lift' => '1.8x',
                            'insight' => 'Pembelian Semen Padang 50kg [A] sering diikuti Pasir Cor 1 Colt [A].',
                        ],
                    ],
                    'topItems' => [
                        [
                            'name' => 'Besi Beton 10mm',
                            'category' => 'Kat A',
                            'share' => '28,4%',
                            'color' => '#ffd15d',
                        ],
                    ],
                    'insight' => 'Rekomendasi Utama: Pelanggan yang membeli Semen Padang 50kg [Kat A] memiliki peluang 78% untuk membeli Pasir Cor 1 Colt [Kat A]. Kombinasikan dengan prioritas stok Besi Beton 10mm [Kat A] yang menyumbang 28,4% omzet toko.',
                    'heightClass' => 'min-h-[460px]',
                ],
                [
                    'id' => 'recent-activity',
                    'title' => 'Aktivitas Terakhir Anda',
                    'type' => 'recent-activity',
                    'items' => $userActivities,
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'sales-trend',
                    'title' => 'Tren Penjualan',
                    'type' => 'line',
                    'period' => self::dateId(date('Y-m-d', strtotime($latestSalesInvoiceDate . ' -6 days'))) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'labels' => $salesTrendLabels,
                    'series' => [
                        [
                            'name' => 'Penjualan',
                            'data' => $salesTrendData,
                        ],
                    ],
                    'valueFormat' => 'currency',
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'profit-loss',
                    'title' => 'Laba/Rugi Tahun Ini',
                    'type' => 'ring-breakdown',
                    'percentage' => $profitPercentage,
                    'totalLabel' => $netProfitVal < 0 ? 'Rugi' : 'Laba',
                    'totalValue' => 'Rp ' . number_format(abs($netProfitVal), 0, ',', '.'),
                    'period' => self::dateId($jan1ThisYear) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'compare' => 'Dibanding ' . self::dateId($jan1LastYear) . ' - ' . self::dateId($latestSalesInvoiceDate . ' -1 year'),
                    'trend' => $profitTrend,
                    'growth' => $profitGrowth,
                    'legend' => [
                        [
                            'label' => 'Total Pendapatan Penjualan',
                            'value' => 'Rp ' . number_format($totalSalesVal, 0, ',', '.'),
                            'percent' => $pctRev . '%',
                            'color' => '#4ade80',
                            'trend' => $salesTrend,
                            'growth' => $salesGrowth,
                            'tone' => $salesTone,
                        ],
                        [
                            'label' => 'Total HPP',
                            'value' => 'Rp ' . number_format($totalHppVal, 0, ',', '.'),
                            'percent' => $pctHpp . '%',
                            'color' => '#fb923c',
                            'trend' => $hppTrend,
                            'growth' => $hppGrowth,
                            'tone' => $hppTone,
                        ],
                        [
                            'label' => 'Total Pengeluaran Beban',
                            'value' => 'Rp ' . number_format($totalExpensesVal, 0, ',', '.'),
                            'percent' => $pctExp . '%',
                            'color' => '#f87171',
                            'trend' => $expensesTrend,
                            'growth' => $expensesGrowth,
                            'tone' => $expensesTone,
                        ],
                    ],
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'cash-flow',
                    'title' => 'Arus Kas',
                    'type' => 'line',
                    'period' => self::dateId(date('Y-m-d', strtotime($latestSalesInvoiceDate . ' -6 days'))) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'labels' => $cashFlowLabels,
                    'series' => [
                        [
                            'name' => 'Kas Masuk',
                            'data' => $cashInSeries,
                            'color' => '#4ade80',
                        ],
                        [
                            'name' => 'Kas Keluar',
                            'data' => $cashOutSeries,
                            'color' => '#f87171',
                        ],
                    ],
                    'valueFormat' => 'currency',
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'company-expense',
                    'title' => 'Beban Toko',
                    'type' => 'expense',
                    'totalValue' => 'Rp ' . number_format($totalExpense, 0, ',', '.'),
                    'percentage' => ($totalExpense > 0 ? ($pctGaji > 0 ? $pctGaji : $pctOpr) : 0) . '%',
                    'period' => self::dateId($jan1ThisYear) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'compare' => 'Dibanding ' . self::dateId($jan1LastYear) . ' - ' . self::dateId($latestSalesInvoiceDate . ' -1 year'),
                    'trend' => $expenseTrend,
                    'growth' => $expenseGrowth,
                    'legend' => [
                        [
                            'label' => 'Gaji Karyawan',
                            'value' => 'Rp ' . number_format($totalGaji, 0, ',', '.'),
                            'percent' => $pctGaji . '%',
                            'color' => '#818cf8',
                            'trend' => $gajiTrend,
                            'growth' => $gajiGrowth,
                            'tone' => $gajiTone,
                        ],
                        [
                            'label' => 'Beban Operasional',
                            'value' => 'Rp ' . number_format($totalOperasional, 0, ',', '.'),
                            'percent' => $pctOpr . '%',
                            'color' => '#fb7185',
                            'trend' => $operasionalTrend,
                            'growth' => $operasionalGrowth,
                            'tone' => $operasionalTone,
                        ],
                    ],
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'sales-summary',
                    'title' => 'Penjualan',
                    'type' => 'summary',
                    'period' => self::dateId($monthStartThisYear) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'sections' => [
                        [
                            'title' => 'Status Piutang',
                            'items' => [
                                ['label' => 'Faktur Lunas', 'value' => 'Rp ' . number_format($fakturLunasSales, 0, ',', '.'), 'color' => '#22c55e'],
                                ['label' => 'Belum Lunas', 'value' => 'Rp ' . number_format($fakturBelumLunasSales, 0, ',', '.'), 'color' => '#eab308'],
                            ],
                        ],
                        [
                            'title' => 'Jatuh Tempo',
                            'items' => [
                                ['label' => 'Belum Jatuh Tempo', 'value' => 'Rp ' . number_format($belumJatuhTempoSales, 0, ',', '.'), 'color' => '#f59e0b'],
                                ['label' => 'Lewat Jatuh Tempo', 'value' => 'Rp ' . number_format($lewatJatuhTempoSales, 0, ',', '.'), 'color' => '#ef4444'],
                            ],
                        ],
                    ],
                    'headline' => [
                        'label' => 'Pendapatan',
                        'value' => 'Rp ' . number_format($fakturLunasSales + $fakturBelumLunasSales, 0, ',', '.'),
                        'secondaryLabel' => 'Belum Lunas',
                        'secondaryValue' => 'Rp ' . number_format($belumJatuhTempoSales + $lewatJatuhTempoSales, 0, ',', '.'),
                    ],
                    'heightClass' => 'min-h-[210px]',
                ],
                [
                    'id' => 'purchase-summary',
                    'title' => 'Pembelian',
                    'type' => 'summary',
                    'period' => self::dateId($monthStartThisYear) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'sections' => [
                        [
                            'title' => 'Status Hutang',
                            'items' => [
                                ['label' => 'Faktur Lunas', 'value' => 'Rp ' . number_format($fakturLunasPurchase, 0, ',', '.'), 'color' => '#22c55e'],
                                ['label' => 'Belum Lunas', 'value' => 'Rp ' . number_format($fakturBelumLunasPurchase, 0, ',', '.'), 'color' => '#eab308'],
                            ],
                        ],
                        [
                            'title' => 'Jatuh Tempo',
                            'items' => [
                                ['label' => 'Belum Jatuh Tempo', 'value' => 'Rp ' . number_format($belumJatuhTempoPurchase, 0, ',', '.'), 'color' => '#f59e0b'],
                                ['label' => 'Lewat Jatuh Tempo', 'value' => 'Rp ' . number_format($lewatJatuhTempoPurchase, 0, ',', '.'), 'color' => '#ef4444'],
                            ],
                        ],
                    ],
                    'headline' => [
                        'label' => 'Pembelian',
                        'value' => 'Rp ' . number_format($fakturLunasPurchase + $fakturBelumLunasPurchase, 0, ',', '.'),
                        'secondaryLabel' => 'Belum Lunas',
                        'secondaryValue' => 'Rp ' . number_format($belumJatuhTempoPurchase + $lewatJatuhTempoPurchase, 0, ',', '.'),
                    ],
                    'heightClass' => 'min-h-[210px]',
                ],
                [
                    'id' => 'top-products',
                    'title' => 'Barang Paling Laku',
                    'type' => 'top-products',
                    'items' => $topProductsItems,
                    'heightClass' => 'h-[310px]',
                ],
                [
                    'id' => 'cash-availability',
                    'title' => 'Ketersediaan Kas',
                    'type' => 'cash-availability',
                    'period' => self::dateId(date('Y-m-d', strtotime($latestSalesInvoiceDate . ' -6 days'))) . ' - ' . self::dateId($latestSalesInvoiceDate),
                    'asOfDate' => $latestSalesInvoiceDate,
                    'balanceLabel' => 'Estimasi Saldo Kas Berjalan',
                    'balanceValue' => $cashAvailabilitySeries !== [] ? 'Rp ' . number_format(end($cashAvailabilitySeries), 0, ',', '.') : 'Rp -',
                    'labels' => $cashAvailabilityLabels,
                    'series' => [
                        [
                            'name' => 'Saldo Kas',
                            'data' => $cashAvailabilitySeries,
                        ],
                    ],
                    'valueFormat' => 'currency',
                    'heightClass' => 'min-h-[310px]',
                ],
            ],
            'transactionTypeOptions' => $transactionTypeOptions,
        ];

      // Gabung data ABC & Apriori

        foreach ($data['widgets'] as &$w) {
            if ($w['id'] === 'integrated-analysis' || str_starts_with($w['id'], 'integrated-analysis')) {
                $combinedMetrics = [];
                if ($apriori !== null && isset($apriori['metrics'])) {
                    foreach ($apriori['metrics'] as $m) {
                        if ($m['label'] === 'Transaksi' || $m['label'] === 'Rule Valid') {
                            $combinedMetrics[] = $m;
                        }
                    }
                }
                if ($abc !== null && isset($abc['metrics'])) {
                    foreach ($abc['metrics'] as $m) {
                        if ($m['label'] === 'Item A' || $m['label'] === 'Nilai Analisis') {
                            if ($m['label'] === 'Item A') {
                                $m['label'] = 'Fokus Stok (Kat A)';
                            }
                            $combinedMetrics[] = $m;
                        }
                    }
                }

                if (!empty($combinedMetrics)) {
                    $w['metrics'] = $combinedMetrics;
                }

                if ($abc !== null) {
                    $w['distribution'] = $abc['distribution'];
                    $w['topItems'] = $abc['topItems'];
                }

                if ($apriori !== null) {
                    $formattedRules = [];
                    foreach ($apriori['rules'] as $rule) {
                        $formattedRules[] = [
                            'id' => $rule['id'],
                            'segment' => 'Top Rule',
                            'transactionBase' => 'Rule Valid',
                            'antecedent' => $rule['antecedent'],
                            'consequent' => $rule['consequent'],
                            'antecedentAbc' => $rule['antecedentAbc'] ?? null,
                            'antecedentColor' => $rule['antecedentColor'] ?? null,
                            'consequentAbc' => $rule['consequentAbc'] ?? null,
                            'consequentColor' => $rule['consequentColor'] ?? null,
                            'support' => $rule['support'],
                            'confidence' => $rule['confidence'],
                            'lift' => $rule['lift'],
                            'insight' => "Pembelian {$rule['antecedent']} [" . ($rule['antecedentAbc'] ?? 'C') . "] sering diikuti {$rule['consequent']} [" . ($rule['consequentAbc'] ?? 'C') . "].",
                        ];
                    }
                    $w['rules'] = $formattedRules;
                }

                if ($abc !== null && $apriori !== null && !empty($apriori['rules']) && !empty($abc['topItems'])) {
                    $topRule = $apriori['rules'][0];
                    $topItem = $abc['topItems'][0];
                    $w['insight'] = "Rekomendasi Utama: Pelanggan yang membeli {$topRule['antecedent']} [Kat {$topRule['antecedentAbc']}] memiliki peluang {$topRule['confidence']} untuk membeli {$topRule['consequent']} [Kat {$topRule['consequentAbc']}]. Kombinasikan dengan prioritas stok {$topItem['name']} [Kat A] yang menyumbang {$topItem['share']} omzet toko.";
                } else if ($apriori !== null && !empty($apriori['rules'])) {
                    $w['insight'] = $apriori['insight'];
                } else if ($abc !== null) {
                    $w['insight'] = $abc['insight'];
                }
            } else if ($w['id'] === 'abc-analysis' || str_starts_with($w['id'], 'abc-analysis')) {
                if ($abc !== null) {
                    $w['metrics'] = $abc['metrics'];
                    $w['distribution'] = $abc['distribution'];
                    $w['topItems'] = $abc['topItems'];
                    $w['insight'] = $abc['insight'];
                }
            } else if ($w['id'] === 'apriori-analysis' || str_starts_with($w['id'], 'apriori-analysis')) {
                if ($apriori !== null) {
                    $w['metrics'] = $apriori['metrics'];
                    $w['rules'] = $apriori['rules'];
                    $w['insight'] = $apriori['insight'];
                }
            }
        }

        return $data;
    }

    private static function dateId(string $dateStr, bool $withYear = true): string
    {
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Ags',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];
        $ts = strtotime($dateStr);
        if (!$ts) {
            return $dateStr;
        }
        $day = (int) date('j', $ts);
        $mNum = (int) date('n', $ts);
        $month = $months[$mNum] ?? 'Jan';
        $year = date('Y', $ts);
        return $withYear ? "{$day} {$month} {$year}" : "{$day} {$month}";
    }
}
