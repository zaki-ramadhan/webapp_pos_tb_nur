<?php

namespace App\Domain\Inventory\Models;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Organization\Models\Department;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryDocumentLine extends DomainModel
{
    protected $fillable = [
        'product_id',
        'unit_id',
        'department_id',
        'item_name',
        'item_code',
        'quantity',
        'system_quantity',
        'counted_quantity',
        'line_date',
        'notes',
        'attributes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'system_quantity' => 'decimal:2',
            'counted_quantity' => 'decimal:2',
            'line_date' => 'date',
            'attributes' => 'array',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(InventoryDocument::class, 'inventory_document_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
