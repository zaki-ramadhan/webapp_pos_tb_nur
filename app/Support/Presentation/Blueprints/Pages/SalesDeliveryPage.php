<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesDeliveryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-delivery'], self::buildSalesTransactionPage('sales-delivery-create', 'salesDelivery'));
    }
}
