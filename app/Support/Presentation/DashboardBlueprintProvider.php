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
    public static function get(bool $loadData = true, ?string $asOfDate = null): array
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
                    'percentage' => (!str_contains((string) ($profitPercentage ?? '0%'), '-') && ($profitPercentage ?? '0%') !== '0%') ? $profitPercentage : ($pctRev > 0 ? $pctRev . '%' : '0%'),
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
                    'percentage' => ($totalExpense > 0 ? ($pctGaji >= $pctOpr ? $pctGaji : $pctOpr) : 0) . '%',
                    'centerLabel' => ($totalExpense > 0 ? ($pctGaji >= $pctOpr ? 'Gaji Karyawan' : 'Beban Operasional') : 'Beban Toko'),
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
                        'secondaryValue' => 'Rp ' . number_format($fakturBelumLunasSales, 0, ',', '.'),
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
                        'secondaryValue' => 'Rp ' . number_format($fakturBelumLunasPurchase, 0, ',', '.'),
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
                    'rawBalance' => $cashAvailabilitySeries !== [] ? end($cashAvailabilitySeries) : 0,
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
