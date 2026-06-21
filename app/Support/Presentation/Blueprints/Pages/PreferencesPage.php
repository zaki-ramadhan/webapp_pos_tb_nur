<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PreferencesPage
{
    public static function get(): array
    {
        $attachmentsNotice = [
            'parts' => [
                ['text' => 'Silahkan pilih Menu Transaksi yang '],
                ['text' => 'MEWAJIBKAN', 'emphasis' => true],
                ['text' => ' pengguna menyertakan lampiran saat menyimpan transaksi.'],
            ],
        ];

        return [
            'id' => 'preferences',
            'label' => 'Preferensi',
            'openLoading' => [
                'title' => 'Membuka Preferensi',
                'description' => 'Menyiapkan pengaturan perusahaan dan preferensi database.',
                'durationMs' => 700,
            ],
            'workspace' => [
                'topTab' => 'Perusahaan',
                'defaultSidebarItemId' => 'features',
                'companyTabs' => [
                    ['id' => 'company-info', 'label' => 'Info Perusahaan'],
                    ['id' => 'company-address', 'label' => 'Alamat'],
                ],
                'featureTabs' => self::featureTabs(),
                'taxTabs' => self::taxTabs(),
                'salesTabs' => self::salesTabs(),
                'purchaseTabs' => self::purchaseTabs(),
                'approvalTabs' => self::approvalTabs(),
                'attachmentsTabs' => self::attachmentsTabs($attachmentsNotice),
                'limitationsTabs' => self::limitationsTabs(),
                'othersTabs' => self::othersTabs(),
                'sidebarItems' => [
                    ['id' => 'features', 'label' => 'Fitur'],
                    ['id' => 'tax', 'label' => 'Pajak'],
                    ['id' => 'sales', 'label' => 'Penjualan'],
                    ['id' => 'purchase', 'label' => 'Pembelian'],
                    ['id' => 'limitations', 'label' => 'Pembatasan'],
                    ['id' => 'approval', 'label' => 'Persetujuan'],
                    ['id' => 'attachments', 'label' => 'Lampiran'],
                    ['id' => 'others', 'label' => 'Lain-lain'],
                ],
                'actions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'showLabel' => true,
                    ],
                ],
                'companyInfo' => self::companyInfo(),
                'companyAddress' => self::companyAddress(),
            ],
        ];
    }

    private static function companyInfo(): array
    {
        return [
            ['id' => 'company-name', 'label' => 'Nama', 'type' => 'text', 'value' => 'UD. TB Nur', 'clearable' => true],
            ['id' => 'business-category', 'label' => 'Kategori Usaha', 'type' => 'chip-search', 'value' => 'GROSIR / WHOLESALER'],
            ['id' => 'business-field', 'label' => 'Bidang Usaha', 'type' => 'search', 'placeholder' => 'Cari Bidang Usaha..'],
            ['id' => 'phone', 'label' => 'Telepon', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
            ['id' => 'fax', 'label' => 'Faksimili', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
            ['id' => 'email', 'label' => 'Email', 'type' => 'text', 'value' => 'admin@tbnur.com', 'clearable' => true],
            ['id' => 'start-date', 'label' => 'Tgl Mulai Data', 'type' => 'date', 'value' => '01/06/2025'],
            ['id' => 'accounting-period', 'label' => 'Periode Akuntansi', 'type' => 'select', 'value' => 'Januari - Desember', 'options' => [
                'Januari - Desember',
                'Februari - Januari',
                'Maret - Februari',
                'April - Maret',
                'Mei - April',
                'Juni - Mei',
                'Juli - Juni',
                'Agustus - Juli',
                'September - Agustus',
                'Oktober - September',
                'November - Oktober',
                'Desember - November'
            ]],
            ['id' => 'currency', 'label' => 'Mata Uang', 'type' => 'readonly-edit', 'value' => 'Indonesian Rupiah'],
        ];
    }

    private static function companyAddress(): array
    {
        return [
            'label' => 'Alamat',
            'street' => [
                'id' => 'street',
                'label' => 'Jalan',
                'value' => 'Jl. Tomang raya nomor. 35',
            ],
            'tokens' => [],
            'fields' => [
                ['id' => 'city', 'label' => 'Kota', 'value' => 'Kota Denpasar', 'clearable' => true],
                ['id' => 'province', 'label' => 'Provinsi', 'value' => 'Bali', 'clearable' => true],
                ['id' => 'postal-code', 'label' => 'K.Pos', 'value' => '12345', 'clearable' => true],
                ['id' => 'country', 'label' => 'Negara', 'value' => 'Indonesia', 'clearable' => true],
            ],
        ];
    }

    private static function featureTabs(): array
    {
        return [
            [
                'id' => 'feature-company',
                'label' => 'Perusahaan',
                'sections' => [
                    [
                        'id' => 'basic-features',
                        'title' => 'Fitur Dasar',
                        'icon' => 'settings',
                        'column' => 1,
                        'items' => [
                            ['id' => 'multi-branch', 'label' => 'Multi Cabang', 'checked' => false],
                            ['id' => 'multi-currency', 'label' => 'Multi Mata Uang', 'checked' => false],
                            ['id' => 'tax-feature', 'label' => 'Pajak', 'checked' => true],
                            ['id' => 'approval-feature', 'label' => 'Persetujuan (Approval)', 'checked' => true],
                            ['id' => 'asset-feature', 'label' => 'Pencatatan Aset', 'checked' => true],
                            ['id' => 'budget-feature', 'label' => 'Anggaran dan Target', 'checked' => true],
                        ],
                    ],
                    [
                        'id' => 'inventory-cost-method',
                        'title' => 'Metode Biaya Persediaan',
                        'icon' => 'inventory',
                        'column' => 1,
                        'radioItems' => [
                            ['id' => 'inventory-average', 'label' => 'Rata-rata', 'checked' => false],
                            ['id' => 'inventory-fifo', 'label' => 'FIFO (First In First Out)', 'checked' => true],
                        ],
                    ],
                    [
                        'id' => 'profit-cost-center',
                        'title' => 'Pusat Laba & Biaya',
                        'icon' => 'department',
                        'column' => 2,
                        'items' => [
                            ['id' => 'department-center', 'label' => 'Departemen', 'checked' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'feature-sales',
                'label' => 'Penjualan',
                'sections' => [
                    [
                        'id' => 'sales-features',
                        'title' => 'Penjualan',
                        'icon' => 'sales',
                        'column' => 1,
                        'items' => [
                            ['id' => 'sales-quote-order', 'label' => 'Penawaran dan Pesanan Penjualan', 'checked' => true],
                            ['id' => 'sales-return', 'label' => 'Retur Penjualan', 'checked' => true],
                            ['id' => 'price-adjustment', 'label' => 'Penyesuaian Harga atau Diskon', 'checked' => true],
                            ['id' => 'salesman', 'label' => 'Tenaga Penjual (Salesman)', 'checked' => true],
                        ],
                    ],
                    [
                        'id' => 'sales-misc',
                        'title' => 'Lainnya',
                        'icon' => 'numbering',
                        'column' => 2,
                        'items' => [
                            ['id' => 'delivery-service', 'label' => 'Jasa Pengiriman', 'checked' => true],
                            ['id' => 'payment-terms', 'label' => 'Syarat Pembayaran', 'checked' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'feature-purchase',
                'label' => 'Pembelian',
                'sections' => [
                    [
                        'id' => 'purchase-features',
                        'title' => 'Pembelian',
                        'icon' => 'purchase',
                        'column' => 1,
                        'items' => [
                            ['id' => 'purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => true],
                            ['id' => 'supplier-price-list', 'label' => 'Daftar Harga Pemasok', 'checked' => true],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'feature-inventory',
                'label' => 'Persediaan',
                'sections' => [
                    [
                        'id' => 'inventory-features',
                        'title' => 'Persediaan',
                        'icon' => 'inventory',
                        'column' => 1,
                        'items' => [
                            ['id' => 'item-request', 'label' => 'Permintaan Barang', 'checked' => true],
                            ['id' => 'multi-warehouse', 'label' => 'Multi Gudang', 'checked' => true],
                            ['id' => 'multi-unit', 'label' => 'Multi Satuan Barang', 'checked' => true],
                            ['id' => 'simple-production', 'label' => 'Produksi Sederhana', 'checked' => true],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function taxTabs(): array
    {
        return [
            [
                'id' => 'tax-info-company',
                'label' => 'Info Perusahaan',
                'contentClassName' => 'max-w-[760px]',
                'rows' => [
                    [
                        'id' => 'tax-company-name-row',
                        'type' => 'field',
                        'label' => 'Nama Perusahaan',
                        'controls' => [
                            [
                                'id' => 'tax-company-name',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-pkp-date-row',
                        'type' => 'field',
                        'label' => 'Tgl Pengukuhan PKP',
                        'controls' => [
                            [
                                'id' => 'tax-pkp-date',
                                'type' => 'date',
                                'value' => '31/05/2016',
                                'wrapperClassName' => 'w-full max-w-[236px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-pkp-number-row',
                        'type' => 'field',
                        'label' => 'No Pengukuhan PKP',
                        'controls' => [
                            [
                                'id' => 'tax-pkp-number',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-business-type-row',
                        'type' => 'field',
                        'label' => 'Tipe Usaha',
                        'controls' => [
                            [
                                'id' => 'tax-business-type',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-npwp-row',
                        'type' => 'field',
                        'label' => 'NPWP Perusahaan',
                        'controls' => [
                            [
                                'id' => 'tax-company-npwp',
                                'type' => 'text',
                                'value' => '',
                                'placeholder' => '________________',
                                'inputClassName' => 'tracking-[0.16em]',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-klu-row',
                        'type' => 'field',
                        'label' => 'KLU',
                        'controls' => [
                            [
                                'id' => 'tax-klu',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-nitku-row',
                        'type' => 'field',
                        'label' => 'NITKU',
                        'controls' => [
                            [
                                'id' => 'tax-nitku',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'tax-address',
                'label' => 'Alamat',
                'contentClassName' => 'max-w-[760px]',
                'rows' => [
                    [
                        'id' => 'tax-address-street-row',
                        'type' => 'field',
                        'label' => 'Alamat',
                        'controls' => [
                            [
                                'id' => 'tax-address-street',
                                'type' => 'textarea',
                                'prefix' => 'Jalan',
                                'rows' => 3,
                                'value' => "Jl. Pluit Karang Cantik Blok B4 No.39\nPenjaringan, Jakarta Utara - 14450",
                                'wrapperClassName' => 'w-full max-w-[548px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-address-city-row',
                        'type' => 'field',
                        'label' => '',
                        'controlsClassName' => 'w-full gap-2.5 sm:flex-nowrap',
                        'controls' => [
                            [
                                'id' => 'tax-address-city',
                                'type' => 'text',
                                'prefix' => 'Kota',
                                'value' => 'Jakarta',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[316px]',
                            ],
                            [
                                'id' => 'tax-address-postal-code',
                                'type' => 'text',
                                'prefix' => 'K.Pos',
                                'value' => '14450',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[222px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-address-province-row',
                        'type' => 'field',
                        'label' => '',
                        'controls' => [
                            [
                                'id' => 'tax-address-province',
                                'type' => 'text',
                                'prefix' => 'Provinsi',
                                'value' => 'DKI Jakarta',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[548px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-address-country-row',
                        'type' => 'field',
                        'label' => '',
                        'controls' => [
                            [
                                'id' => 'tax-address-country',
                                'type' => 'text',
                                'prefix' => 'Negara',
                                'value' => 'Indonesia',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[548px]',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'tax-others',
                'label' => 'Lainnya',
                'contentClassName' => 'max-w-[860px]',
                'rows' => [
                    [
                        'id' => 'tax-address-source-row',
                        'type' => 'radio',
                        'label' => "Menggunakan\nalamat",
                        'value' => 'sales-invoice',
                        'optionsClassName' => 'sm:gap-x-12',
                        'options' => [
                            [
                                'value' => 'customer-tax',
                                'label' => 'Pajak Pelanggan',
                            ],
                            [
                                'value' => 'sales-invoice',
                                'label' => 'Faktur Penjualan',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-default-quantity-price-row',
                        'type' => 'single-checkbox',
                        'label' => "Tampilkan Kuantitas\ndan Harga secara\nDefault pada Item\nBarang/Jasa",
                        'showInfo' => true,
                        'option' => [
                            'id' => 'tax-default-quantity-price',
                            'label' => 'Ya',
                            'checked' => false,
                        ],
                    ],
                    [
                        'id' => 'tax-default-dpp-row',
                        'type' => 'single-checkbox',
                        'label' => 'Default DPP 11/12',
                        'showInfo' => true,
                        'option' => [
                            'id' => 'tax-default-dpp',
                            'label' => 'Ya',
                            'checked' => false,
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function salesTabs(): array
    {
        return [
            [
                'id' => 'sales-settings',
                'label' => 'Penjualan',
                'sections' => [
                    [
                        'id' => 'sales-order-section',
                        'title' => 'Pesanan Penjualan',
                        'icon' => 'receipt',
                        'rows' => [
                            [
                                'id' => 'sales-order-auto-close',
                                'type' => 'inline-checkbox',
                                'label' => 'Tutup otomatis',
                                'showInfo' => true,
                                'option' => [
                                    'id' => 'yes',
                                    'label' => 'Ya',
                                    'checked' => false,
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'sales-return-section',
                        'title' => 'Retur Penjualan',
                        'icon' => 'transfer',
                        'rows' => [
                            [
                                'id' => 'sales-return-value-option',
                                'type' => 'radio-group',
                                'label' => 'Opsi Nilai Barang yang di Retur (Nilai pengembalian yang dijurnal)',
                                'value' => 'latest-cost',
                                'options' => [
                                    [
                                        'value' => 'latest-cost',
                                        'label' => 'Harga Beli/Biaya masuk terakhir',
                                    ],
                                    [
                                        'value' => 'invoice-cost',
                                        'label' => 'BPP Faktur Penjualan',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'sales-return-no-item-option',
                                'type' => 'radio-group',
                                'label' => 'Opsi Jika barang TIDAK dikembalikan saat Retur',
                                'value' => 'hpp-account',
                                'options' => [
                                    [
                                        'value' => 'hpp-account',
                                        'label' => 'Dibebankan ke akun HPP barang',
                                    ],
                                    [
                                        'value' => 'custom-account',
                                        'label' => 'Dibebankan ke akun',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'sales-return-custom-account-row',
                                'type' => 'field',
                                'label' => 'Akun Beban Retur',
                                'control' => [
                                    'id' => 'sales-return-custom-account',
                                    'type' => 'lookup',
                                    'value' => '[511.000-01] Beban Retur Penjualan',
                                    'clearable' => true,
                                    'placeholder' => 'Cari/Pilih Akun Perkiraan...',
                                ],
                                'widthClassName' => 'max-w-[420px]',
                            ],
                            [
                                'id' => 'sales-return-update-cost',
                                'type' => 'single-checkbox',
                                'option' => [
                                    'id' => 'update-cost',
                                    'label' => 'Perbarui biaya barang saat simpan ulang Retur Penjualan',
                                    'checked' => false,
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'sales-customer-section',
                        'title' => 'Pelanggan',
                        'icon' => 'customer',
                        'rows' => [
                            [
                                'id' => 'sales-customer-tax-default',
                                'type' => 'single-checkbox',
                                'option' => [
                                    'id' => 'customer-tax-default',
                                    'label' => 'Pelanggan baru selalu termasuk pajak',
                                    'checked' => false,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function purchaseTabs(): array
    {
        return [
            [
                'id' => 'purchase-settings',
                'label' => 'Pembelian',
                'sections' => [
                    [
                        'id' => 'purchase-order-section',
                        'title' => 'Pesanan Pembelian',
                        'icon' => 'purchase',
                        'rows' => [
                            [
                                'id' => 'purchase-order-auto-close',
                                'type' => 'inline-checkbox',
                                'label' => 'Tutup otomatis',
                                'showInfo' => true,
                                'option' => [
                                    'id' => 'yes',
                                    'label' => 'Ya',
                                    'checked' => false,
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'purchase-receipt-section',
                        'title' => 'Penerimaan Barang',
                        'icon' => 'receipt',
                        'rows' => [
                            [
                                'id' => 'purchase-receipt-description',
                                'type' => 'description',
                                'label' => 'Biaya Penerimaan Barang akan di update oleh Tagihan dengan pilihan berikut',
                            ],
                            [
                                'id' => 'purchase-receipt-cost-option',
                                'type' => 'radio-group',
                                'value' => 'first-bill-same-period',
                                'options' => [
                                    [
                                        'value' => 'updated-by-bill',
                                        'label' => 'Diperbarui oleh Tagihan',
                                    ],
                                    [
                                        'value' => 'not-updated-by-bill',
                                        'label' => 'Tidak diperbarui oleh Tagihan',
                                    ],
                                    [
                                        'value' => 'first-bill-same-period',
                                        'label' => 'Diperbarui jika tanggal tagihan pertama dalam periode yang sama dengan penerimaan barang',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'purchase-receipt-unbilled-account',
                                'type' => 'lookup-block',
                                'label' => 'Akun selisih pembelian belum tertagih',
                                'control' => [
                                    'value' => '[511.000-06] Beban Selisih Pembelian Barang',
                                    'clearable' => true,
                                ],
                                'widthClassName' => 'max-w-[480px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'purchase-invoice-section',
                        'title' => 'Faktur Pembelian',
                        'icon' => 'invoice',
                        'rows' => [
                            [
                                'id' => 'purchase-asset-account',
                                'type' => 'field',
                                'label' => 'Pembelian Asset',
                                'control' => [
                                    'id' => 'purchase-asset-account-input',
                                    'type' => 'search',
                                    'value' => '',
                                    'placeholder' => 'Cari/Pilih...',
                                ],
                                'widthClassName' => 'max-w-[420px]',
                            ],
                            [
                                'id' => 'purchase-other-supplier-cost-description',
                                'type' => 'description',
                                'label' => 'Akun Selisih pada transaksi pembelian dimana biaya ditagihkan ke pemasok lain',
                            ],
                            [
                                'id' => 'purchase-difference-account',
                                'type' => 'field',
                                'label' => 'Akun Selisih',
                                'control' => [
                                    'id' => 'purchase-difference-account-input',
                                    'type' => 'lookup',
                                    'value' => "[511.000-06] Beban Selisih Pembelian B\nng",
                                    'clearable' => true,
                                    'tokenClassName' => 'leading-5',
                                ],
                                'widthClassName' => 'max-w-[420px]',
                            ],
                            [
                                'id' => 'purchase-journal-date',
                                'type' => 'field',
                                'label' => 'Tanggal Jurnal',
                                'control' => [
                                    'id' => 'purchase-journal-date-select',
                                    'type' => 'select',
                                    'value' => 'bill-date',
                                    'options' => [
                                        [
                                            'value' => 'bill-date',
                                            'label' => 'Tanggal Tagihan Biaya',
                                        ],
                                        [
                                            'value' => 'receipt-date',
                                            'label' => 'Tanggal Penerimaan Barang',
                                        ],
                                    ],
                                ],
                                'widthClassName' => 'max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'purchase-payment-order-section',
                        'title' => 'Perintah Pembayaran ke Pemasok',
                        'icon' => 'payment',
                        'rows' => [
                            [
                                'id' => 'purchase-payment-temporary-account',
                                'type' => 'field',
                                'label' => 'Akun Kas Penampungan Pembayaran Sementara',
                                'showInfo' => true,
                                'control' => [
                                    'id' => 'purchase-payment-temporary-account-input',
                                    'type' => 'search',
                                    'value' => '',
                                    'placeholder' => 'Cari/Pilih Akun Perkiraan...',
                                ],
                                'widthClassName' => 'max-w-[480px]',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function approvalTabs(): array
    {
        return [
            [
                'id' => 'approval-sales',
                'label' => 'Penjualan',
                'contentClassName' => 'max-w-[760px]',
                'sections' => [
                    [
                        'id' => 'approval-sales-section',
                        'title' => 'Penjualan',
                        'icon' => 'sales',
                        'items' => [
                            ['id' => 'approval-sales-quote', 'label' => 'Penawaran Penjualan', 'checked' => true],
                            ['id' => 'approval-sales-order', 'label' => 'Pesanan Penjualan', 'checked' => true],
                            ['id' => 'approval-sales-delivery', 'label' => 'Pengiriman Pesanan', 'checked' => true],
                            ['id' => 'approval-sales-invoice', 'label' => 'Faktur Penjualan', 'checked' => true],
                            ['id' => 'approval-sales-receipt', 'label' => 'Penerimaan Penjualan', 'checked' => false],
                            ['id' => 'approval-sales-return', 'label' => 'Retur Penjualan', 'checked' => false],
                            ['id' => 'approval-sales-discount', 'label' => 'Penyesuaian Harga atau Diskon', 'checked' => false],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'approval-purchase',
                'label' => 'Pembelian',
                'contentClassName' => 'max-w-[760px]',
                'sections' => [
                    [
                        'id' => 'approval-purchase-section',
                        'title' => 'Pembelian',
                        'icon' => 'purchase',
                        'items' => [
                            ['id' => 'approval-purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => false],
                            ['id' => 'approval-purchase-receipt', 'label' => 'Penerimaan Barang', 'checked' => false],
                            ['id' => 'approval-purchase-invoice', 'label' => 'Faktur Pembelian', 'checked' => false],
                            ['id' => 'approval-purchase-payment', 'label' => 'Pembayaran Pembelian', 'checked' => false],
                            ['id' => 'approval-purchase-return', 'label' => 'Retur Pembelian', 'checked' => false],
                            ['id' => 'approval-purchase-price', 'label' => 'Harga Pemasok', 'checked' => false],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'approval-inventory',
                'label' => 'Persediaan',
                'contentClassName' => 'max-w-[760px]',
                'sections' => [
                    [
                        'id' => 'approval-inventory-section',
                        'title' => 'Persediaan',
                        'icon' => 'inventory',
                        'items' => [
                            ['id' => 'approval-inventory-request', 'label' => 'Permintaan Barang', 'checked' => false],
                            ['id' => 'approval-inventory-adjustment', 'label' => 'Penyesuaian Persediaan', 'checked' => false],
                            ['id' => 'approval-inventory-transfer', 'label' => 'Pemindahan Barang', 'checked' => false],
                            ['id' => 'approval-inventory-job-order', 'label' => 'Pekerjaan Pesanan', 'checked' => false],
                            ['id' => 'approval-inventory-material-addition', 'label' => 'Penambahan Bahan Baku', 'checked' => false],
                            ['id' => 'approval-inventory-job-completion', 'label' => 'Penyelesaian Pesanan', 'checked' => false],
                            ['id' => 'approval-inventory-stock-opname', 'label' => 'Hasil Stok Opname', 'checked' => false],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'approval-others',
                'label' => 'Lainnya',
                'contentClassName' => 'max-w-[760px]',
                'sections' => [
                    [
                        'id' => 'approval-other-cash-bank',
                        'title' => 'Kas & Bank',
                        'icon' => 'bank',
                        'items' => [
                            ['id' => 'approval-other-payment', 'label' => 'Pembayaran', 'checked' => false],
                            ['id' => 'approval-other-receipt', 'label' => 'Penerimaan', 'checked' => false],
                            ['id' => 'approval-other-bank-transfer', 'label' => 'Transfer Bank', 'checked' => false],
                        ],
                    ],
                    [
                        'id' => 'approval-other-ledger',
                        'title' => 'Buku Besar',
                        'icon' => 'ledger',
                        'items' => [
                            ['id' => 'approval-other-expense', 'label' => 'Pencatatan Beban', 'checked' => false],
                            ['id' => 'approval-other-salary', 'label' => 'Pencatatan Gaji', 'checked' => false],
                        ],
                    ],
                    [
                        'id' => 'approval-other-asset',
                        'title' => 'Aset Tetap',
                        'icon' => 'asset',
                        'items' => [
                            ['id' => 'approval-other-transfer-asset', 'label' => 'Pindah Aset', 'checked' => false],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function attachmentsTabs(array $attachmentsNotice): array
    {
        return [
            [
                'id' => 'attachments-sales',
                'label' => 'Penjualan',
                'contentClassName' => 'max-w-[760px]',
                'notice' => $attachmentsNotice,
                'sections' => [
                    [
                        'id' => 'attachments-sales-section',
                        'title' => 'Penjualan',
                        'icon' => 'sales',
                        'items' => [
                            ['id' => 'attachments-sales-quote', 'label' => 'Penawaran Penjualan', 'checked' => false],
                            ['id' => 'attachments-sales-order', 'label' => 'Pesanan Penjualan', 'checked' => false],
                            ['id' => 'attachments-sales-delivery', 'label' => 'Pengiriman Pesanan', 'checked' => false],
                            ['id' => 'attachments-sales-invoice', 'label' => 'Faktur Penjualan', 'checked' => false],
                            ['id' => 'attachments-sales-receipt', 'label' => 'Penerimaan Penjualan', 'checked' => false],
                            ['id' => 'attachments-sales-return', 'label' => 'Retur Penjualan', 'checked' => false],
                            ['id' => 'attachments-sales-discount', 'label' => 'Penyesuaian Harga atau Diskon', 'checked' => false],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'attachments-purchase',
                'label' => 'Pembelian',
                'contentClassName' => 'max-w-[760px]',
                'notice' => $attachmentsNotice,
                'sections' => [
                    [
                        'id' => 'attachments-purchase-section',
                        'title' => 'Pembelian',
                        'icon' => 'purchase',
                        'items' => [
                            ['id' => 'attachments-purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => false],
                            ['id' => 'attachments-purchase-receipt', 'label' => 'Penerimaan Barang', 'checked' => false],
                            ['id' => 'attachments-purchase-invoice', 'label' => 'Faktur Pembelian', 'checked' => false],
                            ['id' => 'attachments-purchase-payment', 'label' => 'Pembayaran Pembelian', 'checked' => false],
                            ['id' => 'attachments-purchase-return', 'label' => 'Retur Pembelian', 'checked' => false],
                            ['id' => 'attachments-purchase-price', 'label' => 'Harga Pemasok', 'checked' => false],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'attachments-inventory',
                'label' => 'Persediaan',
                'contentClassName' => 'max-w-[760px]',
                'notice' => $attachmentsNotice,
                'sections' => [
                    [
                        'id' => 'attachments-inventory-section',
                        'title' => 'Persediaan',
                        'icon' => 'inventory',
                        'items' => [
                            ['id' => 'attachments-inventory-request', 'label' => 'Permintaan Barang', 'checked' => false],
                            ['id' => 'attachments-inventory-transfer', 'label' => 'Pemindahan Barang', 'checked' => false],
                            ['id' => 'attachments-inventory-adjustment', 'label' => 'Penyesuaian Persediaan', 'checked' => false],
                            ['id' => 'attachments-inventory-job-order', 'label' => 'Pekerjaan Pesanan', 'checked' => false],
                            ['id' => 'attachments-inventory-material-addition', 'label' => 'Penambahan Bahan Baku', 'checked' => false],
                            ['id' => 'attachments-inventory-job-completion', 'label' => 'Penyelesaian Pesanan', 'checked' => false],
                            ['id' => 'attachments-inventory-stock-opname-request', 'label' => 'Perintah Stok Opname', 'checked' => false],
                            ['id' => 'attachments-inventory-stock-opname-result', 'label' => 'Hasil Stok Opname', 'checked' => false],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'attachments-others',
                'label' => 'Lainnya',
                'contentClassName' => 'max-w-[1120px]',
                'notice' => $attachmentsNotice,
                'sections' => [
                    [
                        'id' => 'attachments-other-ledger',
                        'title' => 'Buku Besar',
                        'icon' => 'ledger',
                        'column' => 1,
                        'items' => [
                            ['id' => 'attachments-other-expense-record', 'label' => 'Pencatatan Beban', 'checked' => false],
                            ['id' => 'attachments-other-salary-record', 'label' => 'Pencatatan Gaji', 'checked' => false],
                            ['id' => 'attachments-other-general-journal', 'label' => 'Jurnal Umum', 'checked' => false],
                        ],
                    ],
                    [
                        'id' => 'attachments-other-cash-bank',
                        'title' => 'Kas & Bank',
                        'icon' => 'bank',
                        'column' => 2,
                        'items' => [
                            ['id' => 'attachments-other-payment', 'label' => 'Pembayaran', 'checked' => false],
                            ['id' => 'attachments-other-receipt', 'label' => 'Penerimaan', 'checked' => false],
                            ['id' => 'attachments-other-bank-transfer', 'label' => 'Transfer Bank', 'checked' => false],
                        ],
                    ],
                    [
                        'id' => 'attachments-other-fixed-asset',
                        'title' => 'Aset Tetap',
                        'icon' => 'asset',
                        'column' => 2,
                        'items' => [
                            ['id' => 'attachments-other-fixed-asset', 'label' => 'Aset Tetap', 'checked' => false],
                            ['id' => 'attachments-other-fixed-asset-change', 'label' => 'Perubahan Aset Tetap', 'checked' => false],
                            ['id' => 'attachments-other-fixed-asset-disposal', 'label' => 'Disposisi Aset Tetap', 'checked' => false],
                            ['id' => 'attachments-other-fixed-asset-transfer', 'label' => 'Pindah Aset', 'checked' => false],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function limitationsTabs(): array
    {
        return [
            [
                'id' => 'limitations-operator-access',
                'label' => 'Akses Operator',
                'sections' => [
                    [
                        'id' => 'limitations-operator-access-section',
                        'title' => 'Pembatasan Akses Database Level Operator',
                        'icon' => 'restriction',
                        'rows' => [
                            [
                                'id' => 'limitations-operator-access-mode',
                                'type' => 'radio-group',
                                'value' => 'not-limited',
                                'options' => [
                                    [
                                        'value' => 'not-limited',
                                        'label' => 'Tidak dibatasi',
                                    ],
                                    [
                                        'value' => 'limited-all',
                                        'label' => 'Dibatasi semua',
                                    ],
                                    [
                                        'value' => 'limited-time',
                                        'label' => 'Akses terbatas hanya pada waktu',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'limitations-transaction-date',
                'label' => 'Tanggal Transaksi',
                'sections' => [
                    [
                        'id' => 'limitations-transaction-date-section',
                        'title' => 'Pembatasan Tanggal Transaksi',
                        'icon' => 'calendar',
                        'rows' => [
                            [
                                'id' => 'limitations-transaction-date-mode',
                                'type' => 'advanced-radio-group',
                                'value' => 'date-range',
                                'options' => [
                                    [
                                        'value' => 'not-limited',
                                        'label' => 'Tidak dibatasi',
                                    ],
                                    [
                                        'value' => 'date-range',
                                        'label' => 'Berdasarkan rentang waktu',
                                        'blocks' => [
                                            [
                                                'id' => 'date-range-warning',
                                                'type' => 'timing-rule',
                                                'label' => 'Peringati Jika',
                                                'option' => [
                                                    'checked' => false,
                                                ],
                                                'beforeValue' => '',
                                                'beforeUnit' => 'Hari',
                                                'afterValue' => '',
                                                'afterUnit' => 'Hari',
                                                'unitOptions' => ['Hari', 'Bulan', 'Tahun'],
                                            ],
                                            [
                                                'id' => 'date-range-prevent',
                                                'type' => 'timing-rule',
                                                'label' => 'Cegah Jika',
                                                'option' => [
                                                    'checked' => false,
                                                ],
                                                'beforeValue' => '',
                                                'beforeUnit' => 'Hari',
                                                'afterValue' => '',
                                                'afterUnit' => 'Hari',
                                                'unitOptions' => ['Hari', 'Bulan', 'Tahun'],
                                            ],
                                            [
                                                'id' => 'date-range-exception-users',
                                                'type' => 'search-row',
                                                'label' => 'Pengecualian pada pengguna',
                                                'control' => [
                                                    'value' => '',
                                                    'placeholder' => 'Cari/Pilih...',
                                                ],
                                            ],
                                            [
                                                'id' => 'date-range-transaction-scope',
                                                'type' => 'nested-radio-group',
                                                'label' => 'Berlakukan pada transaksi',
                                                'value' => 'all-transactions',
                                                'options' => [
                                                    [
                                                        'value' => 'all-transactions',
                                                        'label' => 'Semua Transaksi',
                                                    ],
                                                    [
                                                        'value' => 'journaled-transactions',
                                                        'label' => 'Transaksi berjurnal',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'value' => 'specific-date',
                                        'label' => 'Berdasarkan tanggal tertentu',
                                        'blocks' => [
                                            [
                                                'id' => 'specific-date-warning',
                                                'type' => 'timing-rule',
                                                'label' => 'Peringati Jika',
                                                'option' => [
                                                    'checked' => false,
                                                ],
                                                'beforeValue' => '',
                                                'beforeUnit' => 'Hari',
                                                'afterValue' => '',
                                                'afterUnit' => 'Hari',
                                                'unitOptions' => ['Hari', 'Bulan', 'Tahun'],
                                            ],
                                            [
                                                'id' => 'specific-date-prevent',
                                                'type' => 'timing-rule',
                                                'label' => 'Cegah Jika',
                                                'option' => [
                                                    'checked' => false,
                                                ],
                                                'beforeValue' => '',
                                                'beforeUnit' => 'Hari',
                                                'afterValue' => '',
                                                'afterUnit' => 'Hari',
                                                'unitOptions' => ['Hari', 'Bulan', 'Tahun'],
                                            ],
                                            [
                                                'id' => 'specific-date-exception-users',
                                                'type' => 'search-row',
                                                'label' => 'Pengecualian pada pengguna',
                                                'control' => [
                                                    'value' => '',
                                                    'placeholder' => 'Cari/Pilih...',
                                                ],
                                            ],
                                            [
                                                'id' => 'specific-date-transaction-scope',
                                                'type' => 'nested-radio-group',
                                                'label' => 'Berlakukan pada transaksi',
                                                'value' => 'all-transactions',
                                                'options' => [
                                                    [
                                                        'value' => 'all-transactions',
                                                        'label' => 'Semua Transaksi',
                                                    ],
                                                    [
                                                        'value' => 'journaled-transactions',
                                                        'label' => 'Transaksi berjurnal',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'value' => 'after-period-days',
                                        'label' => "Berdasarkan jumlah hari setelah akhir periode tanggal\ntransaksi",
                                        'blocks' => [
                                            [
                                                'id' => 'after-period-days-warning',
                                                'type' => 'timing-rule',
                                                'label' => 'Peringati Jika',
                                                'option' => [
                                                    'checked' => false,
                                                ],
                                                'beforeValue' => '',
                                                'beforeUnit' => 'Hari',
                                                'afterValue' => '',
                                                'afterUnit' => 'Hari',
                                                'unitOptions' => ['Hari', 'Bulan', 'Tahun'],
                                            ],
                                            [
                                                'id' => 'after-period-days-prevent',
                                                'type' => 'timing-rule',
                                                'label' => 'Cegah Jika',
                                                'option' => [
                                                    'checked' => false,
                                                ],
                                                'beforeValue' => '',
                                                'beforeUnit' => 'Hari',
                                                'afterValue' => '',
                                                'afterUnit' => 'Hari',
                                                'unitOptions' => ['Hari', 'Bulan', 'Tahun'],
                                            ],
                                            [
                                                'id' => 'after-period-days-exception-users',
                                                'type' => 'search-row',
                                                'label' => 'Pengecualian pada pengguna',
                                                'control' => [
                                                    'value' => '',
                                                    'placeholder' => 'Cari/Pilih...',
                                                ],
                                            ],
                                            [
                                                'id' => 'after-period-days-transaction-scope',
                                                'type' => 'nested-radio-group',
                                                'label' => 'Berlakukan pada transaksi',
                                                'value' => 'all-transactions',
                                                'options' => [
                                                    [
                                                        'value' => 'all-transactions',
                                                        'label' => 'Semua Transaksi',
                                                    ],
                                                    [
                                                        'value' => 'journaled-transactions',
                                                        'label' => 'Transaksi berjurnal',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'limitations-others',
                'label' => 'Lainnya',
                'sections' => [
                    [
                        'id' => 'limitations-general-section',
                        'title' => 'Pembatasan Umum',
                        'icon' => 'alert',
                        'rows' => [
                            [
                                'id' => 'limitations-general-items',
                                'type' => 'checkbox-list',
                                'items' => [
                                    [
                                        'id' => 'process-draft-transaction',
                                        'label' => 'Dapat memproses transaksi yang sedang diproses oleh transaksi berstatus Draf/Pengajuan',
                                        'checked' => false,
                                        'showInfo' => true,
                                    ],
                                    [
                                        'id' => 'print-draft-transaction',
                                        'label' => 'Dapat mencetak/e-mail transaksi yang berstatus Draf/Pengajuan/Ditolak',
                                        'checked' => false,
                                        'showInfo' => true,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'limitations-serial-section',
                        'title' => 'Nomor Seri/Produksi Barang',
                        'icon' => 'numbering',
                        'rows' => [
                            [
                                'id' => 'limitations-serial-items',
                                'type' => 'checkbox-list',
                                'items' => [
                                    [
                                        'id' => 'serial-required',
                                        'label' => 'Nomor Seri/Produksi barang harus diisi saat transaksi',
                                        'checked' => true,
                                    ],
                                    [
                                        'id' => 'serial-without-stock',
                                        'label' => 'Dapat mengisi nomor meski tidak ada stok (Gudang terpilih)',
                                        'checked' => false,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'limitations-return-form-section',
                        'title' => 'Formulir Retur',
                        'icon' => 'transfer',
                        'rows' => [
                            [
                                'id' => 'limitations-return-form-items',
                                'type' => 'checkbox-list',
                                'items' => [
                                    [
                                        'id' => 'sales-return-paid-invoice',
                                        'label' => 'Retur Penjualan dapat meretur faktur yang sudah lunas',
                                        'checked' => false,
                                    ],
                                    [
                                        'id' => 'sales-return-paid-down-payment',
                                        'label' => 'Retur Penjualan dapat meretur uang muka penjualan yang sudah lunas',
                                        'checked' => false,
                                    ],
                                    [
                                        'id' => 'sales-return-without-invoice',
                                        'label' => 'Dapat membuat Retur Penjualan tanpa Faktur Penjualan',
                                        'checked' => true,
                                    ],
                                    [
                                        'id' => 'purchase-return-paid-bill',
                                        'label' => 'Retur Pembelian dapat meretur tagihan yang sudah lunas',
                                        'checked' => false,
                                    ],
                                    [
                                        'id' => 'purchase-return-paid-down-payment',
                                        'label' => 'Retur Pembelian dapat meretur uang muka pembelian yang sudah lunas',
                                        'checked' => false,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'limitations-period-end-section',
                        'title' => 'Proses Akhir Bulan',
                        'icon' => 'recurring',
                        'rows' => [
                            [
                                'id' => 'limitations-period-end-items',
                                'type' => 'checkbox-list',
                                'items' => [
                                    [
                                        'id' => 'prevent-period-end-with-negative-stock',
                                        'label' => 'Cegah Proses Akhir Bulan apabila ada barang yang memiliki stok minus',
                                        'checked' => false,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'limitations-advance-payment-section',
                        'title' => 'Uang Muka Penjualan/Pembelian',
                        'icon' => 'payment',
                        'rows' => [
                            [
                                'id' => 'limitations-advance-payment-items',
                                'type' => 'checkbox-list',
                                'items' => [
                                    [
                                        'id' => 'use-only-paid-advance-payment',
                                        'label' => 'Hanya dapat menggunakan Uang Muka yang sudah lunas',
                                        'checked' => false,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function othersTabs(): array
    {
        return [
            [
                'id' => 'others-general',
                'label' => 'Lainnya',
                'contentClassName' => 'max-w-[760px]',
                'sections' => [
                    [
                        'id' => 'others-format-section',
                        'title' => 'Format',
                        'icon' => 'format',
                        'rows' => [
                            [
                                'id' => 'others-decimal-format-row',
                                'type' => 'field',
                                'label' => 'Format Desimal',
                                'controls' => [
                                    [
                                        'id' => 'others-decimal-format',
                                        'type' => 'select',
                                        'value' => 'Asing (9,999.9)',
                                        'options' => [
                                            'Asing (9,999.9)',
                                            'Indonesia (9.999,9)',
                                        ],
                                        'containerClassName' => 'w-full max-w-[200px]',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'others-decimal-option-row',
                                'type' => 'field',
                                'label' => 'Opsi Desimal',
                                'note' => 'Opsi decimal hanya berlaku pada bagian daftar transaksi',
                                'controls' => [
                                    [
                                        'id' => 'others-decimal-option-value',
                                        'type' => 'select',
                                        'value' => '0.99',
                                        'options' => ['0.99', '0.999', '0.9999'],
                                        'containerClassName' => 'w-full max-w-[140px]',
                                    ],
                                    [
                                        'id' => 'others-decimal-option-condition',
                                        'type' => 'select',
                                        'value' => 'Jika ada desimal',
                                        'options' => [
                                            'Jika ada desimal',
                                            'Selalu tampil',
                                        ],
                                        'containerClassName' => 'w-full max-w-[200px]',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'others-date-display-row',
                                'type' => 'field',
                                'label' => 'Tampilan Tanggal',
                                'controls' => [
                                    [
                                        'id' => 'others-date-display',
                                        'type' => 'select',
                                        'value' => 'Indonesia (9 Agu 2023)',
                                        'options' => [
                                            'Indonesia (9 Agu 2023)',
                                            'Asing (Aug 9, 2023)',
                                        ],
                                        'containerClassName' => 'w-full max-w-[220px]',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'others-aging-ar-section',
                        'title' => 'Umur Utang/Piutang',
                        'icon' => 'customer',
                        'rows' => [
                            [
                                'id' => 'others-aging-ar-range-row',
                                'type' => 'field',
                                'label' => 'Rentang Umur',
                                'note' => 'Rentang umur utang dan piutang pada laporan',
                                'controls' => [
                                    [
                                        'id' => 'others-aging-ar-range',
                                        'type' => 'text',
                                        'value' => '30',
                                        'inputType' => 'number',
                                        'containerClassName' => 'w-full max-w-[65px]',
                                        'inputClassName' => 'text-left px-2',
                                        'maxLength' => 3,
                                    ],
                                    [
                                        'id' => 'others-aging-ar-unit',
                                        'type' => 'static',
                                        'label' => 'Hari',
                                    ],
                                ],
                            ],
                            [
                                'id' => 'others-aging-ar-source-row',
                                'type' => 'radio',
                                'label' => 'Umur dihitung dari',
                                'value' => 'invoice-date',
                                'options' => [
                                    [
                                        'value' => 'invoice-date',
                                        'label' => 'Tanggal Faktur',
                                    ],
                                    [
                                        'value' => 'due-date',
                                        'label' => 'Jatuh Tempo',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'others-aging-inventory-section',
                        'title' => 'Umur Persediaan',
                        'icon' => 'inventory',
                        'rows' => [
                            [
                                'id' => 'others-aging-inventory-range-row',
                                'type' => 'field',
                                'label' => 'Rentang Umur',
                                'note' => 'Rentang umur persediaan pada laporan',
                                'controls' => [
                                    [
                                        'id' => 'others-aging-inventory-range',
                                        'type' => 'text',
                                        'value' => '30',
                                        'inputType' => 'number',
                                        'containerClassName' => 'w-full max-w-[65px]',
                                        'inputClassName' => 'text-left px-2',
                                        'maxLength' => 3,
                                    ],
                                    [
                                        'id' => 'others-aging-inventory-unit',
                                        'type' => 'static',
                                        'label' => 'Hari',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'id' => 'others-sales-commission-section',
                        'title' => 'Komisi Penjual',
                        'icon' => 'employee',
                        'rows' => [
                            [
                                'id' => 'others-sales-commission-source-row',
                                'type' => 'field',
                                'label' => 'Komisi dihitung dari',
                                'controls' => [
                                    [
                                        'id' => 'others-sales-commission-source',
                                        'type' => 'select',
                                        'value' => 'Faktur sudah lunas',
                                        'options' => [
                                            'Semua Faktur',
                                            'Faktur sudah lunas',
                                        ],
                                        'containerClassName' => 'w-full max-w-[240px]',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
