<?php

declare(strict_types=1);

namespace App\Support\Presentation\Blueprints;

final class PurchasePageBlueprint
{
    public static function purchaseInvoicePage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-invoice-create', 'purchaseInvoice'),
        ];
    }

    public static function purchaseDepositPage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-deposit-create', 'purchaseDeposit'),
        ];
    }

    public static function purchasePaymentPage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-payment-create', 'purchasePayment'),
        ];
    }

    public static function purchaseReturnPage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-return-create', 'purchaseReturn'),
        ];
    }

    public static function supplierPricePage(): array
    {
        return [
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
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'effectiveDate', 'label' => 'Mulai Berlaku', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'notes', 'label' => 'Keterangan'],
                        ['id' => 'endDate', 'label' => 'Tanggal Berakhir', 'widthClassName' => 'w-[18%]'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    public static function supplierCategoryPage(): array
    {
        return [
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
        ];
    }

    public static function paymentOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'payment-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'paymentOrder' => [
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
                    'transferDueDate' => 'Tgl Batas Transfer',
                    'paymentMethod' => 'Metode Bayar',
                    'documentNumber' => 'No Bukti #',
                    'notes' => 'Keterangan',
                    'branch' => 'Cabang',
                ],
                'numberingOptions' => ['Perintah Pembayaran'],
                'paymentMethodOptions' => ['Transfer Bank'],
                'branchPlaceholder' => 'Cari/Pilih...',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Faktur', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'invoiceSearchPlaceholder' => 'Cari/Pilih...',
                'takeButtonLabel' => 'Ambil',
                'invoiceSectionTitle' => 'Faktur',
                'additionalInfoTitle' => 'Info lainnya',
                'footerLabel' => 'Faktur Dibayar',
                'dockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'muted', 'icon' => 'save'],
                    ['id' => 'document', 'label' => 'Dokumen', 'tone' => 'secondary', 'icon' => 'document'],
                ],
                'draft' => [
                    'transferDueDate' => '28/04/2026',
                    'paymentMethod' => 'Transfer Bank',
                    'autoNumber' => true,
                    'numberingType' => 'Perintah Pembayaran',
                    'invoiceSearch' => '',
                    'notes' => '',
                    'branches' => ['JAKARTA'],
                    'footerValue' => '0',
                ],
                'invoiceTable' => [
                    'columns' => [
                        ['id' => 'invoiceNumber', 'label' => 'No.Faktur', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'invoiceDate', 'label' => 'Tgl.Faktur', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'invoiceTotal', 'label' => 'Total Faktur', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                        ['id' => 'balance', 'label' => 'Terutang', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                        ['id' => 'paid', 'label' => 'Bayar', 'widthClassName' => 'w-[10%]', 'align' => 'right'],
                        ['id' => 'discount', 'label' => 'Diskon', 'widthClassName' => 'w-[10%]', 'align' => 'right'],
                        ['id' => 'payment', 'label' => 'Pembayaran', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'supplier', 'label' => 'Nama Pemasok', 'widthClassName' => 'w-[20%]'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Perintah Pembayaran',
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
                            'id' => 'status',
                            'rowKey' => 'statusFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Status: Semua'],
                            ],
                        ],
                    ],
                    'settingsItems' => [
                        ['id' => 'payment-order-columns', 'label' => 'Atur kolom'],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'notes', 'label' => 'Keterangan'],
                        ['id' => 'bank', 'label' => 'Bank', 'widthClassName' => 'w-[20%]'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[12%]'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    public static function goodsReceiptPage(): array
    {
        return [
            'subtab' => [
                'id' => 'goods-receipt-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'goodsReceipt' => [
                'topActions' => self::salesTransactionTopActions(),
                'customerPlaceholder' => 'Cari/Pilih Pemasok...',
                'customerSearchLabel' => 'Cari pemasok',
                'labels' => [
                    'customer' => 'Terima dari',
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'No Form #',
                    'paymentTerms' => 'Syarat Pembayaran',
                    'purchaseOrderNumber' => 'No Terima #',
                    'address' => 'Alamat',
                    'branch' => 'Cabang',
                    'notes' => 'Keterangan',
                    'shippingDate' => 'Tgl Kirim',
                    'shippingMethod' => 'Pengiriman',
                    'fob' => 'FOB',
                ],
                'numberingOptions' => ['Penerimaan Barang'],
                'secondaryActionLabel' => 'Faktur',
                'showPaymentTerms' => false,
                'showPurchaseOrderNumber' => false,
                'showTaxInfo' => false,
                'showShippingInfo' => true,
                'showExtraInfo' => false,
                'showFobInShippingInfo' => true,
                'showFooter' => false,
                'headerTextField' => [
                    'label' => 'No Terima #',
                    'valueKey' => 'receiptNumber',
                    'required' => true,
                ],
                'itemModal' => [
                    'enabled' => true,
                ],
                'table' => [
                    'createLabel' => 'Tambah Penerimaan Barang',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'receiptNumber', 'label' => 'No Terima #', 'widthClassName' => 'w-[180px]', 'align' => 'left'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]', 'align' => 'left'],
                        ['id' => 'customer', 'label' => 'Pemasok', 'widthClassName' => 'w-[190px]', 'align' => 'left'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[44%]', 'align' => 'left'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[170px]', 'align' => 'left'],
                    ],
                    'rows' => [
                        ['id' => 'RI.2017.01.00002', 'number' => 'RI.2017.01.00002', 'receiptNumber' => 'SJGP-34217', 'date' => '10/01/2017', 'customer' => 'CV Ganda Putra', 'notes' => '', 'status' => 'Difaktur'],
                        ['id' => 'RI.2017.01.00001', 'number' => 'RI.2017.01.00001', 'receiptNumber' => 'SJAPL-409317', 'date' => '05/01/2017', 'customer' => 'Applus', 'notes' => '', 'status' => 'Difaktur Sebagian'],
                        ['id' => 'RI.2016.10.00004', 'number' => 'RI.2016.10.00004', 'receiptNumber' => 'TMM SJ 852456', 'date' => '20/10/2016', 'customer' => 'Toko Mega Mendung', 'notes' => '', 'status' => 'Difaktur'],
                        ['id' => 'RI.2016.10.00003', 'number' => 'RI.2016.10.00003', 'receiptNumber' => 'TSS RI 7895', 'date' => '11/10/2016', 'customer' => 'Toko Samudra Sparepart', 'notes' => 'stock barang di Toko Samudra Sparepart kosong jadi dikirim hanya sebagian saja.', 'status' => 'Difaktur Sebagian'],
                        ['id' => 'RI.2016.10.00002', 'number' => 'RI.2016.10.00002', 'receiptNumber' => 'SAM 20161007015', 'date' => '07/10/2016', 'customer' => 'SAMSANG', 'notes' => '', 'status' => 'Difaktur'],
                        ['id' => 'RI.2016.10.00001', 'number' => 'RI.2016.10.00001', 'receiptNumber' => 'RI 061016001', 'date' => '06/10/2016', 'customer' => 'PT Selaras Inti', 'notes' => '', 'status' => 'Difaktur'],
                    ],
                    'filters' => [
                        ['id' => 'date', 'rowKey' => 'date', 'options' => [['value' => 'all', 'label' => 'Tanggal: Semua'], ['value' => '10/01/2017', 'label' => 'Tanggal: 10/01/2017']]],
                        ['id' => 'status', 'rowKey' => 'status', 'options' => [['value' => 'all', 'label' => 'Status: Semua'], ['value' => 'Difaktur', 'label' => 'Status: Difaktur'], ['value' => 'Difaktur Sebagian', 'label' => 'Status: Difaktur Sebagian']]],
                        ['id' => 'customer', 'rowKey' => 'customer', 'options' => [['value' => 'all', 'label' => 'Terima dari: Semua'], ['value' => 'CV Ganda Putra', 'label' => 'Terima dari: CV Ganda Putra'], ['value' => 'Applus', 'label' => 'Terima dari: Applus']]],
                    ],
                    'downloadItems' => [],
                    'printItems' => [['id' => 'print-list', 'label' => 'Cetak daftar penerimaan barang']],
                    'settingsItems' => [['id' => 'arrange-columns', 'label' => 'Atur kolom']],
                ],
                'itemTable' => [
                    'columns' => [
                        ['id' => 'spacer', 'label' => '', 'kind' => 'spacer', 'widthClassName' => 'w-[38px]', 'align' => 'center'],
                        ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[70%]', 'align' => 'left'],
                        ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[130px]', 'align' => 'center'],
                        ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[110px]', 'align' => 'right'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[92px]', 'align' => 'center'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                    'minWidthClassName' => 'min-w-[880px]',
                ],
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Barang', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'draft' => [
                    'customer' => [],
                    'entryDate' => '28/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Penerimaan Barang',
                    'documentNumber' => '',
                    'currency' => '',
                    'receiptNumber' => '',
                    'itemSearch' => '',
                    'items' => [
                        ['id' => 'goods-receipt-draft-item-1', 'name' => 'Adaptor Fast Charging 20W', 'code' => 'AC2001', 'quantity' => '24', 'unit' => 'PCS'],
                        ['id' => 'goods-receipt-draft-item-2', 'name' => 'Type-C Cable Premium', 'code' => 'TC3004', 'quantity' => '16', 'unit' => 'PCS'],
                    ],
                    'itemCountLabel' => '2 Barang (40)',
                    'address' => '',
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'shippingDate' => '28/04/2026',
                    'shippingMethod' => [],
                    'fob' => [],
                    'showSecondaryHeaderAction' => true,
                    'showProcessButton' => false,
                    'processDisabled' => false,
                    'subtotal' => '0',
                    'discountValue' => '0',
                    'discountPrefix' => '',
                    'taxLabel' => '',
                    'taxValue' => '',
                    'total' => '0',
                    'itemModal' => [
                        'title' => 'Rincian Barang',
                        'tabs' => [
                            ['id' => 'details', 'label' => 'Rincian Barang'],
                            ['id' => 'info', 'label' => 'Info lainnya'],
                        ],
                        'values' => [
                            'code' => 'AC2001',
                            'name' => 'Adaptor Fast Charging 20W',
                            'quantity' => '24',
                            'unit' => ['PCS'],
                            'warehouse' => ['GD. JAKARTA'],
                            'department' => [],
                            'notes' => 'Contoh item penerimaan barang.',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'RI.2017.01.00002' => [
                        'customer' => ['[VJKT-0008] CV Ganda Putra'],
                        'entryDate' => '10/01/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Penerimaan Barang',
                        'documentNumber' => 'RI.2017.01.00002',
                        'currency' => 'IDR',
                        'receiptNumber' => 'SJGP-34217',
                        'itemSearch' => '',
                        'items' => [
                            ['id' => 'RI.2017.01.00002-item-1', 'name' => 'Xiaomi Mi4s', 'code' => '1300003', 'quantity' => '154', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-2', 'name' => 'Xiaomi Mi5', 'code' => '1300002', 'quantity' => '165', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-3', 'name' => 'Xiaomi Note Pro', 'code' => '1300005', 'quantity' => '106', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-4', 'name' => 'Xiaomi Redmi 3', 'code' => '1300001', 'quantity' => '108', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-5', 'name' => 'Xiaomi Redmi Note 3', 'code' => '1300004', 'quantity' => '100', 'unit' => 'PCS'],
                        ],
                        'itemCountLabel' => '5 Barang (633)',
                        'address' => '',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'shippingDate' => '10/01/2017',
                        'shippingMethod' => [],
                        'fob' => [],
                        'showSecondaryHeaderAction' => false,
                        'showProcessButton' => false,
                        'processDisabled' => false,
                        'subtotal' => '0',
                        'discountValue' => '0',
                        'discountPrefix' => '',
                        'taxLabel' => '',
                        'taxValue' => '',
                        'total' => '0',
                        'itemModal' => [
                            'title' => 'Rincian Barang',
                            'tabs' => [
                                ['id' => 'details', 'label' => 'Rincian Barang'],
                                ['id' => 'info', 'label' => 'Info lainnya'],
                            ],
                            'values' => [
                                'code' => '1300003',
                                'name' => 'Xiaomi Mi4s',
                                'quantity' => '154',
                                'unit' => ['PCS'],
                                'warehouse' => ['GD. JAKARTA'],
                                'department' => [],
                                'notes' => 'Batch penerimaan awal dari pemasok utama.',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    public static function itemRequestPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-request-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemRequest' => [
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

    public static function stockTransferPage(): array
    {
        return [
            'subtab' => [
                'id' => 'stock-transfer-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockTransfer' => [
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

    public static function purchaseOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'purchase-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'purchaseOrder' => [
                'topActions' => self::salesTransactionTopActions(),
                'customerPlaceholder' => 'Cari/Pilih Pemasok...',
                'customerSearchLabel' => 'Cari pemasok',
                'labels' => [
                    'customer' => 'Pemasok',
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'Nomor #',
                    'paymentTerms' => 'Syarat Pembayaran',
                    'purchaseOrderNumber' => 'No. PO',
                    'address' => 'Alamat Kirim',
                    'branch' => 'Cabang',
                    'notes' => 'Keterangan',
                    'tax' => 'Pajak',
                    'shippingDate' => 'Tgl Pengiriman',
                    'shippingMethod' => 'Pengiriman',
                    'fob' => 'FOB',
                    'exchangeRate' => 'Kurs',
                ],
                'numberingOptions' => ['Pesanan Pembelian'],
                'showAddressPinButton' => true,
                'showPurchaseOrderNumber' => false,
                'itemModal' => [
                    'enabled' => true,
                ],
                'table' => [
                    'createLabel' => 'Tambah Pesanan Pembelian',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '11',
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]', 'align' => 'left'],
                        ['id' => 'customerShort', 'label' => 'Pemasok', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[48%]', 'align' => 'left'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[170px]', 'align' => 'left'],
                        ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => 'PO.2017.01.00002', 'number' => 'PO.2017.01.00002', 'date' => '12/01/2017', 'customer' => 'Applus', 'customerShort' => 'Applus', 'notes' => '', 'status' => 'Terproses', 'total' => '214,569', 'printedStatus' => 'all'],
                        ['id' => 'PO.2017.01.00003', 'number' => 'PO.2017.01.00003', 'date' => '08/01/2017', 'customer' => 'CV Ganda Putra', 'customerShort' => 'CV Ganda Putra', 'notes' => '', 'status' => 'Terproses', 'total' => '2,259,860,000', 'printedStatus' => 'all'],
                        ['id' => 'PO.2017.01.00001', 'number' => 'PO.2017.01.00001', 'date' => '01/01/2017', 'customer' => 'Applus', 'customerShort' => 'Applus', 'notes' => '', 'status' => 'Terproses', 'total' => '177,632', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.11.00001', 'number' => 'PO.2016.11.00001', 'date' => '15/11/2016', 'customer' => 'Toko Mega Mendung', 'customerShort' => 'Toko Mega Mendung', 'notes' => '', 'status' => 'Terproses', 'total' => '4,165,417,500', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00007', 'number' => 'PO.2016.10.00007', 'date' => '19/10/2016', 'customer' => 'Applus', 'customerShort' => 'Applus', 'notes' => '', 'status' => 'Terproses', 'total' => '19,452,500', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00006', 'number' => 'PO.2016.10.00006', 'date' => '17/10/2016', 'customer' => 'Toko Mega Mendung', 'customerShort' => 'Toko Mega Mendung', 'notes' => '', 'status' => 'Terproses', 'total' => '8,360,000', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00005', 'number' => 'PO.2016.10.00005', 'date' => '12/10/2016', 'customer' => 'Toko Berkat Cell', 'customerShort' => 'Toko Berkat Cell', 'notes' => '', 'status' => 'Menunggu diproses', 'total' => '2,612,500', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00004', 'number' => 'PO.2016.10.00004', 'date' => '11/10/2016', 'customer' => 'Toko Samudra Sparepart', 'customerShort' => 'Toko Samudra Sparepart', 'notes' => 'Karena ada permintaan perbaikan HP untuk speaker dan permintaan penjualan dimohon segera di proses.', 'status' => 'Sebagian diproses', 'total' => '16,720,000', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00003', 'number' => 'PO.2016.10.00003', 'date' => '10/10/2016', 'customer' => 'Beautiful Cellular', 'customerShort' => 'Beautiful Cellular', 'notes' => '', 'status' => 'Ditutup', 'total' => '3,814,250', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00002', 'number' => 'PO.2016.10.00002', 'date' => '05/10/2016', 'customer' => 'SAMSANG', 'customerShort' => 'SAMSANG', 'notes' => '', 'status' => 'Terproses', 'total' => '3,548', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00001', 'number' => 'PO.2016.10.00001', 'date' => '04/10/2016', 'customer' => 'PT Selaras Inti', 'customerShort' => 'PT Selaras Inti', 'notes' => 'Dibutuhkan segera karena banyak pesanan untuk Item yang Di PO kan', 'status' => 'Terproses', 'total' => '55,123,750', 'printedStatus' => 'all'],
                    ],
                    'filters' => [
                        ['id' => 'date', 'rowKey' => 'date', 'options' => [['value' => 'all', 'label' => 'Tanggal: Semua'], ['value' => '12/01/2017', 'label' => 'Tanggal: 12/01/2017']]],
                        ['id' => 'customer', 'rowKey' => 'customer', 'options' => [['value' => 'all', 'label' => 'Pemasok: Semua'], ['value' => 'Applus', 'label' => 'Pemasok: Applus'], ['value' => 'Toko Mega Mendung', 'label' => 'Pemasok: Toko Mega Mendung']]],
                        ['id' => 'status', 'rowKey' => 'status', 'options' => [['value' => 'all', 'label' => 'Status: Semua'], ['value' => 'Terproses', 'label' => 'Status: Terproses'], ['value' => 'Menunggu diproses', 'label' => 'Status: Menunggu diproses'], ['value' => 'Sebagian diproses', 'label' => 'Status: Sebagian diproses'], ['value' => 'Ditutup', 'label' => 'Status: Ditutup']]],
                    ],
                    'downloadItems' => [['id' => 'download-excel', 'label' => 'Unduh Excel']],
                    'printItems' => [['id' => 'print-list', 'label' => 'Cetak daftar pesanan pembelian']],
                    'settingsItems' => [['id' => 'arrange-columns', 'label' => 'Atur kolom']],
                ],
                'costTable' => [
                    'columns' => [
                        ['id' => 'spacer', 'label' => '', 'kind' => 'spacer', 'widthClassName' => 'w-[38px]', 'align' => 'center'],
                        ['id' => 'name', 'label' => 'Nama Biaya', 'widthClassName' => 'w-[58%]', 'align' => 'left'],
                        ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[120px]', 'align' => 'center'],
                        ['id' => 'amount', 'label' => 'Jumlah', 'widthClassName' => 'w-[120px]', 'align' => 'right'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[22%]', 'align' => 'left'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'draft' => [
                    'customer' => [],
                    'entryDate' => '28/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Pesanan Pembelian',
                    'documentNumber' => '',
                    'currency' => '',
                    'exchangeRate' => '',
                    'exchangeRateLabel' => '',
                    'exchangeRatePrefix' => 'Rp',
                    'itemSearch' => '',
                    'items' => [
                        ['id' => 'purchase-order-draft-item-1', 'name' => 'Adaptor Fast Charging 20W', 'code' => 'AC2001', 'quantity' => '50', 'unit' => 'PCS', 'price' => '65,000', 'discount' => '0', 'total' => '3,250,000'],
                    ],
                    'itemCountLabel' => '1 Barang (50)',
                    'paymentTerms' => [],
                    'purchaseOrderNumber' => '',
                    'address' => '',
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'taxEnabled' => false,
                    'taxIncluded' => false,
                    'shippingDate' => '28/04/2026',
                    'shippingMethod' => [],
                    'fob' => [],
                    'costSearch' => '',
                    'additionalCosts' => [
                        ['id' => 'purchase-order-draft-cost-1', 'name' => 'Biaya Pengiriman', 'code' => 'ONGKIR', 'amount' => '150,000', 'notes' => 'Estimasi pengiriman awal'],
                    ],
                    'summary' => [
                        ['Total', 'Rp 3,400,000'],
                        ['Status', 'Menunggu diproses'],
                        ['Dicetak/email', 'Belum cetak/email'],
                    ],
                    'processedBy' => null,
                    'approvalStamp' => '',
                    'processStamp' => '',
                    'showProcessButton' => false,
                    'processDisabled' => false,
                    'subtotal' => 'Rp 3,250,000',
                    'discountValue' => '0',
                    'discountPrefix' => 'Rp',
                    'taxLabel' => '',
                    'taxValue' => '',
                    'total' => 'Rp 3,400,000',
                    'itemModal' => [
                        'title' => 'Rincian Barang',
                        'tabs' => [
                            ['id' => 'details', 'label' => 'Rincian Barang'],
                            ['id' => 'info', 'label' => 'Info lainnya'],
                        ],
                        'values' => [
                            'code' => 'AC2001',
                            'name' => 'Adaptor Fast Charging 20W',
                            'quantity' => '50',
                            'unit' => ['PCS'],
                            'price' => '65,000',
                            'discountPercent' => '',
                            'discountValue' => '0',
                            'total' => 'Rp 3,250,000',
                            'taxChecked' => false,
                            'taxLabel' => 'PPN 10 %',
                            'warehouse' => ['GD. JAKARTA'],
                            'salesPerson' => [],
                            'department' => [],
                            'notes' => 'Pembelian untuk stok cabang utama.',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'PO.2017.01.00002' => [
                        'customer' => ['[VJKT-0002] Applus'],
                        'entryDate' => '12/01/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Pesanan Pembelian',
                        'documentNumber' => 'PO.2017.01.00002',
                        'currency' => 'USD',
                        'exchangeRate' => '12,560',
                        'exchangeRateLabel' => '1 USD=XXX IDR',
                        'exchangeRatePrefix' => 'Rp',
                        'itemSearch' => '',
                        'items' => [
                            ['id' => 'PO.2017.01.00002-item-1', 'name' => 'Iphone 6 S Plus 32 GB', 'code' => '6316001', 'quantity' => '243', 'unit' => 'PCS', 'price' => '883', 'discount' => '0', 'total' => '214,569'],
                        ],
                        'itemCountLabel' => '1 Barang (243)',
                        'paymentTerms' => ['Net 30 Hari'],
                        'purchaseOrderNumber' => '',
                        'address' => '',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'taxEnabled' => false,
                        'taxIncluded' => false,
                        'shippingDate' => '12/01/2017',
                        'shippingMethod' => ['Ekspedisi Internal'],
                        'fob' => ['Gudang Supplier'],
                        'costSearch' => '',
                        'additionalCosts' => [
                            ['id' => 'PO.2017.01.00002-cost-1', 'name' => 'Biaya Asuransi', 'code' => 'ASR-01', 'amount' => '850', 'notes' => 'Proteksi pengiriman impor'],
                        ],
                        'summary' => [
                            ['Total', '$ 214,569'],
                            ['Status', 'Terproses'],
                            ['Dicetak/email', 'Belum cetak/email'],
                        ],
                        'processedBy' => [
                            ['number' => 'PB.2017.01.00004', 'date' => '15/01/2017'],
                        ],
                        'approvalStamp' => '',
                        'processStamp' => 'TERPROSES',
                        'showProcessButton' => true,
                        'processDisabled' => true,
                        'subtotal' => '$ 214,569',
                        'discountValue' => '0',
                        'discountPrefix' => '$',
                        'taxLabel' => '',
                        'taxValue' => '',
                        'total' => '$ 214,569',
                        'itemModal' => [
                            'title' => 'Rincian Barang',
                            'tabs' => [
                                ['id' => 'details', 'label' => 'Rincian Barang'],
                                ['id' => 'info', 'label' => 'Info lainnya'],
                            ],
                            'values' => [
                                'code' => '6316001',
                                'name' => 'Iphone 6 S Plus 32 GB',
                                'quantity' => '243',
                                'unit' => ['PCS'],
                                'price' => '883',
                                'discountPercent' => '',
                                'discountValue' => '0',
                                'total' => '$ 214,569',
                                'taxChecked' => false,
                                'taxLabel' => 'PPN 10 %',
                                'warehouse' => ['GD. IMPORT'],
                                'salesPerson' => [],
                                'department' => [],
                                'notes' => 'Pembelian impor untuk restock awal tahun.',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function buildSalesTransactionPage(string $subtabId, string $configKey): array
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

    private static function salesTransactionTopActions(): array
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
