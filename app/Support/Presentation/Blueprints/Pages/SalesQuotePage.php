<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesQuotePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-quote'], \App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('sales-quote-create', 'salesQuote'));
    }
}
