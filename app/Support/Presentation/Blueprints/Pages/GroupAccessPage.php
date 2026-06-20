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
                                'groupName' => 'TEAM SURABAYA',
                                'userList' => 'AHMADYANI, Erick Szeto',
                                'tabLabel' => 'TEAM SURABAYA',
                                'detailForm' => [
                                    'defaultTabId' => 'general',
                                    'permissionPreset' => 'supervisor',
                                    'general' => [
                                        'nameField' => [
                                            'value' => 'TEAM SURABAYA',
                                        ],
                                        'accessLimitations' => [
                                            'options' => [
                                                [
                                                    'id' => 'follow-preference',
                                                    'label' => 'Mengikuti Pembatasan di Preferensi',
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
                                'groupName' => 'TEAM JAKARTA',
                                'userList' => 'Vando Rufi Sundawan, Darwin_SAC, Jhonni Haris Limbong',
                                'tabLabel' => 'TEAM JAKARTA',
                                'detailForm' => [
                                    'defaultTabId' => 'general',
                                    'permissionPreset' => 'administrator',
                                    'general' => [
                                        'nameField' => [
                                            'value' => 'TEAM JAKARTA',
                                        ],
                                        'accessLimitations' => [
                                            'options' => [
                                                [
                                                    'id' => 'follow-preference',
                                                    'label' => 'Mengikuti Pembatasan di Preferensi',
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
                                        'label' => 'Mengikuti Pembatasan di Preferensi',
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
                                \App\Support\Presentation\PosBlueprint::accessCategory('company', 'Perusahaan', 'building', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('company-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('currency', 'Mata Uang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('department', 'Departemen', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('branch', 'Cabang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('tax-master', 'Pajak', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('payment-terms', 'Syarat Pembayaran', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('employees', 'Karyawan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('salary-allowance', 'Gaji/Tunjangan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('shipping', 'Pengiriman', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('fob', 'FOB', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('contacts', 'Kontak', ['active' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('numbering', 'Penomoran', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('print-design', 'Desain Cetakan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('favorite-transactions', 'Transaksi Favorit', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('recurring-transactions', 'Transaksi Berulang', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('activity-log', 'Log Aktivitas', ['active' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('preferences', 'Preferensi', ['active' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('transaction-approval', 'Penyetuju Transaksi', ['active' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('period-end', 'Proses Akhir Bulan', ['create' => true, 'update' => true, 'delete' => true]),
                                    ]),
                                    \App\Support\Presentation\PosBlueprint::accessSection('company-other', 'Akses Lainnya', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('defer-income-expense', 'Melakukan penangguhan Pendapatan dan Beban di Transaksi', ['active' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('manual-number', 'Mengisi Nomor Transaksi manual', ['active' => true], true),
                                        \App\Support\Presentation\PosBlueprint::accessRow('form-designer', 'Rancangan Formulir', ['update' => true], true),
                                        \App\Support\Presentation\PosBlueprint::accessRow('report-export', 'Ekspor Laporan', ['active' => true], true),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('ledger', 'Buku Besar', 'ledger', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('ledger-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('journal-entry', 'Jurnal Umum', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('general-entry', 'Pencatatan Beban', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('salary-entry', 'Pencatatan Gaji', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('adjustment-entry', 'Jurnal Penyesuaian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('closing-entry', 'Jurnal Penutup', ['create' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('account-list', 'Akun Perkiraan', ['active' => true, 'create' => true, 'update' => true]),
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
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-quote', 'Penawaran Penjualan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-order', 'Pesanan Penjualan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('delivery-order', 'Pengiriman Pesanan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-invoice', 'Faktur Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-receipt', 'Penerimaan Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-return', 'Retur Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('customers', 'Pelanggan', ['active' => true, 'create' => true, 'update' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('price-adjustment', 'Penyesuaian Harga/Diskon', ['create' => true, 'update' => true, 'delete' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('purchase', 'Pembelian', 'purchase', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('purchase-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-order', 'Pesanan Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('goods-receipt', 'Penerimaan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-invoice', 'Faktur Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-payment', 'Pembayaran Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('purchase-return', 'Retur Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('supplier-prices', 'Harga Pemasok', ['active' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('suppliers', 'Pemasok', ['active' => true, 'create' => true, 'update' => true, 'view' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('inventory', 'Persediaan', 'inventory', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('inventory-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('item-request', 'Permintaan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('stock-transfer', 'Pemindahan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('inventory-adjustment', 'Penyesuaian Persediaan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('work-order', 'Pekerjaan Pesanan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('material-addition', 'Penambahan Bahan Baku', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('job-completion', 'Penyelesaian Pesanan', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('stock-opname-order', 'Perintah Stok Opname', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('stock-opname-result', 'Hasil Stok Opname', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('minimum-stock', 'Minimum Stok Cabang', ['active' => true, 'update' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('asset', 'Aset Tetap', 'asset', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('asset-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('asset-master', 'Aset Tetap', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('asset-change', 'Perubahan Aset Tetap', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('asset-disposal', 'Disposisi Aset Tetap', ['create' => true, 'update' => true, 'delete' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('asset-move', 'Pindah Aset', ['create' => true, 'update' => true, 'delete' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('target', 'Target', 'budget', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('target-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('sales-target', 'Target Penjualan', ['active' => true, 'create' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('expense-budget', 'Anggaran Beban', ['active' => true, 'create' => true, 'update' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('company-budget', 'Anggaran Perusahaan', ['active' => true, 'create' => true, 'update' => true]),
                                    ]),
                                ]),
                                \App\Support\Presentation\PosBlueprint::accessCategory('calendar', 'Kalender', 'calendar', [
                                    \App\Support\Presentation\PosBlueprint::accessSection('calendar-menu', 'Akses Menu', [
                                        \App\Support\Presentation\PosBlueprint::accessRow('company-calendar', 'Kalender', ['active' => true, 'create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        \App\Support\Presentation\PosBlueprint::accessRow('upcoming-activities', 'Kegiatan Mendatang', ['active' => true, 'view' => true]),
                                    ]),
                                ]),
                            ],
                        ],
                    ],
                ];
    }
}
