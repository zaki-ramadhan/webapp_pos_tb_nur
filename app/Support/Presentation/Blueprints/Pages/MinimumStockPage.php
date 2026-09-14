<?php

namespace App\Support\Presentation\Blueprints\Pages;

class MinimumStockPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['minimum-stock'], [
            'minimumStock' => [
                'controls' => [
                    [
                        'id' => 'supplierSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Pemasok...',
                        'className' => 'w-full sm:w-[320px]',
                    ],
                    [
                        'id' => 'warehouseSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Gudang...',
                        'className' => 'w-full sm:w-[260px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'refresh',
                        'label' => 'Muat ulang',
                    ],
                    [
                        'id' => 'order',
                        'type' => 'button',
                        'label' => 'Pesan',
                    ],
                    [
                        'id' => 'request',
                        'type' => 'button',
                        'label' => 'Minta',
                    ],
                ],
                'search' => [
                    'placeholder' => 'Cari Nama/Kode Barang...',
                    'className' => 'w-full sm:w-[320px] lg:w-[360px]',
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1560px]',
                    'searchKeys' => ['supplier', 'itemName', 'itemCode'],
                    'columns' => [
                        ['id' => 'selected', 'label' => '', 'kind' => 'checkbox', 'widthClassName' => 'w-[64px]', 'align' => 'center'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[300px]', 'align' => 'left'],
                        ['id' => 'itemName', 'label' => 'Nama Barang', 'widthClassName' => 'w-[300px]', 'align' => 'left'],
                        ['id' => 'itemCode', 'label' => 'Kode Barang', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[140px]', 'align' => 'center'],
                        ['id' => 'availableStock', 'label' => 'Stok tersedia', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'ordered', 'label' => 'Dipesan', 'widthClassName' => 'w-[150px]', 'align' => 'center'],
                        ['id' => 'requested', 'label' => 'Diminta', 'widthClassName' => 'w-[150px]', 'align' => 'center'],
                        ['id' => 'minimumLimit', 'label' => 'Batas Minimum Stok', 'widthClassName' => 'w-[180px]', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ]);
    }
}
