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
                        'className' => 'w-full sm:w-[420px]',
                    ],
                    [
                        'id' => 'warehouseSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Gudang...',
                        'className' => 'w-full sm:w-[420px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'link',
                        'label' => 'Muat ulang barang stok minimum',
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
                    'className' => 'w-full lg:w-[520px]',
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1800px]',
                    'searchKeys' => ['supplier', 'itemName', 'itemCode'],
                    'columns' => [
                        ['id' => 'selected', 'label' => '', 'kind' => 'checkbox', 'widthClassName' => 'w-[52px]', 'align' => 'center'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[340px]', 'align' => 'center'],
                        ['id' => 'itemName', 'label' => 'Nama Barang', 'widthClassName' => 'w-[320px]', 'align' => 'center'],
                        ['id' => 'itemCode', 'label' => 'Kode Barang', 'widthClassName' => 'w-[220px]', 'align' => 'center'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[170px]', 'align' => 'center'],
                        ['id' => 'availableStock', 'label' => 'Stok tersedia', 'widthClassName' => 'w-[190px]', 'align' => 'center'],
                        ['id' => 'ordered', 'label' => 'Dipesan', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'requested', 'label' => 'Diminta', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'minimumLimit', 'label' => 'Batas Minimum Stok', 'widthClassName' => 'w-[250px]', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ]);
    }
}
