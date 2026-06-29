<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operation_documents', function (Blueprint $table) {
            if (Schema::hasColumn('operation_documents', 'payment_term_id')) {
                $table->dropForeign(['payment_term_id']);
                $table->dropColumn('payment_term_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('operation_documents', function (Blueprint $table) {
            $table->foreignId('payment_term_id')->nullable()->constrained('payment_terms')->nullOnDelete();
        });
    }
};
