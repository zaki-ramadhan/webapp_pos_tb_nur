<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class SalesDeposit extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'sales_deposit';
    }
}
