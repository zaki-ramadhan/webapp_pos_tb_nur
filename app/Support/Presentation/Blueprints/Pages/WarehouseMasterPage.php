<?php

namespace App\Support\Presentation\Blueprints\Pages;

class WarehouseMasterPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['warehouse-master'], [
            'subtab' => [
                'id' => 'warehouse-master-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'warehouse' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'tabs' => [
                    ['id' => 'warehouse-general', 'label' => 'Gudang'],
                    ['id' => 'warehouse-address', 'label' => 'Alamat'],
                    ['id' => 'warehouse-users', 'label' => 'Pengguna'],
                ],
                'labels' => [
                    'name' => 'Nama',
                    'description' => 'Deskripsi',
                    'responsiblePerson' => 'Penanggung Jawab',
                    'inactive' => 'Ya',
                    'address' => 'Alamat',
                    'groupBranch' => 'Grup/Cabang',
                    'user' => 'Pengguna',
                ],
                'createDefaults' => [
                    'name' => '',
                    'description' => '',
                    'responsiblePerson' => '',
                    'inactive' => false,
                    'allUsers' => true,
                    'street' => '',
                    'city' => '',
                    'postalCode' => '',
                    'province' => '',
                    'country' => '',
                    'groupBranch' => [],
                    'users' => [],
                ],
                'userAccess' => [
                    'title' => 'Akses Pengguna',
                    'allUsersLabel' => 'Semua Pengguna',
                    'limitedTitle' => 'Tentukan Pengguna yang dapat menggunakan gudang ini',
                    'groupBranchPlaceholder' => 'Cari/Pilih...',
                    'userPlaceholder' => 'Cari/Pilih...',
                ],
                'createDockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'muted',
                    ],
                ],
                'detailDockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'muted',
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'table' => [
                    'createLabel' => 'Tambah Gudang',
                    'refreshLabel' => 'Muat ulang',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel gudang',
                    'filterButtonLabel' => 'Filter gudang',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '2',
                    'filters' => [
                        [
                            'id' => 'inactive',
                            'options' => [
                                ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                            ],
                        ],
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
                            'widthClassName' => 'w-[300px]',
                        ],
                        [
                            'id' => 'address',
                            'label' => 'Alamat',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'code',
                            'label' => 'Kode Gudang',
                            'align' => 'left',
                            'widthClassName' => 'w-[150px]',
                            'defaultHidden' => true,
                        ],
                        [
                            'id' => 'pic',
                            'label' => 'Penanggung Jawab',
                            'align' => 'left',
                            'widthClassName' => 'w-[180px]',
                            'defaultHidden' => true,
                        ],
                        [
                            'id' => 'isActiveText',
                            'label' => 'Status Aktif',
                            'align' => 'center',
                            'widthClassName' => 'w-[110px]',
                            'defaultHidden' => true,
                        ],
                    ],
                    'rows' => [],
                ],
                'detailRecords' => [],
            ],
        ]);
    }
}
