<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (class_exists(\Database\Seeders\PartyEntitySeeder::class)) {
            (new \Database\Seeders\PartyEntitySeeder)->run();
        }

        if (class_exists(\Database\Seeders\TransactionDataSeeder::class)) {
            (new \Database\Seeders\TransactionDataSeeder)->run();
        }
    }

    public function down(): void
    {
    }
};
