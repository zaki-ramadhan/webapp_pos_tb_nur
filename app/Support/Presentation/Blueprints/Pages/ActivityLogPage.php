<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ActivityLogPage
{
    public static function get(): array
    {
        return [
                    'id' => 'activity-log',
                    'label' => 'Log Aktivitas',
                    'showViewIndicator' => true,
                    'table' => [
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi log aktivitas',
                        'searchPlaceholder' => '',
                        'pageValue' => '2,286',
                        'filters' => [
                            [
                                'id' => 'date',
                                'rowKey' => 'dateValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                    ['value' => '2026-04-18', 'label' => 'Tanggal: 18 Apr 2026'],
                                ],
                            ],
                            [
                                'id' => 'transactionDate',
                                'rowKey' => 'transactionDateValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tgl Transaksi: Semua'],
                                    ['value' => 'empty', 'label' => 'Tgl Transaksi: -'],
                                ],
                            ],
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'print-design', 'label' => 'Tipe Transaksi: Desain Cetakan'],
                                    ['value' => 'numbering', 'label' => 'Tipe Transaksi: Penomoran'],
                                    ['value' => 'preferences', 'label' => 'Tipe Transaksi: Preferensi'],
                                ],
                            ],
                            [
                                'id' => 'user',
                                'rowKey' => 'userValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Pengguna: Semua'],
                                    ['value' => 'tbnur-pos', 'label' => 'Pengguna: TB Nur POS System'],
                                ],
                            ],
                            [
                                'id' => 'actionType',
                                'rowKey' => 'actionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Tindakan: Semua'],
                                    ['value' => 'create', 'label' => 'Tipe Tindakan: Buat'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'export-log', 'label' => 'Ekspor log'],
                        ],
                        'columns' => [
                            [
                                'id' => 'transactionDateLabel',
                                'label' => 'Tgl Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'referenceName',
                                'label' => 'No/Nama Referensi',
                                'align' => 'left',
                                'widthClassName' => 'w-[44%]',
                            ],
                            [
                                'id' => 'actionLabel',
                                'label' => 'Tipe Tindakan',
                                'align' => 'left',
                                'widthClassName' => 'w-[130px]',
                            ],
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[200px]',
                            ],
                            [
                                'id' => 'loggedAt',
                                'label' => 'Tanggal',
                                'align' => 'left',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'userName',
                                'label' => 'Pengguna',
                                'align' => 'left',
                                'widthClassName' => 'w-[180px]',
                            ],
                            [
                                'id' => 'email',
                                'label' => 'Email',
                                'align' => 'left',
                                'widthClassName' => 'w-[190px]',
                            ],
                            [
                                'id' => 'ipAddress',
                                'label' => 'Alamat IP',
                                'align' => 'left',
                                'widthClassName' => 'w-[140px]',
                            ],
                        ],
                        'rows' => ActivityLogTable::rows(),
                    ],
                ];
    }
}
