<?php

namespace App\Support\Presentation\Blueprints\Pages;

class DepartmentPage
{
    public static function get(): array
    {
        return [
                    'id' => 'department',
                    'label' => 'Departemen',
                    'subtab' => [
                        'id' => 'department-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Departemen',
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'settingsLabel' => 'Pengaturan tabel departemen',
                        'searchPlaceholder' => 'Cari...',
                        'emptyLabel' => 'Tidak ada data',
                        'pageValue' => '3',
                        'filterOptions' => [
                            ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                            ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                            ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'view-settings', 'label' => 'Atur tampilan'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'align' => 'left',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'userList',
                                'label' => 'Daftar Pengguna',
                                'align' => 'center',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'department-accounting',
                                'inactiveValue' => 'no',
                                'name' => 'Accounting',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'department-head-office',
                                'inactiveValue' => 'no',
                                'name' => 'Head Office',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'department-operational',
                                'inactiveValue' => 'no',
                                'name' => 'Opersional',
                                'userList' => 'Semua Pengguna',
                            ],
                        ],
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'tabs' => [
                            [
                                'id' => 'department-general',
                                'label' => 'Departemen',
                            ],
                            [
                                'id' => 'department-users',
                                'label' => 'Daftar Pengguna',
                            ],
                        ],
                        'labels' => [
                            'name' => 'Nama',
                            'description' => 'Keterangan',
                            'subDepartment' => 'Sub Dept.',
                        ],
                        'defaults' => [
                            'name' => '',
                            'description' => '',
                            'isSubDepartment' => false,
                            'openingDate' => date('d/m/Y'),
                        ],
                        'openingBalance' => [
                            'title' => 'Saldo Awal',
                            'dateLabel' => 'Per Tgl',
                            'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                            'emptyLabel' => 'Belum ada data',
                            'columns' => [
                                [
                                    'id' => 'code',
                                    'label' => 'Kode #',
                                    'widthClassName' => 'w-[33%]',
                                ],
                                [
                                    'id' => 'name',
                                    'label' => 'Nama',
                                    'widthClassName' => 'w-[34%]',
                                ],
                                [
                                    'id' => 'value',
                                    'label' => 'Nilai',
                                    'widthClassName' => 'w-[33%]',
                                    'align' => 'right',
                                ],
                            ],
                            'rows' => [],
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
