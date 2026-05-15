<?php

namespace App\Domain\Finance\Models;

use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'symbol',
        'exchange_rate',
        'is_active',
        'accounts_payable_account_id',
        'accounts_receivable_account_id',
        'purchase_advance_account_id',
        'sales_advance_account_id',
        'sales_discount_account_id',
        'realized_gain_loss_account_id',
        'unrealized_gain_loss_account_id',
    ];

    protected array $searchable = ['code', 'name', 'symbol'];

    protected function casts(): array
    {
        return [
            'exchange_rate' => 'decimal:6',
            'is_active' => 'boolean',
        ];
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function accountsPayableAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'accounts_payable_account_id');
    }

    public function accountsReceivableAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'accounts_receivable_account_id');
    }

    public function purchaseAdvanceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'purchase_advance_account_id');
    }

    public function salesAdvanceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'sales_advance_account_id');
    }

    public function salesDiscountAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'sales_discount_account_id');
    }

    public function realizedGainLossAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'realized_gain_loss_account_id');
    }

    public function unrealizedGainLossAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'unrealized_gain_loss_account_id');
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class);
    }
}
