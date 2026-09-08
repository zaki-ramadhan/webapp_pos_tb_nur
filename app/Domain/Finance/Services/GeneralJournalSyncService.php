<?php

namespace App\Domain\Finance\Services;

use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use App\Support\Backend\BackendResourceWriter;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GeneralJournalSyncService
{
    public function __construct(
        protected BackendResourceWriter $writer,
    ) {
    }

    /**
     * Sinkronisasi transaksi operasional ke Jurnal Umum dan buat jurnal penyesuaian realistis.
     *
     * @return array{posted_transactions: int, manual_adjustments: int}
     */
    public function syncAll(bool $cleanOldDummy = true): array
    {
        if ($cleanOldDummy) {
            $this->cleanOldDummyJournals();
        }

        $postedCount = $this->syncOperationalTransactions();
        $adjustmentCount = $this->seedManualAdjustments();
        $this->ensureDocumentUsers();

        return [
            'posted_transactions' => $postedCount,
            'manual_adjustments' => $adjustmentCount,
        ];
    }

    /**
     * Bersihkan jurnal dummy statis masa lalu (REF-OPS-X).
     */
    public function cleanOldDummyJournals(): int
    {
        $dummyGjIds = DB::table('operation_documents')
            ->where('document_type', 'general_journal')
            ->where(function ($q) {
                $q->where('reference_number', 'like', 'REF-OPS-%')
                  ->orWhere('notes', 'Jurnal penyesuaian operasional');
            })
            ->pluck('id')
            ->all();

        if (!empty($dummyGjIds)) {
            DB::table('operation_document_lines')->whereIn('operation_document_id', $dummyGjIds)->delete();
            DB::table('operation_document_user')->whereIn('operation_document_id', $dummyGjIds)->delete();
            return DB::table('operation_documents')->whereIn('id', $dummyGjIds)->delete();
        }

        return 0;
    }

    /**
     * Posting semua transaksi operasional ke Jurnal Umum.
     */
    public function syncOperationalTransactions(): int
    {
        $postableTypes = [
            'expense_entry',
            'payroll_entry',
            'cash_payment',
            'cash_receipt',
            'bank_transfer',
            'sales_invoice',
            'purchase_invoice',
        ];

        $documents = OperationDocument::query()
            ->whereIn('document_type', $postableTypes)
            ->whereNotIn('status', ['Void', 'Cancelled', 'void', 'cancelled'])
            ->with(['lines.product', 'lines.account'])
            ->orderBy('entry_date')
            ->orderBy('id')
            ->get();

        $count = 0;
        foreach ($documents as $doc) {
            $this->writer->postToGeneralJournal($doc);
            $count++;
        }

        return $count;
    }

    /**
     * Buat jurnal penyesuaian manual realistis untuk Toko Bangunan.
     */
    public function seedManualAdjustments(): int
    {
        $branchId = DB::table('branches')->value('id') ?? 1;
        $warehouseId = DB::table('warehouses')->value('id') ?? 1;
        $userAdminId = DB::table('users')->where('email', 'piscokpiscok2610@gmail.com')->value('id')
            ?? (DB::table('users')->value('id') ?? 1);

        $accBebanPenyKendaraan = DB::table('accounts')->where('code', '610202')->value('id');
        $accAkmPenyKendaraan   = DB::table('accounts')->where('code', '120202')->value('id');
        $accBebanPenyPeralatan = DB::table('accounts')->where('code', '610203')->value('id');
        $accAkmPenyPeralatan   = DB::table('accounts')->where('code', '120203')->value('id');
        $accBebanPerlengkapan  = DB::table('accounts')->where('code', '610103')->value('id');
        $accPerlengkapanToko   = DB::table('accounts')->where('code', '120101')->value('id');
        $accBebanSelisihKas    = DB::table('accounts')->where('code', '7101')->value('id')
            ?? DB::table('accounts')->where('code', 'like', '71%')->value('id');
        $accKasKecilToko       = DB::table('accounts')->where('code', '110101')->value('id')
            ?? (DB::table('accounts')->where('code', 'like', '1101%')->value('id') ?? 1);

        $now = Carbon::now();
        $startYear = 2025;
        $currentYear = $now->year;
        $currentMonth = $now->month;
        $currentDay = $now->day;

        $count = 0;

        for ($year = $startYear; $year <= $currentYear; $year++) {
            $maxM = ($year === $currentYear) ? $currentMonth : 12;
            for ($m = 1; $m <= $maxM; $m++) {
                $isCurrentMonthNow = ($year === $currentYear && $m === $currentMonth);
                $dayAdj = $isCurrentMonthNow ? max(1, min($currentDay, 8)) : 28;
                $adjDate = sprintf('%04d-%02d-%02d', $year, $m, $dayAdj);
                $adjDt = Carbon::parse($adjDate);

                // 1. Beban Penyusutan Kendaraan Operasional Toko (Truk & Pick Up)
                if ($accBebanPenyKendaraan && $accAkmPenyKendaraan) {
                    $note = 'Penyusutan kendaraan truk & pick up operasional toko';
                    $existing = OperationDocument::where('document_type', 'general_journal')
                        ->whereNull('related_document_id')
                        ->where('entry_date', $adjDate)
                        ->where('notes', $note)
                        ->first();

                    if (!$existing) {
                        $amt = 1750000;
                        $docNo = $this->writer->generateNextSequentialNumber('general-journals', $adjDate);
                        $docId = DB::table('operation_documents')->insertGetId([
                            'document_type' => 'general_journal',
                            'branch_id' => $branchId,
                            'warehouse_id' => $warehouseId,
                            'responsible_user_id' => $userAdminId,
                            'document_number' => $docNo,
                            'status' => 'Posted',
                            'entry_date' => $adjDate,
                            'subtotal' => $amt,
                            'total_amount' => $amt,
                            'notes' => $note,
                            'metadata' => json_encode([
                                'transaction_number' => null,
                                'transaction_type_label' => 'Jurnal Umum',
                                'transaction_type_value' => 'general-journal',
                            ]),
                            'is_closed' => true,
                            'created_at' => $adjDt,
                            'updated_at' => $adjDt,
                        ]);

                        DB::table('operation_document_lines')->insert([
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accBebanPenyKendaraan,
                                'description' => 'Beban Penyusutan Kendaraan Operasional',
                                'debit_amount' => $amt,
                                'credit_amount' => 0,
                                'total_amount' => $amt,
                                'sort_order' => 1,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accAkmPenyKendaraan,
                                'description' => 'Akm. Peny. Kendaraan Operasional',
                                'debit_amount' => 0,
                                'credit_amount' => $amt,
                                'total_amount' => $amt,
                                'sort_order' => 2,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                        ]);
                        $count++;
                    }
                }

                // 2. Beban Penyusutan Peralatan Toko & Komputer Kasir
                if ($accBebanPenyPeralatan && $accAkmPenyPeralatan) {
                    $note = 'Penyusutan peralatan toko, rak besi, dan komputer kasir';
                    $existing = OperationDocument::where('document_type', 'general_journal')
                        ->whereNull('related_document_id')
                        ->where('entry_date', $adjDate)
                        ->where('notes', $note)
                        ->first();

                    if (!$existing) {
                        $amt = 650000;
                        $docNo = $this->writer->generateNextSequentialNumber('general-journals', $adjDate);
                        $docId = DB::table('operation_documents')->insertGetId([
                            'document_type' => 'general_journal',
                            'branch_id' => $branchId,
                            'warehouse_id' => $warehouseId,
                            'responsible_user_id' => $userAdminId,
                            'document_number' => $docNo,
                            'status' => 'Posted',
                            'entry_date' => $adjDate,
                            'subtotal' => $amt,
                            'total_amount' => $amt,
                            'notes' => $note,
                            'metadata' => json_encode([
                                'transaction_number' => null,
                                'transaction_type_label' => 'Jurnal Umum',
                                'transaction_type_value' => 'general-journal',
                            ]),
                            'is_closed' => true,
                            'created_at' => $adjDt,
                            'updated_at' => $adjDt,
                        ]);

                        DB::table('operation_document_lines')->insert([
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accBebanPenyPeralatan,
                                'description' => 'Beban Penyusutan Peralatan Toko & Komputer Kasir',
                                'debit_amount' => $amt,
                                'credit_amount' => 0,
                                'total_amount' => $amt,
                                'sort_order' => 1,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accAkmPenyPeralatan,
                                'description' => 'Akm. Peny. Peralatan Toko & Komputer Kasir',
                                'debit_amount' => 0,
                                'credit_amount' => $amt,
                                'total_amount' => $amt,
                                'sort_order' => 2,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                        ]);
                        $count++;
                    }
                }

                // 3. Penyesuaian Pemakaian Perlengkapan Toko & Gudang
                if ($accBebanPerlengkapan && $accPerlengkapanToko) {
                    $note = 'Penyesuaian pemakaian perlengkapan toko & gudang';
                    $existing = OperationDocument::where('document_type', 'general_journal')
                        ->whereNull('related_document_id')
                        ->where('entry_date', $adjDate)
                        ->where('notes', $note)
                        ->first();

                    if (!$existing) {
                        $amt = 320000 + (($m * 45000) % 280000);
                        $docNo = $this->writer->generateNextSequentialNumber('general-journals', $adjDate);
                        $docId = DB::table('operation_documents')->insertGetId([
                            'document_type' => 'general_journal',
                            'branch_id' => $branchId,
                            'warehouse_id' => $warehouseId,
                            'responsible_user_id' => $userAdminId,
                            'document_number' => $docNo,
                            'status' => 'Posted',
                            'entry_date' => $adjDate,
                            'subtotal' => $amt,
                            'total_amount' => $amt,
                            'notes' => $note,
                            'metadata' => json_encode([
                                'transaction_number' => null,
                                'transaction_type_label' => 'Jurnal Umum',
                                'transaction_type_value' => 'general-journal',
                            ]),
                            'is_closed' => true,
                            'created_at' => $adjDt,
                            'updated_at' => $adjDt,
                        ]);

                        DB::table('operation_document_lines')->insert([
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accBebanPerlengkapan,
                                'description' => 'Beban Perlengkapan Toko',
                                'debit_amount' => $amt,
                                'credit_amount' => 0,
                                'total_amount' => $amt,
                                'sort_order' => 1,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accPerlengkapanToko,
                                'description' => 'Perlengkapan Toko',
                                'debit_amount' => 0,
                                'credit_amount' => $amt,
                                'total_amount' => $amt,
                                'sort_order' => 2,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                        ]);
                        $count++;
                    }
                }

                // 4. Penyesuaian Selisih Opname Kas Kecil
                if ($m % 3 === 0 && $accBebanSelisihKas && $accKasKecilToko) {
                    $note = 'Penyesuaian selisih fisik kas kecil hasil stock opname kasir';
                    $existing = OperationDocument::where('document_type', 'general_journal')
                        ->whereNull('related_document_id')
                        ->where('entry_date', $adjDate)
                        ->where('notes', $note)
                        ->first();

                    if (!$existing) {
                        $amt = ($m % 2 === 0) ? 25000 : 50000;
                        $docNo = $this->writer->generateNextSequentialNumber('general-journals', $adjDate);
                        $docId = DB::table('operation_documents')->insertGetId([
                            'document_type' => 'general_journal',
                            'branch_id' => $branchId,
                            'warehouse_id' => $warehouseId,
                            'responsible_user_id' => $userAdminId,
                            'document_number' => $docNo,
                            'status' => 'Posted',
                            'entry_date' => $adjDate,
                            'subtotal' => $amt,
                            'total_amount' => $amt,
                            'notes' => $note,
                            'metadata' => json_encode([
                                'transaction_number' => null,
                                'transaction_type_label' => 'Jurnal Umum',
                                'transaction_type_value' => 'general-journal',
                            ]),
                            'is_closed' => true,
                            'created_at' => $adjDt,
                            'updated_at' => $adjDt,
                        ]);

                        DB::table('operation_document_lines')->insert([
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accBebanSelisihKas,
                                'description' => 'Beban Selisih Kas Opname',
                                'debit_amount' => $amt,
                                'credit_amount' => 0,
                                'total_amount' => $amt,
                                'sort_order' => 1,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                            [
                                'operation_document_id' => $docId,
                                'line_type' => 'general_journal',
                                'account_id' => $accKasKecilToko,
                                'description' => 'Kas Kecil Toko',
                                'debit_amount' => 0,
                                'credit_amount' => $amt,
                                'total_amount' => $amt,
                                'sort_order' => 2,
                                'created_at' => $adjDt,
                                'updated_at' => $adjDt,
                            ],
                        ]);
                        $count++;
                    }
                }
            }
        }

        return $count;
    }

    /**
     * Pastikan semua dokumen memiliki pivot user yang valid.
     */
    protected function ensureDocumentUsers(): void
    {
        $userAdminId = DB::table('users')->where('email', 'piscokpiscok2610@gmail.com')->value('id')
            ?? (DB::table('users')->value('id') ?? 1);

        $missingUserDocs = DB::table('operation_documents')
            ->where('document_type', 'general_journal')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('operation_document_user')
                    ->whereColumn('operation_document_user.operation_document_id', 'operation_documents.id');
            })
            ->get(['id', 'responsible_user_id']);

        foreach ($missingUserDocs as $doc) {
            $respUserId = $doc->responsible_user_id ?? $userAdminId;
            DB::table('operation_document_user')->insertOrIgnore([
                'operation_document_id' => $doc->id,
                'user_id' => $respUserId,
            ]);
            if ($respUserId !== $userAdminId) {
                DB::table('operation_document_user')->insertOrIgnore([
                    'operation_document_id' => $doc->id,
                    'user_id' => $userAdminId,
                ]);
            }
        }
    }
}
