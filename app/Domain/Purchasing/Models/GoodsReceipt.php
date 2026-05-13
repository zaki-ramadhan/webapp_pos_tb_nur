<?php

namespace App\Domain\Purchasing\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class GoodsReceipt extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'goods_receipt';
    }
}
