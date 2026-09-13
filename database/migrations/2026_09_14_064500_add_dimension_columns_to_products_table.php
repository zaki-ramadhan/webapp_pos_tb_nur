<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('length', 12, 2)->nullable()->after('notes');
            $table->decimal('width', 12, 2)->nullable()->after('length');
            $table->decimal('height', 12, 2)->nullable()->after('width');
            $table->decimal('weight', 12, 2)->nullable()->after('height');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $cols = ['length', 'width', 'height', 'weight'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('products', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
