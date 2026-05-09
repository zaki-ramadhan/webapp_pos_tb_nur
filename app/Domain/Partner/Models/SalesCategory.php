<?php

namespace App\Domain\Partner\Models;

use App\Domain\Support\Models\DomainModel;

class SalesCategory extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'description'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
