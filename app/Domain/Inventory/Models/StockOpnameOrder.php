<?php

namespace App\Domain\Inventory\Models;

class StockOpnameOrder extends AbstractInventoryDocument
{
    protected static function documentType(): string
    {
        return 'stock_opname_order';
    }
}
