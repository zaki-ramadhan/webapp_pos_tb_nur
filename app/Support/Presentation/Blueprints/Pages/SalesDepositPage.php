<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesDepositPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-deposit'], self::buildSalesTransactionPage('sales-deposit-create', 'salesDeposit'));
    }
}
