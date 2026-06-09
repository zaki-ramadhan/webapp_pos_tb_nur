<?php

namespace App\Support\Presentation\Blueprints\Pages;

class WorkOrderPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['work-order'], [
            'subtab' => [
                'id' => 'work-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'workOrder' => [
                'topActions' => \App\Support\Presentation\PosBlueprint::salesTransactionTopActions(),
            ],
        ]);
    }
}
