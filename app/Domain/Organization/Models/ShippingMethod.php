<?php

namespace App\Domain\Organization\Models;

use App\Domain\Support\Models\DomainModel;

class ShippingMethod extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'notes'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
