<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warehouses', function (Blueprint $table): void {
            $table->text('description')->nullable()->after('name');
            $table->string('responsible_person', 120)->nullable()->after('description');
            $table->text('street')->nullable()->after('responsible_person');
            $table->string('city', 100)->nullable()->after('street');
            $table->string('postal_code', 20)->nullable()->after('city');
            $table->string('province', 100)->nullable()->after('postal_code');
            $table->string('country', 100)->nullable()->after('province');
            $table->boolean('all_users')->default(true)->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table): void {
            $table->dropColumn([
                'description',
                'responsible_person',
                'street',
                'city',
                'postal_code',
                'province',
                'country',
                'all_users',
            ]);
        });
    }
};
