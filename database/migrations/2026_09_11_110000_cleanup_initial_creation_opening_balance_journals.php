<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $docIds = DB::table('operation_documents')
            ->where('document_type', 'general_journal')
            ->where('is_closed', false)
            ->where(function ($query) {
                $query->where('notes', 'like', '%Livin%')
                    ->orWhere('document_number', 'JU.2026.09.0052');
            })
            ->pluck('id');

        if ($docIds->isNotEmpty()) {
            DB::table('operation_document_lines')->whereIn('operation_document_id', $docIds)->delete();
            DB::table('operation_documents')->whereIn('id', $docIds)->delete();
        }
    }

    public function down(): void
    {
    }
};
