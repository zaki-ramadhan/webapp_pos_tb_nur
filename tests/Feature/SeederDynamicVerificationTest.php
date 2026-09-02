<?php

namespace Tests\Feature;

use App\Support\Presentation\Queries\DashboardActivityQueryService;
use Carbon\Carbon;
use Database\Seeders\RealisticDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SeederDynamicVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_realistic_data_seeder_executes_dynamically_with_indonesian_localization(): void
    {
        $this->seed(RealisticDataSeeder::class);

        $today = Carbon::now()->toDateString();

        // 1. Verifikasi data penjualan hari ini terisi
        $todayInvoicesCount = DB::table('operation_documents')
            ->where('document_type', 'sales_invoice')
            ->where('entry_date', $today)
            ->count();

        $this->assertGreaterThan(0, $todayInvoicesCount, 'Harus ada faktur penjualan untuk hari ini');

        // 2. Verifikasi grafik 7 hari terakhir terisi penuh tanpa hari kosong
        for ($i = 0; $i < 7; $i++) {
            $checkDate = Carbon::now()->subDays($i)->toDateString();
            $countOnDate = DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('entry_date', $checkDate)
                ->count();
            $this->assertGreaterThan(0, $countOnDate, "Tanggal {$checkDate} (H-{$i}) harus memiliki data transaksi");
        }

        // 3. Verifikasi log aktivitas tidak mengandung istilah bahasa Inggris yang bocor
        $englishTerms = [
            'Sales Invoices',
            'Purchase Invoices',
            'Purchase Payments',
            'Sales Orders',
            'Purchase Orders',
            'Sales Quotes',
            'Goods Receipts',
            'Purchase Returns',
            'Sales Returns',
            'Delivery Orders',
        ];

        $activityLogs = DB::table('activity_logs')->get();
        $this->assertNotEmpty($activityLogs, 'Tabel activity_logs harus terisi');

        foreach ($activityLogs as $log) {
            foreach ($englishTerms as $term) {
                $this->assertStringNotContainsStringIgnoringCase(
                    $term,
                    $log->description ?? '',
                    "Deskripsi log aktivitas id {$log->id} tidak boleh mengandung kata '{$term}'"
                );
            }
        }

        // 4. Verifikasi output DashboardActivityQueryService 100% berbahasa Indonesia
        $adminUser = DB::table('users')->where('email', 'piscokpiscok2610@gmail.com')->first();
        $activities = DashboardActivityQueryService::getRecentActivities($adminUser);

        $this->assertNotEmpty($activities, 'Daftar aktivitas dasbor harus terisi');

        foreach ($activities as $activity) {
            foreach ($englishTerms as $term) {
                $this->assertStringNotContainsStringIgnoringCase(
                    $term,
                    $activity['title'] ?? '',
                    "Judul aktivitas dasbor tidak boleh mengandung kata '{$term}'"
                );
            }
        }
    }
}
