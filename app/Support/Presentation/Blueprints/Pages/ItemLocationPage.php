<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ItemLocationPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['item-location'], [
            'itemLocation' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'controls' => [
                    [
                        'id' => 'itemType',
                        'type' => 'select',
                        'value' => 'goods',
                        'options' => [
                            ['value' => 'goods', 'label' => 'Barang'],
                            ['value' => 'warehouse', 'label' => 'Gudang'],
                        ],
                        'className' => 'w-[140px]',
                    ],
                    [
                        'id' => 'itemSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Barang',
                        'className' => 'w-full sm:w-[360px] md:w-[400px]',
                    ],
                    [
                        'id' => 'unitMode',
                        'type' => 'select',
                        'value' => 'multi',
                        'options' => [
                            ['value' => 'multi', 'label' => 'Multi Satuan'],
                        ],
                        'className' => 'w-[140px]',
                    ],
                    [
                        'id' => 'asOfDate',
                        'type' => 'date',
                        'value' => '',
                        'className' => 'w-[145px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'refresh',
                        'label' => 'Muat ulang',
                    ],
                    [
                        'id' => 'export-excel',
                        'type' => 'icon-button',
                        'icon' => 'download',
                        'label' => 'Ekspor Excel',
                    ],
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1180px]',
                    'columns' => [
                        ['id' => 'warehouse', 'label' => 'Gudang', 'widthClassName' => 'w-[300px]', 'align' => 'left'],
                        ['id' => 'multiUnitQuantity', 'label' => 'Kts dalam Multi Satuan', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'saleableStock', 'label' => 'Stok dapat dijual', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'address', 'label' => 'Alamat', 'align' => 'left'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ]);
    }
}
