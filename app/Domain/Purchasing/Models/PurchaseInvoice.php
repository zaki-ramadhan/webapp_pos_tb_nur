<?php

namespace App\Domain\Purchasing\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PurchaseInvoice extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'purchase_invoice';
    }
}
