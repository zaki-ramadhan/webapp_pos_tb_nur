<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPrice extends DomainModel
{
    protected $fillable = [
        'product_id',
        'unit_id',
        'price_type',
        'price',
        'effective_from',
        'effective_until',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'effective_from' => 'date',
            'effective_until' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
