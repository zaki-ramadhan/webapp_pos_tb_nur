<?php

namespace App\Support\Presentation\Blueprints\Pages;

class AccountsPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['accounts'], [
            'subtab' => [
                'id' => 'accounts-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'accounts' => [
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
