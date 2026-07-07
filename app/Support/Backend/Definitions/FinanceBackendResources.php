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
                with: ['parent', 'currency', 'branches', 'users'],
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
}
