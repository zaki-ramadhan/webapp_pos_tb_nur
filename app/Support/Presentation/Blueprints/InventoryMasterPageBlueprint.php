<?php

declare(strict_types=1);

namespace App\Support\Presentation\Blueprints;

final class InventoryMasterPageBlueprint
{
    public static function inventoryAdjustmentPage(): array
    {
        return [
            'subtab' => [
                'id' => 'inventory-adjustment-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'inventoryAdjustment' => [
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
            ],
        ];
    }

    public static function warehouseMasterPage(): array
    {
        return [
            'subtab' => [
                'id' => 'warehouse-master-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'warehouse' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'tabs' => [
                    ['id' => 'warehouse-general', 'label' => 'Gudang'],
                    ['id' => 'warehouse-address', 'label' => 'Alamat'],
                    ['id' => 'warehouse-users', 'label' => 'Pengguna'],
                ],
                'labels' => [
                    'name' => 'Nama',
                    'description' => 'Deskripsi',
                    'responsiblePerson' => 'Penanggung Jawab',
                    'damagedWarehouse' => 'Ya. Merupakan gudang penyimpanan barang rusak',
                    'inactive' => 'Ya',
                    'address' => 'Alamat',
                    'groupBranch' => 'Grup/Cabang',
                    'user' => 'Pengguna',
                ],
                'createDefaults' => [
                    'name' => '',
                    'description' => '',
                    'responsiblePerson' => '',
                    'isDamagedWarehouse' => false,
                    'inactive' => false,
                    'allUsers' => true,
                    'street' => '',
                    'city' => '',
                    'postalCode' => '',
                    'province' => '',
                    'country' => '',
                    'groupBranch' => [],
                    'users' => [],
                ],
                'userAccess' => [
                    'title' => 'Akses Pengguna',
                    'allUsersLabel' => 'Semua Pengguna',
                    'limitedTitle' => 'Tentukan Pengguna yang dapat menggunakan gudang ini',
                    'groupBranchPlaceholder' => 'Cari/Pilih...',
                    'userPlaceholder' => 'Cari/Pilih...',
                ],
                'createDockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'muted',
                    ],
                ],
                'detailDockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'muted',
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'table' => [
                    'createLabel' => 'Tambah Gudang',
                    'refreshLabel' => 'Muat ulang',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel gudang',
                    'filterButtonLabel' => 'Filter gudang',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '2',
                    'filters' => [
                        [
                            'id' => 'inactive',
                            'options' => [
                                ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                            ],
                        ],
                    ],
                    'menuItems' => [
                        ['id' => 'column-settings', 'label' => 'Atur kolom'],
                        ['id' => 'view-settings', 'label' => 'Atur tampilan'],
                    ],
                    'columns' => [
                        [
                            'id' => 'name',
                            'label' => 'Nama',
                            'align' => 'left',
                            'widthClassName' => 'w-[300px]',
                        ],
                        [
                            'id' => 'address',
                            'label' => 'Alamat',
                            'align' => 'left',
                        ],
                    ],
                    'rows' => [
                        [
                            'id' => 'warehouse-jakarta',
                            'inactiveValue' => 'no',
                            'name' => 'GD. JAKARTA',
                            'tabLabel' => 'GD. JAKARTA',
                            'address' => 'Jl. Pluit Karang Cantik Blok B4 No.39 Penjaringan, Jakarta Utara - 14450 Jakarta DKI Jakarta 14450 Indonesia',
                        ],
                        [
                            'id' => 'warehouse-surabaya',
                            'inactiveValue' => 'no',
                            'name' => 'GD. SURABAYA',
                            'tabLabel' => 'GD. SURABAYA',
                            'address' => 'Gedung Pawitra Lt. 2 No. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'warehouse-jakarta' => [
                        'name' => 'GD. JAKARTA',
                        'description' => 'GUDANG JAKARTA',
                        'responsiblePerson' => 'JHONNI',
                        'isDamagedWarehouse' => false,
                        'inactive' => false,
                        'allUsers' => false,
                        'street' => "Jl. Pluit Karang Cantik Blok B4 No.39\nPenjaringan, Jakarta Utara - 14450",
                        'city' => 'Jakarta',
                        'postalCode' => '14450',
                        'province' => 'DKI Jakarta',
                        'country' => 'Indonesia',
                        'groupBranch' => ['JAKARTA'],
                        'users' => [],
                    ],
                    'warehouse-surabaya' => [
                        'name' => 'GD. SURABAYA',
                        'description' => 'GUDANG SURABAYA',
                        'responsiblePerson' => 'ERICK SZETO',
                        'isDamagedWarehouse' => false,
                        'inactive' => false,
                        'allUsers' => true,
                        'street' => "Gedung Pawitra Lt. 2 No. 203\nJl. Kalijudan No. 98A",
                        'city' => 'Surabaya',
                        'postalCode' => '60114',
                        'province' => 'Jawa Timur',
                        'country' => 'Indonesia',
                        'groupBranch' => ['SURABAYA'],
                        'users' => [],
                    ],
                ],
            ],
        ];
    }

    public static function itemsServicesPage(): array
    {
        return [
            'subtab' => [
                'id' => 'items-services-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemsServices' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    public static function itemUnitPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-unit-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemUnit' => [
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
                'createLabel' => 'Tambah Satuan Barang',
                'refreshLabel' => 'Muat ulang',
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '5',
                'leftButtons' => [
                    [
                        'id' => 'refresh-link',
                        'label' => 'Sinkronkan satuan barang',
                    ],
                ],
                'columns' => [
                    [
                        'id' => 'spacer',
                        'label' => '',
                        'kind' => 'spacer',
                        'align' => 'left',
                        'widthClassName' => 'w-[34px]',
                        'cellClassName' => 'px-0',
                    ],
                    [
                        'id' => 'name',
                        'label' => 'Nama',
                        'align' => 'center',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'item-unit-box',
                        'name' => 'Box',
                        'tabLabel' => 'Box',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-dus',
                        'name' => 'Dus',
                        'tabLabel' => 'Dus',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-lusin',
                        'name' => 'Lusin',
                        'tabLabel' => 'Lusin',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-pcs',
                        'name' => 'PCS',
                        'tabLabel' => 'PCS',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-unit',
                        'name' => 'Unit',
                        'tabLabel' => 'Unit',
                        'taxCode' => '',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Satuan Barang',
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
                    [
                        'id' => 'tax-heading',
                        'type' => 'heading',
                        'label' => 'Pajak',
                    ],
                    [
                        'id' => 'taxCode',
                        'type' => 'lookup',
                        'label' => 'Ref Kode Pajak',
                        'info' => true,
                        'value' => '',
                        'placeholder' => 'Cari/Pilih...',
                        'containerClassName' => 'max-w-[420px]',
                    ],
                ],
            ],
        ];
    }

    public static function itemCategoryPage(): array
    {
        return [
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
                'accountIntro' => 'Tentukan default akun perkiraan yang akan digunakan pada barang & jasa kategori ini',
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
                            'id' => 'spacer',
                            'label' => '',
                            'kind' => 'spacer',
                            'align' => 'center',
                            'widthClassName' => 'w-[34px]',
                            'cellClassName' => 'px-0',
                        ],
                        [
                            'id' => 'name',
                            'label' => 'Nama',
                            'align' => 'center',
                            'widthClassName' => 'w-[82%]',
                        ],
                        [
                            'id' => 'defaultLabel',
                            'label' => 'Kategori Default',
                            'align' => 'center',
                            'widthClassName' => 'w-[18%]',
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
        ];
    }

    public static function itemLocationPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-location-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemLocation' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'controls' => [
                    [
                        'id' => 'itemType',
                        'type' => 'select',
                        'value' => 'goods',
                        'options' => [
                            ['value' => 'goods', 'label' => 'Barang'],
                        ],
                        'className' => 'w-[220px]',
                    ],
                    [
                        'id' => 'itemSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Barang',
                        'className' => 'w-full sm:w-[470px]',
                    ],
                    [
                        'id' => 'asOfDate',
                        'type' => 'date',
                        'value' => '28/04/2026',
                        'className' => 'w-[260px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'link',
                        'label' => 'Muat ulang barang per gudang',
                    ],
                    [
                        'id' => 'share',
                        'type' => 'icon-button',
                        'icon' => 'external-link',
                        'label' => 'Bagikan barang per gudang',
                    ],
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1180px]',
                    'columns' => [
                        ['id' => 'warehouse', 'label' => 'Gudang', 'widthClassName' => 'w-[300px]', 'align' => 'center'],
                        ['id' => 'multiUnitQuantity', 'label' => 'Kuantitas Multi Satuan', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'saleableStock', 'label' => 'Stok dapat dijual', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'address', 'label' => 'Alamat', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    public static function minimumStockPage(): array
    {
        return [
            'minimumStock' => [
                'controls' => [
                    [
                        'id' => 'supplierSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Pemasok...',
                        'className' => 'w-full sm:w-[420px]',
                    ],
                    [
                        'id' => 'warehouseSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Gudang...',
                        'className' => 'w-full sm:w-[420px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'link',
                        'label' => 'Muat ulang barang stok minimum',
                    ],
                    [
                        'id' => 'order',
                        'type' => 'button',
                        'label' => 'Pesan',
                    ],
                    [
                        'id' => 'request',
                        'type' => 'button',
                        'label' => 'Minta',
                    ],
                ],
                'search' => [
                    'placeholder' => 'Cari Nama/Kode Barang...',
                    'className' => 'w-full lg:w-[520px]',
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1800px]',
                    'searchKeys' => ['supplier', 'itemName', 'itemCode'],
                    'columns' => [
                        ['id' => 'selected', 'label' => '', 'kind' => 'checkbox', 'widthClassName' => 'w-[52px]', 'align' => 'center'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[340px]', 'align' => 'center'],
                        ['id' => 'itemName', 'label' => 'Nama Barang', 'widthClassName' => 'w-[320px]', 'align' => 'center'],
                        ['id' => 'itemCode', 'label' => 'Kode Barang', 'widthClassName' => 'w-[220px]', 'align' => 'center'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[170px]', 'align' => 'center'],
                        ['id' => 'availableStock', 'label' => 'Stok tersedia', 'widthClassName' => 'w-[190px]', 'align' => 'center'],
                        ['id' => 'ordered', 'label' => 'Dipesan', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'requested', 'label' => 'Diminta', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'minimumLimit', 'label' => 'Batas Minimum Stok', 'widthClassName' => 'w-[250px]', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }
}
