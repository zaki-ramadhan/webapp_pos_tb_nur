<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PrintDesignPage
{
    public static function get(): array
    {
        return [
                    'id' => 'print-design',
                    'label' => 'Desain Cetakan',
                    'subtab' => [
                        'id' => 'print-design-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Desain Cetakan',
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => '',
                        'pageValue' => '64',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'budget', 'label' => 'Tipe Transaksi: Anggaran'],
                                    ['value' => 'ps15', 'label' => 'Tipe Transaksi: Bukti Potong PPh Ps.15'],
                                    ['value' => 'ps42', 'label' => 'Tipe Transaksi: Bukti Potong PPh Ps.4(2)'],
                                    ['value' => 'pph23', 'label' => 'Tipe Transaksi: Bukti Potong PPh23'],
                                    ['value' => 'receipt-pph23', 'label' => 'Tipe Transaksi: Bukti Terima PPh23'],
                                    ['value' => 'list-ps15', 'label' => 'Tipe Transaksi: Daftar Bukti Potong PPh Ps.15'],
                                    ['value' => 'list-ps23', 'label' => 'Tipe Transaksi: Daftar Bukti Potong PPh Ps.23'],
                                    ['value' => 'list-ps42', 'label' => 'Tipe Transaksi: Daftar Bukti Potong PPh Ps.4(2)'],
                                ],
                            ],
                        ],
                        'columns' => [
                            [
                                'id' => 'designName',
                                'label' => 'Nama Desain',
                                'align' => 'left',
                                'widthClassName' => 'w-[30%]',
                            ],
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[19%]',
                            ],
                            [
                                'id' => 'userList',
                                'label' => 'Daftar Pengguna',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'print-design-1',
                                'designName' => 'Anggaran - Default',
                                'transactionTypeLabel' => 'Anggaran',
                                'transactionTypeValue' => 'budget',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-2',
                                'designName' => 'Bukti Potong PPh Ps.15 - Pelayaran',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.15',
                                'transactionTypeValue' => 'ps15',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-3',
                                'designName' => 'Bukti Potong PPh Ps.15 - Penerbangan',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.15',
                                'transactionTypeValue' => 'ps15',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-4',
                                'designName' => 'Bukti Potong PPh Ps.4(2) - Jasa Konstruksi',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.4(2)',
                                'transactionTypeValue' => 'ps42',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-5',
                                'designName' => 'Bukti Potong PPh Ps.4(2) - Sewa Tanah',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.4(2)',
                                'transactionTypeValue' => 'ps42',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-6',
                                'designName' => 'Bukti Potong PPh23',
                                'transactionTypeLabel' => 'Bukti Potong PPh23',
                                'transactionTypeValue' => 'pph23',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-7',
                                'designName' => 'Bukti Terima PPh23',
                                'transactionTypeLabel' => 'Bukti Terima PPh23',
                                'transactionTypeValue' => 'receipt-pph23',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-8',
                                'designName' => 'Daftar Bukti Potong PPh Ps.15 - Desain A',
                                'transactionTypeLabel' => 'Daftar Bukti Potong PPh Ps.15',
                                'transactionTypeValue' => 'list-ps15',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-9',
                                'designName' => 'Daftar Bukti Potong PPh Ps.23 - Desain A',
                                'transactionTypeLabel' => 'Daftar Bukti Potong PPh Ps.23',
                                'transactionTypeValue' => 'list-ps23',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-10',
                                'designName' => 'Daftar Bukti Potong PPh Ps.4(2) - Desain A',
                                'transactionTypeLabel' => 'Daftar Bukti Potong PPh Ps.4(2)',
                                'transactionTypeValue' => 'list-ps42',
                                'userList' => 'Semua Pengguna',
                            ],
                        ],
                    ],
                    'form' => [
                        'sectionLabel' => 'Informasi umum',
                        'saveLabel' => 'Simpan',
                        'defaults' => [
                            'name' => '',
                            'type' => '',
                        ],
                        'typeOptions' => [
                            ['value' => '', 'label' => 'Silakan Pilih'],
                            ['value' => 'budget', 'label' => 'Anggaran'],
                            ['value' => 'ps15', 'label' => 'Bukti Potong PPh Ps.15'],
                            ['value' => 'ps42', 'label' => 'Bukti Potong PPh Ps.4(2)'],
                            ['value' => 'pph23', 'label' => 'Bukti Potong PPh23'],
                            ['value' => 'receipt-pph23', 'label' => 'Bukti Terima PPh23'],
                        ],
                        'userAccess' => [
                            'allUsersLabel' => 'Semua Pengguna',
                            'allUsersChecked' => true,
                        ],
                    ],
                ];
    }
}
