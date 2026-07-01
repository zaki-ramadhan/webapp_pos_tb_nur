<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ItemUnitPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['item-unit'], [
            'subtab' => [
                'id' => 'item-unit-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemUnit' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
            'table' => [
                'createLabel' => 'Tambah Satuan Barang',
                'refreshLabel' => 'Muat ulang',
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '5',
                'leftButtons' => [
                    [
                        'id' => 'refresh-link',
                        'label' => 'Sinkronkan satuan barang',
                    ],
                ],
                'columns' => [
                    [
                        'id' => 'spacer',
                        'label' => '',
                        'kind' => 'spacer',
                        'align' => 'left',
                        'widthClassName' => 'w-[34px]',
                        'cellClassName' => 'px-0',
                    ],
                    [
                        'id' => 'name',
                        'label' => 'Nama',
                        'align' => 'center',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'item-unit-box',
                        'name' => 'Box',
                        'tabLabel' => 'Box',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-dus',
                        'name' => 'Dus',
                        'tabLabel' => 'Dus',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-lusin',
                        'name' => 'Lusin',
                        'tabLabel' => 'Lusin',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-pcs',
                        'name' => 'PCS',
                        'tabLabel' => 'PCS',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-unit',
                        'name' => 'Unit',
                        'tabLabel' => 'Unit',
                        'taxCode' => '',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Satuan Barang',
                'saveLabel' => 'Simpan',
                'deleteLabel' => 'Hapus',
                'saveToneCreate' => 'muted',
                'saveToneDetail' => 'muted',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama',
                        'required' => true,
                        'value' => '',
                        'clearable' => true,
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'taxCode',
                        'type' => 'lookup',
                        'label' => 'Ref Kode Pajak',
                        'info' => true,
                        'value' => '',
                        'placeholder' => 'Cari/Pilih...',
                        'containerClassName' => 'max-w-[420px]',
                    ],
                ],
            ],
        ]);
    }
}
