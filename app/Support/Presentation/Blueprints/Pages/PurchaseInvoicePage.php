<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchaseInvoicePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['purchase-invoice'], [
            ...self::buildSalesTransactionPage('purchase-invoice-create', 'purchaseInvoice'),
        ]);
    }
}
