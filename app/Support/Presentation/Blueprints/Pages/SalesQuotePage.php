<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesQuotePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-quote'], self::buildSalesTransactionPage('sales-quote-create', 'salesQuote'));
    }
}
