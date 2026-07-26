<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchaseInvoicePage
{
    public static function get(array $navigationPages, string $pageId = 'purchase-invoice'): array
    {
        $basePage = $navigationPages[$pageId] ?? $navigationPages['purchase-invoice'] ?? [
            'id' => $pageId,
            'label' => 'Pesanan Pembelian',
        ];

        return array_replace($basePage, [
            'id' => $pageId,
            ...\App\Support\Presentation\PosBlueprint::buildSalesTransactionPage("{$pageId}-create", 'purchaseInvoice'),
        ]);
    }
}
