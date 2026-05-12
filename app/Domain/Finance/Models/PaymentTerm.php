<?php

namespace App\Domain\Finance\Models;

use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentTerm extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'due_days',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'notes'];

    protected function casts(): array
    {
        return [
            'due_days' => 'integer',
            'is_active' => 'boolean',
        ];
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
