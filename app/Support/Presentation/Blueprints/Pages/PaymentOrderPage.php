<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PaymentOrderPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['payment-order'], [
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
                    '__branchId' => 1,
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
        ]);
    }
}
