<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ItemsServicesPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['items-services'], [
            'subtab' => [
                'id' => 'items-services-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemsServices' => [
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
