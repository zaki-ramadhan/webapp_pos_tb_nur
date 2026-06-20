<?php

namespace App\Support\Presentation;

use App\Support\Auth\AuthFeatureFlags;
use Illuminate\Support\Facades\Schema;
use Throwable;

final class PosBlueprint
{
    public static function forLogin(): array
    {
        return [
            ...self::baseData(),
            'login' => [
                'brand' => 'TB Nur POS',
                'title' => 'Selamat datang kembali',
                'subtitle' => 'Masukkan data akun Anda untuk melanjutkan.',
                'identifierLabel' => self::supportsUserPhone() ? 'Email atau No HP' : 'Email',
                'identifierPlaceholder' => self::supportsUserPhone() ? 'Masukkan email atau no HP Anda' : 'Masukkan email Anda',
                'passwordLabel' => 'Password',
                'passwordPlaceholder' => 'Masukkan password Anda',
                'forgotPassword' => 'Lupa Password?',
                'forgotPasswordModal' => [
                    'title' => 'Lupa Password',
                    'identifierLabel' => self::supportsUserPhone() ? 'Email atau No HP' : 'Email',
                    'identifierPlaceholder' => self::supportsUserPhone() ? 'contoh@gmail.com atau 081234567890' : 'contoh@gmail.com',
                    'submitLabel' => 'Reset Password',
                    'closeLabel' => 'Tutup modal lupa password',
                    'successMessage' => 'Jika akun ditemukan, tautan reset password akan dikirim ke email terdaftar.',
                ],
                'submitLabel' => 'Masuk',
                'submitHref' => route('dashboard'),
                'socialDivider' => 'atau masuk dengan',
                'googleLabel' => 'Google',
                'googleHref' => route('auth.google.redirect'),
                'signupPrompt' => AuthFeatureFlags::allowsPublicRegistration() ? 'Belum memiliki akun?' : null,
                'signupCta' => AuthFeatureFlags::allowsPublicRegistration() ? 'Daftar Sekarang' : null,
                'signupHref' => AuthFeatureFlags::allowsPublicRegistration() ? '/register' : null,
            ],
        ];
    }

    public static function forRegister(): array
    {
        return [
            ...self::baseData(),
            'register' => [
                'brand' => 'TB Nur POS',
                'title' => 'Buat akun baru',
                'subtitle' => 'Lengkapi data berikut untuk melanjutkan.',
                'nameLabel' => 'Nama Lengkap',
                'namePrefix' => 'Bpk',
                'namePlaceholder' => 'John Doe',
                'emailLabel' => 'Email',
                'emailPlaceholder' => 'Masukkan email Anda',
                'phoneLabel' => 'No Handphone',
                'phonePlaceholder' => 'Masukkan no HP Anda',
                'showPhoneField' => self::supportsUserPhone(),
                'passwordLabel' => 'Password',
                'passwordPlaceholder' => 'Minimal 8 karakter',
                'submitLabel' => 'Daftar',
                'loginPrompt' => 'Sudah memiliki akun?',
                'loginCta' => 'Masuk Sekarang',
                'loginHref' => '/login',
            ],
        ];
    }

    public static function forResetPassword(string $token, ?string $email = null): array
    {
        return [
            ...self::baseData(),
            'resetPassword' => [
                'brand' => 'TB Nur POS',
                'title' => 'Buat Password Baru',
                'subtitle' => 'Masukkan password baru untuk mengaktifkan kembali akses akun Anda.',
                'emailLabel' => 'Email',
                'emailPlaceholder' => 'contoh@gmail.com',
                'passwordLabel' => 'Password Baru',
                'passwordPlaceholder' => 'Minimal 8 karakter',
                'passwordConfirmationLabel' => 'Konfirmasi Password Baru',
                'passwordConfirmationPlaceholder' => 'Ulangi password baru',
                'submitLabel' => 'Simpan Password',
                'loginPrompt' => 'Sudah ingat password lama?',
                'loginCta' => 'Kembali ke Login',
                'loginHref' => '/login',
                'token' => $token,
                'email' => $email,
            ],
        ];
    }

    public static function forDashboard(?string $sample = null, ?array $abc = null, ?array $apriori = null, bool $loadData = true): array
    {
        $selectedSample = self::resolveSample(self::dashboardSamples(), $sample ?? 'retail');

        return [
            ...self::baseData(),
            'dashboard' => [
                'headerContextLabel' => 'Workspace Aktif',
                'user' => [
                    'name' => 'Zaki Ramadhan',
                    'email' => 'piscokpiscok2610@gmail.com',
                    'role' => 'Administrator',
                    'status' => 'active',
                    'avatarUrl' => null,
                ],
                'sample' => $selectedSample,
                'sampleDashboard' => self::sampleDashboard($abc, $apriori, $loadData),
                'preferences' => self::loadPreferences(),
            ],
        ];
    }

    private static function loadPreferences(): array
    {
        if (!Schema::hasTable('preference_settings')) {
            return [];
        }

        return \Illuminate\Support\Facades\DB::table('preference_settings')
            ->where('scope_type', 'company')
            ->where('scope_key', 'default')
            ->pluck('value', 'setting_key')
            ->map(function ($value) {
                $decoded = json_decode($value, true);
                if ($decoded === 'true' || $decoded === true) {
                    return true;
                }
                if ($decoded === 'false' || $decoded === false) {
                    return false;
                }
                return $decoded;
            })
            ->toArray();
    }

    private static function baseData(): array
    {
        return [
            'locale' => [
                'label' => 'Bahasa',
                'flag' => 'ID',
            ],
            'carousel' => [
                'eyebrow' => 'TB Nur POS',
                'title' => 'Satu workspace operasional untuk transaksi, stok, dan administrasi TB Nur.',
                'caption' => 'Dirancang untuk membantu operasional harian toko berjalan lebih rapi, cepat, dan terkontrol.',
                'imageSrc' => '/auth_bg.jpg',
                'imageAlt' => 'Foto Toko TB Nur.',
            ],
        ];
    }

    private static function dashboardSamples(): array
    {
        return [
            [
                'id' => 'retail',
                'label' => 'TB Nur Pusat',
                'icon' => 'retail',
            ],
            [
                'id' => 'trade-portal',
                'label' => 'TB Nur Cabang Jakarta',
                'icon' => 'trade',
            ],
            [
                'id' => 'manufacture',
                'label' => 'TB Nur Cabang Surabaya',
                'icon' => 'manufacture',
            ],
        ];
    }

    private static function sampleDashboard(?array $abc = null, ?array $apriori = null, bool $loadData = true): array
    {
        return \App\Support\Presentation\DashboardBlueprintProvider::get($abc, $apriori, $loadData);
    }

    public static function buildSalesTransactionPage(string $subtabId, string $configKey): array
    {
        return [
            'subtab' => [
                'id' => $subtabId,
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            $configKey => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    public static function salesTransactionTopActions(): array
    {
        return [
            [
                'id' => 'settings',
                'label' => 'Pengaturan',
                'icon' => 'settings',
                'tone' => 'outline',
            ],
            [
                'id' => 'tips',
                'label' => 'Petunjuk',
                'icon' => 'idea',
                'tone' => 'warning',
            ],
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
                self::navItem('activity-log', 'Log Aktivitas', 'activity', 'purple'),
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
                self::navItem('journal-activity-log', 'Log Aktivitas', 'activity', 'purple'),
            ]),
            self::navModule('cash-bank', 'Kas & Bank', 'bank', [
                self::navItem('cash-payment', 'Pembayaran', 'payment', 'green'),
                self::navItem('cash-receipt', 'Penerimaan', 'receipt', 'green'),
                self::navItem('bank-transfer', 'Transfer Bank', 'transfer', 'green'),
                self::navItem('bank-statement', 'Rekening Koran', 'bank', 'purple'),
                self::navItem('bank-history', 'Histori Bank', 'history', 'purple'),
                self::navItem('bank-reconciliation', 'Rekonsiliasi Bank', 'invoice', 'purple'),
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
            self::navModule('report-center', 'Daftar Laporan', 'reports', [
                self::navItem('report-list', 'Daftar Laporan', 'reports', 'purple'),
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

    public static function navItem(
        string $id,
        string $label,
        string $icon,
        string $tone = 'blue',
        ?string $pageDescription = null
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

    private static function resolveSample(array $samples, string $sample): array
    {
        foreach ($samples as $option) {
            if (($option['id'] ?? null) === $sample) {
                return $option;
            }
        }

        return $samples[0];
    }

    private static function supportsUserPhone(): bool
    {
        try {
            return Schema::hasColumn('users', 'phone');
        } catch (Throwable) {
            return false;
        }
    }
}
