<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ItemCategoryPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['item-category'], [
            'subtab' => [
                'id' => 'item-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemCategory' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'tabs' => [
                    ['id' => 'item-category-general', 'label' => 'Kategori Barang'],
                ],
                'labels' => [
                    'name' => 'Nama',
                    'isDefault' => 'Kategori Default',
                    'isSubCategory' => 'Sub Kategori',
                    'yes' => 'Ya',
                ],
                'accountIntro' => 'Tentukan default akun perkiraan yang akan digunakan pada barang kategori ini',
                'accountPlaceholder' => 'Cari/Pilih...',
                'accountNote' => 'Akun-akun yang dapat dipilih sesuai dengan akun-akun yang dimasukkan pada formulir Preferensi bagian akun default barang',
                'accountFields' => [
                    ['id' => 'inventoryAccount', 'label' => 'Persediaan'],
                    ['id' => 'expenseAccount', 'label' => 'Beban'],
                    ['id' => 'salesAccount', 'label' => 'Penjualan'],
                    ['id' => 'salesReturnAccount', 'label' => 'Retur Penjualan'],
                    ['id' => 'salesDiscountAccount', 'label' => 'Diskon Penjualan'],
                    ['id' => 'goodsInTransitAccount', 'label' => 'Barang Terkirim'],
                    ['id' => 'costOfGoodsSoldAccount', 'label' => 'Beban Pokok Penjualan'],
                    ['id' => 'purchaseReturnAccount', 'label' => 'Retur Pembelian'],
                    ['id' => 'unbilledPurchaseAccount', 'label' => 'Pembelian Belum Tertagih'],
                ],
                'createDefaults' => [
                    'name' => '',
                    'isDefault' => false,
                    'isSubCategory' => false,
                    'accounts' => [],
                ],
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'muted', 'icon' => 'save'],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'muted', 'icon' => 'save'],
                    ['id' => 'delete', 'label' => 'Hapus', 'tone' => 'danger', 'icon' => 'trash'],
                ],
                'table' => [
                    'createLabel' => 'Tambah Kategori Barang',
                    'refreshLabel' => 'Muat ulang',
                    'downloadLabel' => 'Unduh daftar kategori barang',
                    'shareLabel' => 'Opsi tautan kategori barang',
                    'printLabel' => 'Cetak daftar kategori barang',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '5',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'shareItems' => [
                        ['id' => 'open-report', 'label' => 'Buka laporan kategori barang'],
                        ['id' => 'copy-link', 'label' => 'Salin tautan tampilan'],
                    ],
                    'columns' => [
                        [
                            'id' => 'name',
                            'label' => 'Nama',
                            'align' => 'left',
                            'widthClassName' => 'w-[75%]',
                        ],
                        [
                            'id' => 'defaultLabel',
                            'label' => 'Kategori Default',
                            'align' => 'center',
                            'widthClassName' => 'w-[160px]',
                        ],
                        [
                            'id' => 'code',
                            'label' => 'Kode Kategori',
                            'align' => 'left',
                            'widthClassName' => 'w-[150px]',
                            'defaultHidden' => true,
                        ],
                        [
                            'id' => 'notes',
                            'label' => 'Deskripsi',
                            'align' => 'left',
                            'widthClassName' => 'w-[200px]',
                            'defaultHidden' => true,
                        ],
                    ],
                    'printItems' => [
                        ['id' => 'print-list', 'label' => 'Cetak daftar kategori'],
                    ],
                    'settingsItems' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                    ],
                    'rows' => [
                        [
                            'id' => 'item-category-bahan-bangunan',
                            'name' => 'Bahan Bangunan Utama',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Bahan Bangunan Utama',
                        ],
                        [
                            'id' => 'item-category-besi-baja',
                            'name' => 'Besi & Struktur Baja',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Besi & Struktur Baja',
                        ],
                        [
                            'id' => 'item-category-cat',
                            'name' => 'Cat & Perlengkapan',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Cat & Perlengkapan',
                        ],
                        [
                            'id' => 'item-category-umum',
                            'name' => 'Umum',
                            'defaultLabel' => 'Ya',
                            'isDefault' => true,
                            'isSubCategory' => false,
                            'tabLabel' => 'Umum',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'item-category-bahan-bangunan' => [
                        'name' => 'Bahan Bangunan Utama',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-01] Persediaan Bahan Bangunan',
                            'expenseAccount' => '[611.001-04] Beban Angkut Pembelian',
                            'salesAccount' => '[411.000-01] Penjualan Bahan Bangunan',
                            'salesReturnAccount' => '[431.000-01] Retur Penjualan',
                            'salesDiscountAccount' => '[421.000-01] Potongan Penjualan',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-01] Beban Pokok Penjualan',
                            'purchaseReturnAccount' => '[115.000-01] Persediaan Bahan Bangunan',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-besi-baja' => [
                        'name' => 'Besi & Struktur Baja',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-02] Persediaan Besi & Baja',
                            'expenseAccount' => '[611.001-04] Beban Angkut Pembelian',
                            'salesAccount' => '[411.000-02] Penjualan Besi & Baja',
                            'salesReturnAccount' => '[431.000-02] Retur Penjualan Besi & Baja',
                            'salesDiscountAccount' => '[421.000-02] Potongan Penjualan',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-02] Beban Pokok Penjualan Besi & Baja',
                            'purchaseReturnAccount' => '[115.000-02] Persediaan Besi & Baja',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-cat' => [
                        'name' => 'Cat & Perlengkapan',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-03] Persediaan Cat',
                            'expenseAccount' => '[611.001-04] Beban Angkut Pembelian',
                            'salesAccount' => '[411.000-03] Penjualan Cat',
                            'salesReturnAccount' => '[431.000-03] Retur Penjualan Cat',
                            'salesDiscountAccount' => '[421.000-03] Potongan Penjualan Cat',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-03] Beban Pokok Penjualan Cat',
                            'purchaseReturnAccount' => '[115.000-03] Persediaan Cat',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-umum' => [
                        'name' => 'Umum',
                        'isDefault' => true,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-10] Persediaan Umum',
                            'expenseAccount' => '[611.001-10] Beban Umum',
                            'salesAccount' => '[411.000-10] Penjualan Umum',
                            'salesReturnAccount' => '[431.000-10] Retur Penjualan Umum',
                            'salesDiscountAccount' => '[421.000-10] Potongan Penjualan Umum',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-10] Beban Pokok Penjualan Umum',
                            'purchaseReturnAccount' => '[115.000-10] Persediaan Umum',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                ],
            ],
        ]);
    }
}
