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
    public function paginateStatement(array $filters): LengthAwarePaginator
    {
        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $accountId = $filters['account_id'] ?? null;

        if (empty($accountId) && $search === '') {
            return $this->paginateRows(collect(), $filters);
        }

        $rows = $this->buildLedgerRows($filters)
            ->map(function (array $row): array {
                return [
                    'id' => $row['id'],
                    'date' => $row['date_label'],
                    'description' => $row['description'],
                    'mutation' => $row['mutation'],
                    'type' => $row['type'],
                    'balance' => $row['balance'],
                    'account_id' => $row['account_id'],
                    'account_name' => $row['account_name'],
                    'document_number' => $row['document_number'],
                    'transaction_type' => $row['transaction_type'],
                ];
            });

        return $this->paginateRows($rows, $filters);
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
                    'is_opening_balance' => (bool) ($row['is_opening_balance'] ?? false),
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

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, array<string, mixed>>
     */
    protected function buildLedgerRows(array $filters, bool $includeOpeningBalanceRow = false): Collection
    {
        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $accountMap = $this->resolveAccountMap($filters);
        $accountIds = $accountMap->keys()->map(fn ($id) => (int) $id)->all();

        if ($accountIds === []) {
            return collect();
        }

        $documents = $this->queryDocuments($filters);
        $allRows = collect();

        foreach ($documents as $document) {
            $allRows = $allRows->merge($this->rowsFromDocumentLines($document, $accountMap));
            $allRows = $allRows->merge($this->rowsFromSyntheticAccounts($document, $accountMap));
        }

        $openingRows = collect();
        $realRows = collect();

        foreach ($allRows as $row) {
            $isOpBal = (bool) ($row['is_opening_balance'] ?? false)
                || (isset($row['description']) && str_starts_with($row['description'], 'Saldo Awal akun'));

            if ($isOpBal) {
                $openingRows->push($row);
            } else {
                $realRows->push($row);
            }
        }

        $balances = [];
        foreach ($accountMap as $accId => $account) {
            $balances[(int) $accId] = (float) ($account->opening_balance ?? 0);
        }

        foreach ($openingRows as $opRow) {
            $accId = (int) $opRow['account_id'];
            $balances[$accId] = ($balances[$accId] ?? 0) + (float) $opRow['net_amount'];
        }

        $sortedRealRows = $realRows->sortBy([
            ['sortable_date', 'asc'],
            ['account_name', 'asc'],
            ['document_number', 'asc'],
            ['id', 'asc'],
        ])->values();

        $startDate = $this->resolveDateFilter($filters['start_date'] ?? null);
        $outputRows = collect();

        if ($includeOpeningBalanceRow && count($accountIds) === 1) {
            $accId = $accountIds[0];
            $accName = $accountMap->get($accId)?->name ?? '';
            $initialBal = $balances[$accId] ?? 0;

            $outputRows->push([
                'id' => 'opening-balance',
                'document_id' => null,
                'document_type' => null,
                'date' => '-',
                'date_label' => '-',
                'sortable_date' => '0000-00-00',
                'document_number' => '-',
                'check_number' => '',
                'transaction_type' => 'Saldo Awal',
                'description' => $startDate ? sprintf('Saldo per %s', $startDate->copy()->subDay()->format('d/m/Y')) : 'Saldo Awal',
                'debit' => $this->formatNumber(0),
                'credit' => $this->formatNumber(0),
                'mutation' => $this->formatNumber(0),
                'type' => '-',
                'status' => 'Reconciled',
                'balance' => $this->formatNumber($initialBal),
                'net_amount' => 0,
                'is_opening_balance' => true,
                'account_id' => $accId,
                'account_name' => $accName,
            ]);
        }

        $computedRealRows = $sortedRealRows->map(function (array $row) use (&$balances): array {
            $accountId = (int) $row['account_id'];
            $currentBalance = $balances[$accountId] ?? 0;
            $currentBalance += (float) $row['net_amount'];
            $balances[$accountId] = $currentBalance;
            $row['balance'] = $this->formatNumber($currentBalance);

            return $row;
        });

        $outputRows = $outputRows->concat($computedRealRows);

        return $outputRows->values();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Account>
     */
    protected function resolveAccountMap(array $filters): Collection
    {
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

            $matchedAccounts = $query
                ->where(function ($builder) use ($cleanSearch, $codeQuery, $nameQuery): void {
                    $builder->whereRaw('LOWER(name) LIKE ?', ["%{$cleanSearch}%"])
                        ->orWhereRaw('LOWER(code) LIKE ?', ["%{$cleanSearch}%"])
                        ->orWhereRaw('LOWER(name) LIKE ?', ["%{$nameQuery}%"])
                        ->orWhereRaw('LOWER(code) LIKE ?', ["%{$codeQuery}%"]);
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
     * @return Collection<int, OperationDocument>
     */
    protected function queryDocuments(array $filters): Collection
    {
        $startDate = $this->resolveDateFilter($filters['start_date'] ?? null);
        $endDate = $this->resolveDateFilter($filters['end_date'] ?? null);

        return OperationDocument::query()
            ->with(['primaryAccount', 'secondaryAccount', 'lines.account'])
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
        ];

        $docType = $document->document_type;
        $transactionType = $typeTranslations[$docType] ?? str($docType)->replace('_', ' ')->title()->toString();

        return [
            'id' => $id,
            'document_id' => $document->id,
            'document_type' => $document->document_type,
            'account_id' => $accountId,
            'account_name' => $accountName,
            'document_number' => (string) $document->document_number,
            'check_number' => (string) ($document->external_number ?? ''),
            'transaction_type' => $transactionType,
            'description' => $description,
            'debit' => $this->formatNumber($debit),
            'credit' => $this->formatNumber($credit),
            'mutation' => $this->formatNumber(abs($netAmount)),
            'type' => $netAmount >= 0 ? 'Debit' : 'Kredit',
            'status' => $this->resolveRowReconciled($document, $accountId) ? 'Reconciled' : 'Open',
            'date_label' => $date->format('Y-m-d'),
            'sortable_date' => $date->toDateString(),
            'net_amount' => $netAmount,
            'is_opening_balance' => (bool) ($document->metadata['is_opening_balance'] ?? false),
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
