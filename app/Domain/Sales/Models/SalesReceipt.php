<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class SalesReceipt extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'sales_receipt';
    }
}
