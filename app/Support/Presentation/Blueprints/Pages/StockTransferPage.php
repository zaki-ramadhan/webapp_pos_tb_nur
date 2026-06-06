<?php

namespace App\Support\Presentation\Blueprints\Pages;

class StockTransferPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['stock-transfer'], [
            'subtab' => [
                'id' => 'stock-transfer-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockTransfer' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ]);
    }
}
