<?php

namespace App\Domain\Asset\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetTaxCategory extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'depreciation_method',
        'asset_life_months',
        'depreciation_rate',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'depreciation_method', 'notes'];

    protected function casts(): array
    {
        return [
            'asset_life_months' => 'integer',
            'depreciation_rate' => 'decimal:4',
            'is_active' => 'boolean',
        ];
    }

    public function fixedAssets(): HasMany
    {
        return $this->hasMany(FixedAsset::class);
    }
}
