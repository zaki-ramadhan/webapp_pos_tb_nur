<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchasePaymentPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['purchase-payment'], [
            ...self::buildSalesTransactionPage('purchase-payment-create', 'purchasePayment'),
        ]);
    }
}
