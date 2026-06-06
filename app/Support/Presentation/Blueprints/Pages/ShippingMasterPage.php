<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ShippingMasterPage
{
    public static function get(): array
    {
        return [
                    'id' => 'shipping-master',
                    'label' => 'Pengiriman',
                    'subtab' => [
                        'id' => 'shipping-master-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Pengiriman',
                        'refreshLabel' => 'Muat ulang',
                        'downloadLabel' => 'Unduh data pengiriman',
                        'printLabel' => 'Cetak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '0',
                        'emptyLabel' => 'Belum ada data',
                        'filterOptions' => [
                            ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                            ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                            ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                        ],
                        'downloadItems' => [
                            ['id' => 'download-xlsx', 'label' => 'Unduh Excel'],
                            ['id' => 'download-csv', 'label' => 'Unduh CSV'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'pic',
                                'label' => 'PIC',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'phone',
                                'label' => 'No. Telp',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'address',
                                'label' => 'Alamat Lengkap',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'inactiveLabel',
                                'label' => 'Non Aktif',
                                'widthClassName' => 'w-[20%]',
                            ],
                        ],
                        'rows' => [],
                    ],
                    'form' => [
                        'sectionLabel' => 'Pengiriman',
                        'saveLabel' => 'Simpan',
                        'labels' => [
                            'name' => 'Nama',
                            'pic' => 'PIC',
                            'phone' => 'No. Telp',
                            'address' => 'Alamat Pengiriman',
                        ],
                        'defaults' => [
                            'name' => '',
                            'pic' => '',
                            'phone' => '',
                            'street' => '',
                            'city' => '',
                            'postalCode' => '',
                            'province' => '',
                            'country' => '',
                        ],
                    ],
                ];
    }
}
