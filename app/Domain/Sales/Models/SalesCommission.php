<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class SalesCommission extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'sales_commission';
    }
}
