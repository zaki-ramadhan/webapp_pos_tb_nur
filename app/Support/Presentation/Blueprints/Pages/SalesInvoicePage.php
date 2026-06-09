<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesInvoicePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-invoice'], [
            ...\App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('sales-invoice-create', 'salesInvoice'),
        ]);
    }
}
