<?php

namespace App\Domain\Inventory\Models;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryBatch extends DomainModel
{
    protected $table = 'inventory_batches';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'entry_date',
        'qty_received',
        'qty_remaining',
        'unit_cost',
        'source_type',
        'source_id',
        'source_line_id',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'datetime',
            'qty_received' => 'decimal:4',
            'qty_remaining' => 'decimal:4',
            'unit_cost' => 'decimal:4',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}
