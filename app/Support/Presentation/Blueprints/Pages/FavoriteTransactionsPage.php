<?php

namespace App\Support\Presentation\Blueprints\Pages;

class FavoriteTransactionsPage
{
    public static function get(): array
    {
        return [
                    'id' => 'favorite-transactions',
                    'label' => 'Transaksi Favorit',
                    'showViewIndicator' => true,
                    'savedTransactions' => [
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '2',
                        'searchWidthClassName' => 'sm:w-[340px]',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'payroll-entry', 'label' => 'Tipe Transaksi: Pencatatan Gaji'],
                                    ['value' => 'general-journal', 'label' => 'Tipe Transaksi: Jurnal Umum'],
                                ],
                            ],
                        ],
                        'columns' => [
                            ['id' => 'favoriteName', 'label' => 'Nama Favorit', 'widthClassName' => 'w-[220px]'],
                            ['id' => 'transactionTypeLabel', 'label' => 'Tipe Transaksi', 'widthClassName' => 'w-[220px]'],
                            ['id' => 'userList', 'label' => 'Daftar Pengguna'],
                        ],
                        'rows' => [
                            [
                                'id' => 'favorite-salary-jakarta',
                                'favoriteName' => 'Salary Jakarta',
                                'transactionTypeLabel' => 'Pencatatan Gaji',
                                'transactionTypeValue' => 'payroll-entry',
                                'userList' => 'Vando Rufi Sundawan, Darwin_SAC, Jhonni Haris Limbong',
                            ],
                            [
                                'id' => 'favorite-salary-surabaya',
                                'favoriteName' => 'Salary Surabaya',
                                'transactionTypeLabel' => 'Pencatatan Gaji',
                                'transactionTypeValue' => 'payroll-entry',
                                'userList' => 'AHMADYANI, Erick Szeto, Darwin_SAC',
                            ],
                        ],
                    ],
                ];
    }
}
