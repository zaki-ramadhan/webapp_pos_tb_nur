<?php

namespace App\Support\Backend\Queries;

use App\Domain\Finance\Models\Account;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use App\Support\Backend\Queries\Concerns\HasQueryHelpers;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BankInquiryQueryService
{
    use HasQueryHelpers;
    /**
     * @param  array<string, mixed>  $filters
     */
    public function ensureBankStatementMutationsTable(): void
    {
        try {
            if (! \Illuminate\Support\Facades\Schema::hasTable('bank_statement_mutations')) {
                \Illuminate\Support\Facades\Schema::create('bank_statement_mutations', function (\Illuminate\Database\Schema\Blueprint $table): void {
                    $table->id();
                    $table->unsignedBigInteger('account_id')->nullable()->index();
                    $table->string('bank_account_number', 100)->index();
                    $table->string('bank_name', 150)->nullable();
                    $table->string('import_file_name', 255)->nullable();
                    $table->date('transaction_date')->index();
                    $table->text('description');
                    $table->decimal('amount', 18, 2);
                    $table->string('type', 10);
                    $table->decimal('balance', 18, 2)->default(0);
                    $table->string('status', 50)->default('Unreconciled')->index();
                    $table->timestamps();

                    $table->index(['bank_account_number', 'transaction_date'], 'bsm_acc_date_idx');
                    $table->index(['account_id', 'transaction_date'], 'bsm_aid_date_idx');
                });
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Could not ensure bank_statement_mutations table: ' . $e->getMessage());
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateStatement(array $filters): LengthAwarePaginator
    {
        $this->ensureBankStatementMutationsTable();

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $accountId = $filters['account_id'] ?? null;

        if (empty($accountId) && $search === '') {
            return $this->paginateRows(collect(), $filters);
        }

        try {
            $accountNumber = null;
            if (preg_match('/#([0-9\-\.]+)/', $search, $m)) {
                $accountNumber = $m[1];
            } elseif (preg_match('/[0-9\-\.]{4,}/', $search, $m)) {
                $accountNumber = $m[0];
            }

            $query = \App\Domain\Finance\Models\BankStatementMutation::query();

            if ($accountId) {
                $query->where(function ($q) use ($accountId, $accountNumber): void {
                    $q->where('account_id', $accountId);
                    if ($accountNumber) {
                        $q->orWhere('bank_account_number', 'like', "%{$accountNumber}%");
                    }
                });
            } elseif ($accountNumber) {
                $query->where('bank_account_number', 'like', "%{$accountNumber}%");
            } else {
                $query->where(function ($q) use ($search): void {
                    $q->where('bank_name', 'like', "%{$search}%")
                        ->orWhere('bank_account_number', 'like', "%{$search}%");
                });
            }

            $startDate = $this->resolveDateFilter($filters['start_date'] ?? null);
            $endDate = $this->resolveDateFilter($filters['end_date'] ?? null);

            if ($startDate) {
                $query->whereDate('transaction_date', '>=', $startDate->toDateString());
            }
            if ($endDate) {
                $query->whereDate('transaction_date', '<=', $endDate->toDateString());
            }

            $mutations = $query->orderBy('transaction_date', 'asc')->orderBy('id', 'asc')->get();

            if ($mutations->isNotEmpty()) {
                $rows = $mutations->map(function ($m): array {
                    $dateLabel = $m->transaction_date ? \Carbon\Carbon::parse($m->transaction_date)->format('d/m/Y') : '-';
                    $isReconciled = ($m->status === 'Reconciled' || !empty($m->is_reconciled));
                    $rawAmount = (float) ($m->amount ?? 0);
                    $rawBalance = (float) ($m->balance ?? 0);
                    return [
                        'id' => $m->id,
                        'date' => $dateLabel,
                        'description' => (string) ($m->description ?? ''),
                        'mutation' => $this->formatNumber($rawAmount),
                        'raw_amount' => $rawAmount,
                        'type' => (string) ($m->type ?? 'CR'),
                        'balance' => $this->formatNumber($rawBalance),
                        'raw_balance' => $rawBalance,
                        'status' => 'Reconciled',
                        'is_reconciled' => true,
                        'account_id' => $m->account_id,
                        'account_name' => (string) ($m->bank_name ?? ''),
                        'bank_name' => (string) ($m->bank_name ?? ''),
                        'bank_account_number' => (string) ($m->bank_account_number ?? ''),
                        'document_number' => (string) ($m->import_file_name ?? '-'),
                        'transaction_type' => 'Rekening Koran',
                    ];
                });

                return $this->paginateRows($rows, $filters);
            }

            // Fallback: If no imported bank statement records exist, read and synchronize from the related bank account ledger
            $filtersWithAccount = $filters;
            if ($accountId) {
                $filtersWithAccount['account_id'] = $accountId;
            }

            $accountMap = $this->resolveAccountMap($filtersWithAccount);
            if ($accountMap->isNotEmpty()) {
                $targetAccount = $accountMap->first();
                $filtersWithAccount['account_id'] = $targetAccount->id;

                $ledgerRows = $this->buildLedgerRows($filtersWithAccount, includeOpeningBalanceRow: false);

                if ($ledgerRows->isNotEmpty()) {
                    $bankName = $targetAccount->name ?? 'Bank';
                    $accNum = $accountNumber ?: ($targetAccount->cash_bank_reference ?? '');

                    $rows = $ledgerRows->map(function ($row) use ($bankName, $accNum): array {
                        $netAmt = (float) ($row['net_amount'] ?? 0);
                        $rawAmount = abs($netAmt);
                        $rawBalance = (float) preg_replace('/[^0-9.-]/', '', str_replace(['.', ','], ['', '.'], (string) ($row['balance'] ?? 0)));
                        $type = $netAmt >= 0 ? 'Dr' : 'Cr';

                        return [
                            'id' => $row['id'],
                            'document_id' => $row['document_id'] ?? null,
                            'document_type' => $row['document_type'] ?? null,
                            'date' => $row['date_label'] ?? $row['date'] ?? '-',
                            'description' => (string) ($row['description'] ?: ($row['transaction_type'] . ' ' . ($row['document_number'] ?? ''))),
                            'mutation' => $row['mutation'] ?: $this->formatNumber($rawAmount),
                            'raw_amount' => $rawAmount,
                            'type' => $type,
                            'balance' => $row['balance'] ?: $this->formatNumber($rawBalance),
                            'raw_balance' => $rawBalance,
                            'status' => 'Reconciled',
                            'is_reconciled' => true,
                            'account_id' => $row['account_id'] ?? null,
                            'account_name' => (string) ($row['account_name'] ?? $bankName),
                            'bank_name' => $bankName,
                            'bank_account_number' => (string) $accNum,
                            'document_number' => (string) ($row['document_number'] ?? '-'),
                            'transaction_type' => (string) ($row['transaction_type'] ?? 'Rekening Koran'),
                        ];
                    });

                    return $this->paginateRows($rows, $filters);
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Bank statement query error: ' . $e->getMessage());
        }

        return $this->paginateRows(collect(), $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateHistory(array $filters): LengthAwarePaginator
    {
        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $accountId = $filters['account_id'] ?? null;

        if (empty($accountId) && $search === '') {
            return $this->paginateRows(collect(), $filters);
        }

        $rows = $this->buildLedgerRows($filters, includeOpeningBalanceRow: true)
            ->values()
            ->map(function (array $row, int $index): array {
                return [
                    'id' => $row['id'],
                    'document_id' => $row['document_id'] ?? null,
                    'document_type' => $row['document_type'] ?? null,
                    'date' => $row['date_label'],
                    'source_number' => $row['document_number'],
                    'check_number' => $row['check_number'],
                    'transaction_type' => $row['transaction_type'],
                    'description' => $row['description'],
                    'mutation' => $row['mutation'],
                    'type' => $row['type'],
                    'debit' => $row['debit'],
                    'credit' => $row['credit'],
                    'balance' => $row['balance'],
                    'status' => (string) ($row['status'] ?? 'Open'),
                    'is_reconciled' => (bool) ($row['is_reconciled'] ?? (($row['status'] ?? '') === 'Reconciled')),
                    'is_opening_balance' => (bool) ($row['is_opening_balance'] ?? false),
                    'is_balance_adjustment' => (bool) ($row['is_balance_adjustment'] ?? false),
                    'has_balance_adjustment' => (bool) ($row['has_balance_adjustment'] ?? false),
                    'index' => $index + 1,
                    'account_id' => $row['account_id'],
                    'account_name' => $row['account_name'],
                ];
            });

        return $this->paginateRows($rows, $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateReconciliation(array $filters): LengthAwarePaginator
    {
        $rows = $this->buildLedgerRows($filters, includeOpeningBalanceRow: false)
            ->map(function (array $row): array {
                return [
                    'id' => $row['id'],
                    'date' => $row['date_label'],
                    'document_number' => $row['document_number'],
                    'transaction_type' => $row['transaction_type'],
                    'description' => $row['description'],
                    'debit' => $row['debit'],
                    'credit' => $row['credit'],
                    'status' => $row['status'],
                    'balance' => $row['balance'],
                    'account_id' => $row['account_id'],
                    'account_name' => $row['account_name'],
                ];
            });

        return $this->paginateRows($rows, $filters);
    }

    protected array $lastComputedBalances = [];

    /**
     * @param  array<int, int>  $accountIds
     * @return array<int, float>
     */
    public function calculateAccountsBalanceMap(array $accountIds): array
    {
        $cleanIds = array_values(array_unique(array_filter(array_map('intval', $accountIds), fn ($id) => $id > 0)));
        if (empty($cleanIds)) {
            return [];
        }

        $this->buildLedgerRows(['account_ids' => $cleanIds], includeOpeningBalanceRow: false);

        return $this->lastComputedBalances;
    }

    public function calculateAccountBalance(Account $account): float
    {
        $rows = $this->buildLedgerRows(['account_id' => $account->id], includeOpeningBalanceRow: true);
        if ($rows->isEmpty()) {
            return (float) ($account->opening_balance ?? 0);
        }

        $lastRow = $rows->last();
        if (isset($lastRow['balance'])) {
            return (float) str_replace(',', '', (string) $lastRow['balance']);
        }

        return (float) ($account->opening_balance ?? 0);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array<string, mixed>>
     */
    public function buildLedgerRows(array $filters, bool $includeOpeningBalanceRow = false): Collection
    {
        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $accountMap = $this->resolveAccountMap($filters);
        $accountIds = $accountMap->keys()->map(fn ($id) => (int) $id)->all();

        if ($accountIds === []) {
            return collect();
        }

        $documents = $this->queryDocuments($filters, $accountIds);
        $allRows = collect();

        foreach ($documents as $document) {
            $docRows = collect();
            $docRows = $docRows->merge($this->rowsFromDocumentLines($document, $accountMap));
            $docRows = $docRows->merge($this->rowsFromSyntheticAccounts($document, $accountMap));

            $meta = is_array($document->metadata) ? $document->metadata : (json_decode((string) ($document->metadata ?? '[]'), true) ?: []);
            $isVoided = strcasecmp((string) $document->status, 'Void') === 0
                || !empty($meta['flags']['voided'])
                || !empty($meta['voided']);

            if ($isVoided) {
                $reversals = $docRows->map(function (array $r): array {
                    $debit = (float) str_replace(',', '', (string) ($r['credit'] ?? 0));
                    $credit = (float) str_replace(',', '', (string) ($r['debit'] ?? 0));
                    $netAmount = $debit - $credit;

                    return array_merge($r, [
                        'id' => $r['id'] . ':void_reversal',
                        'description' => 'Cek Kosong',
                        'debit' => $this->formatNumber($debit),
                        'credit' => $this->formatNumber($credit),
                        'mutation' => $this->formatNumber(abs($netAmount)),
                        'type' => $netAmount >= 0 ? 'Dr' : 'Cr',
                        'net_amount' => $netAmount,
                    ]);
                });
                $docRows = $docRows->merge($reversals);
            }

            $allRows = $allRows->merge($docRows);
        }

        $openingRows = collect();
        $realRows = collect();

        foreach ($allRows as $row) {
            $transType = trim((string) ($row['transaction_type'] ?? ''));
            $docType = trim((string) ($row['document_type'] ?? ''));

            $isJournal = $docType === 'general_journal' || $transType === 'Jurnal Umum';

            $isOpBalJournal = $isJournal && (
                !empty($row['is_opening_balance'])
                || str_starts_with(strtolower(trim((string)$row['description'])), 'saldo awal')
            );
            if ($isOpBalJournal) {
                continue;
            }

            $isOpBal = ! $isJournal && (
                (bool) ($row['is_opening_balance'] ?? false)
                || $transType === 'Saldo Awal'
            );

            if ($isOpBal) {
                $openingRows->push($row);
            } else {
                $realRows->push($row);
            }
        }

        $balances = [];
        $accountHasPriorDocs = [];
        $accountHasBalanceAdjustmentInReal = [];
        $accountHasBalanceAdjustmentInPrior = [];

        $startDate = $this->resolveDateFilter($filters['start_date'] ?? null);

        if ($startDate) {
            $priorFilters = $filters;
            $priorFilters['start_date'] = null;
            $priorFilters['end_date'] = $startDate->copy()->subDay()->toDateString();
            $priorDocuments = $this->queryDocuments($priorFilters, $accountIds);
            foreach ($priorDocuments as $pDoc) {
                foreach ($this->rowsFromDocumentLines($pDoc, $accountMap) as $pRow) {
                    $accId = (int) $pRow['account_id'];
                    $isOpBalJournal = !empty($pRow['is_opening_balance'])
                        || ($pRow['document_type'] === 'general_journal' && str_starts_with(strtolower(trim((string)$pRow['description'])), 'saldo awal'));
                    if ($isOpBalJournal) {
                        continue;
                    }
                    $isAdj = !empty($pRow['is_balance_adjustment'])
                        || ($pRow['document_type'] === 'general_journal' && (
                            str_starts_with(strtolower(trim((string)$pRow['description'])), 'penyesuaian saldo')
                            || str_starts_with(strtolower(trim((string)$pRow['description'])), 'update saldo')
                        ));
                    if ($isAdj) {
                        $balances[$accId] = (float) $pRow['net_amount'];
                        $accountHasBalanceAdjustmentInPrior[$accId] = true;
                    } else {
                        $balances[$accId] = ($balances[$accId] ?? 0) + (float) $pRow['net_amount'];
                    }
                    $accountHasPriorDocs[$accId] = true;
                }
                foreach ($this->rowsFromSyntheticAccounts($pDoc, $accountMap) as $pRow) {
                    $accId = (int) $pRow['account_id'];
                    $balances[$accId] = ($balances[$accId] ?? 0) + (float) $pRow['net_amount'];
                    $accountHasPriorDocs[$accId] = true;
                }
            }
        }

        foreach ($realRows as $r) {
            $isAdj = !empty($r['is_balance_adjustment'])
                || ($r['document_type'] === 'general_journal' && (
                    str_starts_with(strtolower(trim((string)$r['description'])), 'penyesuaian saldo')
                    || str_starts_with(strtolower(trim((string)$r['description'])), 'update saldo')
                ));
            if ($isAdj) {
                $accountHasBalanceAdjustmentInReal[(int) $r['account_id']] = true;
            }
        }

        foreach ($accountMap as $accId => $account) {
            $hasAdjInReal = $accountHasBalanceAdjustmentInReal[(int) $accId] ?? false;
            $hasAdjInPrior = $accountHasBalanceAdjustmentInPrior[(int) $accId] ?? false;

            if ($hasAdjInReal) {
                $balances[(int) $accId] = 0.0;
            } elseif (! $hasAdjInPrior) {
                $balances[(int) $accId] = (float) ($account->opening_balance ?? 0.0);
            }
        }

        $sortedRealRows = $realRows->sortBy([
            ['sortable_date', 'asc'],
            ['account_name', 'asc'],
            ['document_number', 'asc'],
            ['id', 'asc'],
        ])->values();

        $outputRows = collect();

        if ($includeOpeningBalanceRow && count($accountIds) === 1) {
            $accId = $accountIds[0];
            $acc = $accountMap->get($accId);
            $accName = $acc?->name ?? '';
            $hasAdjInReal = $accountHasBalanceAdjustmentInReal[$accId] ?? false;
            $hasPriorDocs = $accountHasPriorDocs[$accId] ?? false;
            $initialOpBal = (float) ($acc?->opening_balance ?? 0);
            $initialBal = $hasAdjInReal ? 0.0 : ($balances[$accId] ?? 0);

            $dateLabel = '';
            if ($acc?->opening_balance_date) {
                $dateLabel = \Carbon\Carbon::parse($acc->opening_balance_date)->format('d/m/Y');
            }

            if ($hasAdjInReal) {
                $description = 'Saldo Awal';
                $mutation = 0.0;
                $type = '';
            } elseif ($startDate && $hasPriorDocs) {
                $description = sprintf('Saldo per %s', $startDate->copy()->subDay()->format('d/m/Y'));
                $mutation = 0.0;
                $type = '-';
                $dateLabel = '';
            } else {
                $description = 'Saldo Awal';
                $mutation = abs($initialOpBal);
                $type = $initialOpBal >= 0 ? 'Dr' : 'Cr';
            }

            $outputRows->push([
                'id' => 'opening-balance',
                'document_id' => null,
                'document_type' => null,
                'date' => $dateLabel,
                'date_label' => $dateLabel,
                'sortable_date' => '0000-00-00',
                'document_number' => '',
                'check_number' => '',
                'transaction_type' => 'Saldo Awal',
                'description' => $description,
                'debit' => $this->formatNumber(0),
                'credit' => $this->formatNumber(0),
                'mutation' => $this->formatNumber($mutation),
                'type' => $type,
                'status' => '',
                'is_reconciled' => false,
                'balance' => $this->formatNumber($initialBal),
                'net_amount' => 0,
                'is_opening_balance' => true,
                'has_balance_adjustment' => $hasAdjInReal,
                'account_id' => $accId,
                'account_name' => $accName,
            ]);
        }

        $computedRealRows = $sortedRealRows->map(function (array $row) use (&$balances): array {
            $accountId = (int) $row['account_id'];
            $currentBalance = $balances[$accountId] ?? 0;

            $isAdj = !empty($row['is_balance_adjustment'])
                || ($row['document_type'] === 'general_journal' && (
                    str_starts_with(strtolower(trim((string)$row['description'])), 'penyesuaian saldo')
                    || str_starts_with(strtolower(trim((string)$row['description'])), 'update saldo')
                ));

            if ($isAdj) {
                $currentBalance = (float) $row['net_amount'];
            } else {
                $currentBalance += (float) $row['net_amount'];
            }

            $balances[$accountId] = $currentBalance;
            $row['balance'] = $this->formatNumber($currentBalance);

            return $row;
        });

        $this->lastComputedBalances = $balances;

        $outputRows = $outputRows->concat($computedRealRows);

        return $outputRows->values();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Account>
     */
    protected function resolveAccountMap(array $filters): Collection
    {
        if (!empty($filters['account_ids'])) {
            $ids = array_values(array_unique(array_filter(array_map('intval', (array) $filters['account_ids']), fn ($id) => $id > 0)));
            if (empty($ids)) {
                return collect();
            }

            return Account::whereIn('id', $ids)->get()->keyBy('id');
        }

        $query = Account::query();

        if (filled($filters['account_id'] ?? null)) {
            $targetAccount = Account::with('children')->find((int) $filters['account_id']);
            if (! $targetAccount) {
                return collect();
            }

            $accountIds = [$targetAccount->id];
            if ($targetAccount->children->isNotEmpty()) {
                foreach ($targetAccount->children as $child) {
                    $accountIds[] = (int) $child->id;
                }
            }

            return Account::whereIn('id', $accountIds)->get()->keyBy('id');
        }

        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));

        if ($search !== '') {
            $cleanSearch = trim(preg_replace('/\s+/', ' ', str_replace(['[', ']'], ' ', $search)));

            $searchParts = array_map('trim', explode('-', str_replace(['[', ']'], '', $search)));
            if (count($searchParts) < 2) {
                $words = explode(' ', $cleanSearch);
                if (count($words) > 1 && preg_match('/^[0-9.-]+$/', $words[0])) {
                    $searchParts = [$words[0], implode(' ', array_slice($words, 1))];
                }
            }

            $codeQuery = mb_strtolower($searchParts[0] ?? $cleanSearch);
            $nameQuery = mb_strtolower(count($searchParts) > 1 ? implode(' ', array_slice($searchParts, 1)) : $cleanSearch);

            $accNum = null;
            if (preg_match('/#([0-9\-\.]+)/', $search, $m)) {
                $accNum = $m[1];
            } elseif (preg_match('/[0-9\-\.]{4,}/', $search, $m)) {
                $accNum = $m[0];
            }

            $matchedAccounts = $query
                ->where(function ($builder) use ($cleanSearch, $codeQuery, $nameQuery, $accNum): void {
                    $builder->whereRaw('LOWER(name) LIKE ?', ["%{$cleanSearch}%"])
                        ->orWhereRaw('LOWER(code) LIKE ?', ["%{$cleanSearch}%"])
                        ->orWhereRaw('LOWER(name) LIKE ?', ["%{$nameQuery}%"])
                        ->orWhereRaw('LOWER(code) LIKE ?', ["%{$codeQuery}%"]);

                    if ($accNum) {
                        $builder->orWhere('cash_bank_reference', 'like', "%{$accNum}%")
                            ->orWhere('code', 'like', "%{$accNum}%");
                    }
                    if (preg_match('/\b(bri|bca|mandiri|bni|bsi|cimb|danamon|permata)\b/i', $cleanSearch, $bm)) {
                        $builder->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($bm[1]) . '%']);
                    }
                })
                ->where(function ($builder): void {
                    $builder
                        ->whereNotNull('cash_bank_reference')
                        ->orWhere('account_type', 'like', '%bank%')
                        ->orWhere('account_type', 'like', '%cash%')
                        ->orWhere('account_type', 'like', '%kas%');
                })
                ->get();

            if ($matchedAccounts->isNotEmpty()) {
                return $matchedAccounts->keyBy('id');
            }
        }

        return Account::query()
            ->where(function ($builder): void {
                $builder
                    ->whereNotNull('cash_bank_reference')
                    ->orWhere('account_type', 'like', '%bank%')
                    ->orWhere('account_type', 'like', '%cash%')
                    ->orWhere('account_type', 'like', '%kas%');
            })
            ->get()
            ->keyBy('id');
    }

    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, int>  $accountIds
     * @return Collection<int, OperationDocument>
     */
    protected function queryDocuments(array $filters, array $accountIds = []): Collection
    {
        $startDate = $this->resolveDateFilter($filters['start_date'] ?? null);
        $endDate = $this->resolveDateFilter($filters['end_date'] ?? null);

        $syncedOperationalDocIds = OperationDocument::query()
            ->where('document_type', 'general_journal')
            ->whereNotNull('related_document_id')
            ->pluck('related_document_id')
            ->filter()
            ->unique()
            ->all();

        return OperationDocument::query()
            ->with(['primaryAccount', 'secondaryAccount', 'lines.account', 'relatedDocument'])
            ->where(function ($query) use ($syncedOperationalDocIds): void {
                $query->where('document_type', 'general_journal');

                $query->orWhere(function ($fallbackQ) use ($syncedOperationalDocIds): void {
                    $fallbackQ->where('document_type', '!=', 'general_journal');
                    if (!empty($syncedOperationalDocIds)) {
                        $fallbackQ->whereNotIn('id', $syncedOperationalDocIds);
                    }
                });
            })
            ->when(!empty($accountIds), function ($query) use ($accountIds): void {
                $query->where(function ($q) use ($accountIds) {
                    $q->whereIn('primary_account_id', $accountIds)
                      ->orWhereIn('secondary_account_id', $accountIds)
                      ->orWhereHas('lines', fn ($l) => $l->whereIn('account_id', $accountIds));
                });
            })
            ->when($startDate, function ($query, CarbonInterface $date): void {
                $query->whereDate('entry_date', '>=', $date->toDateString());
            })
            ->when($endDate, function ($query, CarbonInterface $date): void {
                $query->whereDate('entry_date', '<=', $date->toDateString());
            })
            ->orderBy('entry_date')
            ->orderBy('id')
            ->get();
    }

    /**
     * @param  Collection<int, Account>  $accountMap
     * @return Collection<int, array<string, mixed>>
     */
    protected function rowsFromDocumentLines(OperationDocument $document, Collection $accountMap): Collection
    {
        return $document->lines
            ->filter(fn (OperationDocumentLine $line) => filled($line->account_id) && $accountMap->has((int) $line->account_id))
            ->map(function (OperationDocumentLine $line) use ($document, $accountMap): array {
                $debit = (float) ($line->debit_amount ?? 0);
                $credit = (float) ($line->credit_amount ?? 0);

                if ($debit <= 0 && $credit <= 0) {
                    $amount = (float) ($line->total_amount ?? 0);
                    $debit = $amount > 0 ? $amount : 0;
                }

                $account = $accountMap->get((int) $line->account_id);

                return $this->makeLedgerRow(
                    id: sprintf('line:%d', $line->id),
                    accountId: (int) $line->account_id,
                    accountName: (string) ($account?->name ?? $line->account_id),
                    document: $document,
                    description: (string) ($line->description ?: $document->notes ?: $document->document_number),
                    debit: $debit,
                    credit: $credit,
                    date: $line->line_date ?? $this->resolveDocumentDate($document),
                );
            })
            ->values();
    }

    /**
     * @param  Collection<int, Account>  $accountMap
     * @return Collection<int, array<string, mixed>>
     */
    protected function rowsFromSyntheticAccounts(OperationDocument $document, Collection $accountMap): Collection
    {
        if ($document->lines->contains(fn (OperationDocumentLine $line) => filled($line->account_id))) {
            return collect();
        }

        $amount = $this->resolveSyntheticAmount($document);

        if ($amount <= 0) {
            return collect();
        }

        $rows = collect();
        $primaryAccountId = $document->primary_account_id ? (int) $document->primary_account_id : null;
        $secondaryAccountId = $document->secondary_account_id ? (int) $document->secondary_account_id : null;

        if ($document->document_type === 'bank_transfer') {
            if ($primaryAccountId !== null && $accountMap->has($primaryAccountId)) {
                $rows->push($this->makeSyntheticRow($document, $accountMap, $primaryAccountId, 0, $amount, 'primary'));
            }

            if ($secondaryAccountId !== null && $accountMap->has($secondaryAccountId)) {
                $rows->push($this->makeSyntheticRow($document, $accountMap, $secondaryAccountId, $amount, 0, 'secondary'));
            }

            return $rows;
        }

        $debitTypes = ['cash_receipt', 'sales_receipt'];
        $creditTypes = ['cash_payment', 'purchase_payment', 'payment_order'];

        if ($primaryAccountId !== null && $accountMap->has($primaryAccountId)) {
            if (in_array($document->document_type, $debitTypes, true)) {
                $rows->push($this->makeSyntheticRow($document, $accountMap, $primaryAccountId, $amount, 0, 'primary'));
            } elseif (in_array($document->document_type, $creditTypes, true)) {
                $rows->push($this->makeSyntheticRow($document, $accountMap, $primaryAccountId, 0, $amount, 'primary'));
            }
        }

        return $rows;
    }

    /**
     * @param  Collection<int, Account>  $accountMap
     */
    protected function makeSyntheticRow(
        OperationDocument $document,
        Collection $accountMap,
        int $accountId,
        float $debit,
        float $credit,
        string $suffix,
    ): array {
        $account = $accountMap->get($accountId);

        $description = (string) ($document->notes ?: '');
        if ($document->document_type === 'bank_transfer') {
            $fromName = $document->primaryAccount?->name ?? 'Kas/Bank Pengirim';
            $toName = $document->secondaryAccount?->name ?? 'Kas/Bank Penerima';
            if (empty($description) || $description === $document->document_number || str_starts_with($description, 'Transfer Bank TB.') || str_starts_with($description, 'Transfer Bank BT.')) {
                $description = "Transfer Bank Dari {$fromName} Ke {$toName}";
            }
        } elseif (empty($description)) {
            $description = (string) $document->document_number;
        }

        return $this->makeLedgerRow(
            id: sprintf('synthetic:%d:%s', $document->id, $suffix),
            accountId: $accountId,
            accountName: (string) ($account?->name ?? $accountId),
            document: $document,
            description: $description,
            debit: $debit,
            credit: $credit,
            date: $this->resolveDocumentDate($document),
        );
    }

    protected function cleanDescription(string $description): string
    {
        $cleaned = preg_replace('/\[.*?\]\s*/', '', $description);
        $cleaned = preg_replace('/\(\d+([.-]\d+)*\)\s*/', '', $cleaned);
        $cleaned = preg_replace('/^\d+([.-]\d+)*\s*[-–—:]?\s*/', '', $cleaned);
        return trim((string) preg_replace('/\s{2,}/', ' ', $cleaned));
    }

    protected function makeLedgerRow(
        string $id,
        int $accountId,
        string $accountName,
        OperationDocument $document,
        string $description,
        float $debit,
        float $credit,
        CarbonInterface $date,
    ): array {
        $description = $this->cleanDescription($description);
        $netAmount = $debit - $credit;

        $typeTranslations = [
            'general_journal' => 'Jurnal Umum',
            'bank_transfer' => 'Transfer Bank',
            'cash_receipt' => 'Penerimaan',
            'sales_receipt' => 'Penerimaan Penjualan',
            'cash_payment' => 'Pembayaran',
            'purchase_payment' => 'Pembayaran Pembelian',
            'payroll_entry' => 'Pencatatan Gaji',
            'expense_entry' => 'Pencatatan Beban',
            'sales_invoice' => 'Faktur Penjualan',
            'purchase_invoice' => 'Faktur Pembelian',
            'sales_return' => 'Retur Penjualan',
            'purchase_return' => 'Retur Pembelian',
            'sales_deposit' => 'Uang Muka Penjualan',
        ];

        $meta = is_array($document->metadata) ? $document->metadata : (json_decode($document->metadata ?? '[]', true) ?: []);
        $docType = $document->document_type;
        $docNumber = (string) ($meta['transaction_number'] ?? $document->document_number);

        $relDoc = $document->relatedDocument;
        $relDocType = $relDoc?->document_type;
        if ($relDocType && isset($typeTranslations[$relDocType])) {
            $transactionType = $typeTranslations[$relDocType];
        } elseif (!empty($meta['transaction_type_label'])) {
            $transactionType = $meta['transaction_type_label'];
        } else {
            $transactionType = $typeTranslations[$docType] ?? str($docType)->replace('_', ' ')->title()->toString();
        }

        $targetDocId = $document->related_document_id ?: $document->id;
        $targetDocType = $relDocType ?: $docType;
        $checkNumber = (string) ($document->external_number ?? $relDoc?->external_number ?? '');

        return [
            'id' => $id,
            'document_id' => $targetDocId,
            'document_type' => $targetDocType,
            'account_id' => $accountId,
            'account_name' => $accountName,
            'document_number' => $docNumber,
            'check_number' => $checkNumber,
            'transaction_type' => $transactionType,
            'description' => $description,
            'debit' => $this->formatNumber($debit),
            'credit' => $this->formatNumber($credit),
            'mutation' => $this->formatNumber(abs($netAmount)),
            'type' => $netAmount >= 0 ? 'Dr' : 'Cr',
            'status' => $this->resolveRowReconciled($document, $accountId) ? 'Reconciled' : 'Open',
            'date_label' => $date->format('Y-m-d'),
            'sortable_date' => $date->toDateString(),
            'net_amount' => $netAmount,
            'is_opening_balance' => (bool) ($meta['is_opening_balance'] ?? false),
            'is_balance_adjustment' => (bool) ($meta['is_balance_adjustment'] ?? false),
        ];
    }

    protected function resolveRowReconciled(OperationDocument $document, int $accountId): bool
    {
        if ($document->is_closed) {
            return true;
        }

        if ($document->document_type === 'bank_transfer') {
            $metadata = $document->metadata ?? [];
            $reconciliations = $metadata['reconciliations'] ?? [];

            $primaryId = $document->primary_account_id ? (int) $document->primary_account_id : null;
            $secondaryId = $document->secondary_account_id ? (int) $document->secondary_account_id : null;

            if ($accountId === $primaryId) {
                $item = collect($reconciliations)->firstWhere('id', 'from');
                return ($item['status'] ?? '') === 'Ya';
            }

            if ($accountId === $secondaryId) {
                $item = collect($reconciliations)->firstWhere('id', 'to');
                return ($item['status'] ?? '') === 'Ya';
            }
        }

        return ($document->metadata['reconcile_status'] ?? '') === 'Ya';
    }

    protected function resolveSyntheticAmount(OperationDocument $document): float
    {
        foreach (['paid_amount', 'total_amount', 'subtotal'] as $field) {
            $value = (float) ($document->getAttribute($field) ?? 0);

            if ($value > 0) {
                return $value;
            }
        }

        return (float) $document->lines
            ->sum(fn (OperationDocumentLine $line) => (float) ($line->total_amount ?? 0));
    }

    protected function resolveDocumentDate(OperationDocument $document): CarbonInterface
    {
        return $document->effective_date
            ?? $document->check_date
            ?? $document->entry_date
            ?? now();
    }

}
