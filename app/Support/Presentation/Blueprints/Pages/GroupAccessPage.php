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
                            [
                                'id' => 'rights',
                                'label' => 'Hak Akses',
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
                                'id' => 'more',
                                'label' => 'Lainnya',
                                'icon' => 'kebab',
                                'tone' => 'success',
                                'hasCaret' => true,
                                'items' => [
                                    ['id' => 'duplicate', 'label' => 'Duplikat Grup'],
                                    ['id' => 'reset', 'label' => 'Reset Hak Akses'],
                                    ['id' => 'export', 'label' => 'Ekspor Pengguna'],
                                ],
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
                                'value' => 'Data Baru',
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
                        'permissions' => [
                            'searchPlaceholder' => 'Cari...',
                            'copyAccessLabel' => 'Salin Hak',
                            'copyAccessOptions' => [
                                [
                                    'id' => 'operator',
                                    'label' => 'Operator Standar',
                                ],
                                [
                                    'id' => 'supervisor',
                                    'label' => 'Supervisor',
                                ],
                                [
                                    'id' => 'viewer',
                                    'label' => 'Peninjau / Viewer',
                                ],
                                [
                                    'id' => 'administrator',
                                    'label' => 'Administrator',
                                ],
                            ],
                            'columns' => [
                                [
                                    'id' => 'active',
                                    'label' => 'Aktif',
                                ],
                                [
                                    'id' => 'create',
                                    'label' => 'Buat',
                                ],
                                [
                                    'id' => 'update',
                                    'label' => 'Ubah',
                                ],
                                [
                                    'id' => 'delete',
                                    'label' => 'Hapus',
                                ],
                                [
                                    'id' => 'view',
                                    'label' => 'Lihat',
                                ],
                            ],
                            'categories' => [
                                \App\Support\Presentation\PosBlueprint::accessCategory('company', 'Toko', 'building', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('company-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('users', 'Pengguna', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('access-groups', 'Akses Grup', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('departments', 'Departemen', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('employees', 'Karyawan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('salary-allowances', 'Gaji atau Tunjangan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('activity-log', 'Log Aktivitas', ['active' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('preferences', 'Preferensi', ['active' => true]),
                                    ]),
                                    \App\Support\Presentation\PosBlueprint::accessSection('company-other', 'Akses Lainnya', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('manual-number', 'Mengisi Nomor Transaksi manual', ['active' => true], true),
                                        \App\Support\Presentation\PosBlueprint::accessRow('report-export', 'Ekspor Laporan', ['active' => true], true),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('ledger', 'Buku Besar', 'ledger', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('ledger-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('journal-entry', 'Jurnal Umum', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('general-entry', 'Pencatatan Beban', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('salary-entry', 'Pencatatan Gaji', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('accounts', 'Akun Perkiraan', ['active' => true, 'create' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('fixed-assets', 'Aset Tetap', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('cash-bank', 'Kas/Bank', 'bank', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('cashbank-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('payment', 'Pembayaran', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('receipt', 'Penerimaan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('bank-transfer', 'Transfer Bank', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('bank-reconciliation', 'Rekonsiliasi Bank', ['active' => true, 'update' => true, 'view' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('sales', 'Penjualan', 'sales', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('sales-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-invoices', 'Faktur Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-receipts', 'Penerimaan Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-returns', 'Retur Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('customers', 'Pelanggan', ['active' => true, 'create' => true, 'update' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('price-adjustment', 'Penyesuaian Harga atau Diskon', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-commissions', 'Komisi Penjual', ['active' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-checkins', 'Check-in', ['active' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('purchase', 'Pembelian', 'purchase', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('purchase-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-invoices', 'Faktur Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-payments', 'Pembayaran Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-returns', 'Retur Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('supplier-prices', 'Harga Pemasok', ['active' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('suppliers', 'Pemasok', ['active' => true, 'create' => true, 'update' => true, 'view' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('inventory', 'Persediaan', 'inventory', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('inventory-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('item-requests', 'Permintaan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('stock-transfers', 'Transfer Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('stock-opname-orders', 'Penyesuaian Persediaan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('minimum-stock', 'Barang stok minimum', ['active' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('products', 'Barang & Jasa', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('warehouses', 'Gudang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('units', 'Satuan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('brands', 'Merek Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('product-categories', 'Kategori Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('item-location', 'Barang per gudang', ['active' => true]),
                                    ]),
                                ]),
                            ],
                        ],
                    ],
                ];
    }
}
