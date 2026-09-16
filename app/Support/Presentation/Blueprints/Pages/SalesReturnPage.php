<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesReturnPage
{
    public static function get(array $navigationPages): array
    {
        $base = $navigationPages['sales-return'] ?? [
            'id' => 'sales-return',
            'label' => 'Retur Penjualan',
        ];

        return array_replace($base, [
            ...\App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('sales-return-create', 'salesReturn'),
        ]);
    }
}
