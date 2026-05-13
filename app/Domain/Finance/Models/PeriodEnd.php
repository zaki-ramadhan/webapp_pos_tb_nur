<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PeriodEnd extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'period_end';
    }
}
