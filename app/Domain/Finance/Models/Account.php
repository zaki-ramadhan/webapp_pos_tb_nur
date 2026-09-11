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

    public ?float $previousOpeningBalance = null;

    protected static function booted(): void
    {
        static::updating(function (Account $account): void {
            if ($account->isDirty('opening_balance')) {
                $account->previousOpeningBalance = (float) ($account->getOriginal('opening_balance') ?? 0);
            }
        });
    }

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

    protected $appends = ['has_children'];

    protected static array $balanceCalculationStack = [];

    public function getHasChildrenAttribute(): bool
    {
        if ($this->relationLoaded('children')) {
            return $this->children->isNotEmpty();
        }

        return $this->children()->exists();
    }

    public function getCurrentBalanceAttribute(): float
    {
        if (array_key_exists('current_balance', $this->attributes)) {
            return (float) $this->attributes['current_balance'];
        }

        if (isset(static::$balanceCalculationStack[$this->id])) {
            return (float) ($this->opening_balance ?? 0);
        }

        static::$balanceCalculationStack[$this->id] = true;

        try {
            $children = $this->relationLoaded('children') ? $this->children : $this->children()->get();

            if ($children->isNotEmpty()) {
                return (float) $children->sum('current_balance');
            }

            return app(\App\Support\Backend\Queries\BankInquiryQueryService::class)->calculateAccountBalance($this);
        } catch (\Throwable $e) {
            return (float) ($this->opening_balance ?? 0);
        } finally {
            unset(static::$balanceCalculationStack[$this->id]);
        }
    }
}
