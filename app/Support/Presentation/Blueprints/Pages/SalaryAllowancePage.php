<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalaryAllowancePage
{
    public static function get(): array
    {
        return [
                    'id' => 'salary-allowance',
                    'label' => 'Gaji atau Tunjangan',
                    'salaryAllowance' => [
                        'newTabLabel' => 'Data Baru',
                        'sectionLabel' => 'Gaji atau Tunjangan',
                        'tipActions' => [],
                        'formActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'muted',
                            ],
                        ],
                        'editActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'muted',
                            ],
                            [
                                'id' => 'delete',
                                'label' => 'Hapus',
                                'icon' => 'delete',
                                'tone' => 'danger',
                            ],
                        ],
                        'fields' => [
                            'nameLabel' => 'Nama',
                            'typeLabel' => 'Tipe Gaji atau Tunjangan',
                            'payDeductLabel' => 'Bayar/Potong',
                            'expenseAccountLabel' => 'Akun Beban',
                            'inactiveLabel' => 'Non Aktif',
                            'inactiveOptionLabel' => 'Ya',
                        ],
                        'typeOptions' => [
                            'Gaji Pokok / Upah',
                            'Tunjangan Jabatan & Operasional',
                            'Tunjangan Makan & Transport',
                            'Uang Lembur',
                            'THR & Bonus',
                            'Potongan (Kasbon / Absensi)',
                        ],
                        'payDeductOptions' => ['Bulanan'],
                        'accountOptions' => [
                            '[611.002-01] Beban Gaji Umum & Admin',
                            '[611.002-02] Beban Tunjangan Hari Raya',
                            '[611.002-03] Beban Tunjangan Bonus',
                        ],
                        'newEntry' => [
                            'id' => 'draft-new',
                            'name' => '',
                            'type' => 'Gaji Pokok / Upah',
                            'payDeduct' => 'Bulanan',
                            'expenseAccount' => '',
                            'inactive' => false,
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Gaji atau Tunjangan',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak atau ekspor',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '17',
                            'filterOptions' => [
                                [
                                    'id' => 'type',
                                    'defaultValue' => 'all',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tipe Gaji atau Tunjangan: Semua'],
                                        ['value' => 'salary', 'label' => 'Tipe Gaji atau Tunjangan: Gaji Pokok / Upah'],
                                        ['value' => 'allowance', 'label' => 'Tipe Gaji atau Tunjangan: Tunjangan & Potongan'],
                                    ],
                                ],
                                [
                                    'id' => 'inactive',
                                    'defaultValue' => 'all',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                        ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                                        ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                    ],
                                ],
                            ],
                            'columns' => [
                                'Nama',
                                'Tipe Gaji atau Tunjangan',
                                'Non Aktif',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'salary-basic',
                                'name' => 'Gaji Pokok',
                                'type' => 'Gaji Pokok / Upah',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'holiday-bonus',
                                'name' => 'Tunjangan Hari Raya',
                                'type' => 'THR & Bonus',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-02] Beban Tunjangan Hari Raya',
                            ],
                            [
                                'id' => 'bonus',
                                'name' => 'Tunjangan Bonus',
                                'type' => 'THR & Bonus',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-03] Beban Tunjangan Bonus',
                            ],
                            [
                                'id' => 'tax-allowance',
                                'name' => 'Tunjangan PPh',
                                'type' => 'Tunjangan Jabatan & Operasional',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'position-allowance',
                                'name' => 'Tunjangan Jabatan',
                                'type' => 'Tunjangan Jabatan & Operasional',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'meal-allowance',
                                'name' => 'Tunjangan Makan',
                                'type' => 'Tunjangan Makan & Transport',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'transport-allowance',
                                'name' => 'Tunjangan Transportasi',
                                'type' => 'Tunjangan Makan & Transport',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'telecom-allowance',
                                'name' => 'Tunjangan Telekomunikasi',
                                'type' => 'Tunjangan Jabatan & Operasional',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'overtime-allowance',
                                'name' => 'Tunjangan Lembur',
                                'type' => 'Uang Lembur',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'insurance-allowance',
                                'name' => 'Tunjangan Premi Asuransi',
                                'type' => 'Tunjangan Jabatan & Operasional',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                        ],
                    ],
                ];
    }
}
