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
        $upcomingNote = '15 ' . date('M Y') . ' — Batas Akhir Pelaporan SPT PPh 21';
        $overdueNote = 'Belum ada kegiatan yang terlewat.';

        $attachmentsNotice = [
            'parts' => [
                ['text' => 'Silahkan pilih Menu Transaksi yang '],
                ['text' => 'MEWAJIBKAN', 'emphasis' => true],
                ['text' => ' pengguna menyertakan lampiran saat menyimpan transaksi.'],
            ],
        ];

        $approvalTypesMapping = [
            'approval-sales-quote' => ['value' => 'sales-quote', 'label' => 'Penawaran Penjualan'],
            'approval-sales-order' => ['value' => 'sales-order', 'label' => 'Pesanan Penjualan'],
            'approval-sales-delivery' => ['value' => 'sales-delivery', 'label' => 'Pengiriman Pesanan'],
            'approval-sales-invoice' => ['value' => 'sales-invoice', 'label' => 'Faktur Penjualan'],
            'approval-sales-receipt' => ['value' => 'sales-receipt', 'label' => 'Penerimaan Penjualan'],
            'approval-sales-return' => ['value' => 'sales-return', 'label' => 'Retur Penjualan'],
            'approval-sales-discount' => ['value' => 'price-adjustment', 'label' => 'Penyesuaian Harga/Diskon'],
            'approval-purchase-order' => ['value' => 'purchase-order', 'label' => 'Pesanan Pembelian'],
            'approval-purchase-receipt' => ['value' => 'goods-receipt', 'label' => 'Penerimaan Barang'],
            'approval-purchase-invoice' => ['value' => 'purchase-invoice', 'label' => 'Faktur Pembelian'],
            'approval-purchase-payment' => ['value' => 'purchase-payment', 'label' => 'Pembayaran Pembelian'],
            'approval-purchase-return' => ['value' => 'purchase-return', 'label' => 'Retur Pembelian'],
            'approval-purchase-price' => ['value' => 'supplier-price', 'label' => 'Harga Pemasok'],
            'approval-inventory-request' => ['value' => 'item-request', 'label' => 'Permintaan Barang'],
            'approval-inventory-adjustment' => ['value' => 'inventory-adjustment', 'label' => 'Penyesuaian Persediaan'],
            'approval-inventory-transfer' => ['value' => 'stock-transfer', 'label' => 'Pemindahan Barang'],
            'approval-inventory-job-order' => ['value' => 'work-order', 'label' => 'Pekerjaan Pesanan'],
            'approval-inventory-material-addition' => ['value' => 'material-addition', 'label' => 'Penambahan Bahan Baku'],
            'approval-inventory-job-completion' => ['value' => 'work-completion', 'label' => 'Penyelesaian Pesanan'],
            'approval-inventory-stock-opname' => ['value' => 'stock-opname-result', 'label' => 'Hasil Stok Opname'],
            'approval-other-payment' => ['value' => 'cash-payment', 'label' => 'Pembayaran (Kas & Bank)'],
            'approval-other-receipt' => ['value' => 'cash-receipt', 'label' => 'Penerimaan (Kas & Bank)'],
            'approval-other-bank-transfer' => ['value' => 'bank-transfer', 'label' => 'Transfer Bank'],
            'approval-other-expense' => ['value' => 'expense-entry', 'label' => 'Pencatatan Beban'],
            'approval-other-salary' => ['value' => 'payroll-entry', 'label' => 'Pencatatan Gaji'],
            'approval-other-transfer-asset' => ['value' => 'asset-move', 'label' => 'Pindah Aset'],
        ];

        $transactionTypeOptions = [];
        if ($loadData && Schema::hasTable('preference_settings')) {
            $enabledApprovals = DB::table('preference_settings')
                ->where('setting_key', 'like', 'approval-%')
                ->where('value', '1')
                ->pluck('setting_key')
                ->toArray();

            foreach ($enabledApprovals as $key) {
                if (isset($approvalTypesMapping[$key])) {
                    $transactionTypeOptions[] = $approvalTypesMapping[$key];
                }
            }
        }

        if (empty($transactionTypeOptions)) {
            $transactionTypeOptions = [
                ['value' => 'sales-invoice', 'label' => 'Faktur Penjualan']
            ];
        }

        $formatCurrencyShort = function ($value) {
            $abs = abs($value);
            $sign = $value < 0 ? '-' : '';
            if ($abs >= 1000000000) {
                return $sign . 'Rp ' . number_format($abs / 1000000000, 2, ',', '.') . ' M';
            }
            if ($abs >= 1000000) {
                return $sign . 'Rp ' . number_format($abs / 1000000, 1, ',', '.') . ' jt';
            }
            if ($abs >= 1000) {
                return $sign . 'Rp ' . number_format($abs / 1000, 0, ',', '.') . ' rb';
            }
            return $sign . 'Rp ' . number_format($abs, 0, ',', '.');
        };

        $userActivities = [];
        if ($loadData) {
            $user = auth()->user() ?? request()->user();
            if ($user !== null) {
                $logs = DB::table('activity_logs')
                    ->where('actor_user_id', $user->id)
                    ->orderBy('occurred_at', 'desc')
                    ->limit(4)
                    ->get();

                $daysIndo = [
                    'Sunday' => 'Minggu',
                    'Monday' => 'Senin',
                    'Tuesday' => 'Selasa',
                    'Wednesday' => 'Rabu',
                    'Thursday' => 'Kamis',
                    'Friday' => 'Jumat',
                    'Saturday' => 'Sabtu',
                ];

                $monthsIndo = [
                    'Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr',
                    'May' => 'Mei', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Agt',
                    'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des',
                ];

                $actionMap = [
                    'create' => 'Buat',
                    'update' => 'Ubah',
                    'delete' => 'Hapus',
                ];

                $resourceMap = [
                    'budget' => 'Anggaran',
                    'general-journal' => 'Jurnal Umum',
                    'employee' => 'Karyawan',
                    'product' => 'Produk',
                    'preference' => 'Preferensi',
                    'user' => 'Pengguna',
                ];

                foreach ($logs as $log) {
                    $occurredAt = $log->occurred_at ? new Carbon($log->occurred_at) : null;
                    $dayName = 'Senin';
                    $dayNum = '01';
                    $monthName = 'Jun';
                    $timeStr = '00:00';
                    if ($occurredAt !== null) {
                        $dayNameEng = $occurredAt->format('l');
                        $dayName = $daysIndo[$dayNameEng] ?? $dayNameEng;
                        $dayNum = $occurredAt->format('d');
                        $monthEng = $occurredAt->format('M');
                        $monthName = $monthsIndo[$monthEng] ?? $monthEng;
                        $timeStr = $occurredAt->format('H:i');
                    }

                    $actionStr = $actionMap[$log->action] ?? ucfirst($log->action);
                    $resourceStr = $resourceMap[$log->permission_key] ?? ($log->resource_label ?? ucfirst($log->resource_key));
                    $activityTitle = "{$actionStr} {$resourceStr}";

                    $userActivities[] = [
                        'id' => $log->id,
                        'dayName' => $dayName,
                        'dayNum' => $dayNum,
                        'monthName' => $monthName,
                        'time' => $timeStr,
                        'title' => $activityTitle,
                    ];
                }
            }

            $latestSalesInvoiceDate = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted')
                ->max('entry_date') ?? date('Y-m-d');

            $salesTrendLabels = [];
            $salesTrendData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - $i days"));
                $dayName = date('D', strtotime($date));
                $dayNameIndo = [
                    'Sun' => 'Min', 'Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab',
                    'Thu' => 'Kam', 'Fri' => 'Jum', 'Sat' => 'Sab'
                ][$dayName] ?? $dayName;
                $salesTrendLabels[] = $dayNameIndo;
                $totalSales = DB::table('operation_documents')
                    ->where('document_type', 'sales_invoice')
                    ->where('status', 'Posted')
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $salesTrendData[] = (float) $totalSales;
            }

            $totalSalesVal = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted')
                ->sum('total_amount');

            $totalHppVal = DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->where('operation_documents.status', 'Posted')
                ->sum(DB::raw('operation_document_lines.quantity * products.default_purchase_price'));

            $totalExpensesVal = DB::table('operation_documents')
                ->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                ->where('status', 'Posted')
                ->sum('total_amount');

            $netProfitVal = $totalSalesVal - $totalHppVal - $totalExpensesVal;
            $profitMargin = $totalSalesVal > 0 ? (int) (($netProfitVal / $totalSalesVal) * 100) : 0;
            $profitPercentage = $profitMargin . '%';
            $legendSum = $totalSalesVal + $totalHppVal + $totalExpensesVal;
            $pctRev = $legendSum > 0 ? round(($totalSalesVal / $legendSum) * 100) : 0;
            $pctHpp = $legendSum > 0 ? round(($totalHppVal / $legendSum) * 100) : 0;
            $pctExp = $legendSum > 0 ? round(($totalExpensesVal / $legendSum) * 100) : 0;

            $cashFlowLabels = [];
            $cashInSeries = [];
            $cashOutSeries = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - $i days"));
                $formattedDate = date('j M', strtotime($date));
                $cashFlowLabels[] = $formattedDate;
                $inflow = DB::table('operation_documents')
                    ->where('document_type', 'sales_invoice')
                    ->where('status', 'Posted')
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $outflow = DB::table('operation_documents')
                    ->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                    ->where('status', 'Posted')
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $cashInSeries[] = (float) $inflow;
                $cashOutSeries[] = (float) $outflow;
            }

            $totalGaji = DB::table('operation_documents')
                ->where('document_type', 'payroll_entry')
                ->where('status', 'Posted')
                ->sum('total_amount');
            $totalOperasional = DB::table('operation_documents')
                ->where('document_type', 'expense_entry')
                ->where('status', 'Posted')
                ->sum('total_amount');
            $totalExpense = $totalGaji + $totalOperasional;
            $pctGaji = $totalExpense > 0 ? round(($totalGaji / $totalExpense) * 100) : 0;
            $pctOpr = $totalExpense > 0 ? round(($totalOperasional / $totalExpense) * 100) : 0;

            $salesInvoiceQuery = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted');
            $fakturLunasSales = (float) (clone $salesInvoiceQuery)->sum('paid_amount');
            $fakturBelumLunasSales = (float) (clone $salesInvoiceQuery)->sum('outstanding_amount');
            $belumJatuhTempoSales = (float) (clone $salesInvoiceQuery)->where('due_date', '>=', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $lewatJatuhTempoSales = (float) (clone $salesInvoiceQuery)->where('due_date', '<', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $hariIniSales = (float) (clone $salesInvoiceQuery)->where('entry_date', $latestSalesInvoiceDate)->sum('total_amount');

            $purchaseInvoiceQuery = DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->where('status', 'Posted');
            $fakturLunasPurchase = (float) (clone $purchaseInvoiceQuery)->sum('paid_amount');
            $fakturBelumLunasPurchase = (float) (clone $purchaseInvoiceQuery)->sum('outstanding_amount');
            $belumJatuhTempoPurchase = (float) (clone $purchaseInvoiceQuery)->where('due_date', '>=', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $lewatJatuhTempoPurchase = (float) (clone $purchaseInvoiceQuery)->where('due_date', '<', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $hariIniPurchase = (float) (clone $purchaseInvoiceQuery)->where('entry_date', $latestSalesInvoiceDate)->sum('total_amount');

            $dbSalespeople = DB::table('employees')
                ->where('is_active', 1)
                ->where('is_salesperson', 1)
                ->select('id', 'full_name', 'position')
                ->get();
            $salesTeamRows = [];
            foreach ($dbSalespeople as $sp) {
                $totalVal = 0;
                $spUser = DB::table('users')->where('name', 'like', "%{$sp->full_name}%")->first();
                if ($spUser) {
                    $totalVal = DB::table('operation_documents')
                        ->where('document_type', 'sales_invoice')
                        ->where('status', 'Posted')
                        ->where('responsible_user_id', $spUser->id)
                        ->sum('total_amount');
                }
                $salesTeamRows[] = [
                    'name' => $sp->full_name,
                    'role' => $sp->position ?? 'Salesperson',
                    'totalValue' => $totalVal > 0 ? $formatCurrencyShort($totalVal) : 'Rp -',
                    'targetPercent' => '0%',
                    'targetValue' => '-',
                ];
            }
            if (empty($salesTeamRows)) {
                $salesTeamRows = [
                    [
                        'name' => 'Belum ada data',
                        'role' => 'Sales Toko',
                        'totalValue' => 'Rp -',
                        'targetPercent' => '0%',
                        'targetValue' => '-',
                    ]
                ];
            }

            $dbTopProducts = DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->leftJoin('units', 'products.base_unit_id', '=', 'units.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->where('operation_documents.status', 'Posted')
                ->select(
                    'products.name',
                    DB::raw('SUM(operation_document_lines.quantity) as units_sold'),
                    DB::raw('SUM(operation_document_lines.total_amount) as revenue'),
                    'units.name as unit_name'
                )
                ->groupBy('products.id', 'products.name', 'units.name')
                ->orderByDesc('revenue')
                ->limit(5)
                ->get();
            $topProductsItems = [];
            foreach ($dbTopProducts as $tp) {
                $pctShare = $totalSalesVal > 0 ? ($tp->revenue / $totalSalesVal) * 100 : 0;
                $topProductsItems[] = [
                    'name' => $tp->name,
                    'units' => number_format($tp->units_sold, 0, ',', '.') . ' ' . ($tp->unit_name ?? 'pcs'),
                    'share' => number_format($pctShare, 1, ',', '.') . '%',
                    'revenue' => $formatCurrencyShort($tp->revenue),
                ];
            }
            if (empty($topProductsItems)) {
                $topProductsItems = [
                    [
                        'name' => 'Belum ada data',
                        'units' => '0 pcs',
                        'share' => '0%',
                        'revenue' => 'Rp -',
                    ]
                ];
            }

            $cashAvailabilityLabels = [];
            $cashAvailabilitySeries = [];
            for ($i = 7; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - " . ($i * 4) . " days"));
                $formattedDate = date('j M', strtotime($date));
                $cashAvailabilityLabels[] = $formattedDate;
                $inUpToDate = DB::table('operation_documents')
                    ->where('document_type', 'sales_invoice')
                    ->where('status', 'Posted')
                    ->where('entry_date', '<=', $date)
                    ->sum('total_amount');
                $outUpToDate = DB::table('operation_documents')
                    ->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                    ->where('status', 'Posted')
                    ->where('entry_date', '<=', $date)
                    ->sum('total_amount');
                $cashAvailabilitySeries[] = 28000000000 + ($inUpToDate - $outUpToDate);
            }

            $totalSalesOrders = DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->count();
            $pendingSalesOrders = DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->where('status', 'Draft')
                ->count();
            $overdueSalesOrders = DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->where('due_date', '<', date('Y-m-d'))
                ->count();

            // Hitung catatan mendatang
            $today = Carbon::today();
            $targetDay = 15;
            $upcomingDate = $today->day <= $targetDay
                ? Carbon::today()->setDay($targetDay)
                : Carbon::today()->addMonth()->setDay($targetDay);

            $monthMap = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];

            $targetMonthName = $monthMap[$upcomingDate->month] ?? $upcomingDate->format('F');
            $reportMonthName = $monthMap[$upcomingDate->copy()->subMonth()->month] ?? $upcomingDate->copy()->subMonth()->format('F');

            $upcomingNote = $upcomingDate->format('d') . ' ' . $targetMonthName . ' ' . $upcomingDate->format('Y') . " — Batas Akhir Pelaporan SPT PPh 21 Masa {$reportMonthName} " . $upcomingDate->copy()->subMonth()->format('Y');

            // Hitung catatan jatuh tempo
            $overdueSalesInvoicesCount = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted')
                ->where('outstanding_amount', '>', 0)
                ->where('due_date', '<', date('Y-m-d'))
                ->count();

            $overduePurchaseInvoicesCount = DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->where('status', 'Posted')
                ->where('outstanding_amount', '>', 0)
                ->where('due_date', '<', date('Y-m-d'))
                ->count();

            $overdueCount = $overdueSalesInvoicesCount + $overduePurchaseInvoicesCount;
            if ($overdueCount > 0) {
                $overdueNote = "Terdapat {$overdueCount} Faktur (Penjualan/Pembelian) yang telah melewati jatuh tempo pembayaran.";
            } else {
                $overdueNote = "Semua faktur aman. Belum ada kegiatan pembayaran yang terlewat.";
            }
        } else {
            $latestSalesInvoiceDate = date('Y-m-d');
            $salesTrendLabels = [];
            $salesTrendData = [];
            $totalSalesVal = 0.0;
            $totalHppVal = 0.0;
            $totalExpensesVal = 0.0;
            $profitPercentage = '0%';
            $netProfitVal = 0.0;
            $pctRev = 0;
            $pctHpp = 0;
            $pctExp = 0;
            $cashFlowLabels = [];
            $cashInSeries = [];
            $cashOutSeries = [];
            $totalGaji = 0.0;
            $totalOperasional = 0.0;
            $totalExpense = 0.0;
            $pctGaji = 0;
            $pctOpr = 0;
            $fakturLunasSales = 0.0;
            $fakturBelumLunasSales = 0.0;
            $belumJatuhTempoSales = 0.0;
            $lewatJatuhTempoSales = 0.0;
            $hariIniSales = 0.0;
            $fakturLunasPurchase = 0.0;
            $fakturBelumLunasPurchase = 0.0;
            $belumJatuhTempoPurchase = 0.0;
            $lewatJatuhTempoPurchase = 0.0;
            $hariIniPurchase = 0.0;
            $salesTeamRows = [
                [
                    'name' => 'Memuat data...',
                    'role' => 'Sales Toko',
                    'totalValue' => 'Rp -',
                    'targetPercent' => '0%',
                    'targetValue' => '-',
                ]
            ];
            $topProductsItems = [
                [
                    'name' => 'Memuat data...',
                    'units' => '0 pcs',
                    'share' => '0%',
                    'revenue' => 'Rp -',
                ]
            ];
            $cashAvailabilityLabels = [];
            $cashAvailabilitySeries = [];
            $totalSalesOrders = 0;
            $pendingSalesOrders = 0;
            $overdueSalesOrders = 0;
        }

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
                            'title' => 'Matrix Analisis Penjualan (Apriori & ABC)',
                            'description' => 'Integrasi pola belanja bersama (Apriori) dan prioritas nilai penjualan (ABC).',
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
                            'id' => 'profit-loss',
                            'title' => 'Laba/Rugi Tahun Ini',
                            'description' => 'Analisa breakdown laba bersih, HPP, dan pengeluaran operasional.',
                            'icon' => 'asset',
                        ],
                        [
                            'id' => 'cash-flow',
                            'title' => 'Arus Kas',
                            'description' => 'Grafik perbandingan kas masuk dan kas keluar harian.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'company-expense',
                            'title' => 'Beban Perusahaan',
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
                    'title' => 'Matrix Analisis Penjualan (Apriori & ABC)',
                    'subtitle' => 'Integrasi pola belanja bersama (Apriori) dan prioritas nilai penjualan (ABC)',
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
                    'id' => 'profit-loss',
                    'title' => 'Laba/Rugi Tahun Ini',
                    'type' => 'ring-breakdown',
                    'percentage' => $profitPercentage,
                    'totalLabel' => 'Estimasi Laba Bersih',
                    'totalValue' => 'Rp ' . number_format($netProfitVal, 0, ',', '.'),
                    'legend' => [
                        [
                            'label' => 'Total Pendapatan Penjualan',
                            'value' => 'Rp ' . number_format($totalSalesVal, 0, ',', '.'),
                            'percent' => $pctRev . '%',
                            'color' => '#4ade80',
                        ],
                        [
                            'label' => 'Total HPP',
                            'value' => 'Rp ' . number_format($totalHppVal, 0, ',', '.'),
                            'percent' => $pctHpp . '%',
                            'color' => '#fb923c',
                        ],
                        [
                            'label' => 'Total Pengeluaran Beban',
                            'value' => 'Rp ' . number_format($totalExpensesVal, 0, ',', '.'),
                            'percent' => $pctExp . '%',
                            'color' => '#f87171',
                        ],
                    ],
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
                    'title' => 'Beban Perusahaan',
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
                    'heightClass' => 'min-h-[310px]',
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
