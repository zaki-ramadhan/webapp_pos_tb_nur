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
        Schema::table('operation_documents', function (Blueprint $table): void {
            $table->index(['document_type', 'entry_date'], 'op_docs_type_entry_date_idx');
            $table->index(['document_type', 'status'], 'op_docs_type_status_idx');
            $table->index(['document_type', 'is_closed'], 'op_docs_type_is_closed_idx');
        });

        Schema::table('operation_document_lines', function (Blueprint $table): void {
            $table->index(['operation_document_id', 'product_id'], 'op_doc_lines_doc_prod_idx');
            $table->index(['operation_document_id', 'account_id'], 'op_doc_lines_doc_acc_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('operation_document_lines', function (Blueprint $table): void {
            $table->dropIndex('op_doc_lines_doc_prod_idx');
            $table->dropIndex('op_doc_lines_doc_acc_idx');
        });

        Schema::table('operation_documents', function (Blueprint $table): void {
            $table->dropIndex('op_docs_type_entry_date_idx');
            $table->dropIndex('op_docs_type_status_idx');
            $table->dropIndex('op_docs_type_is_closed_idx');
        });
    }
};
