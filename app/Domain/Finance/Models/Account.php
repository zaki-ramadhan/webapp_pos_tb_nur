<?php

namespace App\Domain\Finance\Models;

use App\Domain\Organization\Models\Branch;
use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends DomainModel
{
    protected $fillable = [
        'parent_id',
        'currency_id',
        'code',
        'name',
        'account_type',
        'notes',
        'opening_balance',
        'opening_balance_date',
        'cash_bank_reference',
        'is_active',
        'auto_code',
    ];

    protected array $searchable = ['code', 'name', 'account_type', 'notes'];

    protected function casts(): array
    {
        return [
            'opening_balance' => 'decimal:2',
            'opening_balance_date' => 'date',
            'is_active' => 'boolean',
            'auto_code' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    protected $appends = ['current_balance'];

    protected static array $balanceCalculationStack = [];

    public function getCurrentBalanceAttribute(): float
    {
        if (isset(static::$balanceCalculationStack[$this->id])) {
            return (float) ($this->opening_balance ?? 0);
        }

        static::$balanceCalculationStack[$this->id] = true;

        try {
            $children = $this->relationLoaded('children') ? $this->children : $this->children()->get();

            if ($children->isNotEmpty()) {
                return (float) $children->sum('current_balance');
            }

            $debitSum = (float) \App\Domain\Support\Models\OperationDocumentLine::where('account_id', $this->id)->sum('debit_amount');
            $creditSum = (float) \App\Domain\Support\Models\OperationDocumentLine::where('account_id', $this->id)->sum('credit_amount');

            if ($debitSum == 0.0 && $creditSum == 0.0) {
                return (float) ($this->opening_balance ?? 0);
            }

            $type = strtolower($this->account_type ?? '');
            if (str_contains($type, 'liability') || str_contains($type, 'equity') || str_contains($type, 'revenue') || str_contains($type, 'utang') || str_contains($type, 'modal') || str_contains($type, 'pendapatan') || str_contains($type, 'liabilitas')) {
                return $creditSum - $debitSum;
            }

            return $debitSum - $creditSum;
        } catch (\Throwable $e) {
            return (float) ($this->opening_balance ?? 0);
        } finally {
            unset(static::$balanceCalculationStack[$this->id]);
        }
    }
}
