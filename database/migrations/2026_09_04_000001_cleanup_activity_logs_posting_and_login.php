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

        // Ganti semua tindakan posting menjadi buat (create)
        DB::table('activity_logs')->where('action', 'post')->update([
            'action' => 'create',
        ]);

        // Ringkaskan deskripsi agar menggunakan kata kerja lugas (Buat, Ubah, Hapus)
        DB::table('activity_logs')->where('description', 'like', 'Memposting %')->update([
            'description' => DB::raw("REPLACE(description, 'Memposting ', 'Buat ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Posting %')->update([
            'description' => DB::raw("REPLACE(description, 'Posting ', 'Buat ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Membuat %')->update([
            'description' => DB::raw("REPLACE(description, 'Membuat ', 'Buat ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Mengubah %')->update([
            'description' => DB::raw("REPLACE(description, 'Mengubah ', 'Ubah ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Memperbarui %')->update([
            'description' => DB::raw("REPLACE(description, 'Memperbarui ', 'Ubah ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Menghapus %')->update([
            'description' => DB::raw("REPLACE(description, 'Menghapus ', 'Hapus ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Mencatat %')->update([
            'description' => DB::raw("REPLACE(description, 'Mencatat ', 'Buat ')"),
        ]);
        DB::table('activity_logs')->where('description', 'like', 'Memproses %')->update([
            'description' => DB::raw("REPLACE(description, 'Memproses ', 'Buat ')"),
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
