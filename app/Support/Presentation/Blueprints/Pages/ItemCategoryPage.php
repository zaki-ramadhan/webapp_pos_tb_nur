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
                    ['id' => 'item-category-accounts', 'label' => 'Akun'],
                ],
                'labels' => [
                    'name' => 'Nama',
                    'isDefault' => 'Kategori Default',
                    'isSubCategory' => 'Sub Kategori',
                    'yes' => 'Ya',
                ],
                'accountIntro' => 'Tentukan default akun perkiraan yang akan digunakan pada barang dan jasa kategori ini',
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
                            'widthClassName' => 'w-[50%]',
                        ],
                        [
                            'id' => 'defaultLabel',
                            'label' => 'Kategori Default',
                            'align' => 'center',
                            'widthClassName' => 'w-[18%]',
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
                        [
                            'id' => 'isActiveText',
                            'label' => 'Status Aktif',
                            'align' => 'center',
                            'widthClassName' => 'w-[110px]',
                            'defaultHidden' => true,
                        ],
                    ],
                    'rows' => [
                        [
                            'id' => 'item-category-accessories',
                            'name' => 'Accessories',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Accessories',
                        ],
                        [
                            'id' => 'item-category-handphone',
                            'name' => 'Handphone',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Handphone',
                        ],
                        [
                            'id' => 'item-category-jasa',
                            'name' => 'Jasa',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Jasa',
                        ],
                        [
                            'id' => 'item-category-sparepart',
                            'name' => 'Sparepart',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Sparepart',
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
                    'item-category-accessories' => [
                        'name' => 'Accessories',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-03] Persediaan Assesoris Handphone',
                            'expenseAccount' => '[611.001-01] Beban Gaji Penjualan',
                            'salesAccount' => '[411.000-03] Penjualan Assesoris Handphone',
                            'salesReturnAccount' => '[431.000-03] Retur Penjualan Assesoris Handphone',
                            'salesDiscountAccount' => '[421.000-03] Potongan Penjualan Assesoris Handphone',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-03] Beban Pokok Penjualan Assesoris Handphone',
                            'purchaseReturnAccount' => '[115.000-03] Persediaan Assesoris Handphone',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-handphone' => [
                        'name' => 'Handphone',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-01] Persediaan Handphone',
                            'expenseAccount' => '[611.001-04] Beban Angkut Pembelian',
                            'salesAccount' => '[411.000-01] Penjualan Handphone',
                            'salesReturnAccount' => '[431.000-01] Retur Penjualan Handphone',
                            'salesDiscountAccount' => '[421.000-01] Potongan Penjualan Handphone',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-01] Beban Pokok Penjualan Handphone',
                            'purchaseReturnAccount' => '[115.000-01] Persediaan Handphone',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-jasa' => [
                        'name' => 'Jasa',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '',
                            'expenseAccount' => '[611.001-02] Beban Operasional Jasa',
                            'salesAccount' => '[411.000-05] Penjualan Jasa',
                            'salesReturnAccount' => '[431.000-05] Retur Penjualan Jasa',
                            'salesDiscountAccount' => '[421.000-05] Potongan Penjualan Jasa',
                            'goodsInTransitAccount' => '',
                            'costOfGoodsSoldAccount' => '[511.000-05] Beban Pokok Penjualan Jasa',
                            'purchaseReturnAccount' => '',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-sparepart' => [
                        'name' => 'Sparepart',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-04] Persediaan Sparepart',
                            'expenseAccount' => '[611.001-03] Beban Sparepart',
                            'salesAccount' => '[411.000-04] Penjualan Sparepart',
                            'salesReturnAccount' => '[431.000-04] Retur Penjualan Sparepart',
                            'salesDiscountAccount' => '[421.000-04] Potongan Penjualan Sparepart',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-04] Beban Pokok Penjualan Sparepart',
                            'purchaseReturnAccount' => '[115.000-04] Persediaan Sparepart',
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
