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
                        ],
                        'className' => 'w-[220px]',
                    ],
                    [
                        'id' => 'itemSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Barang',
                        'className' => 'w-full sm:w-[470px]',
                    ],
                    [
                        'id' => 'asOfDate',
                        'type' => 'date',
                        'value' => '28/04/2026',
                        'className' => 'w-[260px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'link',
                        'label' => 'Muat ulang barang per gudang',
                    ],
                    [
                        'id' => 'share',
                        'type' => 'icon-button',
                        'icon' => 'external-link',
                        'label' => 'Bagikan barang per gudang',
                    ],
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1180px]',
                    'columns' => [
                        ['id' => 'warehouse', 'label' => 'Gudang', 'widthClassName' => 'w-[300px]', 'align' => 'center'],
                        ['id' => 'multiUnitQuantity', 'label' => 'Kuantitas Multi Satuan', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'saleableStock', 'label' => 'Stok dapat dijual', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'address', 'label' => 'Alamat', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ]);
    }
}
