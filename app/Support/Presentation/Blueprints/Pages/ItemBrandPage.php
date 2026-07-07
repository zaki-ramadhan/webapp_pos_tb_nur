<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ItemBrandPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['item-brand'], [
            'subtab' => [
                'id' => 'item-brand-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemBrand' => [
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
                'createLabel' => 'Tambah Merek Barang',
                'refreshLabel' => 'Muat ulang',
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '5',
                'columns' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama',
                        'align' => 'left',
                    ],
                ],
                'rows' => [],
            ],
            'form' => [
                'sectionLabel' => 'Merek Barang',
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
                ],
            ],
        ]);
    }
}
