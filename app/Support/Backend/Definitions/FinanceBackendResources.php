<?php

namespace App\Support\Backend\Definitions;

use App\Domain\Finance\Models\Account;
use App\Domain\Finance\Models\Currency;
use App\Domain\Finance\Models\SalaryAllowance;
use App\Domain\Finance\Models\Tax;
use App\Support\Backend\BackendRelationSync;
use App\Support\Backend\BackendResourceBlueprint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class FinanceBackendResources
{
    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function definitions(): array
    {
        return [
            'currencies' => new BackendResourceBlueprint(
                key: 'currencies',
                label: 'Currencies',
                searchColumns: ['code', 'name', 'symbol'],
                modelClass: Currency::class,
                with: [
                    'accountsPayableAccount',
                    'accountsReceivableAccount',
                    'purchaseAdvanceAccount',
                    'salesAdvanceAccount',
                    'salesDiscountAccount',
                    'realizedGainLossAccount',
                    'unrealizedGainLossAccount',
                ],
                storeRules: [
                    'code' => ['required', 'string', 'size:3', 'unique:currencies,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'symbol' => ['required', 'string', 'max:10'],
                    'exchange_rate' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['sometimes', 'boolean'],
                    'accounts_payable_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'accounts_receivable_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'purchase_advance_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'sales_advance_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'sales_discount_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'realized_gain_loss_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'unrealized_gain_loss_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['required', 'string', 'size:3', Rule::unique('currencies', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'symbol' => ['required', 'string', 'max:10'],
                    'exchange_rate' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['sometimes', 'boolean'],
                    'accounts_payable_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'accounts_receivable_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'purchase_advance_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'sales_advance_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'sales_discount_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'realized_gain_loss_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'unrealized_gain_loss_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                ],
            ),
            'accounts' => new BackendResourceBlueprint(
                key: 'accounts',
                label: 'Accounts',
                searchColumns: ['code', 'name', 'account_type', 'notes'],
                modelClass: Account::class,
                with: ['parent', 'children', 'currency', 'branches', 'users'],
                indexRules: [
                    'account_type' => ['sometimes'],
                    'exclude_type' => ['sometimes'],
                    'exclude_id' => ['sometimes', 'integer'],
                ],
                storeRules: [
                    'parent_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['nullable', 'string', 'max:50'],
                    'name' => ['required', 'string', 'max:160'],
                    'account_type' => ['required', 'string', 'max:60'],
                    'notes' => ['nullable', 'string'],
                    'opening_balance' => ['nullable', 'numeric'],
                    'opening_balance_date' => ['nullable', 'date'],
                    'cash_bank_reference' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                    'auto_code' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                updateRules: fn (Model $record) => [
                    'parent_id' => [
                        'nullable',
                        'integer',
                        'exists:accounts,id',
                        function (string $attribute, mixed $value, \Closure $fail) use ($record) {
                            if ((int) $value === (int) $record->id) {
                                $fail('Akun tidak boleh menunjuk dirinya sendiri sebagai induk.');
                            }
                        },
                    ],
                    'currency_id' => ['nullable', 'integer', 'exists:currencies,id'],
                    'code' => ['nullable', 'string', 'max:50'],
                    'name' => ['required', 'string', 'max:160'],
                    'account_type' => ['required', 'string', 'max:60'],
                    'notes' => ['nullable', 'string'],
                    'opening_balance' => ['nullable', 'numeric'],
                    'opening_balance_date' => ['nullable', 'date'],
                    'cash_bank_reference' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['sometimes', 'boolean'],
                    'auto_code' => ['sometimes', 'boolean'],
                    'branch_ids' => ['sometimes', 'array'],
                    'branch_ids.*' => ['integer', 'exists:branches,id'],
                    'user_ids' => ['sometimes', 'array'],
                    'user_ids.*' => ['integer', 'exists:users,id'],
                ],
                syncUsing: function (Model $record, array $payload): void {
                    if (array_key_exists('branch_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'branches', $payload['branch_ids']);
                    }

                    if (array_key_exists('user_ids', $payload)) {
                        BackendRelationSync::syncBelongsToMany($record, 'users', $payload['user_ids']);
                    }

                    if ($record instanceof Account) {
                        self::syncAccountOpeningBalanceJournal($record);
                    }
                },
            ),
            'taxes' => new BackendResourceBlueprint(
                key: 'taxes',
                label: 'Taxes',
                searchColumns: ['code', 'name', 'tax_type'],
                modelClass: Tax::class,
                with: ['outputAccount', 'inputAccount'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:taxes,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'tax_type' => ['required', 'string', 'max:60'],
                    'rate' => ['required', 'numeric', 'min:0'],
                    'output_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'input_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('taxes', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'tax_type' => ['required', 'string', 'max:60'],
                    'rate' => ['required', 'numeric', 'min:0'],
                    'output_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'input_account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
            'salary-allowances' => new BackendResourceBlueprint(
                key: 'salary-allowances',
                label: 'Salary Allowances',
                searchColumns: ['code', 'name', 'allowance_type', 'notes'],
                modelClass: SalaryAllowance::class,
                with: ['account'],
                storeRules: [
                    'code' => ['nullable', 'string', 'max:50', 'unique:salary_allowances,code'],
                    'name' => ['required', 'string', 'max:120'],
                    'allowance_type' => ['required', 'string', 'max:60'],
                    'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
                updateRules: fn (Model $record) => [
                    'code' => ['nullable', 'string', 'max:50', Rule::unique('salary_allowances', 'code')->ignore($record)],
                    'name' => ['required', 'string', 'max:120'],
                    'allowance_type' => ['required', 'string', 'max:60'],
                    'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
                    'notes' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ),
        ];
    }

    public static function syncAccountOpeningBalanceJournal(Account $account): void
    {
        $balance = (float) ($account->opening_balance ?? 0);
        $date = $account->opening_balance_date ? \Carbon\Carbon::parse($account->opening_balance_date)->format('Y-m-d') : date('Y-m-d');

        $journal = \App\Domain\Support\Models\OperationDocument::where('document_type', 'general_journal')
            ->where('metadata->is_opening_balance', true)
            ->where('metadata->account_id', $account->id)
            ->first();

        if (abs($balance) < 0.001) {
            if ($journal) {
                $journal->lines()->delete();
                $journal->delete();
            }
            return;
        }

        $type = strtolower($account->account_type ?? '');
        $isAssetOrExpense = ! (str_contains($type, 'liability')
            || str_contains($type, 'equity')
            || str_contains($type, 'revenue')
            || str_contains($type, 'utang')
            || str_contains($type, 'modal')
            || str_contains($type, 'pendapatan')
            || str_contains($type, 'liabilitas'));

        $debitAmount = $isAssetOrExpense ? ($balance > 0 ? $balance : 0.0) : ($balance < 0 ? abs($balance) : 0.0);
        $creditAmount = $isAssetOrExpense ? ($balance < 0 ? abs($balance) : 0.0) : ($balance > 0 ? $balance : 0.0);

        /** @var \App\Support\Backend\BackendResourceWriter $writer */
        $writer = app(\App\Support\Backend\BackendResourceWriter::class);
        $docNumber = $journal?->document_number ?? $writer->generateNextSequentialNumber('general-journals', $date);
        $description = 'Saldo Awal akun ' . $account->name;

        if (! $journal) {
            $journal = new \App\Domain\Support\Models\OperationDocument();
        }

        $journal->fill([
            'branch_id' => 1,
            'document_number' => $docNumber,
            'document_type' => 'general_journal',
            'entry_date' => $date,
            'effective_date' => $date,
            'status' => 'Disetujui',
            'notes' => $description,
            'total_amount' => abs($balance),
            'metadata' => [
                'transaction_type_label' => 'Jurnal Umum',
                'transaction_type_value' => 'general-journal',
                'is_opening_balance' => true,
                'account_id' => $account->id,
            ],
        ]);
        $journal->save();

        $journal->lines()->delete();

        $journal->lines()->create([
            'account_id' => $account->id,
            'reference_code' => $account->code,
            'description' => $description,
            'debit_amount' => $debitAmount,
            'credit_amount' => $creditAmount,
            'total_amount' => abs($balance),
            'sort_order' => 0,
        ]);

        $equityAccount = Account::where('code', '310.100-01')
            ->orWhere('account_type', 'like', '%equity%')
            ->orWhere('account_type', 'like', '%modal%')
            ->first();

        if ($equityAccount) {
            $journal->lines()->create([
                'account_id' => $equityAccount->id,
                'reference_code' => $equityAccount->code,
                'description' => 'Ekuitas Saldo Awal',
                'debit_amount' => $creditAmount,
                'credit_amount' => $debitAmount,
                'total_amount' => abs($balance),
                'sort_order' => 1,
            ]);
        }
    }
}
