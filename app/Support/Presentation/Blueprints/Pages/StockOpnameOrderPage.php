<?php

namespace App\Support\Presentation\Blueprints\Pages;

class StockOpnameOrderPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['stock-opname-order'], [
            'subtab' => [
                'id' => 'stock-opname-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockOpnameOrder' => [
                'topActions' => [
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
