<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class GeneralJournal extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'general_journal';
    }
}
