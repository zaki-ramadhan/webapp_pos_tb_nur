<?php

use App\Domain\Finance\Services\GeneralJournalSyncService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Jalankan sinkronisasi jurnal umum dan log aktivitas jurnal secara otomatis
        app(GeneralJournalSyncService::class)->syncAll(true);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
