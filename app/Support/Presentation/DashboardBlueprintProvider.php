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
    public static function get(?array $abc = null, ?array $apriori = null, bool $loadData = true): array
    {
        $attachmentsNotice = [
            'parts' => [
                ['text' => 'Silahkan pilih Menu Transaksi yang '],
                ['text' => 'MEWAJIBKAN', 'emphasis' => true],
                ['text' => ' pengguna menyertakan lampiran saat menyimpan transaksi.'],
            ],
        ];

        $analytics = \App\Support\Presentation\Queries\DashboardAnalyticsQueryService::getAnalytics($loadData);
        extract($analytics);

        $navigationModules = PosBlueprint::navigationModules();
        $navigationPages = PosBlueprint::buildNavigationPages($navigationModules);

        $data = [
            'toolbar' => [
                'widgetLabel' => 'Widget',
                'dashboards' => [
                    [
                        'id' => 'main-dashboard',
                        'label' => 'Dashboard Utama',
                    ],
                    [
                        'id' => 'sales-dashboard',
                        'label' => 'Dashboard Penjualan',
                    ],
                    [
                        'id' => 'stock-dashboard',
                        'label' => 'Dashboard Stok',
                    ],
                ],
                'selectedDashboardId' => 'main-dashboard',
                'dashboardActions' => [
                    'label' => 'Opsi dashboard',
                    'items' => [
                        [
                            'id' => 'add',
                            'label' => 'Tambah Dashboard',
                        ],
                        [
                            'id' => 'edit',
                            'label' => 'Ubah Dashboard',
                        ],
                    ],
                ],
                'addDashboardModal' => [
                    'title' => 'Dashboard',
                    'closeLabel' => 'Tutup modal dashboard',
                    'nameLabel' => 'Nama Dashboard',
                    'submitLabel' => 'Lanjut',
                    'clearLabel' => 'Kosongkan nama dashboard',
                    'deleteLabel' => 'Hapus',
                ],
                'editDashboardModal' => [
                    'title' => 'Dashboard',
                    'closeLabel' => 'Tutup modal dashboard',
                    'nameLabel' => 'Nama Dashboard',
                    'submitLabel' => 'Lanjut',
                    'clearLabel' => 'Kosongkan nama dashboard',
                    'deleteLabel' => 'Hapus',
                ],
                'loadingOverlay' => [
                    'title' => 'Menyiapkan Widget',
                    'description' => 'Mohon tunggu sebentar, daftar widget sedang dipersiapkan.',
                    'durationMs' => 850,
                ],
                'widgetLibraryModal' => [
                    'title' => 'Widget',
                    'closeLabel' => 'Tutup widget library',
                    'searchPlaceholder' => 'Ketik kata kunci',
                    'emptyLabel' => 'Tidak ada widget yang cocok dengan kata kunci tersebut.',
                    'items' => [
                        [
                            'id' => 'integrated-analysis',
                            'title' => 'Analisis Kombinasi Produk & Prioritas Omzet (Metode Apriori & ABC)',
                            'description' => 'Strategi display produk sering dibeli bersama (Apriori) & prioritas stok penyumbang omzet (ABC).',
                            'icon' => 'asset',

                        ],
                        [
                            'id' => 'recent-activity',
                            'title' => 'Aktivitas Terakhir Anda',
                            'description' => 'Menampilkan riwayat aktivitas terakhir pengguna.',
                            'icon' => 'activity',
                        ],
                        [
                            'id' => 'upcoming-activity',
                            'title' => 'Kegiatan Mendatang',
                            'description' => 'Daftar jadwal kegiatan mendatang.',
                            'icon' => 'activity',
                        ],
                        [
                            'id' => 'sales-trend',
                            'title' => 'Tren Penjualan',
                            'description' => 'Grafik garis tren transaksi penjualan toko seminggu terakhir.',
                            'icon' => 'cash-flow',
                        ],

                        [
                            'id' => 'cash-flow',
                            'title' => 'Arus Kas',
                            'description' => 'Grafik perbandingan kas masuk dan kas keluar harian.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'company-expense',
                            'title' => 'Beban Toko',
                            'description' => 'Distribusi pengeluaran kas operasional dan gaji.',
                            'icon' => 'expense',
                        ],
                        [
                            'id' => 'sales-summary',
                            'title' => 'Penjualan',
                            'description' => 'Ringkasan faktur lunas, belum lunas, dan jatuh tempo penjualan.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'purchase-summary',
                            'title' => 'Pembelian',
                            'description' => 'Ringkasan faktur lunas, belum lunas, dan jatuh tempo pembelian.',
                            'icon' => 'expense',
                        ],
                        [
                            'id' => 'sales-team-performance',
                            'title' => 'Penjualan Penjual',
                            'description' => 'Peringkat pencapaian omzet penjualan per salesperson.',
                            'icon' => 'stock',
                        ],
                        [
                            'id' => 'top-products',
                            'title' => 'Barang Paling Laku',
                            'description' => 'Daftar barang terlaris berdasarkan omzet dan kuantitas.',
                            'icon' => 'stock',
                        ],
                        [
                            'id' => 'overdue-activity',
                            'title' => 'Kegiatan Terlewat',
                            'description' => 'Daftar jadwal kegiatan yang sudah lewat jatuh tempo.',
                            'icon' => 'activity',
                        ],
                        [
                            'id' => 'cash-availability',
                            'title' => 'Ketersediaan Kas',
                            'description' => 'Histori saldo kas berjalan dikalkulasi dari inflow dan outflow.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'sales-order-status',
                            'title' => 'Pesanan Penjualan',
                            'description' => 'Status pesanan menunggu proses dan pending.',
                            'icon' => 'stock',
                        ],
                    ],
                ],
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
                    'id' => 'upcoming-activity',
                    'title' => 'Kegiatan Mendatang',
                    'type' => 'note',
                    'noteDescription' => $upcomingNote,
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'sales-trend',
                    'title' => 'Tren Penjualan',
                    'type' => 'line',
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
                    'id' => 'cash-flow',
                    'title' => 'Arus Kas',
                    'type' => 'line',
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
                    'percentage' => ($totalExpense > 0 ? $pctGaji : 0) . '%',
                    'legend' => [
                        [
                            'label' => 'Gaji Karyawan',
                            'value' => 'Rp ' . number_format($totalGaji, 0, ',', '.'),
                            'percent' => $pctGaji . '%',
                            'color' => '#818cf8',
                        ],
                        [
                            'label' => 'Beban Operasional',
                            'value' => 'Rp ' . number_format($totalOperasional, 0, ',', '.'),
                            'percent' => $pctOpr . '%',
                            'color' => '#fb7185',
                        ],
                    ],
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'sales-summary',
                    'title' => 'Penjualan',
                    'type' => 'summary',
                    'sections' => [
                        [
                            'title' => 'Status Piutang',
                            'items' => [
                                ['label' => 'Faktur Lunas', 'value' => 'Rp ' . number_format($fakturLunasSales, 0, ',', '.'), 'color' => '#22c55e'],
                                ['label' => 'Belum Lunas', 'value' => 'Rp ' . number_format($fakturBelumLunasSales, 0, ',', '.'), 'color' => '#f43f5e'],
                            ],
                        ],
                        [
                            'title' => 'Jatuh Tempo',
                            'items' => [
                                ['label' => 'Belum Jatuh Tempo', 'value' => 'Rp ' . number_format($belumJatuhTempoSales, 0, ',', '.'), 'color' => '#f59e0b'],
                                ['label' => 'Lewat Jatuh Tempo', 'value' => 'Rp ' . number_format($lewatJatuhTempoSales, 0, ',', '.'), 'color' => '#f43f5e'],
                            ],
                        ],
                    ],
                    'headline' => [
                        'label' => 'Faktur Lunas',
                        'value' => 'Rp ' . number_format($fakturLunasSales, 0, ',', '.'),
                        'secondaryLabel' => 'Transaksi Hari Ini',
                        'secondaryValue' => 'Rp ' . number_format($hariIniSales, 0, ',', '.'),
                    ],
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'purchase-summary',
                    'title' => 'Pembelian',
                    'type' => 'summary',
                    'sections' => [
                        [
                            'title' => 'Status Hutang',
                            'items' => [
                                ['label' => 'Faktur Lunas', 'value' => 'Rp ' . number_format($fakturLunasPurchase, 0, ',', '.'), 'color' => '#22c55e'],
                                ['label' => 'Belum Lunas', 'value' => 'Rp ' . number_format($fakturBelumLunasPurchase, 0, ',', '.'), 'color' => '#f43f5e'],
                            ],
                        ],
                        [
                            'title' => 'Jatuh Tempo',
                            'items' => [
                                ['label' => 'Belum Jatuh Tempo', 'value' => 'Rp ' . number_format($belumJatuhTempoPurchase, 0, ',', '.'), 'color' => '#f59e0b'],
                                ['label' => 'Lewat Jatuh Tempo', 'value' => 'Rp ' . number_format($lewatJatuhTempoPurchase, 0, ',', '.'), 'color' => '#f43f5e'],
                            ],
                        ],
                    ],
                    'headline' => [
                        'label' => 'Faktur Lunas',
                        'value' => 'Rp ' . number_format($fakturLunasPurchase, 0, ',', '.'),
                        'secondaryLabel' => 'Transaksi Hari Ini',
                        'secondaryValue' => 'Rp ' . number_format($hariIniPurchase, 0, ',', '.'),
                    ],
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'sales-team-performance',
                    'title' => 'Penjualan Penjual',
                    'type' => 'sales-team',
                    'rows' => $salesTeamRows,
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'top-products',
                    'title' => 'Barang Paling Laku',
                    'type' => 'top-products',
                    'items' => $topProductsItems,
                    'heightClass' => 'h-[310px]',
                ],
                [
                    'id' => 'overdue-activity',
                    'title' => 'Kegiatan Terlewat',
                    'type' => 'note',
                    'noteDescription' => $overdueNote,
                    'heightClass' => 'min-h-[310px]',
                ],
                [
                    'id' => 'cash-availability',
                    'title' => 'Ketersediaan Kas',
                    'type' => 'cash-availability',
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
                [
                    'id' => 'sales-order-status',
                    'title' => 'Pesanan Penjualan',
                    'type' => 'order-status',
                    'primaryLabel' => 'Menunggu diproses',
                    'primaryValue' => (string) $pendingSalesOrders,
                    'statusTitle' => 'Status Pesanan Aktif',
                    'segments' => [
                        [
                            'label' => 'Aktif',
                            'value' => $totalSalesOrders . ' Pesanan',
                            'numericValue' => $totalSalesOrders,
                            'color' => '#ffd15d',
                        ],
                        [
                            'label' => 'Terlewat / Pending',
                            'value' => $pendingSalesOrders . ' Pesanan',
                            'numericValue' => $pendingSalesOrders,
                            'color' => '#ff4a17',
                        ],
                    ],
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
}
