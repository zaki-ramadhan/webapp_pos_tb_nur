<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchaseDepositPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['purchase-deposit'], [
            ...self::buildSalesTransactionPage('purchase-deposit-create', 'purchaseDeposit'),
        ]);
    }
}
