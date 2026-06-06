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
                    'damagedWarehouse' => 'Ya. Merupakan gudang penyimpanan barang rusak',
                    'inactive' => 'Ya',
                    'address' => 'Alamat',
                    'groupBranch' => 'Grup/Cabang',
                    'user' => 'Pengguna',
                ],
                'createDefaults' => [
                    'name' => '',
                    'description' => '',
                    'responsiblePerson' => '',
                    'isDamagedWarehouse' => false,
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
                            'name' => 'GD. JAKARTA',
                            'tabLabel' => 'GD. JAKARTA',
                            'address' => 'Jl. Pluit Karang Cantik Blok B4 No.39 Penjaringan, Jakarta Utara - 14450 Jakarta DKI Jakarta 14450 Indonesia',
                        ],
                        [
                            'id' => 'warehouse-surabaya',
                            'inactiveValue' => 'no',
                            'name' => 'GD. SURABAYA',
                            'tabLabel' => 'GD. SURABAYA',
                            'address' => 'Gedung Pawitra Lt. 2 No. 203 Jl. Kalijudan No. 98A Surabaya Jawa Timur 60114 Indonesia',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'warehouse-jakarta' => [
                        'name' => 'GD. JAKARTA',
                        'description' => 'GUDANG JAKARTA',
                        'responsiblePerson' => 'JHONNI',
                        'isDamagedWarehouse' => false,
                        'inactive' => false,
                        'allUsers' => false,
                        'street' => "Jl. Pluit Karang Cantik Blok B4 No.39\nPenjaringan, Jakarta Utara - 14450",
                        'city' => 'Jakarta',
                        'postalCode' => '14450',
                        'province' => 'DKI Jakarta',
                        'country' => 'Indonesia',
                        'groupBranch' => ['JAKARTA'],
                        'users' => [],
                    ],
                    'warehouse-surabaya' => [
                        'name' => 'GD. SURABAYA',
                        'description' => 'GUDANG SURABAYA',
                        'responsiblePerson' => 'ERICK SZETO',
                        'isDamagedWarehouse' => false,
                        'inactive' => false,
                        'allUsers' => true,
                        'street' => "Gedung Pawitra Lt. 2 No. 203\nJl. Kalijudan No. 98A",
                        'city' => 'Surabaya',
                        'postalCode' => '60114',
                        'province' => 'Jawa Timur',
                        'country' => 'Indonesia',
                        'groupBranch' => ['SURABAYA'],
                        'users' => [],
                    ],
                ],
            ],
        ]);
    }
}
