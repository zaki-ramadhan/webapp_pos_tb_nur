<?php

namespace App\Domain\Inventory\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class WorkOrder extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'work_order';
    }
}
