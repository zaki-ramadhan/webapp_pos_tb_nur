<?php

namespace App\Support\Presentation\Blueprints\Pages;

class GroupAccessPage
{
    public static function get(): array
    {
        return [
                    'id' => 'group-access',
                    'label' => 'Akses Grup',
                    'subtab' => [
                        'id' => 'group-access-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Akses Grup',
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '2',
                        'columns' => [
                            [
                                'id' => 'groupName',
                                'label' => 'Nama Grup',
                            ],
                            [
                                'id' => 'userList',
                                'label' => 'Daftar Pengguna',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'ga-supervisor',
                                'groupName' => 'TEAM CABANG KEDUA',
                                'userList' => 'AHMADYANI, Erick Szeto',
                                'tabLabel' => 'TEAM CABANG KEDUA',
                                'detailForm' => [
                                    'defaultTabId' => 'general',
                                    'permissionPreset' => 'supervisor',
                                    'general' => [
                                        'nameField' => [
                                            'value' => 'TEAM CABANG KEDUA',
                                        ],
                                        'accessLimitations' => [
                                            'options' => [
                                                [
                                                    'id' => 'follow-preference',
                                                    'label' => 'Tidak ada pembatasan (Akses penuh 24 jam)',
                                                    'checked' => true,
                                                ],
                                                [
                                                    'id' => 'limited-time',
                                                    'label' => 'Terbatas pada waktu',
                                                    'checked' => false,
                                                    'info' => true,
                                                ],
                                            ],
                                        ],
                                        'userSelection' => [
                                            'selected' => [
                                                'AHMADYANI',
                                                'Erick Szeto',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'ga-sales-admin',
                                'groupName' => 'TEAM TOKO UTAMA',
                                'userList' => 'Vando Rufi Sundawan, Darwin_SAC, Jhonni Haris Limbong',
                                'tabLabel' => 'TEAM TOKO UTAMA',
                                'detailForm' => [
                                    'defaultTabId' => 'general',
                                    'permissionPreset' => 'administrator',
                                    'general' => [
                                        'nameField' => [
                                            'value' => 'TEAM TOKO UTAMA',
                                        ],
                                        'accessLimitations' => [
                                            'options' => [
                                                [
                                                    'id' => 'follow-preference',
                                                    'label' => 'Tidak ada pembatasan (Akses penuh 24 jam)',
                                                    'checked' => true,
                                                ],
                                                [
                                                    'id' => 'limited-time',
                                                    'label' => 'Terbatas pada waktu',
                                                    'checked' => false,
                                                    'info' => true,
                                                ],
                                            ],
                                        ],
                                        'userSelection' => [
                                            'selected' => [
                                                'Vando Rufi Sundawan',
                                                'Darwin_SAC',
                                                'Jhonni Haris Limbong',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'form' => [
                        'tabs' => [
                            [
                                'id' => 'general',
                                'label' => 'Umum',
                            ],
                        ],
                        'defaultTabId' => 'general',
                        'actions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'primary',
                            ],
                            [
                                'id' => 'delete',
                                'label' => 'Hapus',
                                'icon' => 'trash',
                                'tone' => 'danger',
                            ],
                        ],
                        'systemErrorDemo' => [
                            'title' => 'Terjadi Permasalahan pada Pemrosesan',
                            'description' => 'Silakan perbaiki permasalahan berikut ini:',
                            'messages' => [
                                'Sesi login Anda telah berakhir',
                            ],
                            'copyLabel' => 'Salin',
                            'confirmLabel' => 'OK',
                        ],
                        'deleteConfirmation' => [
                            'title' => 'Konfirmasi',
                            'messageTemplate' => 'Apakah Anda yakin akan melakukan penghapusan data: {name}',
                            'confirmLabel' => 'Ya',
                            'cancelLabel' => 'Batal',
                            'closeLabel' => 'Tutup konfirmasi penghapusan',
                        ],
                        'general' => [
                            'nameField' => [
                                'id' => 'group-name',
                                'label' => 'Nama Grup',
                                'value' => '',
                                'clearable' => true,
                            ],
                            'accessLimitations' => [
                                'label' => 'Pembatasan Akses',
                                'options' => [
                                    [
                                        'id' => 'follow-preference',
                                        'label' => 'Tidak ada pembatasan (Akses penuh 24 jam)',
                                        'checked' => true,
                                    ],
                                    [
                                        'id' => 'limited-time',
                                        'label' => 'Terbatas pada waktu',
                                        'checked' => false,
                                        'info' => true,
                                    ],
                                ],
                            ],
                            'userSelection' => [
                                'label' => 'Daftar Pengguna',
                                'placeholder' => 'Cari/Pilih...',
                                'selected' => [],
                            ],
                        ],
                    ],
                ];
    }
}
