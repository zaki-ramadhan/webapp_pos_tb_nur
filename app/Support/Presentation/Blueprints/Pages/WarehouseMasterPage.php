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
                    ],
                    'rows' => [
                        [
                            'id' => 'warehouse-jakarta',
                            'inactiveValue' => 'no',
                            'name' => 'GUDANG UTAMA',
                            'tabLabel' => 'GUDANG UTAMA',
                            'address' => 'Jl. Raya Sunan Gunung Jati No. 45 Cirebon Jawa Barat 45151 Indonesia',
                        ],
                        [
                            'id' => 'warehouse-surabaya',
                            'inactiveValue' => 'no',
                            'name' => 'GUDANG PASIR & MATERIAL',
                            'tabLabel' => 'GUDANG PASIR & MATERIAL',
                            'address' => 'Lahan Terbuka Belakang Toko Cirebon Jawa Barat 45151 Indonesia',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'warehouse-jakarta' => [
                        'name' => 'GUDANG UTAMA',
                        'description' => 'Gudang Utama Toko (Display Depan)',
                        'responsiblePerson' => 'SUJONO',
                        'inactive' => false,
                        'allUsers' => false,
                        'street' => "Jl. Raya Sunan Gunung Jati No. 45",
                        'city' => 'Cirebon',
                        'postalCode' => '45151',
                        'province' => 'Jawa Barat',
                        'country' => 'Indonesia',
                        'groupBranch' => ['TOKO UTAMA'],
                        'users' => [],
                    ],
                    'warehouse-surabaya' => [
                        'name' => 'GUDANG PASIR & MATERIAL',
                        'description' => 'Gudang Terbuka Pasir & Batu Bata (Belakang Toko)',
                        'responsiblePerson' => 'NUR',
                        'inactive' => false,
                        'allUsers' => true,
                        'street' => "Lahan Terbuka Belakang Toko",
                        'city' => 'Cirebon',
                        'postalCode' => '45151',
                        'province' => 'Jawa Barat',
                        'country' => 'Indonesia',
                        'groupBranch' => ['CABANG KEDUA'],
                        'users' => [],
                    ],
                ],
            ],
        ]);
    }
}
