<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $developerEmails = [
            'piscokpiscok2610@gmail.com',
            'zakiram4dhan@gmail.com',
        ];

        $superAdminRoleId = DB::table('roles')->where('code', 'super_admin')->value('id');
        $adminRoleId = DB::table('roles')->where('code', 'admin')->value('id');

        if (! $superAdminRoleId || ! $adminRoleId) {
            return;
        }

        // 1. Pastikan email developer terhubung ke role super_admin
        $devUserIds = DB::table('users')->whereIn('email', $developerEmails)->pluck('id')->toArray();
        foreach ($devUserIds as $uId) {
            DB::table('role_user')->where('user_id', $uId)->delete();
            DB::table('role_user')->insert([
                'user_id' => $uId,
                'role_id' => $superAdminRoleId,
            ]);
        }

        // 2. Akun selain developer yang terlanjur memegang role super_admin diturunkan ke role admin (Owner)
        $nonDevSuperAdminUserIds = DB::table('role_user')
            ->join('users', 'role_user.user_id', '=', 'users.id')
            ->where('role_user.role_id', $superAdminRoleId)
            ->whereNotIn('users.email', $developerEmails)
            ->pluck('users.id')
            ->toArray();

        foreach ($nonDevSuperAdminUserIds as $uId) {
            DB::table('role_user')->where('user_id', $uId)->where('role_id', $superAdminRoleId)->delete();
            DB::table('role_user')->insertOrIgnore([
                'user_id' => $uId,
                'role_id' => $adminRoleId,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
