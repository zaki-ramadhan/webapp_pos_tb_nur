<?php

namespace App\Domain\Asset\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class AssetMove extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'asset_move';
    }
}
