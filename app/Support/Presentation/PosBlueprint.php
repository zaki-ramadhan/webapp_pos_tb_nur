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
                'namePlaceholder' => 'Masukkan nama Anda',
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

    public static function forDashboard(?string $sample = null, bool $loadData = true, ?string $asOfDate = null): array
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
                'sampleDashboard' => self::sampleDashboard($loadData, $asOfDate),
                'preferences' => self::loadPreferences(),
            ],
        ];
    }

    private static ?array $cachedPreferences = null;

    public static function clearPreferencesCache(): void
    {
        self::$cachedPreferences = null;
    }

    private static function loadPreferences(): array
    {
        if (self::$cachedPreferences !== null) {
            return self::$cachedPreferences;
        }

        try {
            self::$cachedPreferences = \Illuminate\Support\Facades\DB::table('preference_settings')
                ->where('scope_type', 'company')
                ->where('scope_key', 'default')
                ->pluck('value', 'setting_key')
                ->map(function ($value) {
                    if (is_bool($value)) {
                        return $value;
                    }
                    if (!is_string($value)) {
                        return $value;
                    }
                    $decoded = json_decode($value, true);
                    if ($decoded === 'true' || $decoded === true) {
                        return true;
                    }
                    if ($decoded === 'false' || $decoded === false) {
                        return false;
                    }
                    return $decoded ?? $value;
                })
                ->toArray();
        } catch (\Throwable) {
            self::$cachedPreferences = [];
        }

        return self::$cachedPreferences;
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
                'imageSrc' => '/auth_bg.webp',
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
                'label' => 'TB Nur Grosir',
                'icon' => 'trade',
            ],
            [
                'id' => 'manufacture',
                'label' => 'TB Nur Produksi',
                'icon' => 'manufacture',
            ],
        ];
    }

    private static function sampleDashboard(bool $loadData = true, ?string $asOfDate = null): array
    {
        return \App\Support\Presentation\DashboardBlueprintProvider::get($loadData, $asOfDate);
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
                self::navItem('preferences', 'Preferensi', 'preferences', 'amber'),
                self::navItem('group-access', 'Akses Grup', 'group-access', 'amber'),
                self::navItem('users', 'Pengguna', 'users', 'amber'),
            ]),
            self::navModule('company', 'Toko', 'building', [
                self::navItem('salary-allowance', 'Gaji atau Tunjangan', 'salary-allowance', 'blue'),
                self::navItem('employees', 'Karyawan', 'employees', 'blue'),
                self::navItem('activity-log', 'Log Aktivitas', 'activity-log', 'purple'),
            ]),
            self::navModule('general-ledger', 'Buku Besar', 'ledger', [
                self::navItem('accounts', 'Akun Perkiraan', 'account', 'blue'),
                self::navItem('expense-entry', 'Pencatatan Beban', 'expense-entry', 'green'),
                self::navItem('payroll-entry', 'Pencatatan Gaji', 'payroll-entry', 'green'),
                self::navItem('general-journal', 'Jurnal Umum', 'journal', 'green'),
                self::navItem('journal-activity-log', 'Log Aktivitas Jurnal', 'journal-activity-log', 'purple'),
            ]),
            self::navModule('cash-bank', 'Kas & Bank', 'bank', [
                self::navItem('cash-payment', 'Pembayaran', 'cash-payment', 'green'),
                self::navItem('cash-receipt', 'Penerimaan', 'cash-receipt', 'green'),
                self::navItem('bank-transfer', 'Transfer Bank', 'bank-transfer', 'green'),
                self::navItem('smartlink-bank', 'SmartLink e-Banking', 'smartlink-bank', 'blue'),
                self::navItem('bank-statement', 'Rekening Koran', 'bank-statement', 'purple'),
                self::navItem('bank-history', 'Histori Bank', 'bank-history', 'purple'),
                self::navItem('bank-reconciliation', 'Rekonsiliasi Bank', 'bank-reconciliation', 'purple'),
            ]),
            self::navModule('sales', 'Penjualan', 'sales', [
                self::navItem('sales-deposit', 'Uang Muka Penjualan', 'sales-deposit', 'green'),
                self::navItem('sales-invoice', 'Faktur Penjualan', 'sales-invoice', 'green'),
                self::navItem('sales-receipt', 'Penerimaan Penjualan', 'sales-receipt', 'green'),
                self::navItem('sales-return', 'Retur Penjualan', 'sales-return', 'green'),
                self::navItem('customers', 'Pelanggan', 'customers', 'blue'),
            ]),
            self::navModule('purchases', 'Pembelian', 'purchase', [
                self::navItem('purchase-deposit', 'Uang Muka Pembelian', 'purchase-deposit', 'green'),
                self::navItem('purchase-invoice', 'Faktur Pembelian', 'purchase-invoice', 'green'),
                self::navItem('purchase-payment', 'Pembayaran Pembelian', 'purchase-payment', 'green'),
                self::navItem('purchase-return', 'Retur Pembelian', 'purchase-return', 'green'),
                self::navItem('suppliers', 'Pemasok', 'suppliers', 'blue'),
            ]),
            self::navModule('inventory', 'Persediaan', 'inventory', [
                self::navItem('inventory-adjustment', 'Penyesuaian Persediaan', 'inventory-adjustment', 'green'),
                self::navItem('items-services', 'Barang', 'items-services', 'blue'),
                self::navItem('warehouse-master', 'Gudang', 'warehouse-master', 'blue'),
                self::navItem('item-unit', 'Satuan Barang', 'item-unit', 'blue'),
                self::navItem('item-category', 'Kategori Barang', 'item-category', 'blue'),
                self::navItem('item-location', 'Barang per gudang', 'item-location', 'purple'),
                self::navItem('minimum-stock', 'Barang stok minimum', 'minimum-stock', 'purple'),
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
            'bank-transfer',
            'smartlink-bank',
            'bank-statement',
            'bank-reconciliation',
            'bank-history',
            'cash-payment',
            'cash-receipt',
            'item-unit',
            'employees',
            'journal-activity-log',
            'salary-allowance',
            'sales-invoice',
            'sales-deposit',
            'sales-receipt',
            'sales-return',
            'inventory-adjustment',
            'purchase-invoice',
            'purchase-deposit',
            'purchase-payment',
            'purchase-return',
            'item-location',
            'minimum-stock',
            'payroll-entry',
            'items-services',
            'warehouse-master',
            'item-category',
            'suppliers',
            'customers',
            'users',
            'preferences',
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

    private static function cleanTrailingZeroes(string $formatted): string
    {
        if (str_contains($formatted, ',')) {
            return rtrim(rtrim($formatted, '0'), ',');
        }
        return $formatted;
    }

    public static function formatCurrencyShort(float|int $value): string
    {
        $abs = abs($value);
        $sign = $value < 0 ? '-' : '';
        if ($abs >= 1000000000) {
            $formatted = number_format($abs / 1000000000, 2, ',', '.');
            return $sign . 'Rp ' . self::cleanTrailingZeroes($formatted) . ' M';
        }
        if ($abs >= 1000000) {
            $formatted = number_format($abs / 1000000, 1, ',', '.');
            return $sign . 'Rp ' . self::cleanTrailingZeroes($formatted) . ' jt';
        }
        if ($abs >= 1000) {
            return $sign . 'Rp ' . number_format($abs / 1000, 0, ',', '.') . ' rb';
        }
        return $sign . 'Rp ' . number_format($abs, 0, ',', '.');
    }
}
