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
                                self::accessCategory('company', 'Perusahaan', 'building', [
                                    self::accessSection('company-menu', 'Akses Menu', [
                                        self::accessRow('currency', 'Mata Uang', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('department', 'Departemen', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('branch', 'Cabang', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('tax-master', 'Pajak', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('payment-terms', 'Syarat Pembayaran', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('employees', 'Karyawan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('salary-allowance', 'Gaji/Tunjangan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('shipping', 'Pengiriman', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('fob', 'FOB', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('contacts', 'Kontak', ['active' => true, 'update' => true]),
                                        self::accessRow('numbering', 'Penomoran', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('print-design', 'Desain Cetakan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('favorite-transactions', 'Transaksi Favorit', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('recurring-transactions', 'Transaksi Berulang', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('activity-log', 'Log Aktifitas', ['active' => true]),
                                        self::accessRow('preferences', 'Preferensi', ['active' => true]),
                                        self::accessRow('transaction-approval', 'Penyetuju Transaksi', ['active' => true]),
                                        self::accessRow('period-end', 'Proses Akhir Bulan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('smartlink-ebilling', 'SmartLink Tax : e-Billing Pajak', ['active' => true]),
                                        self::accessRow('smartlink-efiling', 'SmartLink Tax : e-Filing Pajak', ['active' => true]),
                                        self::accessRow('smartlink-efaktur', 'SmartLink Tax : e-Faktur Pajak', ['active' => true]),
                                        self::accessRow('smartlink-spt-ppnbm', 'SmartLink Tax : e-SPT PPN/BM', ['active' => true]),
                                        self::accessRow('smartlink-email-faktur', 'SmartLink Tax : Email Faktur Pajak', ['active' => true]),
                                        self::accessRow('smartlink-spt-pph2326', 'SmartLink Tax : e-SPT PPh 23/26', ['active' => true]),
                                        self::accessRow('spt-ppn', 'SPT PPn', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('spt-pph21', 'SPT PPh 21', ['active' => true]),
                                        self::accessRow('spt-pph23', 'SPT PPh 23', ['active' => true]),
                                        self::accessRow('spt-pph42', 'SPT PPh 4(2)', ['active' => true]),
                                        self::accessRow('spt-pph15', 'SPT PPh 15', ['active' => true]),
                                    ]),
                                    self::accessSection('company-other', 'Akses Lainnya', [
                                        self::accessRow('defer-income-expense', 'Melakukan penangguhan Pendapatan dan Beban di Transaksi', ['active' => true]),
                                        self::accessRow('manual-number', 'Mengisi Nomor Transaksi manual', ['active' => true], true),
                                        self::accessRow('form-designer', 'Rancangan Formulir', ['update' => true], true),
                                        self::accessRow('smartlink-authority', 'SmartLink Tax : Pihak Berwenang e-Faktur Pajak', ['create' => true, 'update' => true, 'delete' => true, 'view' => true], true),
                                        self::accessRow('smartlink-upload-all-branches', 'SmartLink Tax : Dapat unggah e-Faktur Pajak semua cabang', ['active' => true], true),
                                        self::accessRow('report-export', 'Ekspor Laporan', ['active' => true], true),
                                        self::accessRow('edit-efaktur-transactions', 'Mengubah/Menghapus transaksi yang sudah memiliki e-Faktur', ['active' => true], true),
                                        self::accessRow('ai-analysis', 'Analisa AI', ['active' => true], true),
                                    ]),
                                ]),
                                self::accessCategory('ledger', 'Buku Besar', 'ledger', [
                                    self::accessSection('ledger-menu', 'Akses Menu', [
                                        self::accessRow('journal-entry', 'Jurnal Umum', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('general-entry', 'Pencatatan Beban', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('salary-entry', 'Pencatatan Gaji', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('adjustment-entry', 'Jurnal Penyesuaian', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('closing-entry', 'Jurnal Penutup', ['create' => true, 'update' => true]),
                                        self::accessRow('account-list', 'Akun Perkiraan', ['active' => true, 'create' => true, 'update' => true]),
                                    ]),
                                ]),
                                self::accessCategory('cash-bank', 'Kas/Bank', 'bank', [
                                    self::accessSection('cashbank-menu', 'Akses Menu', [
                                        self::accessRow('payment', 'Pembayaran', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('receipt', 'Penerimaan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('bank-transfer', 'Transfer Bank', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('bank-reconciliation', 'Rekonsiliasi Bank', ['active' => true, 'update' => true, 'view' => true]),
                                    ]),
                                ]),
                                self::accessCategory('sales', 'Penjualan', 'sales', [
                                    self::accessSection('sales-menu', 'Akses Menu', [
                                        self::accessRow('sales-quote', 'Penawaran Penjualan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('sales-order', 'Pesanan Penjualan', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('delivery-order', 'Pengiriman Pesanan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('sales-invoice', 'Faktur Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('sales-receipt', 'Penerimaan Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('sales-return', 'Retur Penjualan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('customers', 'Pelanggan', ['active' => true, 'create' => true, 'update' => true, 'view' => true]),
                                        self::accessRow('price-adjustment', 'Penyesuaian Harga/Diskon', ['create' => true, 'update' => true, 'delete' => true]),
                                    ]),
                                ]),
                                self::accessCategory('purchase', 'Pembelian', 'purchase', [
                                    self::accessSection('purchase-menu', 'Akses Menu', [
                                        self::accessRow('purchase-order', 'Pesanan Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('goods-receipt', 'Penerimaan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('purchase-invoice', 'Faktur Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('purchase-payment', 'Pembayaran Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('purchase-return', 'Retur Pembelian', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('supplier-prices', 'Harga Pemasok', ['active' => true, 'update' => true]),
                                        self::accessRow('suppliers', 'Pemasok', ['active' => true, 'create' => true, 'update' => true, 'view' => true]),
                                    ]),
                                ]),
                                self::accessCategory('inventory', 'Persediaan', 'inventory', [
                                    self::accessSection('inventory-menu', 'Akses Menu', [
                                        self::accessRow('item-request', 'Permintaan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('stock-transfer', 'Pemindahan Barang', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('inventory-adjustment', 'Penyesuaian Persediaan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('work-order', 'Pekerjaan Pesanan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('material-addition', 'Penambahan Bahan Baku', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('job-completion', 'Penyelesaian Pesanan', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('stock-opname-order', 'Perintah Stok Opname', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('stock-opname-result', 'Hasil Stok Opname', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('minimum-stock', 'Minimum Stok Cabang', ['active' => true, 'update' => true]),
                                    ]),
                                ]),
                                self::accessCategory('asset', 'Aset Tetap', 'asset', [
                                    self::accessSection('asset-menu', 'Akses Menu', [
                                        self::accessRow('asset-master', 'Aset Tetap', ['create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('asset-change', 'Perubahan Aset Tetap', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('asset-disposal', 'Disposisi Aset Tetap', ['create' => true, 'update' => true, 'delete' => true]),
                                        self::accessRow('asset-move', 'Pindah Aset', ['create' => true, 'update' => true, 'delete' => true]),
                                    ]),
                                ]),
                                self::accessCategory('target', 'Target', 'budget', [
                                    self::accessSection('target-menu', 'Akses Menu', [
                                        self::accessRow('sales-target', 'Target Penjualan', ['active' => true, 'create' => true, 'update' => true]),
                                        self::accessRow('expense-budget', 'Anggaran Beban', ['active' => true, 'create' => true, 'update' => true]),
                                        self::accessRow('company-budget', 'Anggaran Perusahaan', ['active' => true, 'create' => true, 'update' => true]),
                                    ]),
                                ]),
                                self::accessCategory('calendar', 'Kalender', 'calendar', [
                                    self::accessSection('calendar-menu', 'Akses Menu', [
                                        self::accessRow('company-calendar', 'Kalender', ['active' => true, 'create' => true, 'update' => true, 'delete' => true, 'view' => true]),
                                        self::accessRow('upcoming-activities', 'Kegiatan Mendatang', ['active' => true, 'view' => true]),
                                    ]),
                                ]),
                                self::accessCategory('widget', 'Widget', 'format', [
                                    self::accessSection('widget-menu', 'Akses Menu', [
                                        self::accessRow('widget-dashboard', 'Dashboard', ['active' => true, 'view' => true]),
                                        self::accessRow('widget-library', 'Library Widget', ['active' => true, 'view' => true]),
                                        self::accessRow('widget-add', 'Tambah Widget', ['create' => true]),
                                        self::accessRow('widget-edit', 'Atur Widget', ['update' => true, 'delete' => true]),
                                    ]),
                                ]),
                            ],
                        ],
                    ],
                ];
    }
}
