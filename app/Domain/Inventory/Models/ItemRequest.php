<?php

namespace App\Domain\Inventory\Models;

class ItemRequest extends AbstractInventoryDocument
{
    protected static function documentType(): string
    {
        return 'item_request';
    }
}
