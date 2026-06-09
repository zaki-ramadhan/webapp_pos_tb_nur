<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesDepositPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-deposit'], \App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('sales-deposit-create', 'salesDeposit'));
    }
}
