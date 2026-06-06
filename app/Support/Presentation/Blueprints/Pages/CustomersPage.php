<?php

namespace App\Support\Presentation\Blueprints\Pages;

class CustomersPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['customers'], [
            'subtab' => [
                'id' => 'customers-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'customers' => [
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
