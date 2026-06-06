<?php

namespace App\Support\Presentation\Blueprints\Pages;

class TransactionApprovalPage
{
    public static function get(): array
    {
        return [
                    'id' => 'transaction-approval',
                    'label' => 'Penyetuju Transaksi',
                    'subtab' => [
                        'id' => 'transaction-approval-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Penyetuju Transaksi',
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi daftar penyetuju transaksi',
                        'emptyLabel' => 'Belum ada data',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => array_merge(
                                    [['value' => 'all', 'label' => 'Tipe Transaksi: Semua']],
                                    array_map(function ($opt) {
                                        return ['value' => $opt['value'], 'label' => 'Tipe Transaksi: ' . $opt['label']];
                                    }, $transactionTypeOptions)
                                ),
                            ],
                            [
                                'id' => 'branch',
                                'rowKey' => 'branchValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Cabang: Semua'],
                                    ['value' => 'all-branches', 'label' => 'Cabang: Semua Cabang'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'export', 'label' => 'Ekspor daftar'],
                            ['id' => 'duplicate', 'label' => 'Duplikasi aturan'],
                        ],
                        'columns' => [
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[22%]',
                            ],
                            [
                                'id' => 'valueLabel',
                                'label' => 'Nilai',
                                'align' => 'left',
                                'widthClassName' => 'w-[22%]',
                            ],
                            [
                                'id' => 'approvedBy',
                                'label' => 'Disetujui Oleh',
                                'align' => 'left',
                                'widthClassName' => 'w-[22%]',
                            ],
                            [
                                'id' => 'createdBy',
                                'label' => 'Pembuat Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[24%]',
                            ],
                            [
                                'id' => 'branchLabel',
                                'label' => 'Cabang',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [],
                    ],
                    'form' => [
                        'sectionLabel' => 'Penyetuju Transaksi',
                        'saveLabel' => 'Simpan',
                        'valueLabel' => 'Nilai (Rp)',
                        'defaults' => [
                            'transactionType' => $transactionTypeOptions[0]['value'] ?? 'sales-invoice',
                            'branch' => 'all-branches',
                            'approvalRule' => 'one-approved',
                        ],
                        'transactionTypeOptions' => $transactionTypeOptions,
                        'branchOptions' => [
                            ['value' => 'all-branches', 'label' => '[Semua Cabang]'],
                        ],
                        'approvalRuleOptions' => [
                            ['value' => 'one-approved', 'label' => 'Ada Salah Satu Pengguna Setuju'],
                            ['value' => 'all-approved', 'label' => 'Semua Pengguna Harus Setuju'],
                        ],
                    ],
                ];
    }
}
