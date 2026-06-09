<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesOrderPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-order'], \App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('sales-order-create', 'salesOrder'));
    }
}
