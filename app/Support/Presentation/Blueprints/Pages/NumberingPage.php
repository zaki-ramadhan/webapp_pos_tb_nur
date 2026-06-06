<?php

namespace App\Support\Presentation\Blueprints\Pages;

class NumberingPage
{
    public static function get(): array
    {
        return [
                    'id' => 'numbering',
                    'label' => 'Penomoran',
                    'subtab' => [
                        'id' => 'numbering-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Penomoran',
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi daftar penomoran',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '79',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'project-material', 'label' => 'Tipe Transaksi: Alokasi Bahan Proyek'],
                                    ['value' => 'fixed-asset', 'label' => 'Tipe Transaksi: Aset Tetap'],
                                    ['value' => 'bank-proof', 'label' => 'Tipe Transaksi: Nomor Bukti Kas/Bank'],
                                    ['value' => 'sales-invoice', 'label' => 'Tipe Transaksi: Faktur Penjualan'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'export', 'label' => 'Ekspor daftar penomoran'],
                            ['id' => 'duplicate', 'label' => 'Duplikasi penomoran'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'align' => 'left',
                                'widthClassName' => 'w-[32%]',
                            ],
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[28%]',
                            ],
                            [
                                'id' => 'userScopeLabel',
                                'label' => 'Daftar Pengguna',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'numbering-1',
                                'name' => 'Alokasi Bahan Proyek',
                                'transactionTypeLabel' => 'Alokasi Bahan Proyek',
                                'transactionTypeValue' => 'project-material',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-2',
                                'name' => 'Aset Tetap',
                                'transactionTypeLabel' => 'Aset Tetap',
                                'transactionTypeValue' => 'fixed-asset',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-3',
                                'name' => 'Bank BCA IDR Jakarta (069-773...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-4',
                                'name' => 'Bank BCA IDR Surabaya (388-3...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-5',
                                'name' => 'Bank BCA SGD Jakarta (157-37...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-6',
                                'name' => 'Bank BCA SGD Surabaya (102-...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-7',
                                'name' => 'Bank BCA USD Jakarta (273-84...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-8',
                                'name' => 'Bank BCA USD Surabaya (247-...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-9',
                                'name' => 'Bank Jakarta',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-10',
                                'name' => 'Bank Mandiri IDR Jakarta (142-...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                        ],
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'tabs' => [
                            [
                                'id' => 'numbering',
                                'label' => 'Penomoran',
                            ],
                            [
                                'id' => 'numbering-users',
                                'label' => 'Daftar Pengguna',
                            ],
                        ],
                        'defaults' => [
                            'name' => '',
                            'transactionType' => 'sales-invoice',
                            'numberingType' => 'monthly-reset',
                            'counterDigits' => 5,
                            'componentPicker' => 'year',
                            'selectedComponents' => [],
                        ],
                        'transactionTypeOptions' => [
                            ['value' => 'sales-invoice', 'label' => 'Faktur Penjualan', 'code' => 'FP'],
                            ['value' => 'bank-proof', 'label' => 'Nomor Bukti Kas/Bank', 'code' => 'NBK'],
                            ['value' => 'fixed-asset', 'label' => 'Aset Tetap', 'code' => 'AT'],
                            ['value' => 'project-material', 'label' => 'Alokasi Bahan Proyek', 'code' => 'ABP'],
                        ],
                        'numberingTypeOptions' => [
                            ['value' => 'monthly-reset', 'label' => 'Reset setiap bulan'],
                            ['value' => 'yearly-reset', 'label' => 'Reset setiap tahun'],
                            ['value' => 'fixed', 'label' => 'Tidak di-reset'],
                        ],
                        'componentOptions' => [
                            ['value' => 'year', 'label' => 'Tahun'],
                            ['value' => 'month', 'label' => 'Bulan'],
                            ['value' => 'transaction-code', 'label' => 'Kode Transaksi'],
                        ],
                        'userAccess' => [
                            'title' => 'Akses Pengguna',
                            'allUsersLabel' => 'Semua Pengguna',
                            'allUsersChecked' => true,
                        ],
                    ],
                ];
    }
}
