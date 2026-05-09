<?php

namespace App\Domain\Partner\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierCategory extends DomainModel
{
    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'is_default',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'notes'];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
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

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class, 'category_id');
    }
}
