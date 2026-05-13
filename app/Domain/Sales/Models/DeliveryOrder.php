<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class DeliveryOrder extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'delivery_order';
    }
}
