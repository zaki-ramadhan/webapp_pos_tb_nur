<?php

namespace App\Support\Presentation\Blueprints;

final class InventoryOpPageBlueprint
{
    public static function buildSalesTransactionPage(string $subtabId, string $configKey): array
    {
        return [
            'subtab' => [
                'id' => $subtabId,
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            $configKey => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    public static function salesTransactionTopActions(): array
    {
        return [
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
        ];
    }

    public static function workOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'work-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'workOrder' => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    public static function materialAdditionPage(): array
    {
        return [
            'subtab' => [
                'id' => 'material-addition-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'materialAddition' => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    public static function stockOpnameOrderPage(): array
    {
        return [
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
        ];
    }

    public static function stockOpnameResultPage(): array
    {
        return [
            'subtab' => [
                'id' => 'stock-opname-result-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockOpnameResult' => [
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
        ];
    }

    public static function workCompletionPage(): array
    {
        return [
            'subtab' => [
                'id' => 'work-completion-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'workCompletion' => [
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
        ];
    }

    public static function orderFulfillmentPage(): array
    {
        return [
            'orderFulfillment' => [],
        ];
    }
}
