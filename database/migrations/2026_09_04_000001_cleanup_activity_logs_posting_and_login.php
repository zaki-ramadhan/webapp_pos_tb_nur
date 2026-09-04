<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('activity_logs')) {
            return;
        }

        // Hapus log aktivitas tipe login
        DB::table('activity_logs')->where('action', 'login')->delete();

        // Ganti semua tindakan posting menjadi buat (create) dan perbarui deskripsinya
        DB::table('activity_logs')->where('action', 'post')->update([
            'action' => 'create',
            'description' => DB::raw("REPLACE(REPLACE(description, 'Memposting ', 'Membuat '), 'Posting ', 'Buat ')"),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
