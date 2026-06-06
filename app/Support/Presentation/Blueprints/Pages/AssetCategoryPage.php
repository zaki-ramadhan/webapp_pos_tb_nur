<?php

namespace App\Support\Presentation\Blueprints\Pages;

class AssetCategoryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['asset-category'], [
            'subtab' => [
                'id' => 'asset-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetCategory' => [
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
