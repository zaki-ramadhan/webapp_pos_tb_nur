<?php

namespace App\Domain\Inventory\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOpnameResult extends AbstractInventoryDocument
{
    protected static function documentType(): string
    {
        return 'stock_opname_result';
    }

    public function opnameOrder(): BelongsTo
    {
        return $this->belongsTo(InventoryDocument::class, 'related_document_id');
    }
}
