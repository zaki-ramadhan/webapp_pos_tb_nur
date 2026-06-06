<?php

namespace App\Support\Presentation\Blueprints\Pages;

class InventoryAdjustmentPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['inventory-adjustment'], [
            'subtab' => [
                'id' => 'inventory-adjustment-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'inventoryAdjustment' => [
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
