<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends DomainModel
{
    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'slug',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'slug'];

    protected function casts(): array
    {
        return [
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

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
