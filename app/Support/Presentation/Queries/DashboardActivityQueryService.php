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
            ->limit(3)
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
            'general-journals' => 'Jurnal Umum',
            'employee' => 'Karyawan',
            'employees' => 'Karyawan',
            'product' => 'Barang & Jasa',
            'products' => 'Barang & Jasa',
            'preference' => 'Preferensi',
            'user' => 'Pengguna',
            'users' => 'Pengguna',
            'expense-entry' => 'Pencatatan Beban',
            'expense-entries' => 'Pencatatan Beban',
            'payroll-entry' => 'Pencatatan Gaji',
            'payroll-entries' => 'Pencatatan Gaji',
            'account' => 'Akun Perkiraan',
            'accounts' => 'Akun Perkiraan',
            'bank-inquiry' => 'Rekonsiliasi Bank',
            'bank-inquiries' => 'Rekonsiliasi Bank',
            'bank-transfer' => 'Transfer Bank',
            'bank-transfers' => 'Transfer Bank',
            'business-partner' => 'Mitra Bisnis',
            'business-partners' => 'Mitra Bisnis',
            'cash-payment' => 'Pembayaran Kas & Bank',
            'cash-payments' => 'Pembayaran Kas & Bank',
            'cash-receipt' => 'Penerimaan Kas & Bank',
            'cash-receipts' => 'Penerimaan Kas & Bank',
            'currency' => 'Mata Uang',
            'currencies' => 'Mata Uang',
            'department' => 'Departemen',
            'departments' => 'Departemen',
            'group-access' => 'Hak Akses',
            'group-accesses' => 'Hak Akses',
            'inventory-adjustment' => 'Penyesuaian Persediaan',
            'inventory-adjustments' => 'Penyesuaian Persediaan',
            'item-category' => 'Kategori Barang & Jasa',
            'item-categories' => 'Kategori Barang & Jasa',
            'item-request' => 'Permintaan Barang',
            'item-requests' => 'Permintaan Barang',
            'salary-allowance' => 'Tunjangan & Gaji',
            'salary-allowances' => 'Tunjangan & Gaji',
            'sales-checkin' => 'Kunjungan Sales',
            'sales-checkins' => 'Kunjungan Sales',
            'sales-commission' => 'Komisi Penjualan',
            'sales-commissions' => 'Komisi Penjualan',
            'sales-deposit' => 'Uang Muka Penjualan',
            'sales-deposits' => 'Uang Muka Penjualan',
            'sales-document' => 'Dokumen Penjualan',
            'sales-documents' => 'Dokumen Penjualan',
            'sales-receipt' => 'Penerimaan Penjualan',
            'sales-receipts' => 'Penerimaan Penjualan',
            'supplier-price' => 'Harga Pemasok',
            'supplier-prices' => 'Harga Pemasok',
            'transaction-approval' => 'Persetujuan Transaksi',
            'transaction-approvals' => 'Persetujuan Transaksi',
            'users-management' => 'Manajemen Pengguna',
            'users-managements' => 'Manajemen Pengguna',
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

            $actionStr = $actionMap[strtolower($log->action)] ?? ucfirst($log->action);
            
            $keysToCheck = array_filter([
                $log->permission_key,
                $log->resource_key,
                $log->resource_label,
            ]);
            $resourceStr = null;
            foreach ($keysToCheck as $k) {
                $norm = strtolower(trim($k));
                if (isset($resourceMap[$norm])) {
                    $resourceStr = $resourceMap[$norm];
                    break;
                }
            }
            if ($resourceStr === null) {
                $resourceStr = $log->resource_label ?? ucfirst($log->resource_key);
            }
            
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

        return $userActivities;
    }
}
