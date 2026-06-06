<?php

namespace App\Support\Presentation\Blueprints\Pages;

class RecurringTransactionsPage
{
    public static function get(): array
    {
        return [
                    'id' => 'recurring-transactions',
                    'label' => 'Transaksi Berulang',
                    'showViewIndicator' => true,
                    'savedTransactions' => [
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '4',
                        'searchWidthClassName' => 'sm:w-[342px]',
                        'filters' => [
                            [
                                'id' => 'category',
                                'rowKey' => 'categoryValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Kategori: Semua'],
                                    ['value' => 'general', 'label' => 'Kategori: UMUM'],
                                ],
                            ],
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'expense-entry', 'label' => 'Tipe Transaksi: Pencatatan Beban'],
                                    ['value' => 'general-journal', 'label' => 'Tipe Transaksi: Jurnal Umum'],
                                ],
                            ],
                            [
                                'id' => 'branch',
                                'rowKey' => 'branchValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Cabang: Semua'],
                                    ['value' => 'jakarta', 'label' => 'Cabang: Jakarta'],
                                    ['value' => 'surabaya', 'label' => 'Cabang: Surabaya'],
                                ],
                            ],
                            [
                                'id' => 'status',
                                'rowKey' => 'statusValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Status: Semua'],
                                    ['value' => 'partial', 'label' => 'Status: Sebagian Tereksekusi'],
                                ],
                            ],
                        ],
                        'actionMenu' => [
                            'label' => 'Aksi transaksi berulang',
                            'items' => [
                                ['id' => 'edit-schedule', 'label' => 'Atur jadwal transaksi'],
                                ['id' => 'export-list', 'label' => 'Ekspor transaksi berulang'],
                            ],
                        ],
                        'primaryAction' => [
                            'id' => 'run',
                            'label' => 'Jalankan',
                        ],
                        'columns' => [
                            ['id' => 'categoryLabel', 'label' => 'Kategori', 'widthClassName' => 'w-[250px]'],
                            ['id' => 'name', 'label' => 'Nama'],
                            ['id' => 'transactionTypeLabel', 'label' => 'Tipe Transaksi', 'widthClassName' => 'w-[250px]'],
                            ['id' => 'statusLabel', 'label' => 'Status', 'widthClassName' => 'w-[190px]'],
                        ],
                        'rows' => [
                            [
                                'id' => 'recurring-jkt-interest',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Bunga Pinjaman - JKT',
                                'transactionTypeLabel' => 'Pencatatan Beban',
                                'transactionTypeValue' => 'expense-entry',
                                'branchValue' => 'jakarta',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                            [
                                'id' => 'recurring-sby-interest',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Bunga Pinjaman - SBY',
                                'transactionTypeLabel' => 'Pencatatan Beban',
                                'transactionTypeValue' => 'expense-entry',
                                'branchValue' => 'surabaya',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                            [
                                'id' => 'recurring-jkt-prepaid',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Prepaid Sewa - JKT',
                                'transactionTypeLabel' => 'Jurnal Umum',
                                'transactionTypeValue' => 'general-journal',
                                'branchValue' => 'jakarta',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                            [
                                'id' => 'recurring-sby-prepaid',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Prepaid Sewa - SBY',
                                'transactionTypeLabel' => 'Jurnal Umum',
                                'transactionTypeValue' => 'general-journal',
                                'branchValue' => 'surabaya',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                        ],
                    ],
                ];
    }
}
