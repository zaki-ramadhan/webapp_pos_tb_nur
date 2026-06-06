<?php

declare(strict_types=1);

namespace App\Support\Presentation\Blueprints;

final class SalesPageBlueprint
{
    public static function salesOrderPage(): array
    {
        return self::buildSalesTransactionPage('sales-order-create', 'salesOrder');
    }

    public static function salesQuotePage(): array
    {
        return self::buildSalesTransactionPage('sales-quote-create', 'salesQuote');
    }

    public static function salesDepositPage(): array
    {
        return self::buildSalesTransactionPage('sales-deposit-create', 'salesDeposit');
    }

    public static function salesReceiptPage(): array
    {
        return self::buildSalesTransactionPage('sales-receipt-create', 'salesReceipt');
    }

    public static function salesDeliveryPage(): array
    {
        return self::buildSalesTransactionPage('sales-delivery-create', 'salesDelivery');
    }

    public static function salesInvoicePage(): array
    {
        return [
            ...self::buildSalesTransactionPage('sales-invoice-create', 'salesInvoice'),
        ];
    }

    public static function customerCategoryPage(): array
    {
        return [
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
        ];
    }

    public static function salesCategoryPage(): array
    {
        return [
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
        ];
    }

    public static function priceAdjustmentPage(): array
    {
        return [
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
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'effectiveDate', 'label' => 'Mulai Berlaku', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'salesCategory', 'label' => 'Kategori Penjualan', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[35%]'],
                        ['id' => 'adjustmentType', 'label' => 'Tipe Penyesuaian', 'widthClassName' => 'w-[21%]'],
                    ],
                    'rows' => [],
                ],
            ],
        ];
    }

    public static function salesCommissionPage(): array
    {
        return [
            'subtab' => [
                'id' => 'sales-commission-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'salesCommission' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'formTabs' => [
                    ['id' => 'commission', 'label' => 'Komisi Penjual'],
                    ['id' => 'others', 'label' => 'Lain-lain'],
                ],
                'labels' => [
                    'period' => 'Komisi Berlaku',
                    'name' => 'Nama perhitungan komisi',
                    'salespeople' => 'Berlaku ke Tenaga Penjual',
                    'order' => 'Diberikan pada penjual urutan (Urutan input penjual di faktur)',
                    'productScope' => 'Komisi berlaku untuk barang',
                    'supplierScope' => 'Dari pemasok utama',
                    'condition' => 'Dengan syarat perhitungan',
                    'reward' => 'Akan mendapat komisi',
                    'notes' => 'Catatan',
                    'inactive' => 'Non Aktif',
                ],
                'periodOptions' => [
                    ['id' => 'forever', 'label' => 'Selamanya'],
                    ['id' => 'period', 'label' => 'Periode Tertentu'],
                ],
                'salespeopleOptions' => [
                    ['id' => 'all', 'label' => 'Semua'],
                    ['id' => 'specific', 'label' => 'Tertentu'],
                ],
                'orderOptions' => [
                    ['id' => 'first', 'label' => 'Pertama'],
                    ['id' => 'second', 'label' => 'Kedua'],
                    ['id' => 'third', 'label' => 'Ketiga'],
                    ['id' => 'fourth', 'label' => 'Keempat'],
                    ['id' => 'fifth', 'label' => 'Kelima'],
                ],
                'productScopeOptions' => ['Semua Barang'],
                'supplierScopeOptions' => ['Semua Pemasok'],
                'conditionOptions' => [
                    'none' => 'Tanpa batasan dan syarat',
                    'salesRange' => 'Nilai Penjualan antara',
                    'quantityRange' => 'Kuantitas penjualan antara',
                    'quantityUnit' => 'Kuantitas terjual per',
                ],
                'conditionUnitLabel' => 'Unit (Berlaku kelipatan)',
                'rewardTypeOptions' => ['Persentase'],
                'rewardMiddleLabel' => '% dari',
                'rewardBaseOptions' => ['Nilai Penjualan'],
                'inactiveLabel' => 'Ya',
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    ['id' => 'delete', 'label' => 'Hapus', 'icon' => 'trash', 'tone' => 'danger'],
                ],
                'draft' => [
                    'periodType' => 'forever',
                    'name' => '',
                    'sellerScope' => 'all',
                    'orderSelections' => ['first'],
                    'productScope' => 'Semua Barang',
                    'supplierScope' => 'Semua Pemasok',
                    'conditionType' => 'none',
                    'salesValueFrom' => '',
                    'salesValueTo' => '',
                    'quantityFrom' => '',
                    'quantityTo' => '',
                    'quantityUnit' => '',
                    'rewardType' => 'Persentase',
                    'rewardValue' => '',
                    'rewardBase' => 'Nilai Penjualan',
                    'notes' => '',
                    'inactive' => false,
                ],
                'table' => [
                    'createLabel' => 'Tambah Komisi Penjual',
                    'refreshLabel' => 'Muat ulang',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '1',
                    'columns' => [
                        ['id' => 'notes', 'label' => 'Catatan', 'widthClassName' => 'w-[42%]'],
                        ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'periodLabel', 'label' => 'Periode Berlaku', 'widthClassName' => 'w-[40%]'],
                    ],
                    'rows' => [
                        [
                            'id' => 'sales-commission-komisi-team',
                            'name' => 'Komisi Team',
                            'periodLabel' => 'Selamanya',
                            'notes' => '',
                            'periodType' => 'forever',
                            'sellerScope' => 'all',
                            'orderSelections' => ['first', 'second', 'third', 'fourth', 'fifth'],
                            'productScope' => 'Semua Barang',
                            'supplierScope' => 'Semua Pemasok',
                            'conditionType' => 'none',
                            'salesValueFrom' => '',
                            'salesValueTo' => '',
                            'quantityFrom' => '',
                            'quantityTo' => '',
                            'quantityUnit' => '',
                            'rewardType' => 'Persentase',
                            'rewardValue' => '7',
                            'rewardBase' => 'Nilai Penjualan',
                            'inactive' => false,
                        ],
                    ],
                ],
            ],
        ];
    }

    public static function salesTargetPage(): array
    {
        return [
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
        ];
    }

    public static function salesCheckinPage(): array
    {
        return [
            'table' => [
                'refreshLabel' => 'Muat ulang',
                'settingsLabel' => 'Pengaturan tabel',
                'filterButtonLabel' => 'Filter lanjutan',
                'searchPlaceholder' => 'Cari...',
                'searchWidthClassName' => 'sm:w-[342px]',
                'pageValue' => '6',
                'tableClassName' => 'min-w-[1320px]',
                'searchKeys' => ['dateLabel', 'number', 'customerName', 'salesName', 'transactionName'],
                'filters' => [
                    [
                        'id' => 'date',
                        'rowKey' => 'dateFilter',
                        'options' => [
                            ['value' => 'all', 'label' => 'Tanggal: Semua'],
                            ['value' => '2026-04-28', 'label' => 'Tanggal: 28/04/2026'],
                            ['value' => '2026-04-27', 'label' => 'Tanggal: 27/04/2026'],
                        ],
                    ],
                    [
                        'id' => 'sales',
                        'rowKey' => 'salesFilter',
                        'options' => [
                            ['value' => 'all', 'label' => 'Sales: Semua'],
                            ['value' => 'adam-pratama', 'label' => 'Sales: Adam Pratama'],
                            ['value' => 'jhonni-haris', 'label' => 'Sales: Jhonni Haris'],
                            ['value' => 'nur-aulia', 'label' => 'Sales: Nur Aulia'],
                        ],
                    ],
                ],
                'columns' => [
                    ['id' => 'dateLabel', 'label' => 'Tanggal', 'widthClassName' => 'w-[18%]'],
                    ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[30%]'],
                    ['id' => 'customerName', 'label' => 'Nama Pelanggan (Saat Check In)', 'widthClassName' => 'w-[26%]'],
                    ['id' => 'salesName', 'label' => 'Sales', 'widthClassName' => 'w-[12%]'],
                    ['id' => 'transactionName', 'label' => 'Transaksi', 'widthClassName' => 'w-[14%]'],
                ],
                'rows' => [
                    [
                        'id' => 'sales-checkin-1',
                        'dateLabel' => '28/04/2026 09:10',
                        'number' => 'CI.2026.04.00018',
                        'customerName' => 'PT Sumber Retail Nusantara',
                        'salesName' => 'Adam Pratama',
                        'transactionName' => 'Pesanan Penjualan',
                        'dateFilter' => '2026-04-28',
                        'salesFilter' => 'adam-pratama',
                    ],
                    [
                        'id' => 'sales-checkin-2',
                        'dateLabel' => '28/04/2026 10:24',
                        'number' => 'CI.2026.04.00019',
                        'customerName' => 'CV Mitra Karya Abadi',
                        'salesName' => 'Jhonni Haris',
                        'transactionName' => 'Faktur Penjualan',
                        'dateFilter' => '2026-04-28',
                        'salesFilter' => 'jhonni-haris',
                    ],
                    [
                        'id' => 'sales-checkin-3',
                        'dateLabel' => '28/04/2026 13:42',
                        'number' => 'CI.2026.04.00020',
                        'customerName' => 'Toko Sentosa Elektronik',
                        'salesName' => 'Nur Aulia',
                        'transactionName' => 'Penawaran Penjualan',
                        'dateFilter' => '2026-04-28',
                        'salesFilter' => 'nur-aulia',
                    ],
                    [
                        'id' => 'sales-checkin-4',
                        'dateLabel' => '27/04/2026 16:08',
                        'number' => 'CI.2026.04.00017',
                        'customerName' => 'PT Arta Boga Sejahtera',
                        'salesName' => 'Adam Pratama',
                        'transactionName' => 'Pesanan Penjualan',
                        'dateFilter' => '2026-04-27',
                        'salesFilter' => 'adam-pratama',
                    ],
                    [
                        'id' => 'sales-checkin-5',
                        'dateLabel' => '27/04/2026 11:55',
                        'number' => 'CI.2026.04.00016',
                        'customerName' => 'UD Makmur Jaya',
                        'salesName' => 'Jhonni Haris',
                        'transactionName' => 'Retur Penjualan',
                        'dateFilter' => '2026-04-27',
                        'salesFilter' => 'jhonni-haris',
                    ],
                    [
                        'id' => 'sales-checkin-6',
                        'dateLabel' => '27/04/2026 09:18',
                        'number' => 'CI.2026.04.00015',
                        'customerName' => 'PT Graha Niaga Mandiri',
                        'salesName' => 'Nur Aulia',
                        'transactionName' => 'Penerimaan Penjualan',
                        'dateFilter' => '2026-04-27',
                        'salesFilter' => 'nur-aulia',
                    ],
                ],
                'emptyLabel' => 'Belum ada data',
            ],
        ];
    }

    public static function buildSalesTransactionPage(string $subtabId, string $configKey): array
    {
        return [
            'subtab' => [
                'id' => $subtabId,
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            $configKey => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    public static function salesTransactionTopActions(): array
    {
        return [
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
        ];
    }
}
