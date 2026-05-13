<?php

namespace App\Domain\Inventory\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class MaterialAddition extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'material_addition';
    }
}
