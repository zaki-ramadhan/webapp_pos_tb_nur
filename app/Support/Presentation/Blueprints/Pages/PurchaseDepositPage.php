<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PurchaseDepositPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace(
            $navigationPages['purchase-deposit'] ?? [
                'id' => 'purchase-deposit',
                'label' => 'Uang Muka Pembelian',
            ],
            \App\Support\Presentation\PosBlueprint::buildSalesTransactionPage('purchase-deposit-create', 'purchaseDeposit')
        );
    }
}
