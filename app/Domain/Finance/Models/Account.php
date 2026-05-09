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
    ];

    protected array $searchable = ['code', 'name', 'account_type', 'notes'];

    protected function casts(): array
    {
        return [
            'opening_balance' => 'decimal:2',
            'opening_balance_date' => 'date',
            'is_active' => 'boolean',
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
}
