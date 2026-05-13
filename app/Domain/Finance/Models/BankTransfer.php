<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class BankTransfer extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'bank_transfer';
    }
}
