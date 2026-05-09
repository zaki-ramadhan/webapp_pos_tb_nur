<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\DomainModel;

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
}
