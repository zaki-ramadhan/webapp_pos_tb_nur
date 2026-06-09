<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchaseInvoicePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['purchase-invoice'], [
            ...\App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('purchase-invoice-create', 'purchaseInvoice'),
        ]);
    }
}
