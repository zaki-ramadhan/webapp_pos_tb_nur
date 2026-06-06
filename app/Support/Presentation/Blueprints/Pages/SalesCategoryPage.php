<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesCategoryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-category'], [
            'subtab' => [
                'id' => 'sales-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'table' => [
                'createLabel' => 'Tambah Kategori Penjualan',
                'refreshLabel' => 'Muat ulang',
                'leftButtons' => [
                    [
                        'id' => 'link-sales-category',
                        'label' => 'Hubungkan kategori penjualan',
                    ],
                ],
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '1',
                'emptyLabel' => 'Tidak ada kategori penjualan yang cocok.',
                'columns' => [
                    [
                        'id' => 'description',
                        'label' => 'Keterangan',
                        'widthClassName' => 'w-[50%]',
                    ],
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'widthClassName' => 'w-[50%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'sales-category-umum',
                        'name' => 'Umum',
                        'description' => '',
                        'tabLabel' => 'Umum',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Kategori Penjualan',
                'saveLabel' => 'Simpan',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'required' => true,
                        'value' => '',
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'description',
                        'type' => 'textarea',
                        'label' => 'Keterangan',
                        'value' => '',
                        'rows' => 3,
                        'containerClassName' => 'max-w-[420px]',
                        'textareaClassName' => 'min-h-[68px]',
                    ],
                ],
            ],
        ]);
    }
}
