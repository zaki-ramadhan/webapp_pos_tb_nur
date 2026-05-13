<?php

namespace App\Domain\Inventory\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class WorkCompletion extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'work_completion';
    }
}
