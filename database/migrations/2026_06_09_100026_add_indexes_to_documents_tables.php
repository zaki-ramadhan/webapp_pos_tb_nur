<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('operation_documents', function (Blueprint $table) {
            $table->index('entry_date');
            $table->index('status');
            $table->index('is_closed');
        });

        Schema::table('inventory_documents', function (Blueprint $table) {
            $table->index('document_date');
            $table->index('status');
            $table->index('is_closed');
        });

        Schema::table('operation_document_lines', function (Blueprint $table) {
            $table->index('line_date');
        });

        Schema::table('inventory_document_lines', function (Blueprint $table) {
            $table->index('line_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('operation_documents', function (Blueprint $table) {
            $table->dropIndex(['entry_date']);
            $table->dropIndex(['status']);
            $table->dropIndex(['is_closed']);
        });

        Schema::table('inventory_documents', function (Blueprint $table) {
            $table->dropIndex(['document_date']);
            $table->dropIndex(['status']);
            $table->dropIndex(['is_closed']);
        });

        Schema::table('operation_document_lines', function (Blueprint $table) {
            $table->dropIndex(['line_date']);
        });

        Schema::table('inventory_document_lines', function (Blueprint $table) {
            $table->dropIndex(['line_date']);
        });
    }
};
