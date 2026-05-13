<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PaymentOrder extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'payment_order';
    }
}
