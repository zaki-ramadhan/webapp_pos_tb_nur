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
            'employee' => 'Karyawan',
            'product' => 'Produk',
            'preference' => 'Preferensi',
            'user' => 'Pengguna',
        ];

        $userActivities = [];

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

        return $userActivities;
    }
}
