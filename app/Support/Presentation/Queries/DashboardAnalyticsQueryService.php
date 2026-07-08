<?php

namespace App\Support\Presentation\Queries;

use App\Support\Presentation\PosBlueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardAnalyticsQueryService
{
    /**
     * Get aggregated metrics and analytics for the main dashboard widgets.
     *
     * @param bool $loadData
     * @return array
     */
    public static function getAnalytics(bool $loadData): array
    {
        $upcomingNote = '15 ' . date('M Y') . ' — Batas Akhir Pelaporan SPT PPh 21';
        $overdueNote = 'Belum ada kegiatan yang terlewat.';

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

        $formatCurrencyShort = fn ($value) => PosBlueprint::formatCurrencyShort($value);

        $userActivities = [];
        if ($loadData) {
            $user = auth()->user() ?? request()->user();
            $userActivities = \App\Support\Presentation\Queries\DashboardActivityQueryService::getRecentActivities($user);

            $latestSalesInvoiceDate = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
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
                    ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $salesTrendData[] = (float) $totalSales;
            }

            $totalSalesVal = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
                ->sum('total_amount');

            $totalHppVal = DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->whereIn('operation_documents.status', ['Posted', 'Lunas', 'Belum Lunas'])
                ->sum(DB::raw('operation_document_lines.quantity * products.default_purchase_price'));

            $totalExpensesVal = DB::table('operation_documents')
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'payroll_entry')
                            ->where('status', 'Posted');
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'expense_entry')
                            ->whereIn('status', ['Sedang diproses', 'Terbayar']);
                    });
                })
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
                    ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $outflow = DB::table('operation_documents')
                    ->where('entry_date', $date)
                    ->where(function ($q) {
                        $q->where(function ($sub) {
                            $sub->where('document_type', 'payroll_entry')
                                ->where('status', 'Posted');
                        })->orWhere(function ($sub) {
                            $sub->where('document_type', 'expense_entry')
                                ->whereIn('status', ['Sedang diproses', 'Terbayar']);
                        });
                    })
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
                ->whereIn('status', ['Sedang diproses', 'Terbayar'])
                ->sum('total_amount');
            $totalExpense = $totalGaji + $totalOperasional;
            $pctGaji = $totalExpense > 0 ? round(($totalGaji / $totalExpense) * 100) : 0;
            $pctOpr = $totalExpense > 0 ? round(($totalOperasional / $totalExpense) * 100) : 0;

            $salesInvoiceQuery = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas']);
            $fakturLunasSales = (float) (clone $salesInvoiceQuery)->sum('paid_amount');
            $fakturBelumLunasSales = (float) (clone $salesInvoiceQuery)->sum('outstanding_amount');
            $belumJatuhTempoSales = (float) (clone $salesInvoiceQuery)->where('due_date', '>=', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $lewatJatuhTempoSales = (float) (clone $salesInvoiceQuery)->where('due_date', '<', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $hariIniSales = (float) (clone $salesInvoiceQuery)->where('entry_date', $latestSalesInvoiceDate)->sum('total_amount');

            $purchaseInvoiceQuery = DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas']);
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
                        ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
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
                    'products.id as product_id',
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
                
                $imageAttachment = DB::table('attachments')
                    ->where('attachable_type', \App\Domain\Catalog\Models\Product::class)
                    ->where('attachable_id', $tp->product_id)
                    ->where('file_type', 'like', 'image/%')
                    ->first();
                $imageUrl = $imageAttachment ? asset('storage/' . $imageAttachment->file_path) : null;

                $topProductsItems[] = [
                    'name' => $tp->name,
                    'units' => number_format($tp->units_sold, 0, ',', '.') . ' ' . ($tp->unit_name ?? 'pcs'),
                    'share' => number_format($pctShare, 1, ',', '.') . '%',
                    'revenue' => $formatCurrencyShort($tp->revenue),
                    'imageUrl' => $imageUrl,
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
                    ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
                    ->where('entry_date', '<=', $date)
                    ->sum('total_amount');
                $outUpToDate = DB::table('operation_documents')
                    ->where('entry_date', '<=', $date)
                    ->where(function ($q) {
                        $q->where(function ($sub) {
                            $sub->where('document_type', 'payroll_entry')
                                ->where('status', 'Posted');
                        })->orWhere(function ($sub) {
                            $sub->where('document_type', 'expense_entry')
                                ->whereIn('status', ['Sedang diproses', 'Terbayar']);
                        });
                    })
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
                ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
                ->where('outstanding_amount', '>', 0)
                ->where('due_date', '<', date('Y-m-d'))
                ->count();

            $overduePurchaseInvoicesCount = DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->whereIn('status', ['Posted', 'Lunas', 'Belum Lunas'])
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

        return [
            'userActivities' => $userActivities,
            'upcomingNote' => $upcomingNote,
            'overdueNote' => $overdueNote,
            'transactionTypeOptions' => $transactionTypeOptions,
            'salesTrendLabels' => $salesTrendLabels,
            'salesTrendData' => $salesTrendData,
            'totalSalesVal' => $totalSalesVal,
            'totalHppVal' => $totalHppVal,
            'totalExpensesVal' => $totalExpensesVal,
            'netProfitVal' => $netProfitVal,
            'profitPercentage' => $profitPercentage,
            'pctRev' => $pctRev,
            'pctHpp' => $pctHpp,
            'pctExp' => $pctExp,
            'cashFlowLabels' => $cashFlowLabels,
            'cashInSeries' => $cashInSeries,
            'cashOutSeries' => $cashOutSeries,
            'totalGaji' => $totalGaji,
            'totalOperasional' => $totalOperasional,
            'totalExpense' => $totalExpense,
            'pctGaji' => $pctGaji,
            'pctOpr' => $pctOpr,
            'fakturLunasSales' => $fakturLunasSales,
            'fakturBelumLunasSales' => $fakturBelumLunasSales,
            'belumJatuhTempoSales' => $belumJatuhTempoSales,
            'lewatJatuhTempoSales' => $lewatJatuhTempoSales,
            'hariIniSales' => $hariIniSales,
            'fakturLunasPurchase' => $fakturLunasPurchase,
            'fakturBelumLunasPurchase' => $fakturBelumLunasPurchase,
            'belumJatuhTempoPurchase' => $belumJatuhTempoPurchase,
            'lewatJatuhTempoPurchase' => $lewatJatuhTempoPurchase,
            'hariIniPurchase' => $hariIniPurchase,
            'salesTeamRows' => $salesTeamRows,
            'topProductsItems' => $topProductsItems,
            'cashAvailabilityLabels' => $cashAvailabilityLabels,
            'cashAvailabilitySeries' => $cashAvailabilitySeries,
            'totalSalesOrders' => $totalSalesOrders,
            'pendingSalesOrders' => $pendingSalesOrders,
            'overdueSalesOrders' => $overdueSalesOrders,
        ];
    }
}
