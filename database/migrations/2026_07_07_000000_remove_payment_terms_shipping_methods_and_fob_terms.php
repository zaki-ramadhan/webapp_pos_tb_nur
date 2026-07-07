<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['payment_term_id']);
            $table->dropColumn('payment_term_id');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['payment_term_id']);
            $table->dropColumn('payment_term_id');
        });

        Schema::dropIfExists('payment_terms');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('fob_terms');
    }

    public function down(): void
    {
        // No rollback needed for permanent deletion
    }
};
