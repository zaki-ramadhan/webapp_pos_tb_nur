<?php

namespace App\Support\Presentation\Queries;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DashboardActivityQueryService
{
    /**
     * Mengambil daftar aktivitas terakhir pengguna.
     *
     * @param mixed $user
     * @return array
     */
    public static function getRecentActivities($user): array
    {
        if ($user === null) {
            return [];
        }

        $logs = DB::table('activity_logs')
            ->where('actor_user_id', $user->id)
            ->orderBy('occurred_at', 'desc')
            ->limit(10)
            ->get();

        if ($logs->count() < 5) {
            $logs = DB::table('activity_logs')
                ->orderBy('occurred_at', 'desc')
                ->limit(10)
                ->get();
        }

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
            'May' => 'Mei', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Ags',
            'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des',
        ];

        $actionMap = [
            'create' => 'Membuat',
            'update' => 'Mengubah',
            'delete' => 'Menghapus',
            'post' => 'Memproses',
            'login' => 'Masuk',
        ];

        $resourceMap = [
            'brand' => 'Merek',
            'brands' => 'Merek',
            'unit' => 'Satuan',
            'units' => 'Satuan',
            'product' => 'Data Barang',
            'products' => 'Data Barang',
            'items-services' => 'Data Barang',
            'item-service' => 'Data Barang',
            'warehouse-master' => 'Gudang',
            'warehouse-masters' => 'Gudang',
            'currency-master' => 'Mata Uang',
            'currency-masters' => 'Mata Uang',
            'shipping-master' => 'Pengiriman',
            'shipping-masters' => 'Pengiriman',
            'fob-master' => 'Syarat Pengiriman',
            'fob-masters' => 'Syarat Pengiriman',
            'sales-quote' => 'Penawaran Penjualan',
            'sales-quotes' => 'Penawaran Penjualan',
            'sales-order' => 'Pesanan Penjualan',
            'sales-orders' => 'Pesanan Penjualan',
            'sales-delivery' => 'Pengiriman Pesanan',
            'sales-deliveries' => 'Pengiriman Pesanan',
            'delivery-order' => 'Surat Jalan',
            'delivery-orders' => 'Surat Jalan',
            'sales-invoice' => 'Faktur Penjualan',
            'sales-invoices' => 'Faktur Penjualan',
            'sales-receipt' => 'Penerimaan Penjualan',
            'sales-receipts' => 'Penerimaan Penjualan',
            'sales-return' => 'Retur Penjualan',
            'sales-returns' => 'Retur Penjualan',
            'sales-deposit' => 'Uang Muka Penjualan',
            'sales-deposits' => 'Uang Muka Penjualan',
            'sales-target' => 'Target Penjualan',
            'sales-targets' => 'Target Penjualan',
            'purchase-order' => 'Pesanan Pembelian',
            'purchase-orders' => 'Pesanan Pembelian',
            'goods-receipt' => 'Penerimaan Barang',
            'goods-receipts' => 'Penerimaan Barang',
            'purchase-invoice' => 'Faktur Pembelian',
            'purchase-invoices' => 'Faktur Pembelian',
            'purchase-payment' => 'Pembayaran Pembelian',
            'purchase-payments' => 'Pembayaran Pembelian',
            'purchase-return' => 'Retur Pembelian',
            'purchase-returns' => 'Retur Pembelian',
            'purchase-deposit' => 'Uang Muka Pembelian',
            'purchase-deposits' => 'Uang Muka Pembelian',
            'stock-opname' => 'Opname Stok',
            'inventory-adjustment' => 'Penyesuaian Persediaan',
            'inventory-adjustments' => 'Penyesuaian Persediaan',
            'stock-transfer' => 'Pemindahan Barang',
            'stock-transfers' => 'Pemindahan Barang',
            'item-request' => 'Permintaan Barang',
            'item-requests' => 'Permintaan Barang',
            'cash-payment' => 'Pengeluaran Kas',
            'cash-payments' => 'Pengeluaran Kas',
            'cash-receipt' => 'Penerimaan Kas',
            'cash-receipts' => 'Penerimaan Kas',
            'bank-transfer' => 'Transfer Bank',
            'bank-transfers' => 'Transfer Bank',
            'bank-statement' => 'Rekening Koran',
            'bank-statements' => 'Rekening Koran',
            'bank-reconciliation' => 'Rekonsiliasi Bank',
            'bank-reconciliations' => 'Rekonsiliasi Bank',
            'bank-history' => 'Histori Bank',
            'bank-histories' => 'Histori Bank',
            'expense-entry' => 'Pencatatan Beban',
            'expense-entries' => 'Pencatatan Beban',
            'payroll-entry' => 'Pencatatan Gaji',
            'payroll-entries' => 'Pencatatan Gaji',
            'general-journal' => 'Jurnal Umum',
            'general-journals' => 'Jurnal Umum',
            'account' => 'Akun Perkiraan',
            'accounts' => 'Akun Perkiraan',
            'currency' => 'Mata Uang',
            'currencies' => 'Mata Uang',
            'warehouse' => 'Gudang',
            'warehouses' => 'Gudang',
            'customer' => 'Pelanggan',
            'customers' => 'Pelanggan',
            'supplier' => 'Pemasok',
            'suppliers' => 'Pemasok',
            'fixed-asset' => 'Aset Tetap',
            'fixed-assets' => 'Aset Tetap',
            'employee' => 'Karyawan',
            'employees' => 'Karyawan',
            'department' => 'Departemen',
            'departments' => 'Departemen',
            'user' => 'Pengguna',
            'users' => 'Pengguna',
            'group-access' => 'Grup Hak Akses',
            'access-groups' => 'Grup Hak Akses',
            'sales-checkin' => 'Check-in Penjualan',
            'sales-checkins' => 'Check-in Penjualan',
        ];

        $englishReplacements = [
            'Sales Invoices' => 'Faktur Penjualan',
            'Sales Invoice' => 'Faktur Penjualan',
            'Purchase Invoices' => 'Faktur Pembelian',
            'Purchase Invoice' => 'Faktur Pembelian',
            'Purchase Payments' => 'Pembayaran Pembelian',
            'Purchase Payment' => 'Pembayaran Pembelian',
            'Purchase Orders' => 'Pesanan Pembelian',
            'Purchase Order' => 'Pesanan Pembelian',
            'Sales Orders' => 'Pesanan Penjualan',
            'Sales Order' => 'Pesanan Penjualan',
            'Sales Quotes' => 'Penawaran Penjualan',
            'Sales Quote' => 'Penawaran Penjualan',
            'Sales Deliveries' => 'Pengiriman Pesanan',
            'Sales Delivery' => 'Pengiriman Pesanan',
            'Delivery Orders' => 'Surat Jalan',
            'Delivery Order' => 'Surat Jalan',
            'Goods Receipts' => 'Penerimaan Barang',
            'Goods Receipt' => 'Penerimaan Barang',
            'Purchase Returns' => 'Retur Pembelian',
            'Purchase Return' => 'Retur Pembelian',
            'Sales Returns' => 'Retur Penjualan',
            'Sales Return' => 'Retur Penjualan',
            'Sales Deposits' => 'Uang Muka Penjualan',
            'Sales Deposit' => 'Uang Muka Penjualan',
            'Purchase Deposits' => 'Uang Muka Pembelian',
            'Purchase Deposit' => 'Uang Muka Pembelian',
            'Fixed Assets' => 'Aset Tetap',
            'Fixed Asset' => 'Aset Tetap',
            'Stock Transfers' => 'Pemindahan Barang',
            'Stock Transfer' => 'Pemindahan Barang',
            'Expense Entries' => 'Pencatatan Beban',
            'Payroll Entries' => 'Pencatatan Gaji',
            'General Journals' => 'Jurnal Umum',
            'Bank Transfers' => 'Transfer Bank',
            'Cash Payments' => 'Pembayaran Kas & Bank',
            'Cash Receipts' => 'Penerimaan Kas & Bank',
            'Bank Statements' => 'Rekening Koran',
            'Bank Reconciliations' => 'Rekonsiliasi Bank',
            'Bank Histories' => 'Histori Bank',
            'Sales Checkins' => 'Check-in Penjualan',
            'Customers' => 'Pelanggan',
            'Suppliers' => 'Pemasok',
            'Warehouses' => 'Gudang',
            'Products' => 'Barang',
            'Units' => 'Satuan',
        ];

        $userActivities = [];

        foreach ($logs as $log) {
            $occurredAt = $log->occurred_at ? Carbon::parse($log->occurred_at)->setTimezone('Asia/Jakarta') : null;
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

            if (filled($log->description)) {
                $activityTitle = $log->description;
            } else {
                $actionStr = $actionMap[strtolower($log->action)] ?? ucfirst($log->action);
                $resourceKeyNorm = strtolower(trim((string)$log->resource_key));
                $resourceStr = $resourceMap[$resourceKeyNorm] ?? ($log->resource_label ?? ucfirst($log->resource_key));
                $subjectStr = trim((string) ($log->subject_label ?? $log->document_number ?? ''));

                if (filled($subjectStr) && strtolower($subjectStr) !== strtolower($resourceStr)) {
                    $activityTitle = "{$actionStr} {$subjectStr}";
                } else {
                    $activityTitle = "{$actionStr} {$resourceStr}";
                }
            }

            // Normalisasi agar tidak ada kebocoran istilah bahasa Inggris dari log lama
            $activityTitle = str_ireplace(array_keys($englishReplacements), array_values($englishReplacements), $activityTitle);
            $activityTitle = str_ireplace(['ke sistem POS TB Nur', 'ke sistem POS', 'ke sistem TB Nur'], ['ke sistem', 'ke sistem', 'ke sistem'], $activityTitle);
            $activityTitle = str_ireplace(['UD. TB Nur', 'UD TB Nur', 'TB Nur', 'UD. '], ['', '', '', ''], $activityTitle);
            $activityTitle = str_ireplace([' POS Kasir', ' Kasir POS', ' POS'], [' Kasir', ' Kasir', ''], $activityTitle);
            $activityTitle = str_ireplace(['Master Barang', 'Master Data', 'Data Master', 'Master '], ['Data Barang', 'Data Sistem', 'Data Toko', 'Data '], $activityTitle);
            $activityTitle = preg_replace('/\s+/', ' ', trim($activityTitle));

            $userActivities[] = [
                'id' => $log->id,
                'dayName' => $dayName,
                'dayNum' => $dayNum,
                'monthName' => $monthName,
                'time' => $timeStr,
                'title' => $activityTitle,
            ];
        }

        return $userActivities;
    }
}
