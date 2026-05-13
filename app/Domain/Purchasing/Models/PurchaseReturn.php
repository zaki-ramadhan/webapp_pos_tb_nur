<?php

namespace App\Domain\Purchasing\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PurchaseReturn extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'purchase_return';
    }
}
