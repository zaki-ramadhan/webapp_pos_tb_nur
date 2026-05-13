<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class ExpenseEntry extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'expense_entry';
    }
}
