<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class SalesDelivery extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'sales_delivery';
    }
}
