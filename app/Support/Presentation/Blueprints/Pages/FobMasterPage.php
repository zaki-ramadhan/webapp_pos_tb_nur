<?php

namespace App\Support\Presentation\Blueprints\Pages;

class FobMasterPage
{
    public static function get(): array
    {
        return [
                    'id' => 'fob-master',
                    'label' => 'FOB',
                    'subtab' => [
                        'id' => 'fob-master-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah FOB',
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '2',
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
                                'id' => 'fob-destination',
                                'name' => 'Destination',
                            ],
                            [
                                'id' => 'fob-shipping-point',
                                'name' => 'Shipping Point',
                            ],
                        ],
                    ],
                    'form' => [
                        'sectionLabel' => 'FOB',
                        'saveLabel' => 'Simpan',
                        'fields' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'required' => true,
                                'value' => '',
                                'containerClassName' => 'max-w-[420px]',
                            ],
                        ],
                    ],
                ];
    }
}
