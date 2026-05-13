<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PayrollEntry extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'payroll_entry';
    }
}
