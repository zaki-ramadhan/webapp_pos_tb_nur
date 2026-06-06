<?php

namespace App\Support\Presentation\Blueprints\Pages;

class FixedAssetsPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['fixed-assets'], [
            'subtab' => [
                'id' => 'fixed-assets-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'fixedAssets' => [
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
