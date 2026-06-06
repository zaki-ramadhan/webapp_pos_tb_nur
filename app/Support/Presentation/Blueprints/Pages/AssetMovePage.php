<?php

namespace App\Support\Presentation\Blueprints\Pages;

class AssetMovePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['asset-move'], [
            'subtab' => [
                'id' => 'asset-move-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetMove' => [
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
