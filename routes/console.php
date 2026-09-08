<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('journal:sync-general {--keep-dummy : Tidak menghapus dummy REF-OPS lama}', function () {
    $this->info('Memulai sinkronisasi Jurnal Umum...');
    $cleanDummy = ! $this->option('keep-dummy');
    $service = app(\App\Domain\Finance\Services\GeneralJournalSyncService::class);
    $result = $service->syncAll($cleanDummy);
    $this->info("Sinkronisasi Jurnal Umum selesai!");
    $this->line("- Transaksi operasional terposting: {$result['posted_transactions']}");
    $this->line("- Jurnal penyesuaian manual terbuat: {$result['manual_adjustments']}");
})->purpose('Sinkronisasi seluruh transaksi operasional dan buat jurnal penyesuaian realistis ke Jurnal Umum');
