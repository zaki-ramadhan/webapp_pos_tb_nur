<?php

namespace App\Support\Presentation\Blueprints\Pages;

class AssetTaxCategoryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['asset-tax-category'], [
            'subtab' => [
                'id' => 'asset-tax-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetTaxCategory' => [
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
