<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'is_active',
    ];

    protected array $searchable = ['code', 'name'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
