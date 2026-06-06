<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchaseReturnPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['purchase-return'], [
            ...self::buildSalesTransactionPage('purchase-return-create', 'purchaseReturn'),
        ]);
    }
}
