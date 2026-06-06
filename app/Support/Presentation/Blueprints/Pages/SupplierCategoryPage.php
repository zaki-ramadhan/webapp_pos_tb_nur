<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SupplierCategoryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['supplier-category'], [
            'subtab' => [
                'id' => 'supplier-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'supplierCategory' => [
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
                'createLabel' => 'Tambah Kategori Pemasok',
                'refreshLabel' => 'Muat ulang',
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '4',
                'columns' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'widthClassName' => 'w-[92%]',
                    ],
                    [
                        'id' => 'defaultLabel',
                        'label' => 'Kategori Default',
                        'widthClassName' => 'w-[8%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'supplier-category-accessories',
                        'name' => 'ACCESSORIES',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'ACCESSORIES',
                    ],
                    [
                        'id' => 'supplier-category-handphone',
                        'name' => 'HANDPHONE',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'HANDPHONE',
                    ],
                    [
                        'id' => 'supplier-category-sparepart',
                        'name' => 'SPAREPART',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'SPAREPART',
                    ],
                    [
                        'id' => 'supplier-category-umum',
                        'name' => 'Umum',
                        'defaultLabel' => 'Ya',
                        'isDefault' => true,
                        'isSubCategory' => false,
                        'tabLabel' => 'Umum',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Kategori Pemasok',
                'saveLabel' => 'Simpan',
                'deleteLabel' => 'Hapus',
                'saveToneCreate' => 'muted',
                'saveToneDetail' => 'muted',
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
