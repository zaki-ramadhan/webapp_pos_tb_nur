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
            'May' => 'Mei', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Agt',
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
            'general-journal' => 'Jurnal Umum',
            'general-journals' => 'Jurnal Umum',
            'employee' => 'Karyawan',
            'employees' => 'Karyawan',
            'product' => 'Barang',
            'products' => 'Barang',
            'purchase-order' => 'Pesanan Pembelian',
            'purchase-orders' => 'Pesanan Pembelian',
            'sales-invoice' => 'Faktur Penjualan',
            'sales-invoices' => 'Faktur Penjualan',
            'stock-opname' => 'Opname Stok',
            'inventory-adjustment' => 'Penyesuaian Stok',
            'inventory-adjustments' => 'Penyesuaian Stok',
            'cash-payment' => 'Pengeluaran Kas',
            'cash-payments' => 'Pengeluaran Kas',
            'sales-receipt' => 'Penerimaan Piutang',
            'sales-receipts' => 'Penerimaan Piutang',
            'user' => 'Pengguna',
            'users' => 'Pengguna',
            'expense-entry' => 'Pencatatan Beban',
            'expense-entries' => 'Pencatatan Beban',
            'payroll-entry' => 'Pencatatan Gaji',
            'payroll-entries' => 'Pencatatan Gaji',
            'account' => 'Akun Perkiraan',
            'accounts' => 'Akun Perkiraan',
            'warehouse' => 'Gudang',
            'warehouses' => 'Gudang',
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
