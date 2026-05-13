<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class CashReceipt extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'cash_receipt';
    }
}
