<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PriceAdjustment extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'price_adjustment';
    }
}
