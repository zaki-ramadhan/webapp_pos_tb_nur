<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesInvoicePage
{
    public static function get(array $navigationPages, string $pageId = 'sales-invoice'): array
    {
        $basePage = $navigationPages[$pageId] ?? $navigationPages['sales-invoice'] ?? [
            'id' => $pageId,
            'label' => 'Penjualan',
        ];

        return array_replace($basePage, [
            'id' => $pageId,
            ...\App\Support\Presentation\PosBlueprint::buildSalesTransactionPage("{$pageId}-create", 'salesInvoice'),
        ]);
    }
}
