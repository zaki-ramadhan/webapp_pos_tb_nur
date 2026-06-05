<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('access_groups', function (Blueprint $table): void {
            $table->string('access_limit_type')->nullable()->default('follow-preference');
            $table->string('access_limit_days')->nullable();
            $table->string('access_limit_start_hour')->nullable();
            $table->string('access_limit_end_hour')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('access_groups', function (Blueprint $table): void {
            $table->dropColumn([
                'access_limit_type',
                'access_limit_days',
                'access_limit_start_hour',
                'access_limit_end_hour',
            ]);
        });
    }
};
