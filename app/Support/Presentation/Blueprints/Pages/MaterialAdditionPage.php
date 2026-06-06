<?php

namespace App\Support\Presentation\Blueprints\Pages;

class MaterialAdditionPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['material-addition'], [
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
        ]);
    }
}
