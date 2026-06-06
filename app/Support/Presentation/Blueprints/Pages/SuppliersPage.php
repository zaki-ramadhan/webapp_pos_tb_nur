<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SuppliersPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['suppliers'], [
            'subtab' => [
                'id' => 'suppliers-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'suppliers' => [
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
