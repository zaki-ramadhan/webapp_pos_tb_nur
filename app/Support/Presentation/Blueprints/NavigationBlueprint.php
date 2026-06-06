<?php

namespace App\Support\Presentation\Blueprints;

final class NavigationBlueprint
{
    public static function navigationModules(): array
    {
        return [
            self::navModule('settings', 'Pengaturan', 'settings', [
                self::navItem('preferences', 'Preferensi', 'settings', 'amber'),
                self::navItem('group-access', 'Akses Grup', 'group', 'amber'),
                self::navItem('users', 'Pengguna', 'users', 'amber'),
                self::navItem('numbering', 'Penomoran', 'numbering', 'amber'),
                self::navItem('print-design', 'Desain Cetakan', 'printer', 'amber'),
                self::navItem('transaction-approval', 'Penyetuju Transaksi', 'users', 'amber'),
            ]),
            self::navModule('company', 'Perusahaan', 'building', [
                self::navItem('currency-master', 'Mata Uang', 'currency', 'blue'),
                self::navItem('branch', 'Cabang', 'branch', 'blue'),
                self::navItem('department', 'Departemen', 'department', 'blue'),
                self::navItem('company-tax', 'Pajak', 'tax', 'blue'),
                self::navItem('payment-terms', 'Syarat Pembayaran', 'terms', 'blue'),
                self::navItem('shipping-master', 'Pengiriman', 'truck', 'blue'),
                self::navItem('fob-master', 'FOB', 'invoice', 'blue'),
                self::navItem('salary-allowance', 'Gaji/Tunjangan', 'salary', 'blue'),
                self::navItem('employees', 'Karyawan', 'employee', 'blue'),
                self::navItem('recurring-transactions', 'Transaksi Berulang', 'recurring', 'green'),
                self::navItem('period-end', 'Proses Akhir Bulan', 'calendar', 'green'),
                self::navItem('contacts', 'Kontak', 'contact', 'purple'),
                self::navItem('favorite-transactions', 'Transaksi Favorit', 'favorite', 'purple'),
                // self::navItem('calendar-master', 'Kalender', 'calendar', 'purple'),
                self::navItem('activity-log', 'Log Aktifitas', 'activity', 'purple'),
            ]),
            self::navModule('general-ledger', 'Buku Besar', 'ledger', [
                self::navItem('accounts', 'Akun Perkiraan', 'account', 'blue'),
                self::navItem('expense-entry', 'Pencatatan Beban', 'expense', 'green'),
                self::navItem('payroll-entry', 'Pencatatan Gaji', 'salary', 'green'),
                self::navItem('general-journal', 'Jurnal Umum', 'journal', 'green'),
                self::navItem('budget-monitor', 'Monitor Anggaran', 'budget', 'purple'),
                self::navItem('budget-transfer', 'Transfer Anggaran', 'transfer', 'green'),
                self::navItem('budget', 'Anggaran', 'budget', 'amber'),
                self::navItem('account-history', 'Histori Akun', 'history', 'purple'),
                self::navItem('journal-activity-log', 'Log Aktifitas Jurnal', 'activity', 'purple'),
            ]),
            self::navModule('cash-bank', 'Kas & Bank', 'bank', [
                self::navItem('cash-payment', 'Pembayaran', 'payment', 'green'),
                self::navItem('cash-receipt', 'Penerimaan', 'receipt', 'green'),
                self::navItem('bank-transfer', 'Transfer Bank', 'transfer', 'green'),
                // self::navItem('smartlink-banking', 'SmartLink e-Banking', 'smartlink', 'blue'),
                self::navItem('bank-statement', 'Rekening Koran', 'bank', 'purple'),
                self::navItem('bank-history', 'Histori Bank', 'history', 'purple'),
                self::navItem('bank-reconciliation', 'Rekonsiliasi Bank', 'invoice', 'purple'),
                // self::navItem('smartlink-virtual-account', 'SmartLink Virtual Account', 'smartlink', 'purple'),
                // self::navItem('smartlink-payment', 'SmartLink e-Payment', 'invoice', 'purple'),
            ]),
            self::navModule('sales', 'Penjualan', 'sales', [
                self::navItem('sales-quote', 'Penawaran Penjualan', 'receipt', 'green'),
                self::navItem('sales-order', 'Pesanan Penjualan', 'invoice', 'green'),
                self::navItem('sales-delivery', 'Pengiriman Pesanan', 'truck', 'green'),
                self::navItem('sales-deposit', 'Uang Muka Penjualan', 'payment', 'green'),
                self::navItem('sales-invoice', 'Faktur Penjualan', 'invoice', 'green'),
                self::navItem('sales-receipt', 'Penerimaan Penjualan', 'receipt', 'green'),
                self::navItem('sales-return', 'Retur Penjualan', 'transfer', 'green'),
                self::navItem('customer-category', 'Kategori Pelanggan', 'group', 'blue'),
                self::navItem('sales-category', 'Kategori Penjualan', 'category', 'blue'),
                self::navItem('customers', 'Pelanggan', 'customer', 'blue'),
                self::navItem('price-adjustment', 'Penyesuaian Harga/Diskon', 'category', 'amber'),
                self::navItem('sales-commission', 'Komisi Penjual', 'employee', 'amber'),
                self::navItem('sales-target', 'Target Penjualan', 'budget', 'amber'),
                // self::navItem('smartlink-commerce', 'SmartLink e-Commerce', 'store', 'amber'),
                self::navItem('sales-checkin', 'Check In', 'checkin', 'purple'),
            ]),
            self::navModule('purchases', 'Pembelian', 'purchase', [
                self::navItem('purchase-order', 'Pesanan Pembelian', 'invoice', 'green'),
                self::navItem('goods-receipt', 'Penerimaan Barang', 'receipt', 'green'),
                self::navItem('purchase-deposit', 'Uang Muka Pembelian', 'payment', 'green'),
                self::navItem('purchase-invoice', 'Faktur Pembelian', 'invoice', 'green'),
                self::navItem('purchase-payment', 'Pembayaran Pembelian', 'payment', 'green'),
                self::navItem('purchase-return', 'Retur Pembelian', 'transfer', 'green'),
                self::navItem('supplier-price', 'Harga Pemasok', 'salary', 'amber'),
                self::navItem('supplier-category', 'Kategori Pemasok', 'group', 'blue'),
                self::navItem('suppliers', 'Pemasok', 'supplier', 'blue'),
                self::navItem('payment-order', 'Perintah Pembayaran', 'payment', 'green'),
                self::navItem('supplier-transfer', 'Transfer Pemasok', 'transfer', 'purple'),
            ]),
            self::navModule('inventory', 'Persediaan', 'inventory', [
                self::navItem('item-request', 'Permintaan Barang', 'invoice', 'green'),
                self::navItem('stock-transfer', 'Pemindahan Barang', 'truck', 'green'),
                self::navItem('inventory-adjustment', 'Penyesuaian Persediaan', 'stock', 'green'),
                self::navItem('work-order', 'Pekerjaan Pesanan', 'box', 'green'),
                self::navItem('material-addition', 'Penambahan Bahan Baku', 'payment', 'green'),
                self::navItem('work-completion', 'Penyelesaian Pesanan', 'stock', 'green'),
                self::navItem('stock-opname-order', 'Perintah Stok Opname', 'expense', 'green'),
                self::navItem('stock-opname-result', 'Hasil Stok Opname', 'stock', 'green'),
                self::navItem('items-services', 'Barang & Jasa', 'box', 'blue'),
                self::navItem('warehouse-master', 'Gudang', 'warehouse', 'blue'),
                self::navItem('item-unit', 'Satuan Barang', 'unit', 'blue'),
                self::navItem('item-category', 'Kategori Barang', 'category', 'blue'),
                self::navItem('order-fulfillment', 'Pemenuhan Pesanan', 'inventory', 'purple'),
                self::navItem('item-location', 'Barang per Gudang', 'location', 'purple'),
                self::navItem('minimum-stock', 'Barang Stok Minimum', 'box', 'purple'),
            ]),
            self::navModule('fixed-assets', 'Aset Tetap', 'asset', [
                self::navItem('fixed-assets', 'Aset Tetap', 'asset', 'blue'),
                self::navItem('asset-category', 'Kategori Aset', 'category', 'blue'),
                self::navItem('asset-tax-category', 'Kategori Aset Tetap Pajak', 'tax', 'blue'),
                self::navItem('asset-change', 'Perubahan Aset Tetap', 'asset', 'green'),
                self::navItem('asset-disposal', 'Disposisi Aset Tetap', 'asset', 'green'),
                self::navItem('asset-move', 'Pindah Aset', 'transfer', 'green'),
                self::navItem('asset-location', 'Aset per Lokasi', 'location', 'purple'),
            ]),
            // self::navModule('tax-center', 'SmartLink Tax', 'tax', [
            //     self::navItem('efaktur-ctas', 'e-Faktur CTAS', 'tax', 'purple'),
            //     self::navItem('tax-invoice-email', 'Email Faktur Pajak', 'invoice', 'purple'),
            //     self::navItem('efaktur-legacy', 'e-Faktur Legacy', 'tax', 'purple'),
            // ]),
            self::navModule('report-center', 'Daftar Laporan', 'reports', [
                self::navItem('report-list', 'Daftar Laporan', 'reports', 'purple'),
                // self::navItem('vat-report', 'SPT PPN / PPNBM', 'form', 'purple'),
                // self::navItem('analysis-ai', 'Analisa AI', 'ai', 'purple'),
                // self::navItem('income-tax-report', 'SPT PPh Ps.21', 'form', 'purple'),
                // self::navItem('withholding-slip', 'Bukti Potong PPh Ps.21', 'form', 'purple'),
            ]),
        ];
    }

    public static function navModule(string $id, string $label, string $icon, array $items): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'items' => $items,
        ];
    }

    public static function accessCategory(string $id, string $label, string $icon, array $sections): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'sections' => $sections,
        ];
    }

    public static function accessSection(string $id, string $label, array $rows): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'rows' => $rows,
        ];
    }

    public static function accessRow(string $id, string $label, array $permissions = [], bool $info = false): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'info' => $info,
            'permissions' => array_replace(
                [
                    'active' => false,
                    'create' => false,
                    'update' => false,
                    'delete' => false,
                    'view' => false,
                ],
                $permissions,
            ),
        ];
    }

    public static function navItem(
        string $id,
        string $label,
        string $icon,
        string $tone = 'blue',
        ?string $pageDescription = null,
    ): array {
        return [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'tone' => $tone,
            'pageDescription' => $pageDescription,
        ];
    }

    public static function buildSidebarItems(array $modules): array
    {
        return array_map(
            fn (array $module) => [
                'id' => $module['id'],
                'label' => $module['label'],
                'icon' => $module['icon'],
                'panel' => [
                    'title' => $module['label'],
                    'items' => array_map(
                        fn (array $item) => [
                            'id' => $item['id'],
                            'label' => $item['label'],
                            'icon' => $item['icon'],
                            'tone' => $item['tone'],
                            'implemented' => self::isImplementedWorkspacePage($item['id']),
                        ],
                        $module['items'],
                    ),
                ],
            ],
            $modules,
        );
    }

    public static function isImplementedWorkspacePage(string $pageId): bool
    {
        return in_array($pageId, [
            'group-access',
            'accounts',
            'expense-entry',
            'general-journal',
            'activity-log',
            'currency-master',
            'bank-transfer',
            'bank-statement',
            'bank-history',
            'bank-reconciliation',
            'cash-payment',
            'cash-receipt',
            'department',
            'item-unit',
            'company-tax',
            'employees',
            'journal-activity-log',
            'salary-allowance',
            'sales-quote',
            'sales-order',
            'sales-delivery',
            'sales-invoice',
            'sales-deposit',
            'sales-receipt',
            'sales-return',
            'customer-category',
            'supplier-category',
            'sales-category',
            'inventory-adjustment',
            'price-adjustment',
            'sales-checkin',
            'purchase-order',
            'purchase-invoice',
            'purchase-payment',
            'purchase-return',
            'goods-receipt',
            'item-request',
            'material-addition',
            'item-location',
            'minimum-stock',
            'delivery-order',
            'report-list',
        ], true);
    }

    public static function buildNavigationPages(array $modules): array
    {
        $pages = [];

        foreach ($modules as $module) {
            foreach ($module['items'] as $item) {
                $pages[$item['id']] = [
                    'id' => $item['id'],
                    'label' => $item['label'],
                    'moduleLabel' => $module['label'],
                    'icon' => $item['icon'],
                    'tone' => $item['tone'],
                    'openLoading' => [
                        'title' => 'Membuka ' . $item['label'],
                        'description' => 'Menyiapkan halaman ' . $item['label'] . ' dari menu ' . $module['label'] . '.',
                        'durationMs' => 480,
                    ],
                    'placeholder' => [
                        'description' => $item['pageDescription']
                            ?? 'Halaman ' . $item['label'] . ' sudah terhubung ke navigasi sidebar dan bisa dibuka sebagai stack tab.',
                    ],
                ];
            }
        }

        return $pages;
    }
}
