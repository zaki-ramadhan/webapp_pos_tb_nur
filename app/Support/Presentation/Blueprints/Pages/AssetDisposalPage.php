<?php

namespace App\Support\Presentation\Blueprints\Pages;

class AssetDisposalPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['asset-disposal'], [
            'subtab' => [
                'id' => 'asset-disposal-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetDisposal' => [
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
