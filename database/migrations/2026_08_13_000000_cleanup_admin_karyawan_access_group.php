<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $adminGroup = DB::table('access_groups')->where('code', 'ADMIN')->first();
        $ownerGroup = DB::table('access_groups')->where('code', 'OWNER')->first();

        if ($ownerGroup && $adminGroup) {
            $adminUserIds = DB::table('access_group_user')
                ->where('access_group_id', $adminGroup->id)
                ->pluck('user_id');

            foreach ($adminUserIds as $userId) {
                DB::table('access_group_user')->insertOrIgnore([
                    'access_group_id' => $ownerGroup->id,
                    'user_id' => $userId,
                ]);
            }

            DB::table('access_group_permissions')->where('access_group_id', $adminGroup->id)->delete();
            DB::table('access_group_user')->where('access_group_id', $adminGroup->id)->delete();
            DB::table('access_groups')->where('id', $adminGroup->id)->delete();
        }

        if ($ownerGroup) {
            $ownerUsers = DB::table('users')
                ->whereIn('email', ['piscokpiscok2610@gmail.com', 'nurhayati.karya@gmail.com', 'zakiram4dhan@gmail.com'])
                ->pluck('id');

            foreach ($ownerUsers as $userId) {
                DB::table('access_group_user')->insertOrIgnore([
                    'access_group_id' => $ownerGroup->id,
                    'user_id' => $userId,
                ]);
            }
        }
    }

    public function down(): void
    {
        // No-op
    }
};
