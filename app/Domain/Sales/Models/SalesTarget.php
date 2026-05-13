<?php

namespace App\Domain\Sales\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class SalesTarget extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'sales_target';
    }
}
