<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class WorkflowPreferences
{
    public static function approvalTabs(): array
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
                ],
            ],
        ];
    }

    public static function attachmentsTabs(array $attachmentsNotice): array
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
                            ['id' => 'attachments-inventory-adjustment', 'label' => 'Penyesuaian Persediaan', 'checked' => false],
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
                ],
            ],
        ];
    }

    public static function othersTabs(): array
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
                                        'containerClassName' => 'w-full max-w-[90px]',
                                        'inputClassName' => 'text-left px-3',
                                        'clearable' => false,
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
                                        'containerClassName' => 'w-full max-w-[90px]',
                                        'inputClassName' => 'text-left px-3',
                                        'clearable' => false,
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
