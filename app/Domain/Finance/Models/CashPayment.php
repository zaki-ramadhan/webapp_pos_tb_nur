<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class CashPayment extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'cash_payment';
    }
}
