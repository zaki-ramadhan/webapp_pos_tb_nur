<?php

namespace App\Domain\Finance\Models;

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
}
