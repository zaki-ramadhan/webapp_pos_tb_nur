<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierPrice extends DomainModel
{
    protected $fillable = [
        'supplier_id',
        'product_id',
        'unit_id',
        'price',
        'effective_from',
        'effective_until',
        'notes',
    ];

    protected array $searchable = ['notes'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'effective_from' => 'date',
            'effective_until' => 'date',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
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
