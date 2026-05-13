<?php

namespace App\Domain\Inventory\Models;

class StockTransfer extends AbstractInventoryDocument
{
    protected static function documentType(): string
    {
        return 'stock_transfer';
    }
}
