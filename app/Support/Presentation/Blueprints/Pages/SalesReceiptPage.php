<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesReceiptPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-receipt'], \App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('sales-receipt-create', 'salesReceipt'));
    }
}
