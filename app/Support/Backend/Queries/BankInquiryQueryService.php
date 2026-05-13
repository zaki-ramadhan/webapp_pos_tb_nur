<?php

namespace App\Support\Backend\Queries;

use App\Domain\Finance\Models\Account;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BankInquiryQueryService
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateStatement(array $filters): LengthAwarePaginator
    {
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
        $rows = $this->buildLedgerRows($filters)
            ->values()
            ->map(function (array $row, int $index): array {
                return [
                    'id' => $row['id'],
                    'date' => $row['date_label'],
                    'source_number' => $row['document_number'],
                    'check_number' => $row['check_number'],
                    'transaction_type' => $row['transaction_type'],
                    'description' => $row['description'],
                    'mutation' => $row['mutation'],
                    'type' => $row['type'],
                    'balance' => $row['balance'],
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
        $rows = $this->buildLedgerRows($filters)
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
    protected function buildLedgerRows(array $filters): Collection
    {
        $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
        $accountMap = $this->resolveAccountMap($filters);
        $accountIds = $accountMap->keys()->map(fn ($id) => (int) $id)->all();

        if ($accountIds === []) {
            return collect();
        }

        $documents = $this->queryDocuments($filters);
        $rows = collect();

        foreach ($documents as $document) {
            $rows = $rows->merge($this->rowsFromDocumentLines($document, $accountMap));
            $rows = $rows->merge($this->rowsFromSyntheticAccounts($document, $accountMap));
        }

        $balances = [];

        $rows = $rows
            ->sortBy([
                ['sortable_date', 'asc'],
                ['account_name', 'asc'],
                ['document_number', 'asc'],
                ['id', 'asc'],
            ])
            ->values()
            ->map(function (array $row) use (&$balances, $accountMap): array {
                $accountId = (int) $row['account_id'];
                $openingBalance = (float) ($accountMap->get($accountId)?->opening_balance ?? 0);
                $currentBalance = $balances[$accountId] ?? $openingBalance;
                $currentBalance += (float) $row['net_amount'];
                $balances[$accountId] = $currentBalance;
                $row['balance'] = $this->formatNumber($currentBalance);

                return $row;
            })
            ->filter(function (array $row) use ($search): bool {
                if ($search === '') {
                    return true;
                }

                return collect([
                    $row['date_label'],
                    $row['document_number'],
                    $row['check_number'],
                    $row['transaction_type'],
                    $row['description'],
                    $row['mutation'],
                    $row['type'],
                    $row['balance'],
                    $row['account_name'],
                ])->contains(fn ($value) => str_contains(mb_strtolower((string) $value), $search));
            })
            ->values();

        return $rows;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Account>
     */
    protected function resolveAccountMap(array $filters): Collection
    {
        $query = Account::query();

        if (filled($filters['account_id'] ?? null)) {
            return $query->whereKey((int) $filters['account_id'])->get()->keyBy('id');
        }

        $accounts = $query
            ->where(function ($builder): void {
                $builder
                    ->whereNotNull('cash_bank_reference')
                    ->orWhere('account_type', 'like', '%bank%')
                    ->orWhere('account_type', 'like', '%cash%');
            })
            ->get();

        return $accounts->keyBy('id');
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
            ->when($startDate !== null, function ($query, CarbonInterface $date): void {
                $query->whereDate('entry_date', '>=', $date->toDateString());
            })
            ->when($endDate !== null, function ($query, CarbonInterface $date): void {
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

        return $this->makeLedgerRow(
            id: sprintf('synthetic:%d:%s', $document->id, $suffix),
            accountId: $accountId,
            accountName: (string) ($account?->name ?? $accountId),
            document: $document,
            description: (string) ($document->notes ?: $document->document_number),
            debit: $debit,
            credit: $credit,
            date: $this->resolveDocumentDate($document),
        );
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
        $netAmount = $debit - $credit;

        return [
            'id' => $id,
            'account_id' => $accountId,
            'account_name' => $accountName,
            'document_number' => (string) $document->document_number,
            'check_number' => (string) ($document->external_number ?? ''),
            'transaction_type' => str($document->document_type)->replace('_', ' ')->title()->toString(),
            'description' => $description,
            'debit' => $this->formatNumber($debit),
            'credit' => $this->formatNumber($credit),
            'mutation' => $this->formatNumber(abs($netAmount)),
            'type' => $netAmount >= 0 ? 'Debit' : 'Credit',
            'status' => $document->is_closed ? 'Reconciled' : 'Open',
            'date_label' => $date->format('Y-m-d'),
            'sortable_date' => $date->toDateString(),
            'net_amount' => $netAmount,
        ];
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

    protected function resolveDateFilter(mixed $value): ?CarbonInterface
    {
        if (! filled($value)) {
            return null;
        }

        return Carbon::parse((string) $value);
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @param  array<string, mixed>  $filters
     */
    protected function paginateRows(Collection $rows, array $filters): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 100));
        $page = max(1, (int) request()->query('page', 1));

        return ArrayPaginatorFactory::make($rows, $perPage, $page);
    }

    protected function formatNumber(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
