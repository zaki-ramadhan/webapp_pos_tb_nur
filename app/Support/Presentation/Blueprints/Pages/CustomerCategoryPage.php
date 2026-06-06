<?php

namespace App\Support\Presentation\Blueprints\Pages;

class CustomerCategoryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['customer-category'], [
            'subtab' => [
                'id' => 'customer-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'table' => [
                'createLabel' => 'Tambah Kategori Pelanggan',
                'refreshLabel' => 'Muat ulang',
                'leftButtons' => [
                    [
                        'id' => 'link-customer-category',
                        'label' => 'Hubungkan kategori pelanggan',
                    ],
                ],
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '3',
                'emptyLabel' => 'Tidak ada kategori pelanggan yang cocok.',
                'columns' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'widthClassName' => 'w-[72%]',
                    ],
                    [
                        'id' => 'defaultLabel',
                        'label' => 'Kategori Default',
                        'widthClassName' => 'w-[28%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'customer-category-agen-lokal',
                        'name' => 'Agen Lokal',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'Agen Lokal',
                    ],
                    [
                        'id' => 'customer-category-ekspor',
                        'name' => 'Ekspor',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'Ekspor',
                    ],
                    [
                        'id' => 'customer-category-umum',
                        'name' => 'Umum',
                        'defaultLabel' => 'Ya',
                        'isDefault' => true,
                        'isSubCategory' => false,
                        'tabLabel' => 'Umum',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Kategori Pelanggan',
                'saveLabel' => 'Simpan',
                'deleteLabel' => 'Hapus',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'required' => true,
                        'value' => '',
                        'clearable' => true,
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'isDefault',
                        'type' => 'checkbox',
                        'label' => 'Kategori Default',
                        'checkboxLabel' => 'Ya',
                        'checked' => false,
                    ],
                    [
                        'id' => 'isSubCategory',
                        'type' => 'checkbox',
                        'label' => 'Sub Kategori',
                        'checked' => false,
                        'standalone' => true,
                    ],
                ],
            ],
        ]);
    }
}
