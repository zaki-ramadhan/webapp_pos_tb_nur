<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class Budget extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'budget';
    }
}
