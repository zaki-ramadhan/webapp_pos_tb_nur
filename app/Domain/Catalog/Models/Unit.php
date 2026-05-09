<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Finance\Models\Tax;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends DomainModel
{
    protected $fillable = [
        'tax_id',
        'code',
        'name',
        'precision',
        'tax_reference_code',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'tax_reference_code'];

    protected function casts(): array
    {
        return [
            'precision' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'base_unit_id');
    }
}
