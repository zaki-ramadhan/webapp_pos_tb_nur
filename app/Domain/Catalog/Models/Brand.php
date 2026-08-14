<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;

class Brand extends DomainModel
{
    protected $fillable = ['code', 'name', 'description', 'is_active'];

    protected array $searchable = ['code', 'name'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
