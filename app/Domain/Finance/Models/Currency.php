<?php

namespace App\Domain\Finance\Models;

use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'symbol',
        'exchange_rate',
        'is_active',
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

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class);
    }
}
