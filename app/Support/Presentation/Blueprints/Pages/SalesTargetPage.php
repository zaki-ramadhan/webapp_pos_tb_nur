<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesTargetPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-target'], [
            'subtab' => [
                'id' => 'sales-target-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'salesTarget' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'labels' => [
                    'name' => 'Nama Target',
                    'type' => 'Tipe Target',
                    'branch' => 'Penjualan Cabang',
                    'startDate' => 'Dari Tanggal',
                    'endDate' => 'S/d Tanggal',
                    'notes' => 'Catatan',
                    'analyst' => 'Penganalisa',
                ],
                'targetTypeOptions' => ['Per Barang', 'Per Penjual'],
                'branchOptions' => ['[Semua Cabang]', 'Berlaku di Semua Cabang'],
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'additionalInfoTitle' => 'Info lainnya',
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    [
                        'id' => 'detail',
                        'label' => 'Rincian target',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'detail-preview', 'label' => 'Lihat rincian target'],
                        ],
                    ],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    [
                        'id' => 'detail',
                        'label' => 'Rincian target',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'detail-preview', 'label' => 'Lihat rincian target'],
                        ],
                    ],
                    ['id' => 'delete', 'label' => 'Hapus', 'icon' => 'trash', 'tone' => 'danger'],
                ],
                'draft' => [
                    'name' => '',
                    'targetType' => 'Per Barang',
                    'branch' => '[Semua Cabang]',
                    'startDate' => '01/04/2026',
                    'endDate' => '30/04/2026',
                    'notes' => '',
                    'analyst' => '',
                    'detailConfig' => [
                        'title' => 'Rincian Barang',
                        'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                        'columns' => [
                            ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'],
                            ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'],
                            ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                            ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right'],
                        ],
                        'rows' => [],
                        'modal' => null,
                    ],
                ],
                'table' => [
                    'createLabel' => 'Tambah Target Penjualan',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '10',
                    'filters' => [
                        [
                            'id' => 'targetType',
                            'rowKey' => 'targetTypeFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tipe Target: Semua'],
                                ['value' => 'per-item', 'label' => 'Tipe Target: Per Barang'],
                                ['value' => 'per-sales', 'label' => 'Tipe Target: Per Penjual'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'endDate', 'label' => 'S/d Tanggal', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'startDate', 'label' => 'Dari Tanggal', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[76%]'],
                    ],
                    'rows' => [
                        [
                            'id' => 'sales-target-october-2016',
                            'name' => 'Target Sales Oktober 16',
                            'startDate' => '01/10/2016',
                            'endDate' => '31/10/2016',
                            'targetType' => 'Per Penjual',
                            'targetTypeFilter' => 'per-sales',
                            'branch' => 'Berlaku di Semua Cabang',
                            'notes' => '',
                            'analyst' => '',
                            'detailConfig' => [
                                'title' => 'Rincian Penjual',
                                'searchPlaceholder' => 'Cari/Pilih...',
                                'columns' => [
                                    ['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'],
                                    ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right'],
                                ],
                                'rows' => [
                                    [
                                        'id' => 'sales-target-october-2016-jhonni',
                                        'salesperson' => 'Jhonni Haris',
                                        'value' => '100,000,000',
                                        'salespersonName' => 'Jhonni Haris',
                                        'targetValue' => '100,000,000,00',
                                    ],
                                    [
                                        'id' => 'sales-target-october-2016-adam',
                                        'salesperson' => 'Adam',
                                        'value' => '200,000,000',
                                        'salespersonName' => 'Adam',
                                        'targetValue' => '200,000,000,00',
                                    ],
                                ],
                                'modal' => [
                                    'title' => 'Rincian Penjual',
                                    'tabLabel' => 'Target Per Penjual',
                                    'deleteLabel' => 'Hapus',
                                    'submitLabel' => 'Lanjut',
                                    'fields' => [
                                        ['id' => 'salespersonName', 'label' => 'Nama Penjual'],
                                        ['id' => 'targetValue', 'label' => 'Nilai', 'type' => 'currency', 'prefix' => 'Rp'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'item-target-october-2016',
                            'name' => 'Target Barang Oktober 2016',
                            'startDate' => '01/10/2016',
                            'endDate' => '31/10/2016',
                            'targetType' => 'Per Barang',
                            'targetTypeFilter' => 'per-item',
                            'branch' => 'Berlaku di Semua Cabang',
                            'detailConfig' => [
                                'title' => 'Rincian Barang',
                                'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                                'columns' => [
                                    ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'],
                                    ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'],
                                    ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                                    ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right'],
                                ],
                                'rows' => [
                                    ['id' => 'item-target-october-2016-1', 'name' => 'Laptop Bisnis', 'code' => 'BRG-001', 'quantity' => '10', 'value' => '150,000,000'],
                                ],
                                'modal' => null,
                            ],
                        ],
                        ['id' => 'sales-target-november-2016', 'name' => 'Target Sales Nov 2016', 'startDate' => '01/11/2016', 'endDate' => '30/11/2016', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'annual-target-2016', 'name' => 'Target Bulanan Tahun 2016', 'startDate' => '01/02/2016', 'endDate' => '31/12/2016', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'annual-target-2017', 'name' => 'Target Bulanan Tahun 2017', 'startDate' => '01/02/2017', 'endDate' => '31/12/2017', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'item-target-november-2016', 'name' => 'Target Barang Nov 16', 'startDate' => '01/11/2016', 'endDate' => '30/11/2016', 'targetType' => 'Per Barang', 'targetTypeFilter' => 'per-item', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Barang', 'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...', 'columns' => [['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'], ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'], ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'sales-target-december-2016', 'name' => 'Target Sales Des 16', 'startDate' => '01/12/2016', 'endDate' => '31/12/2016', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'item-target-december-2016', 'name' => 'Target Barang Des 16', 'startDate' => '01/12/2016', 'endDate' => '31/12/2016', 'targetType' => 'Per Barang', 'targetTypeFilter' => 'per-item', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Barang', 'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...', 'columns' => [['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'], ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'], ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'sales-target-january-2017', 'name' => 'Target Sales Jan 17', 'startDate' => '01/01/2017', 'endDate' => '31/01/2017', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'item-target-january-2017', 'name' => 'Target Barang Jan 17', 'startDate' => '01/01/2017', 'endDate' => '31/01/2017', 'targetType' => 'Per Barang', 'targetTypeFilter' => 'per-item', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Barang', 'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...', 'columns' => [['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'], ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'], ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                    ],
                ],
            ],
        ]);
    }
}
