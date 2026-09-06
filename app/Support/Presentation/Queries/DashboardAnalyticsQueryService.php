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
     * @param string|null $asOfDate
     * @return array
     */
    public static function getAnalytics(bool $loadData, ?string $asOfDate = null): array
    {
        $today = date('Y-m-d');
        if ($asOfDate && $asOfDate > $today) {
            $asOfDate = $today;
        }

        $nowMonths = [1=>'Jan',2=>'Feb',3=>'Mar',4=>'Apr',5=>'Mei',6=>'Jun',7=>'Jul',8=>'Ags',9=>'Sep',10=>'Okt',11=>'Nov',12=>'Des'];
        $upcomingNote = '15 ' . ($nowMonths[(int) date('n')] ?? date('M')) . ' ' . date('Y') . ' — Batas Akhir Pelaporan SPT PPh 21';
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

            $latestSalesInvoiceDate = $asOfDate ?? date('Y-m-d');
            $resolvedYear = (int) date('Y', strtotime($latestSalesInvoiceDate));
            $isTodayAnchor = ($latestSalesInvoiceDate === date('Y-m-d'));

            $salesTrendLabels = [];
            $salesTrendData = [];
            $startDate = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - 6 days"));

            $salesTrendDb = DB::table('operation_documents')
                ->whereIn('document_type', ['sales_invoice', 'sales_return'])
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', [$startDate, $latestSalesInvoiceDate])
                ->groupBy('entry_date', 'document_type')
                ->select('entry_date', 'document_type', DB::raw('SUM(total_amount) as total'))
                ->get()
                ->groupBy('entry_date');

            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - $i days"));
                if ($isTodayAnchor && $i === 0) {
                    $dayLabel = 'Hari ini';
                } elseif ($isTodayAnchor && $i === 1) {
                    $dayLabel = 'Kemarin';
                } else {
                    $dayLabel = self::dateId($date, false);
                }
                $salesTrendLabels[] = $dayLabel;

                $dayRecords = $salesTrendDb->get($date);
                $totalSales = (float) ($dayRecords?->firstWhere('document_type', 'sales_invoice')?->total ?? 0);
                $totalReturns = (float) ($dayRecords?->firstWhere('document_type', 'sales_return')?->total ?? 0);
                $salesTrendData[] = (float) max(0, $totalSales - $totalReturns);
            }

            $jan1ThisYear = date('Y-01-01', strtotime($latestSalesInvoiceDate));
            $jan1LastYear = date('Y-01-01', strtotime($latestSalesInvoiceDate . ' -1 year'));
            $monthStart = date('Y-m-01', strtotime($latestSalesInvoiceDate));

            $totalSalesInvoices = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum('total_amount');
            $totalSalesReturns = DB::table('operation_documents')
                ->where('document_type', 'sales_return')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum('total_amount');
            $totalSalesVal = (float) max(0, $totalSalesInvoices - $totalSalesReturns);

            $totalHppInvoices = (float) DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('operation_documents.entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum(DB::raw('operation_document_lines.quantity * products.default_purchase_price'));
            $totalHppReturns = (float) DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->where('operation_documents.document_type', 'sales_return')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('operation_documents.entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum(DB::raw('operation_document_lines.quantity * products.default_purchase_price'));
            $totalHppVal = (float) max(0, $totalHppInvoices - $totalHppReturns);

            $totalExpensesVal = DB::table('operation_documents')
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'payroll_entry')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'expense_entry')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    });
                })
                ->whereBetween('entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum('total_amount');
 
            $netProfitVal = $totalSalesVal - $totalHppVal - $totalExpensesVal;
            if ($totalSalesVal > 0) {
                $profitMargin = (int) round(($netProfitVal / $totalSalesVal) * 100);
            } else {
                $profitMargin = $netProfitVal < 0 ? -100 : ($netProfitVal > 0 ? 100 : 0);
            }
            $profitPercentage = $profitMargin . '%';
            $legendSum = $totalSalesVal + $totalHppVal + $totalExpensesVal;
            $pctRev = $legendSum > 0 ? round(($totalSalesVal / $legendSum) * 100) : 0;
            $pctHpp = $legendSum > 0 ? round(($totalHppVal / $legendSum) * 100) : 0;
            $pctExp = $legendSum > 0 ? round(($totalExpensesVal / $legendSum) * 100) : 0;

            $prevYear = $resolvedYear - 1;
            $prevSalesInvoiceDate = date('Y-m-d', strtotime($latestSalesInvoiceDate . ' -1 year'));

            $prevSalesVal = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$prevYear}-01-01", $prevSalesInvoiceDate])
                ->sum('total_amount');
            $prevHppVal = DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('operation_documents.entry_date', ["{$prevYear}-01-01", $prevSalesInvoiceDate])
                ->sum(DB::raw('operation_document_lines.quantity * products.default_purchase_price'));
            $prevExpensesVal = DB::table('operation_documents')
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'payroll_entry')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'expense_entry')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    });
                })
                ->whereBetween('entry_date', ["{$prevYear}-01-01", $prevSalesInvoiceDate])
                ->sum('total_amount');

            $calcGrowth = function ($curr, $prev) {
                if ($prev == 0) {
                    return $curr > 0 ? '+100%' : ($curr < 0 ? '-100%' : '0%');
                }
                $diff = $curr - $prev;
                $pct = round(($diff / abs($prev)) * 100, 1);
                $pctStr = (string) $pct;
                if (str_contains($pctStr, '.')) {
                    $pctStr = rtrim(rtrim($pctStr, '0'), '.');
                }
                return ($pct >= 0 ? '+' : '') . $pctStr . '%';
            };

            $prevNetProfitVal = $prevSalesVal - $prevHppVal - $prevExpensesVal;
            $profitTrend = $netProfitVal >= $prevNetProfitVal ? 'up' : 'down';
            $profitGrowth = $calcGrowth($netProfitVal, $prevNetProfitVal);

            $salesTrend = $totalSalesVal >= $prevSalesVal ? 'up' : 'down';
            $salesGrowth = $calcGrowth($totalSalesVal, $prevSalesVal);
            $salesTone = $totalSalesVal >= $prevSalesVal ? 'success' : 'danger';

            $hppTrend = $totalHppVal >= $prevHppVal ? 'up' : 'down';
            $hppGrowth = $calcGrowth($totalHppVal, $prevHppVal);
            $hppTone = $totalHppVal >= $prevHppVal ? 'danger' : 'success';

            $expensesTrend = $totalExpensesVal >= $prevExpensesVal ? 'up' : 'down';
            $expensesGrowth = $calcGrowth($totalExpensesVal, $prevExpensesVal);
            $expensesTone = $totalExpensesVal >= $prevExpensesVal ? 'danger' : 'success';
 
            $cashFlowLabels = [];
            $cashInSeries = [];
            $cashOutSeries = [];

            $inflowsDb = DB::table('operation_documents')
                ->whereBetween('entry_date', [$startDate, $latestSalesInvoiceDate])
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'sales_receipt')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'cash_receipt')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'sales_invoice')
                            ->whereIn('status', ['Lunas', 'Paid', 'lunas'])
                            ->where('paid_amount', '>', 0)
                            ->whereNotExists(function ($ex) {
                                $ex->select(DB::raw(1))
                                    ->from('operation_document_lines')
                                    ->join('operation_documents as r', 'operation_document_lines.operation_document_id', '=', 'r.id')
                                    ->where('r.document_type', 'sales_receipt')
                                    ->whereColumn('operation_document_lines.reference_code', 'operation_documents.document_number');
                            });
                    });
                })
                ->groupBy('entry_date')
                ->select('entry_date', DB::raw('SUM(total_amount) as total'))
                ->pluck('total', 'entry_date')
                ->all();

            $outflowsDb = DB::table('operation_documents')
                ->whereBetween('entry_date', [$startDate, $latestSalesInvoiceDate])
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'cash_payment')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'purchase_payment')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                            ->whereIn('status', ['Terbayar', 'Lunas', 'Paid'])
                            ->whereNotExists(function ($ex) {
                                $ex->select(DB::raw(1))
                                    ->from('operation_documents as cp')
                                    ->where('cp.document_type', 'cash_payment')
                                    ->whereColumn('cp.related_document_id', 'operation_documents.id')
                                    ->whereNotIn('cp.status', ['Void', 'Cancelled', 'void', 'cancelled']);
                            });
                    });
                })
                ->groupBy('entry_date')
                ->select('entry_date', DB::raw('SUM(total_amount) as total'))
                ->pluck('total', 'entry_date')
                ->all();

            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - $i days"));
                if ($isTodayAnchor && $i === 0) {
                    $formattedDate = 'Hari ini';
                } elseif ($isTodayAnchor && $i === 1) {
                    $formattedDate = 'Kemarin';
                } else {
                    $formattedDate = self::dateId($date, false);
                }
                $cashFlowLabels[] = $formattedDate;
                $cashInSeries[] = (float) ($inflowsDb[$date] ?? 0);
                $cashOutSeries[] = (float) ($outflowsDb[$date] ?? 0);
            }
 
            $totalGaji = DB::table('operation_documents')
                ->where('document_type', 'payroll_entry')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum('total_amount');
            $totalOperasional = DB::table('operation_documents')
                ->where('document_type', 'expense_entry')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$resolvedYear}-01-01", $latestSalesInvoiceDate])
                ->sum('total_amount');
            $totalExpense = $totalGaji + $totalOperasional;
            $pctGaji = $totalExpense > 0 ? round(($totalGaji / $totalExpense) * 100) : 0;
            $pctOpr = $totalExpense > 0 ? round(($totalOperasional / $totalExpense) * 100) : 0;

            $prevTotalGaji = DB::table('operation_documents')
                ->where('document_type', 'payroll_entry')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$prevYear}-01-01", $prevSalesInvoiceDate])
                ->sum('total_amount');
            $prevTotalOperasional = DB::table('operation_documents')
                ->where('document_type', 'expense_entry')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->whereBetween('entry_date', ["{$prevYear}-01-01", $prevSalesInvoiceDate])
                ->sum('total_amount');

            $prevTotalExpense = $prevTotalGaji + $prevTotalOperasional;
            $expenseTrend = $totalExpense >= $prevTotalExpense ? 'up' : 'down';
            $expenseGrowth = $calcGrowth($totalExpense, $prevTotalExpense);
            $expenseTone = $totalExpense >= $prevTotalExpense ? 'danger' : 'success';

            $gajiTrend = $totalGaji >= $prevTotalGaji ? 'up' : 'down';
            $gajiGrowth = $calcGrowth($totalGaji, $prevTotalGaji);
            $gajiTone = $totalGaji >= $prevTotalGaji ? 'danger' : 'success';

            $operasionalTrend = $totalOperasional >= $prevTotalOperasional ? 'up' : 'down';
            $operasionalGrowth = $calcGrowth($totalOperasional, $prevTotalOperasional);
            $operasionalTone = $totalOperasional >= $prevTotalOperasional ? 'danger' : 'success';

            $salesInvoiceAgg = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->where('entry_date', '>=', $monthStart)
                ->where('entry_date', '<=', $latestSalesInvoiceDate)
                ->selectRaw('
                    SUM(paid_amount) as faktur_lunas,
                    SUM(outstanding_amount) as faktur_belum_lunas,
                    SUM(CASE WHEN due_date >= ? OR due_date IS NULL THEN outstanding_amount ELSE 0 END) as belum_jatuh_tempo,
                    SUM(CASE WHEN due_date < ? AND due_date IS NOT NULL THEN outstanding_amount ELSE 0 END) as lewat_jatuh_tempo,
                    SUM(CASE WHEN entry_date = ? THEN total_amount ELSE 0 END) as hari_ini
                ', [$latestSalesInvoiceDate, $latestSalesInvoiceDate, $latestSalesInvoiceDate])
                ->first();

            $fakturLunasSales = (float) ($salesInvoiceAgg->faktur_lunas ?? 0);
            $fakturBelumLunasSales = (float) ($salesInvoiceAgg->faktur_belum_lunas ?? 0);
            $belumJatuhTempoSales = (float) ($salesInvoiceAgg->belum_jatuh_tempo ?? 0);
            $lewatJatuhTempoSales = (float) ($salesInvoiceAgg->lewat_jatuh_tempo ?? 0);
            $hariIniSales = (float) ($salesInvoiceAgg->hari_ini ?? 0);

            $purchaseInvoiceAgg = DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->where('entry_date', '>=', $monthStart)
                ->where('entry_date', '<=', $latestSalesInvoiceDate)
                ->selectRaw('
                    SUM(paid_amount) as faktur_lunas,
                    SUM(outstanding_amount) as faktur_belum_lunas,
                    SUM(CASE WHEN due_date >= ? OR due_date IS NULL THEN outstanding_amount ELSE 0 END) as belum_jatuh_tempo,
                    SUM(CASE WHEN due_date < ? AND due_date IS NOT NULL THEN outstanding_amount ELSE 0 END) as lewat_jatuh_tempo,
                    SUM(CASE WHEN entry_date = ? THEN total_amount ELSE 0 END) as hari_ini
                ', [$latestSalesInvoiceDate, $latestSalesInvoiceDate, $latestSalesInvoiceDate])
                ->first();

            $fakturLunasPurchase = (float) ($purchaseInvoiceAgg->faktur_lunas ?? 0);
            $fakturBelumLunasPurchase = (float) ($purchaseInvoiceAgg->faktur_belum_lunas ?? 0);
            $belumJatuhTempoPurchase = (float) ($purchaseInvoiceAgg->belum_jatuh_tempo ?? 0);
            $lewatJatuhTempoPurchase = (float) ($purchaseInvoiceAgg->lewat_jatuh_tempo ?? 0);
            $hariIniPurchase = (float) ($purchaseInvoiceAgg->hari_ini ?? 0);

            $dbTopProducts = DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->leftJoin('units', 'products.base_unit_id', '=', 'units.id')
                ->whereIn('operation_documents.document_type', ['sales_invoice', 'sales_delivery', 'cash_sale'])
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->where('operation_documents.entry_date', '<=', $latestSalesInvoiceDate)
                ->when($resolvedYear, fn ($q) => $q->whereBetween('operation_documents.entry_date', ["{$resolvedYear}-01-01", "{$resolvedYear}-12-31"]))
                ->select(
                    'products.id as product_id',
                    'products.name',
                    DB::raw('SUM(operation_document_lines.quantity) as units_sold'),
                    DB::raw('SUM(operation_document_lines.total_amount) as revenue'),
                    'units.name as unit_name'
                )
                ->groupBy('products.id', 'products.name', 'units.name')
                ->orderByDesc(DB::raw('SUM(operation_document_lines.quantity)'))
                ->limit(5)
                ->get();

            $totalTopUnits = (float) $dbTopProducts->sum('units_sold');
            $topProductsItems = [];

            $productIds = $dbTopProducts->pluck('product_id')->filter()->all();
            $productAttachments = empty($productIds) ? collect() : DB::table('attachments')
                ->where('attachable_type', \App\Domain\Catalog\Models\Product::class)
                ->whereIn('attachable_id', $productIds)
                ->where('file_type', 'like', 'image/%')
                ->get()
                ->keyBy('attachable_id');

            foreach ($dbTopProducts as $tp) {
                $pctShare = $totalTopUnits > 0 ? ($tp->units_sold / $totalTopUnits) * 100 : 0;
                
                $imageAttachment = $productAttachments->get($tp->product_id);
                $imageUrl = $imageAttachment ? asset('storage/' . $imageAttachment->file_path) : null;

                $unitsSold = (float) $tp->units_sold;
                $formattedUnits = (floor($unitsSold) == $unitsSold
                    ? number_format($unitsSold, 0, ',', '.')
                    : rtrim(rtrim(number_format($unitsSold, 2, ',', '.'), '0'), ',')) . ($tp->unit_name ? (' ' . $tp->unit_name) : '');

                $topProductsItems[] = [
                    'id' => $tp->product_id,
                    'name' => $tp->name,
                    'units' => $formattedUnits,
                    'share' => number_format($pctShare, 1, ',', '.') . '%',
                    'revenue' => $formatCurrencyShort($tp->revenue),
                    'imageUrl' => $imageUrl,
                ];
            }

            $initialCash = (float) DB::table('accounts')
                ->where(function ($q) {
                    $q->where('code', 'like', '1101%')
                      ->orWhere('account_type', 'like', '%Kas%')
                      ->orWhere('account_type', 'like', '%Cash%');
                })
                ->sum('opening_balance');

            if ($initialCash <= 0) {
                $initialCash = 150000000;
            }

            $baseInflowBefore = (float) DB::table('operation_documents')
                ->where('entry_date', '<', $startDate)
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'sales_receipt')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'cash_receipt')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'sales_invoice')
                            ->whereIn('status', ['Lunas', 'Paid', 'lunas'])
                            ->where('paid_amount', '>', 0)
                            ->whereNotExists(function ($ex) {
                                $ex->select(DB::raw(1))
                                    ->from('operation_document_lines')
                                    ->join('operation_documents as r', 'operation_document_lines.operation_document_id', '=', 'r.id')
                                    ->where('r.document_type', 'sales_receipt')
                                    ->whereColumn('operation_document_lines.reference_code', 'operation_documents.document_number');
                            });
                    });
                })
                ->sum('total_amount');

            $baseOutflowBefore = (float) DB::table('operation_documents')
                ->where('entry_date', '<', $startDate)
                ->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('document_type', 'cash_payment')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->where('document_type', 'purchase_payment')
                            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled']);
                    })->orWhere(function ($sub) {
                        $sub->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                            ->whereIn('status', ['Terbayar', 'Lunas', 'Paid'])
                            ->whereNotExists(function ($ex) {
                                $ex->select(DB::raw(1))
                                    ->from('operation_documents as cp')
                                    ->where('cp.document_type', 'cash_payment')
                                    ->whereColumn('cp.related_document_id', 'operation_documents.id')
                                    ->whereNotIn('cp.status', ['Void', 'Cancelled', 'void', 'cancelled']);
                            });
                    });
                })
                ->sum('total_amount');

            $runningCash = $initialCash + ($baseInflowBefore - $baseOutflowBefore);
            $cashAvailabilityLabels = [];
            $cashAvailabilitySeries = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - " . $i . " days"));
                $formattedDate = self::dateId($date, false);
                $cashAvailabilityLabels[] = $formattedDate;
                $runningCash += ((float) ($inflowsDb[$date] ?? 0) - (float) ($outflowsDb[$date] ?? 0));
                $cashAvailabilitySeries[] = $runningCash;
            }

            $todayStr = date('Y-m-d');
            $salesOrderStats = DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->selectRaw('
                    COUNT(*) as total_count,
                    COUNT(CASE WHEN status = ? THEN 1 END) as pending_count,
                    COUNT(CASE WHEN due_date < ? THEN 1 END) as overdue_count
                ', ['Draft', $todayStr])
                ->first();

            $totalSalesOrders = (int) ($salesOrderStats->total_count ?? 0);
            $pendingSalesOrders = (int) ($salesOrderStats->pending_count ?? 0);
            $overdueSalesOrders = (int) ($salesOrderStats->overdue_count ?? 0);

            $today = Carbon::today();
            $monthMap = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];

            // 1. Hitung Kegiatan Mendatang
            $upcomingActivityItems = [];
            $targetDay = 15;
            $upcomingDate = $today->day <= $targetDay
                ? Carbon::today()->setDay($targetDay)
                : Carbon::today()->addMonth()->setDay($targetDay);

            $targetMonthName = $monthMap[$upcomingDate->month] ?? $upcomingDate->format('F');
            $reportMonthName = $monthMap[$upcomingDate->copy()->subMonth()->month] ?? $upcomingDate->copy()->subMonth()->format('F');
            $upcomingNote = $upcomingDate->format('d') . ' ' . $targetMonthName . ' ' . $upcomingDate->format('Y') . " — Batas Akhir Pelaporan SPT PPh 21 Masa {$reportMonthName} " . $upcomingDate->copy()->subMonth()->format('Y');

            $upcomingActivityItems[] = [
                'id' => 'spt-tax',
                'title' => "Batas Pelaporan SPT PPh 21 Masa {$reportMonthName}",
                'subtitle' => 'Pajak Bulanan Toko',
                'date' => $upcomingDate->format('d/m/Y'),
                'badge' => 'Pajak Toko',
                'tone' => 'info',
            ];

            $dbUpcomingSO = DB::table('operation_documents')
                ->leftJoin('customers', 'operation_documents.customer_id', '=', 'customers.id')
                ->where('operation_documents.document_type', 'sales_order')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'Closed', 'void', 'cancelled'])
                ->where('operation_documents.entry_date', '>=', date('Y-m-d'))
                ->select('operation_documents.id', 'operation_documents.document_number', 'operation_documents.entry_date', 'customers.name as contact_name')
                ->orderBy('operation_documents.entry_date', 'asc')
                ->limit(3)
                ->get();

            foreach ($dbUpcomingSO as $so) {
                $upcomingActivityItems[] = [
                    'id' => 'so-' . $so->id,
                    'title' => "Pengiriman Pesanan {$so->document_number}" . ($so->contact_name ? " ({$so->contact_name})" : ''),
                    'subtitle' => 'Target Pengiriman Penjualan',
                    'date' => Carbon::parse($so->entry_date)->format('d/m/Y'),
                    'badge' => 'Pesanan Sales',
                    'tone' => 'warning',
                ];
            }

            $dbUpcomingPO = DB::table('operation_documents')
                ->leftJoin('suppliers', 'operation_documents.supplier_id', '=', 'suppliers.id')
                ->where('operation_documents.document_type', 'purchase_order')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'Closed', 'void', 'cancelled'])
                ->where('operation_documents.entry_date', '>=', date('Y-m-d'))
                ->select('operation_documents.id', 'operation_documents.document_number', 'operation_documents.entry_date', 'suppliers.name as contact_name')
                ->orderBy('operation_documents.entry_date', 'asc')
                ->limit(3)
                ->get();

            foreach ($dbUpcomingPO as $po) {
                $upcomingActivityItems[] = [
                    'id' => 'po-' . $po->id,
                    'title' => "Penerimaan PO {$po->document_number}" . ($po->contact_name ? " ({$po->contact_name})" : ''),
                    'subtitle' => 'Jadwal Datang Pasokan Supplier',
                    'date' => Carbon::parse($po->entry_date)->format('d/m/Y'),
                    'badge' => 'Pembelian PO',
                    'tone' => 'info',
                ];
            }

            // 2. Hitung Kegiatan Terlewat
            $overdueActivityItems = [];

            $dbOverdueSalesInvoices = DB::table('operation_documents')
                ->leftJoin('customers', 'operation_documents.customer_id', '=', 'customers.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->where('operation_documents.outstanding_amount', '>', 0)
                ->where('operation_documents.due_date', '<', date('Y-m-d'))
                ->select('operation_documents.id', 'operation_documents.document_number', 'operation_documents.due_date', 'operation_documents.outstanding_amount', 'customers.name as contact_name')
                ->orderBy('operation_documents.due_date', 'asc')
                ->limit(4)
                ->get();

            foreach ($dbOverdueSalesInvoices as $inv) {
                $days = Carbon::parse($inv->due_date)->diffInDays(now());
                $overdueActivityItems[] = [
                    'id' => 'sinv-' . $inv->id,
                    'title' => "Piutang Faktur " . $inv->document_number . ($inv->contact_name ? " ({$inv->contact_name})" : ''),
                    'subtitle' => 'Sisa Rp ' . number_format($inv->outstanding_amount, 0, ',', '.') . ' • Due: ' . Carbon::parse($inv->due_date)->format('d/m/Y'),
                    'date' => Carbon::parse($inv->due_date)->format('d/m/Y'),
                    'badge' => 'Terlewat ' . $days . ' Hari',
                    'tone' => 'danger',
                ];
            }

            $dbOverduePurchaseInvoices = DB::table('operation_documents')
                ->leftJoin('suppliers', 'operation_documents.supplier_id', '=', 'suppliers.id')
                ->where('operation_documents.document_type', 'purchase_invoice')
                ->whereNotIn('operation_documents.status', ['Void', 'Cancelled', 'void', 'cancelled'])
                ->where('operation_documents.outstanding_amount', '>', 0)
                ->where('operation_documents.due_date', '<', date('Y-m-d'))
                ->select('operation_documents.id', 'operation_documents.document_number', 'operation_documents.due_date', 'operation_documents.outstanding_amount', 'suppliers.name as contact_name')
                ->orderBy('operation_documents.due_date', 'asc')
                ->limit(4)
                ->get();

            foreach ($dbOverduePurchaseInvoices as $inv) {
                $days = Carbon::parse($inv->due_date)->diffInDays(now());
                $overdueActivityItems[] = [
                    'id' => 'pinv-' . $inv->id,
                    'title' => "Hutang Supplier " . $inv->document_number . ($inv->contact_name ? " ({$inv->contact_name})" : ''),
                    'subtitle' => 'Hutang: Rp ' . number_format($inv->outstanding_amount, 0, ',', '.') . ' • Due: ' . Carbon::parse($inv->due_date)->format('d/m/Y'),
                    'date' => Carbon::parse($inv->due_date)->format('d/m/Y'),
                    'badge' => 'Hutang ' . $days . ' Hari',
                    'tone' => 'danger',
                ];
            }

            $dbOverduePayroll = DB::table('operation_documents')
                ->where('document_type', 'payroll_entry')
                ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled', 'Lunas', 'lunas'])
                ->where('outstanding_amount', '>', 0)
                ->where('due_date', '<', date('Y-m-d'))
                ->select('id', 'document_number', 'due_date', 'outstanding_amount')
                ->orderBy('due_date', 'asc')
                ->limit(4)
                ->get();

            foreach ($dbOverduePayroll as $pay) {
                $days = Carbon::parse($pay->due_date)->diffInDays(now());
                $overdueActivityItems[] = [
                    'id' => 'pay-' . $pay->id,
                    'title' => "Gaji Karyawan " . $pay->document_number,
                    'subtitle' => 'Utang Gaji: Rp ' . number_format($pay->outstanding_amount, 0, ',', '.') . ' • Due: ' . Carbon::parse($pay->due_date)->format('d/m/Y'),
                    'date' => Carbon::parse($pay->due_date)->format('d/m/Y'),
                    'badge' => 'Terlewat ' . $days . ' Hari',
                    'tone' => 'danger',
                ];
            }

            $overdueSalesInvoicesCount = count($dbOverdueSalesInvoices);
            $overduePurchaseInvoicesCount = count($dbOverduePurchaseInvoices);
            $overduePayrollCount = count($dbOverduePayroll);
            $overdueCount = $overdueSalesInvoicesCount + $overduePurchaseInvoicesCount + $overduePayrollCount;
            if ($overdueCount > 0) {
                $overdueNote = "{$overdueCount} Kewajiban/faktur melewati batas jatuh tempo.";
            } else {
                $overdueNote = "Belum ada kegiatan pembayaran yang terlewat.";
            }
        } else {
            $latestSalesInvoiceDate = $asOfDate ?? date('Y-m-d');
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
            $salesTeamRows = [];
            $topProductsItems = [];
            $cashAvailabilityLabels = [];
            $cashAvailabilitySeries = [];
            $totalSalesOrders = 0;
            $pendingSalesOrders = 0;
            $overdueSalesOrders = 0;

            $profitTrend = null;
            $profitGrowth = null;
            $salesTrend = null;
            $salesGrowth = null;
            $salesTone = null;
            $hppTrend = null;
            $hppGrowth = null;
            $hppTone = null;
            $expensesTrend = null;
            $expensesGrowth = null;
            $expensesTone = null;
            $expenseTrend = null;
            $expenseGrowth = null;
            $expenseTone = null;
            $gajiTrend = null;
            $gajiGrowth = null;
            $gajiTone = null;
            $operasionalTrend = null;
            $operasionalGrowth = null;
            $operasionalTone = null;
        }

        return [
            'userActivities' => $userActivities,
            'upcomingNote' => $upcomingNote,
            'overdueNote' => $overdueNote,
            'upcomingActivityItems' => $upcomingActivityItems ?? [],
            'overdueActivityItems' => $overdueActivityItems ?? [],
            'transactionTypeOptions' => $transactionTypeOptions,
            'latestSalesInvoiceDate' => $latestSalesInvoiceDate ?? date('Y-m-d'),
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
            'profitTrend' => $profitTrend,
            'profitGrowth' => $profitGrowth,
            'salesTrend' => $salesTrend,
            'salesGrowth' => $salesGrowth,
            'salesTone' => $salesTone,
            'hppTrend' => $hppTrend,
            'hppGrowth' => $hppGrowth,
            'hppTone' => $hppTone,
            'expensesTrend' => $expensesTrend,
            'expensesGrowth' => $expensesGrowth,
            'expensesTone' => $expensesTone,
            'cashFlowLabels' => $cashFlowLabels,
            'cashInSeries' => $cashInSeries,
            'cashOutSeries' => $cashOutSeries,
            'totalGaji' => $totalGaji,
            'totalOperasional' => $totalOperasional,
            'totalExpense' => $totalExpense,
            'pctGaji' => $pctGaji,
            'pctOpr' => $pctOpr,
            'expenseTrend' => $expenseTrend,
            'expenseGrowth' => $expenseGrowth,
            'expenseTone' => $expenseTone,
            'gajiTrend' => $gajiTrend,
            'gajiGrowth' => $gajiGrowth,
            'gajiTone' => $gajiTone,
            'operasionalTrend' => $operasionalTrend,
            'operasionalGrowth' => $operasionalGrowth,
            'operasionalTone' => $operasionalTone,
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
            'topProductsItems' => $topProductsItems,
            'cashAvailabilityLabels' => $cashAvailabilityLabels,
            'cashAvailabilitySeries' => $cashAvailabilitySeries,
        ];
    }

    private static function dateId(string $dateStr, bool $withYear = true): string
    {
        static $months = [
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
