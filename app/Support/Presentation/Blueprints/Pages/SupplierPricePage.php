<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SupplierPricePage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['supplier-price'], [
            'subtab' => [
                'id' => 'supplier-price-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'supplierPrice' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'labels' => [
                    'supplier' => 'Pemasok',
                    'effectiveDate' => 'Mulai Berlaku',
                    'autoEndDate' => 'Atur Tanggal Berakhir',
                    'documentNumber' => 'Nomor #',
                    'currency' => 'Mata Uang',
                    'notes' => 'Keterangan',
                ],
                'supplierPlaceholder' => 'Cari/Pilih Pemasok...',
                'currencyPlaceholder' => 'Cari/Pilih...',
                'numberingOptions' => ['Harga Pemasok'],
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Barang', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'itemSearchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                'takeButtonLabel' => 'Ambil',
                'itemSectionTitle' => 'Rincian Barang',
                'additionalInfoTitle' => 'Info lainnya',
                'dockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'primary', 'icon' => 'save'],
                    ['id' => 'attachment', 'label' => 'Lampiran', 'tone' => 'secondary', 'icon' => 'paperclip'],
                    ['id' => 'more', 'label' => 'Opsi lain', 'tone' => 'success', 'icon' => 'kebab'],
                ],
                'draft' => [
                    'supplier' => [],
                    'effectiveDate' => '28/04/2026',
                    'autoEndDate' => false,
                    'autoNumber' => true,
                    'numberingType' => 'Harga Pemasok',
                    'currencies' => ['Indonesian Rupiah'],
                    'notes' => '',
                    'itemSearch' => '',
                ],
                'itemTable' => [
                    'columns' => [
                        ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[42%]'],
                        ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[24%]'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[25%]'],
                        ['id' => 'newPrice', 'label' => 'Harga Baru', 'widthClassName' => 'w-[19%]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Harga Pemasok',
                    'refreshLabel' => 'Muat ulang',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '0',
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                            ],
                        ],
                        [
                            'id' => 'supplier',
                            'rowKey' => 'supplierFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Pemasok: Semua'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'No. Bukti', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'effectiveDate', 'label' => 'Mulai Berlaku', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'notes', 'label' => 'Keterangan'],
                        ['id' => 'endDate', 'label' => 'Tanggal Berakhir', 'widthClassName' => 'w-[18%]'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ]);
    }
}
