<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PriceAdjustmentPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['price-adjustment'], [
            'subtab' => [
                'id' => 'price-adjustment-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
                'priceAdjustment' => [
                    'topActions' => [
                        [
                            'id' => 'settings',
                            'label' => 'Pengaturan',
                            'icon' => 'settings',
                            'tone' => 'outline',
                        ],
                        [
                            'id' => 'tips',
                            'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'labels' => [
                    'salesCategory' => 'Kategori Penjualan',
                    'adjustmentType' => 'Tipe Penyesuaian',
                    'effectiveDate' => 'Mulai Berlaku',
                    'documentNumber' => 'Nomor #',
                    'branch' => 'Berlaku di Cabang',
                    'currency' => 'Mata Uang',
                    'notes' => 'Keterangan',
                ],
                'salesCategoryPlaceholder' => 'Cari/Pilih...',
                'adjustmentTypeOptions' => ['Harga'],
                'numberingOptions' => ['Penyesuaian Harga Jual'],
                'branchOptions' => ['[Semua Cabang]'],
                'currencyPlaceholder' => 'Cari/Pilih...',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Barang', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'itemSearchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                'detailModeLabel' => 'Rincian',
                'detailViewLabel' => 'Tampilan rincian',
                'itemLookupLabel' => 'Cari rincian barang',
                'itemSectionTitle' => 'Rincian Barang',
                'itemTable' => [
                    'columns' => [
                        ['id' => 'number', 'label' => 'No.', 'widthClassName' => 'w-[8%]', 'align' => 'center'],
                        ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[34%]'],
                        ['id' => 'code', 'label' => 'Kode Barang', 'widthClassName' => 'w-[20%]'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'newPrice', 'label' => 'Harga Baru', 'widthClassName' => 'w-[22%]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'additionalInfoTitle' => 'Info lainnya',
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'items' => [
                            ['id' => 'save-now', 'label' => 'Simpan'],
                            ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate', 'label' => 'Duplikasi penyesuaian'],
                        ],
                    ],
                ],
                'draft' => [
                    'salesCategory' => [],
                    'adjustmentType' => 'Harga',
                    'effectiveDate' => '28/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Penyesuaian Harga Jual',
                    'branches' => ['[Semua Cabang]'],
                    'currencies' => ['Indonesian Rupiah'],
                    'notes' => '',
                    'itemSearch' => '',
                ],
                'table' => [
                    'createLabel' => 'Tambah Penyesuaian Harga/Diskon',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '0',
                    'emptyLabel' => 'Belum ada data',
                    'filters' => [
                        ['id' => 'date', 'rowKey' => 'dateFilter', 'options' => [['value' => 'all', 'label' => 'Tanggal: Semua']]],
                        ['id' => 'inactive', 'rowKey' => 'inactiveFilter', 'options' => [['value' => 'all', 'label' => 'Non Aktif: Semua']]],
                        ['id' => 'type', 'rowKey' => 'adjustmentTypeFilter', 'options' => [['value' => 'all', 'label' => 'Tipe Penyesuaian: Semua']]],
                        ['id' => 'category', 'rowKey' => 'salesCategoryFilter', 'options' => [['value' => 'all', 'label' => 'Kategori Penjualan: Semua']]],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'No. Penyesuaian', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'effectiveDate', 'label' => 'Mulai Berlaku', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'salesCategory', 'label' => 'Kategori Penjualan', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[35%]'],
                        ['id' => 'adjustmentType', 'label' => 'Tipe Penyesuaian', 'widthClassName' => 'w-[21%]'],
                    ],
                    'rows' => [],
                ],
            ],
        ]);
    }
}
