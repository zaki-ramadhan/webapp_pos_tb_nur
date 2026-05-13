<?php

namespace App\Domain\Asset\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedAssetLocation extends DomainModel
{
    protected $fillable = [
        'location_name',
        'location_address',
        'quantity',
        'is_current',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'is_current' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function fixedAsset(): BelongsTo
    {
        return $this->belongsTo(FixedAsset::class);
    }
}
