<?php

namespace App\Support\Presentation\Blueprints\Pages;

class StockOpnameResultPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['stock-opname-result'], [
            'subtab' => [
                'id' => 'stock-opname-result-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockOpnameResult' => [
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
