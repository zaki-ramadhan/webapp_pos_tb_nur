<?php

namespace App\Support\Presentation\Blueprints\Pages;

class UsersPage
{
    public static function get(): array
    {
        return [
                    'id' => 'users',
                    'label' => 'Pengguna',
                    'subtab' => [
                        'id' => 'users-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'form' => [
                        'sectionLabel' => 'Pengguna',
                        'title' => 'Tambahkan pengguna untuk mengakses database ini dengan memasukkan no handphone/emailnya',
                        'saveLabel' => 'Simpan',
                        'actions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'muted',
                            ],
                        ],
                        'identifierLabel' => 'No Handphone/Email',
                        'identifierPlaceholder' => '',
                        'accessLabel' => 'Jenis Akses',
                        'accessOptions' => [
                            [
                                'value' => 'operator',
                                'label' => 'Operator',
                                'note' => 'Pengguna tipe Operator dapat melihat dan membuka database. Hak menunya ditentukan melalui Akses grup.',
                            ],
                            [
                                'value' => 'administrator',
                                'label' => 'Administrator',
                                'note' => 'Administrator dapat mengelola pengaturan dan akses pengguna lain pada database ini.',
                            ],
                        ],
                        'groupLabel' => 'Akses Grup',
                        'groupPlaceholder' => 'Cari/Pilih...',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Pengguna',
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi tabel pengguna',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '1',
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                            ],
                            [
                                'id' => 'phone',
                                'label' => 'No Handphone',
                            ],
                            [
                                'id' => 'email',
                                'label' => 'Email',
                            ],
                            [
                                'id' => 'status',
                                'label' => 'Status',
                            ],
                            [
                                'id' => 'accessType',
                                'label' => 'Jenis Akses',
                            ],
                            [
                                'id' => 'createdAt',
                                'label' => 'Tanggal Registrasi',
                                'defaultHidden' => true,
                            ],
                            [
                                'id' => 'googleAuthStatus',
                                'label' => 'Status Google Auth',
                                'defaultHidden' => true,
                            ],
                        ],
                        'rows' => [
                            [
                                'name' => 'Zaki Ramadhan',
                                'phone' => '',
                                'email' => 'piscokpiscok2610@gmail.com',
                                'twoFactor' => false,
                                'accessType' => 'Administrator',
                            ],
                        ],
                    ],
                ];
    }
}
