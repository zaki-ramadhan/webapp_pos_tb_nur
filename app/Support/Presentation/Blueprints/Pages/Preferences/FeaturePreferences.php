<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class FeaturePreferences
{
    public static function tabs(): array
    {
        return [
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
                            ['id' => 'sales-quote-order', 'label' => 'Penawaran dan Pesanan Penjualan', 'checked' => false],
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
                            ['id' => 'delivery-service', 'label' => 'Jasa Pengiriman', 'checked' => false],
                            ['id' => 'payment-terms', 'label' => 'Syarat Pembayaran', 'checked' => false],
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
                            ['id' => 'purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => false],
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
                            ['id' => 'multi-unit', 'label' => 'Multi Satuan Barang', 'checked' => false],
                            ['id' => 'simple-production', 'label' => 'Produksi Sederhana', 'checked' => false],
                        ],
                    ],
                ],
            ],
        ];
    }

    public static function limitationsTabs(): array
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
}
