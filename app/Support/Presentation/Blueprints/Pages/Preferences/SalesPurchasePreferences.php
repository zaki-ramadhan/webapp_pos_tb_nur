<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class SalesPurchasePreferences
{
    public static function salesTabs(): array
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

    public static function purchaseTabs(): array
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
}
