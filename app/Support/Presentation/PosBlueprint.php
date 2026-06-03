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
                'identifierLabel' => self::supportsUserPhone() ? 'Email atau No Handphone' : 'Email',
                'identifierPlaceholder' => self::supportsUserPhone() ? 'contoh@gmail.com atau 081234567890' : 'contoh@gmail.com',
                'passwordLabel' => 'Password',
                'passwordPlaceholder' => 'Masukkan password Anda',
                'forgotPassword' => 'Lupa Password?',
                'forgotPasswordModal' => [
                    'title' => 'Lupa Password',
                    'identifierLabel' => self::supportsUserPhone() ? 'Email atau No Handphone' : 'Email',
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
                'emailPlaceholder' => 'contoh@gmail.com',
                'phoneLabel' => 'No Handphone',
                'phonePlaceholder' => '081234567890',
                'showPhoneField' => self::supportsUserPhone(),
                'passwordLabel' => 'Password',
                'passwordPlaceholder' => 'Minimal 8 karakter',
                'submitLabel' => 'Daftar',
                'loginPrompt' => 'Sudah memiliki akun?',
                'loginCta' => 'Masuk Sekarang',
                'loginHref' => '/',
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
                'loginHref' => '/',
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
            ],
        ];
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
        $navigationModules = self::navigationModules();
        $navigationPages = self::buildNavigationPages($navigationModules);
        $attachmentsNotice = [
            'parts' => [
                ['text' => 'Silahkan pilih Menu Transaksi yang '],
                ['text' => 'MEWAJIBKAN', 'emphasis' => true],
                ['text' => ' pengguna menyertakan lampiran saat menyimpan transaksi.'],
            ],
        ];

        $formatCurrencyShort = function ($value) {
            $abs = abs($value);
            $sign = $value < 0 ? '-' : '';
            if ($abs >= 1000000000) {
                return $sign . 'Rp ' . number_format($abs / 1000000000, 2, ',', '.') . ' M';
            }
            if ($abs >= 1000000) {
                return $sign . 'Rp ' . number_format($abs / 1000000, 1, ',', '.') . ' jt';
            }
            if ($abs >= 1000) {
                return $sign . 'Rp ' . number_format($abs / 1000, 0, ',', '.') . ' rb';
            }
            return $sign . 'Rp ' . number_format($abs, 0, ',', '.');
        };

        $userActivities = [];
        if ($loadData) {
            $user = auth()->user() ?? request()->user();
            if ($user !== null) {
                $logs = \Illuminate\Support\Facades\DB::table('activity_logs')
                    ->where('actor_user_id', $user->id)
                    ->orderBy('occurred_at', 'desc')
                    ->limit(4)
                    ->get();

                $daysIndo = [
                    'Sunday' => 'Minggu',
                    'Monday' => 'Senin',
                    'Tuesday' => 'Selasa',
                    'Wednesday' => 'Rabu',
                    'Thursday' => 'Kamis',
                    'Friday' => 'Jumat',
                    'Saturday' => 'Sabtu',
                ];

                $monthsIndo = [
                    'Jan' => 'Jan',
                    'Feb' => 'Feb',
                    'Mar' => 'Mar',
                    'Apr' => 'Apr',
                    'May' => 'Mei',
                    'Jun' => 'Jun',
                    'Jul' => 'Jul',
                    'Aug' => 'Agt',
                    'Sep' => 'Sep',
                    'Oct' => 'Okt',
                    'Nov' => 'Nov',
                    'Dec' => 'Des',
                ];

                $actionMap = [
                    'create' => 'Buat',
                    'update' => 'Ubah',
                    'delete' => 'Hapus',
                ];

                $resourceMap = [
                    'budget' => 'Anggaran',
                    'general-journal' => 'Jurnal Umum',
                    'employee' => 'Karyawan',
                    'product' => 'Produk',
                    'preference' => 'Preferensi',
                    'user' => 'Pengguna',
                ];

                foreach ($logs as $log) {
                    $occurredAt = $log->occurred_at ? new \Illuminate\Support\Carbon($log->occurred_at) : null;
                    $dayName = 'Senin';
                    $dayNum = '01';
                    $monthName = 'Jun';
                    $timeStr = '00:00';
                    if ($occurredAt !== null) {
                        $dayNameEng = $occurredAt->format('l');
                        $dayName = $daysIndo[$dayNameEng] ?? $dayNameEng;
                        $dayNum = $occurredAt->format('d');
                        $monthEng = $occurredAt->format('M');
                        $monthName = $monthsIndo[$monthEng] ?? $monthEng;
                        $timeStr = $occurredAt->format('H:i');
                    }

                    $actionStr = $actionMap[$log->action] ?? ucfirst($log->action);
                    $resourceStr = $resourceMap[$log->permission_key] ?? ($log->resource_label ?? ucfirst($log->resource_key));
                    $activityTitle = "{$actionStr} {$resourceStr}";

                    $userActivities[] = [
                        'id' => $log->id,
                        'dayName' => $dayName,
                        'dayNum' => $dayNum,
                        'monthName' => $monthName,
                        'time' => $timeStr,
                        'title' => $activityTitle,
                    ];
                }
            }

            $latestSalesInvoiceDate = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted')
                ->max('entry_date') ?? date('Y-m-d');

            $salesTrendLabels = [];
            $salesTrendData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - $i days"));
                $dayName = date('D', strtotime($date));
                $dayNameIndo = [
                    'Sun' => 'Min', 'Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab',
                    'Thu' => 'Kam', 'Fri' => 'Jum', 'Sat' => 'Sab'
                ][$dayName] ?? $dayName;
                $salesTrendLabels[] = $dayNameIndo;
                $totalSales = \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->where('document_type', 'sales_invoice')
                    ->where('status', 'Posted')
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $salesTrendData[] = (float) $totalSales;
            }

            $totalSalesVal = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted')
                ->sum('total_amount');

            $totalHppVal = \Illuminate\Support\Facades\DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->where('operation_documents.status', 'Posted')
                ->sum(\Illuminate\Support\Facades\DB::raw('operation_document_lines.quantity * products.default_purchase_price'));

            $totalExpensesVal = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                ->where('status', 'Posted')
                ->sum('total_amount');

            $netProfitVal = $totalSalesVal - $totalHppVal - $totalExpensesVal;
            $profitMargin = $totalSalesVal > 0 ? (int) (($netProfitVal / $totalSalesVal) * 100) : 0;
            $profitPercentage = $profitMargin . '%';
            $legendSum = $totalSalesVal + $totalHppVal + $totalExpensesVal;
            $pctRev = $legendSum > 0 ? round(($totalSalesVal / $legendSum) * 100) : 0;
            $pctHpp = $legendSum > 0 ? round(($totalHppVal / $legendSum) * 100) : 0;
            $pctExp = $legendSum > 0 ? round(($totalExpensesVal / $legendSum) * 100) : 0;

            $cashFlowLabels = [];
            $cashInSeries = [];
            $cashOutSeries = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - $i days"));
                $formattedDate = date('j M', strtotime($date));
                $cashFlowLabels[] = $formattedDate;
                $inflow = \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->where('document_type', 'sales_invoice')
                    ->where('status', 'Posted')
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $outflow = \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                    ->where('status', 'Posted')
                    ->where('entry_date', $date)
                    ->sum('total_amount');
                $cashInSeries[] = (float) $inflow;
                $cashOutSeries[] = (float) $outflow;
            }

            $totalGaji = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'payroll_entry')
                ->where('status', 'Posted')
                ->sum('total_amount');
            $totalOperasional = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'expense_entry')
                ->where('status', 'Posted')
                ->sum('total_amount');
            $totalExpense = $totalGaji + $totalOperasional;
            $pctGaji = $totalExpense > 0 ? round(($totalGaji / $totalExpense) * 100) : 0;
            $pctOpr = $totalExpense > 0 ? round(($totalOperasional / $totalExpense) * 100) : 0;

            $salesInvoiceQuery = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'sales_invoice')
                ->where('status', 'Posted');
            $fakturLunasSales = (float) (clone $salesInvoiceQuery)->sum('paid_amount');
            $fakturBelumLunasSales = (float) (clone $salesInvoiceQuery)->sum('outstanding_amount');
            $belumJatuhTempoSales = (float) (clone $salesInvoiceQuery)->where('due_date', '>=', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $lewatJatuhTempoSales = (float) (clone $salesInvoiceQuery)->where('due_date', '<', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $hariIniSales = (float) (clone $salesInvoiceQuery)->where('entry_date', $latestSalesInvoiceDate)->sum('total_amount');

            $purchaseInvoiceQuery = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'purchase_invoice')
                ->where('status', 'Posted');
            $fakturLunasPurchase = (float) (clone $purchaseInvoiceQuery)->sum('paid_amount');
            $fakturBelumLunasPurchase = (float) (clone $purchaseInvoiceQuery)->sum('outstanding_amount');
            $belumJatuhTempoPurchase = (float) (clone $purchaseInvoiceQuery)->where('due_date', '>=', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $lewatJatuhTempoPurchase = (float) (clone $purchaseInvoiceQuery)->where('due_date', '<', $latestSalesInvoiceDate)->sum('outstanding_amount');
            $hariIniPurchase = (float) (clone $purchaseInvoiceQuery)->where('entry_date', $latestSalesInvoiceDate)->sum('total_amount');

            $dbSalespeople = \Illuminate\Support\Facades\DB::table('employees')
                ->where('is_active', 1)
                ->where('is_salesperson', 1)
                ->select('id', 'full_name', 'position')
                ->get();
            $salesTeamRows = [];
            foreach ($dbSalespeople as $sp) {
                $totalVal = 0;
                $user = \Illuminate\Support\Facades\DB::table('users')->where('name', 'like', "%{$sp->full_name}%")->first();
                if ($user) {
                    $totalVal = \Illuminate\Support\Facades\DB::table('operation_documents')
                        ->where('document_type', 'sales_invoice')
                        ->where('status', 'Posted')
                        ->where('responsible_user_id', $user->id)
                        ->sum('total_amount');
                }
                $salesTeamRows[] = [
                    'name' => $sp->full_name,
                    'role' => $sp->position ?? 'Salesperson',
                    'totalValue' => $totalVal > 0 ? $formatCurrencyShort($totalVal) : 'Rp -',
                    'targetPercent' => '0%',
                    'targetValue' => '-',
                ];
            }
            if (empty($salesTeamRows)) {
                $salesTeamRows = [
                    [
                        'name' => 'Belum ada data',
                        'role' => 'Sales Toko',
                        'totalValue' => 'Rp -',
                        'targetPercent' => '0%',
                        'targetValue' => '-',
                    ]
                ];
            }

            $dbTopProducts = \Illuminate\Support\Facades\DB::table('operation_document_lines')
                ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
                ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
                ->leftJoin('units', 'products.base_unit_id', '=', 'units.id')
                ->where('operation_documents.document_type', 'sales_invoice')
                ->where('operation_documents.status', 'Posted')
                ->select(
                    'products.name',
                    \Illuminate\Support\Facades\DB::raw('SUM(operation_document_lines.quantity) as units_sold'),
                    \Illuminate\Support\Facades\DB::raw('SUM(operation_document_lines.total_amount) as revenue'),
                    'units.name as unit_name'
                )
                ->groupBy('products.id', 'products.name', 'units.name')
                ->orderByDesc('revenue')
                ->limit(5)
                ->get();
            $topProductsItems = [];
            foreach ($dbTopProducts as $tp) {
                $pctShare = $totalSalesVal > 0 ? ($tp->revenue / $totalSalesVal) * 100 : 0;
                $topProductsItems[] = [
                    'name' => $tp->name,
                    'units' => number_format($tp->units_sold, 0, ',', '.') . ' ' . ($tp->unit_name ?? 'pcs'),
                    'share' => number_format($pctShare, 1, ',', '.') . '%',
                    'revenue' => $formatCurrencyShort($tp->revenue),
                ];
            }
            if (empty($topProductsItems)) {
                $topProductsItems = [
                    [
                        'name' => 'Belum ada data',
                        'units' => '0 pcs',
                        'share' => '0%',
                        'revenue' => 'Rp -',
                    ]
                ];
            }

            $cashAvailabilityLabels = [];
            $cashAvailabilitySeries = [];
            for ($i = 7; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime($latestSalesInvoiceDate . " - " . ($i * 4) . " days"));
                $formattedDate = date('j M', strtotime($date));
                $cashAvailabilityLabels[] = $formattedDate;
                $inUpToDate = \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->where('document_type', 'sales_invoice')
                    ->where('status', 'Posted')
                    ->where('entry_date', '<=', $date)
                    ->sum('total_amount');
                $outUpToDate = \Illuminate\Support\Facades\DB::table('operation_documents')
                    ->whereIn('document_type', ['payroll_entry', 'expense_entry'])
                    ->where('status', 'Posted')
                    ->where('entry_date', '<=', $date)
                    ->sum('total_amount');
                $cashAvailabilitySeries[] = 28000000000 + ($inUpToDate - $outUpToDate);
            }

            $totalSalesOrders = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->count();
            $pendingSalesOrders = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->where('status', 'Draft')
                ->count();
            $overdueSalesOrders = \Illuminate\Support\Facades\DB::table('operation_documents')
                ->where('document_type', 'sales_order')
                ->where('due_date', '<', date('Y-m-d'))
                ->count();
        } else {
            $latestSalesInvoiceDate = date('Y-m-d');
            $salesTrendLabels = [];
            $salesTrendData = [];
            $totalSalesVal = 0.0;
            $totalHppVal = 0.0;
            $totalExpensesVal = 0.0;
            $profitPercentage = '0%';
            $netProfitVal = 0.0;
            $pctRev = 0;
            $pctHpp = 0;
            $pctExp = 0;
            $cashFlowLabels = [];
            $cashInSeries = [];
            $cashOutSeries = [];
            $totalGaji = 0.0;
            $totalOperasional = 0.0;
            $totalExpense = 0.0;
            $pctGaji = 0;
            $pctOpr = 0;
            $fakturLunasSales = 0.0;
            $fakturBelumLunasSales = 0.0;
            $belumJatuhTempoSales = 0.0;
            $lewatJatuhTempoSales = 0.0;
            $hariIniSales = 0.0;
            $fakturLunasPurchase = 0.0;
            $fakturBelumLunasPurchase = 0.0;
            $belumJatuhTempoPurchase = 0.0;
            $lewatJatuhTempoPurchase = 0.0;
            $hariIniPurchase = 0.0;
            $salesTeamRows = [
                [
                    'name' => 'Memuat data...',
                    'role' => 'Sales Toko',
                    'totalValue' => 'Rp -',
                    'targetPercent' => '0%',
                    'targetValue' => '-',
                ]
            ];
            $topProductsItems = [
                [
                    'name' => 'Memuat data...',
                    'units' => '0 pcs',
                    'share' => '0%',
                    'revenue' => 'Rp -',
                ]
            ];
            $cashAvailabilityLabels = [];
            $cashAvailabilitySeries = [];
            $totalSalesOrders = 0;
            $pendingSalesOrders = 0;
            $overdueSalesOrders = 0;
        }

        $data = [
            'toolbar' => [
                'widgetLabel' => 'Widget',
                'dashboards' => [
                    [
                        'id' => 'main-dashboard',
                        'label' => 'Dashboard Utama',
                    ],
                    [
                        'id' => 'sales-dashboard',
                        'label' => 'Dashboard Penjualan',
                    ],
                    [
                        'id' => 'stock-dashboard',
                        'label' => 'Dashboard Stok',
                    ],
                ],
                'selectedDashboardId' => 'main-dashboard',
                'dashboardActions' => [
                    'label' => 'Opsi dashboard',
                    'items' => [
                        [
                            'id' => 'add',
                            'label' => 'Tambah Dashboard',
                        ],
                        [
                            'id' => 'edit',
                            'label' => 'Ubah Dashboard',
                        ],
                    ],
                ],
                'addDashboardModal' => [
                    'title' => 'Dashboard',
                    'closeLabel' => 'Tutup modal dashboard',
                    'nameLabel' => 'Nama Dashboard',
                    'submitLabel' => 'Lanjut',
                    'clearLabel' => 'Kosongkan nama dashboard',
                    'deleteLabel' => 'Hapus',
                ],
                'editDashboardModal' => [
                    'title' => 'Dashboard',
                    'closeLabel' => 'Tutup modal dashboard',
                    'nameLabel' => 'Nama Dashboard',
                    'submitLabel' => 'Lanjut',
                    'clearLabel' => 'Kosongkan nama dashboard',
                    'deleteLabel' => 'Hapus',
                ],
                'loadingOverlay' => [
                    'title' => 'Menyiapkan Widget',
                    'description' => 'Mohon tunggu sebentar, daftar widget sedang dipersiapkan.',
                    'durationMs' => 850,
                ],
                'widgetLibraryModal' => [
                    'title' => 'Widget',
                    'closeLabel' => 'Tutup widget library',
                    'searchPlaceholder' => 'Ketik kata kunci',
                    'emptyLabel' => 'Tidak ada widget yang cocok dengan kata kunci tersebut.',
                    'items' => [
                        [
                            'id' => 'integrated-analysis',
                            'title' => 'Matrix Analisis Penjualan (Apriori & ABC)',
                            'description' => 'Integrasi pola belanja bersama (Apriori) dan prioritas nilai penjualan (ABC).',
                            'icon' => 'asset',
                        ],
                        [
                            'id' => 'recent-activity',
                            'title' => 'Aktifitas Terakhir Anda',
                            'description' => 'Menampilkan riwayat aktivitas terakhir pengguna.',
                            'icon' => 'activity',
                        ],
                        [
                            'id' => 'upcoming-activity',
                            'title' => 'Kegiatan Mendatang',
                            'description' => 'Daftar jadwal kegiatan mendatang.',
                            'icon' => 'activity',
                        ],
                        [
                            'id' => 'sales-trend',
                            'title' => 'Tren Penjualan',
                            'description' => 'Grafik garis tren transaksi penjualan toko seminggu terakhir.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'profit-loss',
                            'title' => 'Laba/Rugi Tahun Ini',
                            'description' => 'Analisa breakdown laba bersih, HPP, dan pengeluaran operasional.',
                            'icon' => 'asset',
                        ],
                        [
                            'id' => 'cash-flow',
                            'title' => 'Arus Kas',
                            'description' => 'Grafik perbandingan kas masuk dan kas keluar harian.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'company-expense',
                            'title' => 'Beban Perusahaan',
                            'description' => 'Distribusi pengeluaran kas operasional dan gaji.',
                            'icon' => 'expense',
                        ],
                        [
                            'id' => 'sales-summary',
                            'title' => 'Penjualan',
                            'description' => 'Ringkasan faktur lunas, belum lunas, dan jatuh tempo penjualan.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'purchase-summary',
                            'title' => 'Pembelian',
                            'description' => 'Ringkasan faktur lunas, belum lunas, dan jatuh tempo pembelian.',
                            'icon' => 'expense',
                        ],
                        [
                            'id' => 'sales-team-performance',
                            'title' => 'Penjualan Penjual',
                            'description' => 'Peringkat pencapaian omzet penjualan per salesperson.',
                            'icon' => 'stock',
                        ],
                        [
                            'id' => 'top-products',
                            'title' => 'Barang Paling Laku',
                            'description' => 'Daftar barang terlaris berdasarkan omzet dan kuantitas.',
                            'icon' => 'stock',
                        ],
                        [
                            'id' => 'overdue-activity',
                            'title' => 'Kegiatan Terlewat',
                            'description' => 'Daftar jadwal kegiatan yang sudah lewat jatuh tempo.',
                            'icon' => 'activity',
                        ],
                        [
                            'id' => 'cash-availability',
                            'title' => 'Ketersediaan Kas',
                            'description' => 'Histori saldo kas berjalan dikalkulasi dari inflow dan outflow.',
                            'icon' => 'cash-flow',
                        ],
                        [
                            'id' => 'sales-order-status',
                            'title' => 'Pesanan Penjualan',
                            'description' => 'Status pesanan menunggu proses dan pending.',
                            'icon' => 'stock',
                        ],
                    ],
                ],
                'searchModal' => [
                    'closeLabel' => 'Tutup pencarian menu',
                    'searchPlaceholder' => 'Cari...',
                    'topLabel' => 'Menu Teratas',
                    'resultLabel' => 'Hasil Pencarian',
                    'emptyLabel' => 'Tidak ada menu yang cocok dengan kata kunci tersebut.',
                    'topItemIds' => [
                        'group-access',
                        'preferences',
                        'recurring-transactions',
                        'employees',
                        'fob-master',
                        'salary-allowance',
                        'department',
                        'contacts',
                        'activity-log',
                    ],
                ],
            ],
            'sidebar' => [
                'items' => self::buildSidebarItems($navigationModules),
            ],
            'pages' => array_replace(
                [
                'dashboard' => [
                    'id' => 'dashboard',
                    'label' => 'Dashboard',
                ],
                ],
                $navigationPages,
                [
                'users' => [
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
                            'Nama',
                            'No Handphone',
                            'Email',
                            'Status',
                            'Jenis Akses',
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
                ],
                'group-access' => [
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
                ],
                'department' => [
                    'id' => 'department',
                    'label' => 'Departemen',
                    'subtab' => [
                        'id' => 'department-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Departemen',
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'settingsLabel' => 'Pengaturan tabel departemen',
                        'searchPlaceholder' => 'Cari...',
                        'emptyLabel' => 'Tidak ada data',
                        'pageValue' => '3',
                        'filterOptions' => [
                            ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                            ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                            ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
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
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'userList',
                                'label' => 'Daftar Pengguna',
                                'align' => 'center',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'department-accounting',
                                'inactiveValue' => 'no',
                                'name' => 'Accounting',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'department-head-office',
                                'inactiveValue' => 'no',
                                'name' => 'Head Office',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'department-operational',
                                'inactiveValue' => 'no',
                                'name' => 'Opersional',
                                'userList' => 'Semua Pengguna',
                            ],
                        ],
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'tabs' => [
                            [
                                'id' => 'department-general',
                                'label' => 'Departemen',
                            ],
                            [
                                'id' => 'department-opening-balance',
                                'label' => 'Saldo Awal',
                            ],
                            [
                                'id' => 'department-users',
                                'label' => 'Daftar Pengguna',
                            ],
                        ],
                        'labels' => [
                            'name' => 'Nama',
                            'description' => 'Keterangan',
                            'subDepartment' => 'Sub Dept.',
                        ],
                        'defaults' => [
                            'name' => '',
                            'description' => '',
                            'isSubDepartment' => false,
                            'openingDate' => '25/04/2026',
                        ],
                        'openingBalance' => [
                            'title' => 'Saldo Awal',
                            'dateLabel' => 'Per Tgl',
                            'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                            'emptyLabel' => 'Belum ada data',
                            'columns' => [
                                [
                                    'id' => 'code',
                                    'label' => 'Kode #',
                                    'widthClassName' => 'w-[33%]',
                                ],
                                [
                                    'id' => 'name',
                                    'label' => 'Nama',
                                    'widthClassName' => 'w-[34%]',
                                ],
                                [
                                    'id' => 'value',
                                    'label' => 'Nilai',
                                    'widthClassName' => 'w-[33%]',
                                    'align' => 'right',
                                ],
                            ],
                            'rows' => [],
                        ],
                        'userAccess' => [
                            'title' => 'Akses Pengguna',
                            'allUsersLabel' => 'Semua Pengguna',
                            'allUsersChecked' => true,
                        ],
                    ],
                ],
                'currency-master' => [
                    'id' => 'currency-master',
                    'label' => 'Mata Uang',
                    'subtab' => [
                        'id' => 'currency-master-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'currency' => [
                        'saveLabel' => 'Simpan',
                        'deleteLabel' => 'Hapus',
                        'lookupPlaceholder' => 'Cari/Pilih...',
                        'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                        'createTabs' => [
                            ['id' => 'currency-general', 'label' => 'Mata Uang'],
                        ],
                        'detailTabs' => [
                            ['id' => 'currency-general', 'label' => 'Mata Uang'],
                            ['id' => 'currency-default-accounts', 'label' => 'Default Akun'],
                        ],
                        'labels' => [
                            'countryName' => 'Negara/Nama',
                            'code' => 'Kode',
                            'symbol' => 'Simbol',
                            'flag' => 'Bendera',
                        ],
                        'createDefaults' => [
                            'countryName' => '',
                        ],
                        'accountFields' => [
                            ['id' => 'accountsPayable', 'label' => 'Akun Utang Usaha'],
                            ['id' => 'accountsReceivable', 'label' => 'Akun Piutang Usaha'],
                            ['id' => 'purchaseAdvance', 'label' => 'Akun Uang Muka Pembelian'],
                            ['id' => 'salesAdvance', 'label' => 'Akun Uang Muka Penjualan'],
                            ['id' => 'salesDiscount', 'label' => 'Akun Diskon Penjualan'],
                            ['id' => 'realizedGainLoss', 'label' => 'Akun Laba/Rugi Terealisasi'],
                            ['id' => 'unrealizedGainLoss', 'label' => 'Akun Laba/Rugi Belum Terealisasi'],
                        ],
                        'records' => [
                            [
                                'id' => 'currency-idr',
                                'tabLabel' => 'Indonesian Rupiah',
                                'countryName' => 'Indonesian Rupiah',
                                'code' => 'IDR',
                                'symbol' => 'Rp',
                                'countryCode' => 'ID',
                                'defaultAccounts' => [
                                    'accountsPayable' => '[211.101-01] Hutang Usaha Jakarta - IDR',
                                    'accountsReceivable' => '[112.101-01] Piutang Usaha Jakarta - IDR',
                                    'purchaseAdvance' => '[113.101-01] Uang Muka Pembelian Barang Jakarta - IDR',
                                    'salesAdvance' => '[212.101-01] Uang Muka Penjualan Barang Jakarta - IDR',
                                    'salesDiscount' => '[422.000-01] Potongan Penjualan IDR',
                                    'realizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                    'unrealizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                ],
                            ],
                            [
                                'id' => 'currency-usd',
                                'tabLabel' => 'US Dollar',
                                'countryName' => 'US Dollar',
                                'code' => 'USD',
                                'symbol' => '$',
                                'countryCode' => 'US',
                                'defaultAccounts' => [
                                    'accountsPayable' => '[211.102-01] Hutang Usaha Jakarta - USD',
                                    'accountsReceivable' => '[112.102-01] Piutang Usaha Jakarta - USD',
                                    'purchaseAdvance' => '[113.102-01] Uang Muka Pembelian Barang Jakarta - USD',
                                    'salesAdvance' => '[212.102-01] Uang Muka Penjualan Barang Jakarta - USD',
                                    'salesDiscount' => '[422.000-02] Potongan Penjualan USD',
                                    'realizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                    'unrealizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                ],
                            ],
                            [
                                'id' => 'currency-sgd',
                                'tabLabel' => 'Singapore Dollar',
                                'countryName' => 'Singapore Dollar',
                                'code' => 'SGD',
                                'symbol' => '$',
                                'countryCode' => 'SG',
                                'defaultAccounts' => [
                                    'accountsPayable' => '[211.103-01] Hutang Usaha Jakarta - SGD',
                                    'accountsReceivable' => '[112.103-01] Piutang Usaha Jakarta - SGD',
                                    'purchaseAdvance' => '[113.103-01] Uang Muka Pembelian Barang Jakarta - SGD',
                                    'salesAdvance' => '[212.103-01] Uang Muka Penjualan Barang Jakarta - SGD',
                                    'salesDiscount' => '[422.000-03] Potongan Penjualan SGD',
                                    'realizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                    'unrealizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                ],
                            ],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Mata Uang',
                            'refreshLabel' => 'Muat ulang',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '3',
                            'columns' => [
                                ['id' => 'symbol', 'label' => 'Simbol', 'widthClassName' => 'w-[100px]'],
                                ['id' => 'code', 'label' => 'Kode', 'widthClassName' => 'w-[120px]'],
                                ['id' => 'countryName', 'label' => 'Negara/Nama'],
                                ['id' => 'exchange_rate', 'label' => 'Kurs (ke IDR)', 'widthClassName' => 'w-[180px]', 'align' => 'right'],
                            ],
                            'rows' => [
                                ['id' => 'currency-idr', 'symbol' => 'Rp', 'code' => 'IDR', 'countryName' => 'Indonesian Rupiah', 'exchange_rate' => '1.0000'],
                                ['id' => 'currency-usd', 'symbol' => '$', 'code' => 'USD', 'countryName' => 'US Dollar', 'exchange_rate' => '16350.0000'],
                                ['id' => 'currency-sgd', 'symbol' => '$', 'code' => 'SGD', 'countryName' => 'Singapore Dollar', 'exchange_rate' => '12111.0000'],
                            ],
                        ],
                    ],
                ],
                'payment-terms' => [
                    'id' => 'payment-terms',
                    'label' => 'Syarat Pembayaran',
                    'subtab' => [
                        'id' => 'payment-terms-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'paymentTerms' => [
                        'sectionLabel' => 'Syarat Pembayaran',
                        'saveLabel' => 'Simpan',
                        'deleteLabel' => 'Hapus',
                        'createLabels' => [
                            'discountDays' => 'Jika membayar antara',
                            'discountPercent' => 'Akan mendapat diskon',
                            'dueDays' => 'Masa Jatuh Tempo',
                            'description' => 'Keterangan',
                            'default' => 'Default Syarat Pembayaran',
                            'yesLabel' => 'Ya',
                        ],
                        'detailLabels' => [
                            'name' => 'Nama',
                            'default' => 'Default Syarat Pembayaran',
                            'inactive' => 'Non Aktif',
                        ],
                        'createDefaults' => [
                            'discountDays' => '',
                            'discountPercent' => '',
                            'dueDays' => '',
                            'description' => '',
                            'isDefault' => false,
                        ],
                        'records' => [
                            ['id' => 'payment-1-21-30', 'name' => '1/21 n/30', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-cod', 'name' => 'C.O.D', 'isDefault' => true, 'isInactive' => false],
                            ['id' => 'payment-cicilan', 'name' => 'Cicilan', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-set-manual', 'name' => 'Set Manual', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-net-21', 'name' => 'net 21', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-net-30', 'name' => 'net 30', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-net-45', 'name' => 'net 45', 'isDefault' => false, 'isInactive' => false],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Syarat Pembayaran',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak',
                            'actionsLabel' => 'Pengaturan syarat pembayaran',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '7',
                            'filterOptions' => [
                                ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                            ],
                            'menuItems' => [
                                ['id' => 'column-settings', 'label' => 'Atur kolom'],
                                ['id' => 'export', 'label' => 'Ekspor syarat pembayaran'],
                            ],
                            'columns' => [
                                ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[160px]'],
                                ['id' => 'discountPercent', 'label' => 'Diskon (%)', 'widthClassName' => 'w-[160px]', 'align' => 'right'],
                                ['id' => 'discountDays', 'label' => 'Masa Diskon (hari)', 'widthClassName' => 'w-[190px]', 'align' => 'right'],
                                ['id' => 'dueDays', 'label' => 'Masa Jatuh Tempo (hari)', 'widthClassName' => 'w-[210px]', 'align' => 'right'],
                                ['id' => 'description', 'label' => 'Keterangan'],
                                ['id' => 'inactiveLabel', 'label' => 'Non Aktif', 'widthClassName' => 'w-[160px]'],
                                ['id' => 'defaultLabel', 'label' => 'Default', 'widthClassName' => 'w-[160px]'],
                            ],
                            'rows' => [
                                ['id' => 'payment-1-21-30', 'tabLabel' => '1/21 n/30', 'name' => '1/21 n/30', 'discountPercent' => '1', 'discountDays' => '21', 'dueDays' => '30', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-cod', 'tabLabel' => 'C.O.D', 'name' => 'C.O.D', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '0', 'description' => 'C.O.D', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Ya'],
                                ['id' => 'payment-cicilan', 'tabLabel' => 'Cicilan', 'name' => 'Cicilan', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '0', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-set-manual', 'tabLabel' => 'Set Manual', 'name' => 'Set Manual', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '0', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-net-21', 'tabLabel' => 'net 21', 'name' => 'net 21', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '21', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-net-30', 'tabLabel' => 'net 30', 'name' => 'net 30', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '30', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-net-45', 'tabLabel' => 'net 45', 'name' => 'net 45', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '45', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                            ],
                        ],
                    ],
                ],
                'period-end' => [
                    'id' => 'period-end',
                    'label' => 'Proses Akhir Bulan',
                    'subtab' => [
                        'id' => 'period-end-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'periodEnd' => [
                        'saveLabel' => 'Simpan',
                        'gridButtonLabel' => 'Tampilan daftar kurs',
                        'labels' => [
                            'month' => 'Bulan',
                            'year' => 'Tahun',
                        ],
                        'monthOptions' => ['[Pilih Bulan]', 'Januari', 'Februari', 'Maret', 'April'],
                        'yearOptions' => ['2026', '2025', '2024'],
                        'defaults' => [
                            'month' => '[Pilih Bulan]',
                            'year' => '2026',
                        ],
                        'deleteLabel' => 'Hapus',
                        'historyTable' => [
                            'createLabel' => 'Tambah Proses Akhir Bulan',
                            'refreshLabel' => 'Muat ulang',
                            'actionsLabel' => 'Pengaturan proses akhir bulan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '5',
                            'filters' => [
                                [
                                    'id' => 'month',
                                    'rowKey' => 'monthValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Bulan: Semua'],
                                        ['value' => 'january-2017', 'label' => 'Bulan: Januari 2017'],
                                        ['value' => 'december-2016', 'label' => 'Bulan: Desember 2016'],
                                        ['value' => 'november-2016', 'label' => 'Bulan: November 2016'],
                                        ['value' => 'october-2016', 'label' => 'Bulan: Oktober 2016'],
                                        ['value' => 'september-2016', 'label' => 'Bulan: September 2016'],
                                    ],
                                ],
                                [
                                    'id' => 'year',
                                    'rowKey' => 'yearValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tahun: Semua'],
                                        ['value' => '2017', 'label' => 'Tahun: 2017'],
                                        ['value' => '2016', 'label' => 'Tahun: 2016'],
                                    ],
                                ],
                            ],
                            'menuItems' => [
                                ['id' => 'column-settings', 'label' => 'Atur kolom'],
                                ['id' => 'export', 'label' => 'Ekspor proses akhir bulan'],
                            ],
                            'columns' => [
                                ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[200px]'],
                                ['id' => 'inputDate', 'label' => 'Tanggal Input', 'widthClassName' => 'w-[150px]'],
                                ['id' => 'description', 'label' => 'Keterangan'],
                            ],
                            'rows' => [
                                ['id' => 'period-history-2017-01', 'tabLabel' => 'Januari 2017', 'name' => 'Januari 2017', 'inputDate' => '31/01/2017', 'description' => 'Proses Akhir Bulan (Januari, 2017)', 'monthValue' => 'january-2017', 'yearValue' => '2017'],
                                ['id' => 'period-history-2016-12', 'tabLabel' => 'Desember 2016', 'name' => 'Desember 2016', 'inputDate' => '31/12/2016', 'description' => 'Proses Akhir Bulan (Desember, 2016)', 'monthValue' => 'december-2016', 'yearValue' => '2016'],
                                ['id' => 'period-history-2016-11', 'tabLabel' => 'November 2016', 'name' => 'November 2016', 'inputDate' => '30/11/2016', 'description' => 'Proses Akhir Bulan (November, 2016)', 'monthValue' => 'november-2016', 'yearValue' => '2016'],
                                ['id' => 'period-history-2016-10', 'tabLabel' => 'Oktober 2016', 'name' => 'Oktober 2016', 'inputDate' => '31/10/2016', 'description' => 'Proses Akhir Bulan (Oktober, 2016)', 'monthValue' => 'october-2016', 'yearValue' => '2016'],
                                ['id' => 'period-history-2016-09', 'tabLabel' => 'September 2016', 'name' => 'September 2016', 'inputDate' => '30/09/2016', 'description' => 'Proses Akhir Bulan (September, 2016)', 'monthValue' => 'september-2016', 'yearValue' => '2016'],
                            ],
                        ],
                        'detailRecords' => [
                            [
                                'id' => 'period-history-2017-01',
                                'month' => 'Januari',
                                'year' => '2017',
                                'rates' => [
                                    ['id' => 'period-idr-2017-01', 'currencyName' => 'Indonesian Rupiah', 'rate' => '1'],
                                    ['id' => 'period-sgd-2017-01', 'currencyName' => 'Singapore Dollar', 'rate' => '9,543'],
                                    ['id' => 'period-usd-2017-01', 'currencyName' => 'US Dollar', 'rate' => '12,700'],
                                ],
                            ],
                            [
                                'id' => 'period-history-2016-12',
                                'month' => 'Desember',
                                'year' => '2016',
                                'rates' => [
                                    ['id' => 'period-idr-2016-12', 'currencyName' => 'Indonesian Rupiah', 'rate' => '1'],
                                    ['id' => 'period-sgd-2016-12', 'currencyName' => 'Singapore Dollar', 'rate' => '9,410'],
                                    ['id' => 'period-usd-2016-12', 'currencyName' => 'US Dollar', 'rate' => '12,530'],
                                ],
                            ],
                        ],
                        'ratesTable' => [
                            'columns' => [
                                ['id' => 'handle', 'label' => '', 'widthClassName' => 'w-[36px]'],
                                ['id' => 'currencyName', 'label' => 'Nama Mata Uang'],
                                ['id' => 'rate', 'label' => 'Nilai Tukar', 'align' => 'right'],
                            ],
                            'rows' => [
                                ['id' => 'period-idr', 'currencyName' => 'Indonesian Rupiah', 'rate' => '1'],
                                ['id' => 'period-usd', 'currencyName' => 'US Dollar', 'rate' => '12,300'],
                                ['id' => 'period-sgd', 'currencyName' => 'Singapore Dollar', 'rate' => '9,320'],
                            ],
                        ],
                    ],
                ],
                'budget-transfer' => [
                    'id' => 'budget-transfer',
                    'label' => 'Transfer Anggaran',
                    'subtab' => [
                        'id' => 'budget-transfer-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'budgetTransfer' => [
                        'labels' => [
                            'year' => 'Tahun',
                            'type' => 'Tipe',
                            'branch' => 'Cabang',
                            'transferNumber' => 'No Transfer #',
                            'date' => 'Tanggal',
                            'month' => 'Bulan',
                            'budget' => 'Anggaran',
                            'remainingBudget' => 'Sisa Anggaran',
                            'transferAmount' => 'Nilai Transfer',
                            'notes' => 'Catatan',
                        ],
                        'yearOptions' => ['2026', '2025', '2024'],
                        'typeOptions' => ['Umum', 'Departemen'],
                        'numberingOptions' => ['Transfer Anggaran'],
                        'monthOptions' => [
                            'Januari',
                            'Februari',
                            'Maret',
                            'April',
                            'Mei',
                            'Juni',
                            'Juli',
                            'Agustus',
                            'September',
                            'Oktober',
                            'November',
                            'Desember',
                        ],
                        'defaults' => [
                            'year' => '2026',
                            'type' => 'Umum',
                            'branches' => ['JAKARTA'],
                            'autoNumber' => true,
                            'numberingType' => 'Transfer Anggaran',
                            'transferNumber' => '',
                            'date' => '25/04/2026',
                            'fromMonth' => 'Januari',
                            'fromBudget' => '',
                            'remainingBudget' => '-',
                            'transferAmount' => '',
                            'toMonth' => 'Januari',
                            'toBudget' => '',
                            'notes' => '',
                        ],
                        'branchPlaceholder' => 'Cari/Pilih...',
                        'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                        'currencyPrefix' => 'Rp',
                        'fromTitle' => 'Transfer Dari Anggaran',
                        'toTitle' => 'Ke Anggaran',
                        'infoTitle' => 'Info lainnya',
                        'sectionTabs' => [
                            ['id' => 'details', 'label' => 'Rincian Transfer', 'icon' => 'document'],
                            ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                        ],
                        'dockActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'blue',
                            ],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Transfer Anggaran',
                            'refreshLabel' => 'Muat ulang',
                            'settingsLabel' => 'Pengaturan transfer anggaran',
                            'filterButtonLabel' => 'Filter lanjutan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '0',
                            'emptyLabel' => 'Belum ada data',
                            'filters' => [
                                [
                                    'id' => 'date',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                        ['value' => 'today', 'label' => 'Tanggal: Hari ini'],
                                        ['value' => 'month', 'label' => 'Tanggal: Bulan ini'],
                                    ],
                                ],
                            ],
                            'columns' => [
                                ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[24%]'],
                                ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[14%]'],
                                ['id' => 'fromAccount', 'label' => 'Dari Akun', 'widthClassName' => 'w-[23%]'],
                                ['id' => 'toAccount', 'label' => 'Ke Akun', 'widthClassName' => 'w-[23%]'],
                                ['id' => 'transferValue', 'label' => 'Nilai Transfer', 'widthClassName' => 'w-[16%]', 'align' => 'right'],
                            ],
                            'rows' => [],
                        ],
                    ],
                ],
                'budget' => [
                    'id' => 'budget',
                    'label' => 'Anggaran',
                    'subtab' => [
                        'id' => 'budget-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'budgetPage' => [
                        'labels' => [
                            'month' => 'Bulan',
                            'type' => 'Tipe',
                            'branch' => 'Berlaku di Cabang',
                            'notes' => 'Catatan',
                            'analyzer' => 'Penganalisa',
                        ],
                        'monthOptions' => ['Januari', 'Februari', 'Maret', 'April'],
                        'yearOptions' => ['2026', '2025', '2024'],
                        'typeOptions' => ['Umum', 'Departemen'],
                        'defaults' => [
                            'month' => 'Januari',
                            'year' => '2026',
                            'type' => 'Umum',
                            'branches' => ['JAKARTA'],
                            'notes' => '',
                            'analyzer' => '',
                        ],
                        'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                        'takeButtonLabel' => 'Ambil',
                        'gridTitle' => 'Rincian Anggaran',
                        'infoTitle' => 'Info lainnya',
                        'sectionTabs' => [
                            ['id' => 'budget-lines', 'label' => 'Rincian Anggaran', 'icon' => 'document'],
                            ['id' => 'budget-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                        ],
                        'grid' => [
                            'columns' => [
                                ['id' => 'name', 'label' => 'Beban/Pendapatan'],
                                ['id' => 'code', 'label' => 'Kode #'],
                                ['id' => 'budgetValue', 'label' => 'Anggaran', 'align' => 'right'],
                            ],
                            'rows' => [],
                            'emptyLabel' => 'Belum ada data',
                        ],
                        'dockActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'muted',
                                'items' => [
                                    ['id' => 'save-budget', 'label' => 'Simpan anggaran'],
                                ],
                            ],
                            [
                                'id' => 'document',
                                'label' => 'Dokumen',
                                'icon' => 'document',
                                'tone' => 'blue',
                                'items' => [
                                    ['id' => 'budget-detail', 'label' => 'Lihat rincian'],
                                    ['id' => 'budget-preview', 'label' => 'Preview anggaran'],
                                ],
                            ],
                            [
                                'id' => 'actions',
                                'label' => 'Aksi lainnya',
                                'icon' => 'kebab',
                                'tone' => 'green',
                                'items' => [
                                    ['id' => 'budget-copy', 'label' => 'Salin dari anggaran lain'],
                                    ['id' => 'budget-adjust', 'label' => 'Sesuaikan nilai anggaran'],
                                ],
                            ],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Anggaran',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak',
                            'actionsLabel' => 'Pengaturan anggaran',
                            'filterButtonLabel' => 'Filter lanjutan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '0',
                            'emptyLabel' => 'Belum ada data',
                            'filters' => [
                                [
                                    'id' => 'department',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Departemen: Semua'],
                                        ['value' => 'management', 'label' => 'Departemen: Management'],
                                        ['value' => 'accounting', 'label' => 'Departemen: Accounting'],
                                    ],
                                ],
                                [
                                    'id' => 'type',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tipe: Semua'],
                                        ['value' => 'general', 'label' => 'Tipe: Umum'],
                                        ['value' => 'department', 'label' => 'Tipe: Departemen'],
                                    ],
                                ],
                            ],
                            'menuItems' => [
                                ['id' => 'budget-columns', 'label' => 'Atur kolom'],
                                ['id' => 'budget-export', 'label' => 'Ekspor anggaran'],
                            ],
                            'columns' => [
                                ['id' => 'year', 'label' => 'Tahun', 'widthClassName' => 'w-[80px]'],
                                ['id' => 'month', 'label' => 'Bulan', 'widthClassName' => 'w-[150px]'],
                                ['id' => 'typeLabel', 'label' => 'Tipe', 'widthClassName' => 'w-[150px]'],
                                ['id' => 'analyzer', 'label' => 'Penganalisa'],
                                ['id' => 'notes', 'label' => 'Catatan'],
                            ],
                            'rows' => [],
                        ],
                    ],
                ],
                'company-tax' => [
                    'id' => 'company-tax',
                    'label' => 'Pajak',
                    'subtab' => [
                        'id' => 'company-tax-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Pajak',
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'actionsLabel' => 'Pengaturan daftar pajak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '6',
                        'filterOptions' => [
                            ['value' => 'all', 'label' => 'Tipe Pajak: Semua'],
                            ['value' => 'vat', 'label' => 'Tipe Pajak: Pajak Pertambahan Nilai'],
                            ['value' => 'pph23', 'label' => 'Tipe Pajak: Pajak Penghasilan Ps.23'],
                            ['value' => 'pph21', 'label' => 'Tipe Pajak: Pajak Penghasilan Ps.21'],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'view-settings', 'label' => 'Atur tampilan'],
                        ],
                        'rows' => [
                            [
                                'id' => 'tax-vat',
                                'tabLabel' => 'Pajak Pertambahan...',
                                'typeValue' => 'vat',
                                'typeLabel' => 'Pajak Pertambahan Nilai',
                                'description' => 'Pajak Pertambahan Nilai',
                                'percentage' => '10',
                                'salesAccount' => '[215.000-01] PPN Keluaran',
                                'purchaseAccount' => '[117.000-01] PPN Masukan',
                            ],
                            [
                                'id' => 'tax-software-services',
                                'tabLabel' => 'Jasa Software...',
                                'typeValue' => 'pph23',
                                'typeLabel' => 'Pajak Penghasilan Ps.23',
                                'description' => 'Jasa Software Komputer',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-technical-services',
                                'tabLabel' => 'Jasa Teknik',
                                'typeValue' => 'pph23',
                                'typeLabel' => 'Pajak Penghasilan Ps.23',
                                'description' => 'Jasa Teknik',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-cleaning-services',
                                'tabLabel' => 'Jasa Kebersihan',
                                'typeValue' => 'pph23',
                                'typeLabel' => 'Pajak Penghasilan Ps.23',
                                'description' => 'Jasa Kebersihan',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-freight-services',
                                'tabLabel' => 'Jasa Freight...',
                                'typeValue' => 'pph23',
                                'typeLabel' => 'Pajak Penghasilan Ps.23',
                                'description' => 'Jasa Freight forwarding',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-pph21',
                                'tabLabel' => 'PPh 21',
                                'typeValue' => 'pph21',
                                'typeLabel' => 'Pajak Penghasilan Ps.21',
                                'description' => 'PPh 21',
                                'percentage' => '0',
                                'salesAccount' => '[215.200-01] Hutang PPh 21',
                                'purchaseAccount' => '[117.200-01] Piutang PPh 21',
                            ],
                        ],
                    ],
                    'form' => [
                        'sectionLabel' => 'Pajak',
                        'saveLabel' => 'Simpan',
                        'deleteLabel' => 'Hapus',
                        'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                        'salesAccountSearchLabel' => 'Cari akun pajak penjualan',
                        'purchaseAccountSearchLabel' => 'Cari akun pajak pembelian',
                        'labels' => [
                            'type' => 'Tipe Pajak',
                            'description' => 'Keterangan',
                            'percentage' => 'Persentase',
                            'salesAccount' => 'Akun Pajak Penjualan',
                            'purchaseAccount' => 'Akun Pajak Pembelian',
                        ],
                        'typeOptions' => [
                            ['value' => '', 'label' => '- Pilih Tipe Pajak -'],
                            ['value' => 'vat', 'label' => 'Pajak Pertambahan Nilai'],
                            ['value' => 'pph23', 'label' => 'Pajak Penghasilan Ps.23'],
                            ['value' => 'pph21', 'label' => 'Pajak Penghasilan Ps.21'],
                        ],
                        'createDefaults' => [
                            'type' => '',
                            'description' => '',
                            'percentage' => '',
                            'salesAccount' => '',
                            'purchaseAccount' => '',
                        ],
                        'records' => [
                            [
                                'id' => 'tax-vat',
                                'type' => 'vat',
                                'description' => 'Pajak Pertambahan Nilai',
                                'percentage' => '10',
                                'salesAccount' => '[215.000-01] PPN Keluaran',
                                'purchaseAccount' => '[117.000-01] PPN Masukan',
                            ],
                            [
                                'id' => 'tax-software-services',
                                'type' => 'pph23',
                                'description' => 'Jasa Software Komputer',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-technical-services',
                                'type' => 'pph23',
                                'description' => 'Jasa Teknik',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-cleaning-services',
                                'type' => 'pph23',
                                'description' => 'Jasa Kebersihan',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-freight-services',
                                'type' => 'pph23',
                                'description' => 'Jasa Freight forwarding',
                                'percentage' => '2',
                                'salesAccount' => '[215.100-02] PPh 23 Keluaran',
                                'purchaseAccount' => '[117.100-02] PPh 23 Masukan',
                            ],
                            [
                                'id' => 'tax-pph21',
                                'type' => 'pph21',
                                'description' => 'PPh 21',
                                'percentage' => '0',
                                'salesAccount' => '[215.200-01] Hutang PPh 21',
                                'purchaseAccount' => '[117.200-01] Piutang PPh 21',
                            ],
                        ],
                    ],
                ],
                'branch' => [
                    'id' => 'branch',
                    'label' => 'Cabang',
                    'subtab' => [
                        'id' => 'branch-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Cabang',
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
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
                        'columns' => [
                            [
                                'id' => 'phone',
                                'label' => 'No. Telepon',
                                'align' => 'left',
                                'widthClassName' => 'w-[28%]',
                            ],
                            [
                                'id' => 'inactiveLabel',
                                'label' => 'Non Aktif',
                                'align' => 'left',
                                'widthClassName' => 'w-[28%]',
                            ],
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'align' => 'left',
                                'widthClassName' => 'w-[17%]',
                            ],
                            [
                                'id' => 'userList',
                                'label' => 'Daftar Pengguna',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'branch-jakarta',
                                'phone' => '',
                                'inactiveLabel' => 'Tidak',
                                'inactiveValue' => 'no',
                                'name' => 'JAKARTA',
                                'userList' => 'Vando Rufi Sundawan, Jhonni Haris Limbong',
                            ],
                            [
                                'id' => 'branch-surabaya',
                                'phone' => '',
                                'inactiveLabel' => 'Tidak',
                                'inactiveValue' => 'no',
                                'name' => 'SURABAYA',
                                'userList' => 'Erick Szeto',
                            ],
                        ],
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'tabs' => [
                            [
                                'id' => 'branch-general',
                                'label' => 'Cabang',
                            ],
                            [
                                'id' => 'branch-users',
                                'label' => 'Daftar Pengguna',
                            ],
                        ],
                        'defaults' => [
                            'name' => '',
                            'phone' => '',
                            'street' => '',
                            'city' => '',
                            'postalCode' => '',
                            'province' => '',
                            'country' => '',
                        ],
                        'userAccess' => [
                            'title' => 'Akses Pengguna',
                            'allUsersLabel' => 'Semua Pengguna',
                            'allUsersChecked' => true,
                        ],
                    ],
                ],
                'employees' => [
                    'id' => 'employees',
                    'label' => 'Karyawan',
                    'subtab' => [
                        'id' => 'employees-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Karyawan',
                        'refreshLabel' => 'Muat ulang',
                        'downloadLabel' => 'Unduh',
                        'shareLabel' => 'Bagikan',
                        'printLabel' => 'Cetak',
                        'actionsLabel' => 'Aksi karyawan',
                        'filterButtonLabel' => 'Filter lanjutan',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '11',
                        'filters' => [
                            [
                                'id' => 'inactive',
                                'rowKey' => 'inactiveValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                    ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                    ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                                ],
                            ],
                            [
                                'id' => 'employment-status',
                                'rowKey' => 'employmentStatusValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Status Pekerja: Semua'],
                                    ['value' => 'permanent', 'label' => 'Status Pekerja: Pegawai Tetap'],
                                ],
                            ],
                            [
                                'id' => 'department',
                                'rowKey' => 'departmentValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Departemen: Semua'],
                                    ['value' => 'consulting', 'label' => 'Departemen: Consulting'],
                                    ['value' => 'accounting', 'label' => 'Departemen: Accounting'],
                                    ['value' => 'management', 'label' => 'Departemen: Management'],
                                ],
                            ],
                            [
                                'id' => 'seller',
                                'rowKey' => 'sellerValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Penjual: Semua'],
                                    ['value' => 'yes', 'label' => 'Penjual: Ya'],
                                    ['value' => 'no', 'label' => 'Penjual: Tidak'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'export-employees', 'label' => 'Ekspor daftar karyawan'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'widthClassName' => 'w-[190px]',
                            ],
                            [
                                'id' => 'position',
                                'label' => 'Posisi Jabatan',
                                'widthClassName' => 'w-[310px]',
                            ],
                            [
                                'id' => 'email',
                                'label' => 'Email',
                                'widthClassName' => 'w-[310px]',
                            ],
                            [
                                'id' => 'mobilePhone',
                                'label' => 'Handphone',
                                'widthClassName' => 'w-[210px]',
                            ],
                            [
                                'id' => 'employeeId',
                                'label' => 'ID Karyawan',
                                'widthClassName' => 'w-[150px]',
                            ],
                            [
                                'id' => 'taxStatus',
                                'label' => 'Status PTKP',
                                'widthClassName' => 'w-[130px]',
                            ],
                            [
                                'id' => 'employmentStatus',
                                'label' => 'Status Pekerja',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'payable',
                                'label' => 'Utang',
                                'widthClassName' => 'w-[120px]',
                                'align' => 'right',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'employee-adam',
                                'name' => 'Adam',
                                'position' => 'Junior Staf TB Nur',
                                'email' => 'onsite_jkt@tbnur.com',
                                'mobilePhone' => '081315778xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-ahmad',
                                'name' => 'Ahmad',
                                'position' => 'Supervisor Staf TB Nur',
                                'email' => 'ahmadyani@tbnur.com',
                                'mobilePhone' => '081288087xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-ari',
                                'name' => 'Ari',
                                'position' => 'Junior Staf TB Nur',
                                'email' => 'onsite_sby@tbnur.com',
                                'mobilePhone' => '08115222xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-cynthia',
                                'name' => 'Cynthia',
                                'position' => 'Accounting',
                                'email' => 'onsite_jkt@tbnur.com',
                                'mobilePhone' => '08511294xxxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'accounting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-darwin',
                                'name' => 'Darwin Nur',
                                'position' => 'Direktur',
                                'email' => 'onsite_jkt@tbnur.com',
                                'mobilePhone' => '081287773xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'K1',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'management',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-eko',
                                'name' => 'Eko',
                                'position' => 'Junior Staf TB Nur',
                                'email' => 'onsite_sby@tbnur.com',
                                'mobilePhone' => '085646779xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'K1',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-erick',
                                'name' => 'Erick',
                                'position' => 'Asst. Supervisor Staf TB Nur',
                                'email' => 'erick@tbnur.com',
                                'mobilePhone' => '081293274xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-fandy',
                                'name' => 'Fandy',
                                'position' => 'Junior Staf TB Nur',
                                'email' => 'onsite_jkt@tbnur.com',
                                'mobilePhone' => '08999294xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-jhonni',
                                'name' => 'Jhonni Haris',
                                'position' => 'Asst. Supervisor Staf TB Nur',
                                'email' => 'jhonni@tbnur.com',
                                'mobilePhone' => '081297584xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-roni',
                                'name' => 'Roni',
                                'position' => 'Junior Staf TB Nur',
                                'email' => 'onsite_jkt@tbnur.com',
                                'mobilePhone' => '081285612xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                            [
                                'id' => 'employee-vando',
                                'name' => 'Vando',
                                'position' => 'Asst. Manager Staf TB Nur',
                                'email' => 'vando@tbnur.com',
                                'mobilePhone' => '081317805xxx',
                                'employeeId' => '0426201200...',
                                'taxStatus' => 'TK0',
                                'employmentStatus' => 'Pegawai Tetap',
                                'payable' => 'IDR 0',
                                'inactiveValue' => 'no',
                                'employmentStatusValue' => 'permanent',
                                'departmentValue' => 'consulting',
                                'sellerValue' => 'no',
                            ],
                        ],
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'attachmentLabel' => 'Lampiran',
                        'tabs' => [
                            [
                                'id' => 'employee-general',
                                'label' => 'Karyawan',
                            ],
                            [
                                'id' => 'employee-address',
                                'label' => 'Alamat',
                            ],
                            [
                                'id' => 'employee-tax',
                                'label' => 'Pajak Penghasilan',
                            ],
                            [
                                'id' => 'employee-bank',
                                'label' => 'Rekening Gaji',
                            ],
                        ],
                        'salutationOptions' => [
                            'Bapak',
                            'Ibu',
                        ],
                        'nationalityOptions' => [
                            'Indonesia',
                            'WNA',
                        ],
                        'employeeIdTypeOptions' => [
                            'Karyawan',
                            'Kontrak',
                            'Magang',
                        ],
                        'branchOptions' => [
                            'JAKARTA',
                            'SURABAYA',
                        ],
                        'departmentOptions' => [
                            'Accounting',
                            'Gudang',
                            'Keuangan',
                            'Penjualan',
                        ],
                        'bankOptions' => [
                            'Bank BCA',
                            'Bank BNI',
                            'Bank BRI',
                            'Bank Mandiri',
                        ],
                        'employmentStatusOptions' => [
                            'Pegawai Tetap',
                            'Pegawai Kontrak',
                        ],
                        'taxAllowanceStatusOptions' => [
                            'Tidak Kawin (Tidak ada tanggungan)',
                            'Kawin (Tidak ada tanggungan)',
                            'Kawin (1 tanggungan)',
                        ],
                        'taxStartMonthOptions' => [
                            'Januari',
                            'Februari',
                            'Maret',
                            'April',
                            'Mei',
                            'Juni',
                            'Juli',
                            'Agustus',
                            'September',
                            'Oktober',
                            'November',
                            'Desember',
                        ],
                        'taxStartYearOptions' => [
                            '2026',
                            '2025',
                        ],
                        'taxCalculationNote' => 'Penghasilan dan PPh sebelumnya HANYA PERLU diisikan jika PPh sudah dihitung dan dibayarkan dari januari, namun Pencatatan gaji di TB Nur POS hanya di isi mulai bulan April 2026',
                        'defaults' => [
                            'salutation' => 'Bapak',
                            'fullName' => '',
                            'position' => '',
                            'email' => '',
                            'mobilePhone' => '',
                            'officePhone' => '',
                            'homePhone' => '',
                            'whatsApp' => '',
                            'website' => '',
                            'nationality' => 'Indonesia',
                            'autoEmployeeId' => true,
                            'employeeIdType' => 'Karyawan',
                            'joinDate' => '24/04/2026',
                            'identityNumber' => '',
                            'branch' => 'JAKARTA',
                            'department' => '',
                            'isSalesperson' => false,
                            'note' => '',
                            'street' => '',
                            'city' => '',
                            'postalCode' => '',
                            'province' => '',
                            'country' => '',
                            'subjectToIncomeTax' => true,
                            'taxNumber' => '',
                            'employmentStatus' => 'Pegawai Tetap',
                            'taxAllowanceApplies' => 'Ya',
                            'taxAllowanceStatus' => 'Tidak Kawin (Tidak ada tanggungan)',
                            'taxStartMonth' => 'April',
                            'taxStartYear' => '2026',
                            'previousIncome' => '',
                            'previousTax' => '',
                            'bankName' => '',
                            'bankAccountNumber' => '',
                            'bankAccountHolder' => '',
                        ],
                    ],
                ],
                'fob-master' => [
                    'id' => 'fob-master',
                    'label' => 'FOB',
                    'subtab' => [
                        'id' => 'fob-master-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah FOB',
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '2',
                        'columns' => [
                            [
                                'id' => 'spacer',
                                'label' => '',
                                'kind' => 'spacer',
                                'align' => 'left',
                                'widthClassName' => 'w-[34px]',
                                'cellClassName' => 'px-0',
                            ],
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'align' => 'center',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'fob-destination',
                                'name' => 'Destination',
                            ],
                            [
                                'id' => 'fob-shipping-point',
                                'name' => 'Shipping Point',
                            ],
                        ],
                    ],
                    'form' => [
                        'sectionLabel' => 'FOB',
                        'saveLabel' => 'Simpan',
                        'fields' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'required' => true,
                                'value' => '',
                                'containerClassName' => 'max-w-[420px]',
                            ],
                        ],
                    ],
                ],
                'shipping-master' => [
                    'id' => 'shipping-master',
                    'label' => 'Pengiriman',
                    'subtab' => [
                        'id' => 'shipping-master-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Pengiriman',
                        'refreshLabel' => 'Muat ulang',
                        'downloadLabel' => 'Unduh data pengiriman',
                        'printLabel' => 'Cetak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '0',
                        'emptyLabel' => 'Belum ada data',
                        'filterOptions' => [
                            ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                            ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                            ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                        ],
                        'downloadItems' => [
                            ['id' => 'download-xlsx', 'label' => 'Unduh Excel'],
                            ['id' => 'download-csv', 'label' => 'Unduh CSV'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'pic',
                                'label' => 'PIC',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'phone',
                                'label' => 'No. Telp',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'address',
                                'label' => 'Alamat Lengkap',
                                'widthClassName' => 'w-[20%]',
                            ],
                            [
                                'id' => 'inactiveLabel',
                                'label' => 'Non Aktif',
                                'widthClassName' => 'w-[20%]',
                            ],
                        ],
                        'rows' => [],
                    ],
                    'form' => [
                        'sectionLabel' => 'Pengiriman',
                        'saveLabel' => 'Simpan',
                        'labels' => [
                            'name' => 'Nama',
                            'pic' => 'PIC',
                            'phone' => 'No. Telp',
                            'address' => 'Alamat Pengiriman',
                        ],
                        'defaults' => [
                            'name' => '',
                            'pic' => '',
                            'phone' => '',
                            'street' => '',
                            'city' => '',
                            'postalCode' => '',
                            'province' => '',
                            'country' => '',
                        ],
                    ],
                ],
                'contacts' => [
                    'id' => 'contacts',
                    'label' => 'Kontak',
                    'showViewIndicator' => true,
                    'table' => [
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'actionsLabel' => 'Aksi kontak',
                        'filterButtonLabel' => 'Filter kontak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '127',
                        'filters' => [
                            [
                                'id' => 'type',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe: Semua'],
                                    ['value' => 'customer', 'label' => 'Tipe: Pelanggan'],
                                    ['value' => 'supplier', 'label' => 'Tipe: Pemasok'],
                                    ['value' => 'employee', 'label' => 'Tipe: Karyawan'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'export-contacts', 'label' => 'Ekspor kontak'],
                        ],
                        'columns' => [
                            ['id' => 'fullName', 'label' => 'Nama Lengkap', 'align' => 'left', 'widthClassName' => 'w-[24%]'],
                            ['id' => 'typeLabel', 'label' => 'Tipe', 'align' => 'left', 'widthClassName' => 'w-[10%]'],
                            ['id' => 'company', 'label' => 'Perusahaan', 'align' => 'left', 'widthClassName' => 'w-[24%]'],
                            ['id' => 'mobilePhone', 'label' => 'Handphone', 'align' => 'left', 'widthClassName' => 'w-[24%]'],
                            ['id' => 'email', 'label' => 'Email', 'align' => 'left', 'widthClassName' => 'w-[18%]'],
                        ],
                        'rows' => [
                            ['id' => 'contact-001', 'fullName' => 'Pelanggan Umum - Surabaya', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Pelanggan Umum - Surabaya', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-002', 'fullName' => 'PT CIRCLE PHONE', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT CIRCLE PHONE', 'mobilePhone' => '', 'email' => 'Purchase@circlephone.com'],
                            ['id' => 'contact-003', 'fullName' => 'Miss Anna', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT.CIRCLE PHONE', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-004', 'fullName' => 'Grow up Phone Cellular', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Grow up Phone Cellular', 'mobilePhone' => '', 'email' => 'buyingmartinus@yahoo.com'],
                            ['id' => 'contact-005', 'fullName' => 'Mr. Martinus', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Grow up Phone Cellular', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-006', 'fullName' => 'SUN Acerssories', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'SUN Acerssories', 'mobilePhone' => '', 'email' => 'sunbuy@yahoo.com'],
                            ['id' => 'contact-007', 'fullName' => 'Mr. Lassarisi', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'SUN Acerssories', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-008', 'fullName' => 'Abadi Phone Center', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Abadi Phone Center', 'mobilePhone' => '', 'email' => 'rikson93@gmail.com'],
                            ['id' => 'contact-009', 'fullName' => 'Rikson', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Abadi Phone Center', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-010', 'fullName' => 'Nasional Phone Jaya', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Nasional Phone Jaya', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-011', 'fullName' => 'Miss. Eventi', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Nasional Phone Jaya', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-012', 'fullName' => 'National Earth Accessories', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'National Earth Accessories', 'mobilePhone' => '', 'email' => 'prcs@earthaccessories.com'],
                            ['id' => 'contact-013', 'fullName' => 'Miss Lena', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'National Earth Accessories', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-014', 'fullName' => 'PT Global Makmur', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT Global Makmur', 'mobilePhone' => '', 'email' => 'imanlimbong.makmur@gmail.com'],
                            ['id' => 'contact-015', 'fullName' => 'Mr. Iman', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT. Global Makmur', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-016', 'fullName' => 'PT Kapuk Kartika', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT Kapuk Kartika', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-017', 'fullName' => 'Miss Anggreani', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT. Kapuk Kartika', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-018', 'fullName' => 'PT Emas Sentosa', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT Emas Sentosa', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-019', 'fullName' => 'Miss Winny', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT. Emas Sentosa', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-020', 'fullName' => 'CV Surya Teknik', 'typeValue' => 'supplier', 'typeLabel' => 'Pemasok', 'company' => 'CV Surya Teknik', 'mobilePhone' => '0812-1111-2233', 'email' => 'procurement@suryateknik.id'],
                            ['id' => 'contact-021', 'fullName' => 'Budi Santoso', 'typeValue' => 'employee', 'typeLabel' => 'Karyawan', 'company' => 'TB Nur Pusat', 'mobilePhone' => '0813-8899-1122', 'email' => 'budi.santoso@tbnur.com'],
                        ],
                    ],
                ],
                'favorite-transactions' => [
                    'id' => 'favorite-transactions',
                    'label' => 'Transaksi Favorit',
                    'showViewIndicator' => true,
                    'savedTransactions' => [
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '2',
                        'searchWidthClassName' => 'sm:w-[340px]',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'payroll-entry', 'label' => 'Tipe Transaksi: Pencatatan Gaji'],
                                    ['value' => 'general-journal', 'label' => 'Tipe Transaksi: Jurnal Umum'],
                                ],
                            ],
                        ],
                        'columns' => [
                            ['id' => 'favoriteName', 'label' => 'Nama Favorit', 'widthClassName' => 'w-[220px]'],
                            ['id' => 'transactionTypeLabel', 'label' => 'Tipe Transaksi', 'widthClassName' => 'w-[220px]'],
                            ['id' => 'userList', 'label' => 'Daftar Pengguna'],
                        ],
                        'rows' => [
                            [
                                'id' => 'favorite-salary-jakarta',
                                'favoriteName' => 'Salary Jakarta',
                                'transactionTypeLabel' => 'Pencatatan Gaji',
                                'transactionTypeValue' => 'payroll-entry',
                                'userList' => 'Vando Rufi Sundawan, Darwin_SAC, Jhonni Haris Limbong',
                            ],
                            [
                                'id' => 'favorite-salary-surabaya',
                                'favoriteName' => 'Salary Surabaya',
                                'transactionTypeLabel' => 'Pencatatan Gaji',
                                'transactionTypeValue' => 'payroll-entry',
                                'userList' => 'AHMADYANI, Erick Szeto, Darwin_SAC',
                            ],
                        ],
                    ],
                ],
                'recurring-transactions' => [
                    'id' => 'recurring-transactions',
                    'label' => 'Transaksi Berulang',
                    'showViewIndicator' => true,
                    'savedTransactions' => [
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '4',
                        'searchWidthClassName' => 'sm:w-[342px]',
                        'filters' => [
                            [
                                'id' => 'category',
                                'rowKey' => 'categoryValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Kategori: Semua'],
                                    ['value' => 'general', 'label' => 'Kategori: UMUM'],
                                ],
                            ],
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'expense-entry', 'label' => 'Tipe Transaksi: Pencatatan Beban'],
                                    ['value' => 'general-journal', 'label' => 'Tipe Transaksi: Jurnal Umum'],
                                ],
                            ],
                            [
                                'id' => 'branch',
                                'rowKey' => 'branchValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Cabang: Semua'],
                                    ['value' => 'jakarta', 'label' => 'Cabang: Jakarta'],
                                    ['value' => 'surabaya', 'label' => 'Cabang: Surabaya'],
                                ],
                            ],
                            [
                                'id' => 'status',
                                'rowKey' => 'statusValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Status: Semua'],
                                    ['value' => 'partial', 'label' => 'Status: Sebagian Tereksekusi'],
                                ],
                            ],
                        ],
                        'actionMenu' => [
                            'label' => 'Aksi transaksi berulang',
                            'items' => [
                                ['id' => 'edit-schedule', 'label' => 'Atur jadwal transaksi'],
                                ['id' => 'export-list', 'label' => 'Ekspor transaksi berulang'],
                            ],
                        ],
                        'primaryAction' => [
                            'id' => 'run',
                            'label' => 'Jalankan',
                        ],
                        'columns' => [
                            ['id' => 'categoryLabel', 'label' => 'Kategori', 'widthClassName' => 'w-[250px]'],
                            ['id' => 'name', 'label' => 'Nama'],
                            ['id' => 'transactionTypeLabel', 'label' => 'Tipe Transaksi', 'widthClassName' => 'w-[250px]'],
                            ['id' => 'statusLabel', 'label' => 'Status', 'widthClassName' => 'w-[190px]'],
                        ],
                        'rows' => [
                            [
                                'id' => 'recurring-jkt-interest',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Bunga Pinjaman - JKT',
                                'transactionTypeLabel' => 'Pencatatan Beban',
                                'transactionTypeValue' => 'expense-entry',
                                'branchValue' => 'jakarta',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                            [
                                'id' => 'recurring-sby-interest',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Bunga Pinjaman - SBY',
                                'transactionTypeLabel' => 'Pencatatan Beban',
                                'transactionTypeValue' => 'expense-entry',
                                'branchValue' => 'surabaya',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                            [
                                'id' => 'recurring-jkt-prepaid',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Prepaid Sewa - JKT',
                                'transactionTypeLabel' => 'Jurnal Umum',
                                'transactionTypeValue' => 'general-journal',
                                'branchValue' => 'jakarta',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                            [
                                'id' => 'recurring-sby-prepaid',
                                'categoryLabel' => 'UMUM',
                                'categoryValue' => 'general',
                                'name' => 'Prepaid Sewa - SBY',
                                'transactionTypeLabel' => 'Jurnal Umum',
                                'transactionTypeValue' => 'general-journal',
                                'branchValue' => 'surabaya',
                                'statusLabel' => 'Sebagian Tereksekusi',
                                'statusValue' => 'partial',
                            ],
                        ],
                    ],
                ],
                'numbering' => [
                    'id' => 'numbering',
                    'label' => 'Penomoran',
                    'subtab' => [
                        'id' => 'numbering-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Penomoran',
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi daftar penomoran',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '79',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'project-material', 'label' => 'Tipe Transaksi: Alokasi Bahan Proyek'],
                                    ['value' => 'fixed-asset', 'label' => 'Tipe Transaksi: Aset Tetap'],
                                    ['value' => 'bank-proof', 'label' => 'Tipe Transaksi: Nomor Bukti Kas/Bank'],
                                    ['value' => 'sales-invoice', 'label' => 'Tipe Transaksi: Faktur Penjualan'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'export', 'label' => 'Ekspor daftar penomoran'],
                            ['id' => 'duplicate', 'label' => 'Duplikasi penomoran'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'align' => 'left',
                                'widthClassName' => 'w-[32%]',
                            ],
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[28%]',
                            ],
                            [
                                'id' => 'userScopeLabel',
                                'label' => 'Daftar Pengguna',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'numbering-1',
                                'name' => 'Alokasi Bahan Proyek',
                                'transactionTypeLabel' => 'Alokasi Bahan Proyek',
                                'transactionTypeValue' => 'project-material',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-2',
                                'name' => 'Aset Tetap',
                                'transactionTypeLabel' => 'Aset Tetap',
                                'transactionTypeValue' => 'fixed-asset',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-3',
                                'name' => 'Bank BCA IDR Jakarta (069-773...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-4',
                                'name' => 'Bank BCA IDR Surabaya (388-3...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-5',
                                'name' => 'Bank BCA SGD Jakarta (157-37...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-6',
                                'name' => 'Bank BCA SGD Surabaya (102-...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-7',
                                'name' => 'Bank BCA USD Jakarta (273-84...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-8',
                                'name' => 'Bank BCA USD Surabaya (247-...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-9',
                                'name' => 'Bank Jakarta',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'numbering-10',
                                'name' => 'Bank Mandiri IDR Jakarta (142-...)',
                                'transactionTypeLabel' => 'Nomor Bukti Kas/Bank',
                                'transactionTypeValue' => 'bank-proof',
                                'userScopeLabel' => 'Semua Pengguna',
                            ],
                        ],
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'tabs' => [
                            [
                                'id' => 'numbering',
                                'label' => 'Penomoran',
                            ],
                            [
                                'id' => 'numbering-users',
                                'label' => 'Daftar Pengguna',
                            ],
                        ],
                        'defaults' => [
                            'name' => '',
                            'transactionType' => 'sales-invoice',
                            'numberingType' => 'monthly-reset',
                            'counterDigits' => 5,
                            'componentPicker' => 'year',
                            'selectedComponents' => [],
                        ],
                        'transactionTypeOptions' => [
                            ['value' => 'sales-invoice', 'label' => 'Faktur Penjualan', 'code' => 'FP'],
                            ['value' => 'bank-proof', 'label' => 'Nomor Bukti Kas/Bank', 'code' => 'NBK'],
                            ['value' => 'fixed-asset', 'label' => 'Aset Tetap', 'code' => 'AT'],
                            ['value' => 'project-material', 'label' => 'Alokasi Bahan Proyek', 'code' => 'ABP'],
                        ],
                        'numberingTypeOptions' => [
                            ['value' => 'monthly-reset', 'label' => 'Reset setiap bulan'],
                            ['value' => 'yearly-reset', 'label' => 'Reset setiap tahun'],
                            ['value' => 'fixed', 'label' => 'Tidak di-reset'],
                        ],
                        'componentOptions' => [
                            ['value' => 'year', 'label' => 'Tahun'],
                            ['value' => 'month', 'label' => 'Bulan'],
                            ['value' => 'transaction-code', 'label' => 'Kode Transaksi'],
                        ],
                        'userAccess' => [
                            'title' => 'Akses Pengguna',
                            'allUsersLabel' => 'Semua Pengguna',
                            'allUsersChecked' => true,
                        ],
                    ],
                ],
                'print-design' => [
                    'id' => 'print-design',
                    'label' => 'Desain Cetakan',
                    'subtab' => [
                        'id' => 'print-design-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Desain Cetakan',
                        'refreshLabel' => 'Muat ulang',
                        'searchPlaceholder' => '',
                        'pageValue' => '64',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'budget', 'label' => 'Tipe Transaksi: Anggaran'],
                                    ['value' => 'ps15', 'label' => 'Tipe Transaksi: Bukti Potong PPh Ps.15'],
                                    ['value' => 'ps42', 'label' => 'Tipe Transaksi: Bukti Potong PPh Ps.4(2)'],
                                    ['value' => 'pph23', 'label' => 'Tipe Transaksi: Bukti Potong PPh23'],
                                    ['value' => 'receipt-pph23', 'label' => 'Tipe Transaksi: Bukti Terima PPh23'],
                                    ['value' => 'list-ps15', 'label' => 'Tipe Transaksi: Daftar Bukti Potong PPh Ps.15'],
                                    ['value' => 'list-ps23', 'label' => 'Tipe Transaksi: Daftar Bukti Potong PPh Ps.23'],
                                    ['value' => 'list-ps42', 'label' => 'Tipe Transaksi: Daftar Bukti Potong PPh Ps.4(2)'],
                                ],
                            ],
                        ],
                        'columns' => [
                            [
                                'id' => 'designName',
                                'label' => 'Nama Desain',
                                'align' => 'left',
                                'widthClassName' => 'w-[30%]',
                            ],
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[19%]',
                            ],
                            [
                                'id' => 'userList',
                                'label' => 'Daftar Pengguna',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'print-design-1',
                                'designName' => 'Anggaran - Default',
                                'transactionTypeLabel' => 'Anggaran',
                                'transactionTypeValue' => 'budget',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-2',
                                'designName' => 'Bukti Potong PPh Ps.15 - Pelayaran',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.15',
                                'transactionTypeValue' => 'ps15',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-3',
                                'designName' => 'Bukti Potong PPh Ps.15 - Penerbangan',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.15',
                                'transactionTypeValue' => 'ps15',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-4',
                                'designName' => 'Bukti Potong PPh Ps.4(2) - Jasa Konstruksi',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.4(2)',
                                'transactionTypeValue' => 'ps42',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-5',
                                'designName' => 'Bukti Potong PPh Ps.4(2) - Sewa Tanah',
                                'transactionTypeLabel' => 'Bukti Potong PPh Ps.4(2)',
                                'transactionTypeValue' => 'ps42',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-6',
                                'designName' => 'Bukti Potong PPh23',
                                'transactionTypeLabel' => 'Bukti Potong PPh23',
                                'transactionTypeValue' => 'pph23',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-7',
                                'designName' => 'Bukti Terima PPh23',
                                'transactionTypeLabel' => 'Bukti Terima PPh23',
                                'transactionTypeValue' => 'receipt-pph23',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-8',
                                'designName' => 'Daftar Bukti Potong PPh Ps.15 - Desain A',
                                'transactionTypeLabel' => 'Daftar Bukti Potong PPh Ps.15',
                                'transactionTypeValue' => 'list-ps15',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-9',
                                'designName' => 'Daftar Bukti Potong PPh Ps.23 - Desain A',
                                'transactionTypeLabel' => 'Daftar Bukti Potong PPh Ps.23',
                                'transactionTypeValue' => 'list-ps23',
                                'userList' => 'Semua Pengguna',
                            ],
                            [
                                'id' => 'print-design-10',
                                'designName' => 'Daftar Bukti Potong PPh Ps.4(2) - Desain A',
                                'transactionTypeLabel' => 'Daftar Bukti Potong PPh Ps.4(2)',
                                'transactionTypeValue' => 'list-ps42',
                                'userList' => 'Semua Pengguna',
                            ],
                        ],
                    ],
                    'form' => [
                        'sectionLabel' => 'Informasi umum',
                        'saveLabel' => 'Simpan',
                        'defaults' => [
                            'name' => '',
                            'type' => '',
                        ],
                        'typeOptions' => [
                            ['value' => '', 'label' => 'Silakan Pilih'],
                            ['value' => 'budget', 'label' => 'Anggaran'],
                            ['value' => 'ps15', 'label' => 'Bukti Potong PPh Ps.15'],
                            ['value' => 'ps42', 'label' => 'Bukti Potong PPh Ps.4(2)'],
                            ['value' => 'pph23', 'label' => 'Bukti Potong PPh23'],
                            ['value' => 'receipt-pph23', 'label' => 'Bukti Terima PPh23'],
                        ],
                        'userAccess' => [
                            'allUsersLabel' => 'Semua Pengguna',
                            'allUsersChecked' => true,
                        ],
                    ],
                ],
                'transaction-approval' => [
                    'id' => 'transaction-approval',
                    'label' => 'Penyetuju Transaksi',
                    'subtab' => [
                        'id' => 'transaction-approval-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Penyetuju Transaksi',
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi daftar penyetuju transaksi',
                        'emptyLabel' => 'Belum ada data',
                        'filters' => [
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'sales-invoice', 'label' => 'Tipe Transaksi: Faktur Penjualan'],
                                ],
                            ],
                            [
                                'id' => 'branch',
                                'rowKey' => 'branchValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Cabang: Semua'],
                                    ['value' => 'all-branches', 'label' => 'Cabang: Semua Cabang'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'export', 'label' => 'Ekspor daftar'],
                            ['id' => 'duplicate', 'label' => 'Duplikasi aturan'],
                        ],
                        'columns' => [
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[22%]',
                            ],
                            [
                                'id' => 'valueLabel',
                                'label' => 'Nilai',
                                'align' => 'left',
                                'widthClassName' => 'w-[22%]',
                            ],
                            [
                                'id' => 'approvedBy',
                                'label' => 'Disetujui Oleh',
                                'align' => 'left',
                                'widthClassName' => 'w-[22%]',
                            ],
                            [
                                'id' => 'createdBy',
                                'label' => 'Pembuat Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[24%]',
                            ],
                            [
                                'id' => 'branchLabel',
                                'label' => 'Cabang',
                                'align' => 'left',
                            ],
                        ],
                        'rows' => [],
                    ],
                    'form' => [
                        'sectionLabel' => 'Penyetuju Transaksi',
                        'saveLabel' => 'Simpan',
                        'valueLabel' => 'Nilai (Rp)',
                        'defaults' => [
                            'transactionType' => 'sales-invoice',
                            'branch' => 'all-branches',
                            'approvalRule' => 'one-approved',
                        ],
                        'transactionTypeOptions' => [
                            ['value' => 'sales-invoice', 'label' => 'Faktur Penjualan'],
                        ],
                        'branchOptions' => [
                            ['value' => 'all-branches', 'label' => '[Semua Cabang]'],
                        ],
                        'approvalRuleOptions' => [
                            ['value' => 'one-approved', 'label' => 'Ada Salah Satu Pengguna Setuju'],
                            ['value' => 'all-approved', 'label' => 'Semua Pengguna Harus Setuju'],
                        ],
                    ],
                ],
                'activity-log' => [
                    'id' => 'activity-log',
                    'label' => 'Log Aktifitas',
                    'showViewIndicator' => true,
                    'table' => [
                        'refreshLabel' => 'Muat ulang',
                        'actionsLabel' => 'Aksi log aktifitas',
                        'searchPlaceholder' => '',
                        'pageValue' => '2,286',
                        'filters' => [
                            [
                                'id' => 'date',
                                'rowKey' => 'dateValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                    ['value' => '2026-04-18', 'label' => 'Tanggal: 18 Apr 2026'],
                                ],
                            ],
                            [
                                'id' => 'transactionDate',
                                'rowKey' => 'transactionDateValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tgl Transaksi: Semua'],
                                    ['value' => 'empty', 'label' => 'Tgl Transaksi: -'],
                                ],
                            ],
                            [
                                'id' => 'transactionType',
                                'rowKey' => 'transactionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                    ['value' => 'print-design', 'label' => 'Tipe Transaksi: Desain Cetakan'],
                                    ['value' => 'numbering', 'label' => 'Tipe Transaksi: Penomoran'],
                                    ['value' => 'preferences', 'label' => 'Tipe Transaksi: Preferensi'],
                                ],
                            ],
                            [
                                'id' => 'user',
                                'rowKey' => 'userValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Pengguna: Semua'],
                                    ['value' => 'tbnur-pos', 'label' => 'Pengguna: TB Nur POS System'],
                                ],
                            ],
                            [
                                'id' => 'actionType',
                                'rowKey' => 'actionTypeValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe Tindakan: Semua'],
                                    ['value' => 'create', 'label' => 'Tipe Tindakan: Buat'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'export-log', 'label' => 'Ekspor log'],
                        ],
                        'columns' => [
                            [
                                'id' => 'transactionDateLabel',
                                'label' => 'Tgl Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'referenceName',
                                'label' => 'No/Nama Referensi',
                                'align' => 'left',
                                'widthClassName' => 'w-[44%]',
                            ],
                            [
                                'id' => 'actionLabel',
                                'label' => 'Tipe Tin...',
                                'align' => 'left',
                                'widthClassName' => 'w-[90px]',
                            ],
                            [
                                'id' => 'transactionTypeLabel',
                                'label' => 'Tipe Transaksi',
                                'align' => 'left',
                                'widthClassName' => 'w-[200px]',
                            ],
                            [
                                'id' => 'loggedAt',
                                'label' => 'Tanggal',
                                'align' => 'left',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'userName',
                                'label' => 'Pengguna',
                                'align' => 'left',
                                'widthClassName' => 'w-[180px]',
                            ],
                            [
                                'id' => 'email',
                                'label' => 'Email',
                                'align' => 'left',
                                'widthClassName' => 'w-[190px]',
                            ],
                            [
                                'id' => 'ipAddress',
                                'label' => 'Alamat IP',
                                'align' => 'left',
                                'widthClassName' => 'w-[140px]',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'activity-log-1',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Perintah Pembayaran - Default',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'print-design',
                                'transactionTypeLabel' => 'Desain Cetakan',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-2',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Alokasi Bahan Proyek',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-3',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Faktur Pesanan - Default Trade Portal',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'print-design',
                                'transactionTypeLabel' => 'Desain Cetakan',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-4',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Check In',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-5',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Pelunasan Pinjaman - Default',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'print-design',
                                'transactionTypeLabel' => 'Desain Cetakan',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-6',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Pembayaran Angsuran - Default',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'print-design',
                                'transactionTypeLabel' => 'Desain Cetakan',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-7',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Pelunasan Pinjaman',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-8',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Pembayaran Angsuran',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-9',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Pencairan Pinjaman',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-10',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Pinjaman Karyawan',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-11',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => '-',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'preferences',
                                'transactionTypeLabel' => 'Preferensi',
                                'loggedAt' => '18 Apr 2026 21:42:59',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-12',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Distribusi Stok',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-13',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Forecast PO',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-14',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Minimum Stok Cabang',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-15',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Persiapan Bahan Baku - Default',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'print-design',
                                'transactionTypeLabel' => 'Desain Cetakan',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-16',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Persiapan Bahan Baku',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-17',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Trade Portal',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-18',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Transfer Anggaran',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                            [
                                'id' => 'activity-log-19',
                                'dateValue' => '2026-04-18',
                                'transactionDateValue' => 'empty',
                                'transactionDateLabel' => '',
                                'referenceName' => 'Uang Muka Pembelian',
                                'actionTypeValue' => 'create',
                                'actionLabel' => 'Buat',
                                'transactionTypeValue' => 'numbering',
                                'transactionTypeLabel' => 'Penomoran',
                                'loggedAt' => '18 Apr 2026 21:42:58',
                                'userValue' => 'tbnur-pos',
                                'userName' => 'TB Nur POS System',
                                'email' => 'system@tbnurpos.local',
                                'ipAddress' => '127.0.0.1',
                            ],
                        ],
                    ],
                ],
                'preferences' => [
                    'id' => 'preferences',
                    'label' => 'Preferensi',
                    'openLoading' => [
                        'title' => 'Membuka Preferensi',
                        'description' => 'Menyiapkan pengaturan perusahaan dan preferensi database.',
                        'durationMs' => 700,
                    ],
                    'workspace' => [
                        'topTab' => 'Perusahaan',
                        'defaultSidebarItemId' => 'features',
                        'companyTabs' => [
                            ['id' => 'company-info', 'label' => 'Info Perusahaan'],
                            ['id' => 'company-address', 'label' => 'Alamat'],
                        ],
                        'featureTabs' => [
                            [
                                'id' => 'feature-company',
                                'label' => 'Perusahaan',
                                'sections' => [
                                    [
                                        'id' => 'basic-features',
                                        'title' => 'Fitur Dasar',
                                        'icon' => 'settings',
                                        'column' => 1,
                                        'items' => [
                                            ['id' => 'multi-branch', 'label' => 'Multi Cabang', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                            ['id' => 'multi-currency', 'label' => 'Multi Mata Uang', 'checked' => true],
                                            ['id' => 'tax-feature', 'label' => 'Pajak', 'checked' => true],
                                            ['id' => 'approval-feature', 'label' => 'Persetujuan (Approval)', 'checked' => true],
                                            ['id' => 'asset-feature', 'label' => 'Pencatatan Aset', 'checked' => true],
                                            ['id' => 'budget-feature', 'label' => 'Anggaran dan Target', 'checked' => true],
                                        ],
                                    ],
                                    [
                                        'id' => 'inventory-cost-method',
                                        'title' => 'Metode Biaya Persediaan',
                                        'icon' => 'inventory',
                                        'column' => 1,
                                        'textItems' => [
                                            ['id' => 'average-method', 'label' => 'Rata-rata'],
                                        ],
                                    ],
                                    [
                                        'id' => 'profit-cost-center',
                                        'title' => 'Pusat Laba & Biaya',
                                        'icon' => 'department',
                                        'column' => 2,
                                        'items' => [
                                            ['id' => 'department-center', 'label' => 'Departemen', 'checked' => true],
                                            ['id' => 'project-center', 'label' => 'Proyek', 'checked' => false],
                                            ['id' => 'finance-category', 'label' => 'Kategori Keuangan', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                        ],
                                    ],
                                    [
                                        'id' => 'misc-features',
                                        'title' => 'Lainnya',
                                        'icon' => 'numbering',
                                        'column' => 2,
                                        'items' => [
                                            ['id' => 'employee-loan', 'label' => 'Pinjaman Karyawan', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'feature-sales',
                                'label' => 'Penjualan',
                                'sections' => [
                                    [
                                        'id' => 'sales-features',
                                        'title' => 'Penjualan',
                                        'icon' => 'sales',
                                        'column' => 1,
                                        'items' => [
                                            ['id' => 'sales-quote-order', 'label' => 'Penawaran dan Pesanan Penjualan', 'checked' => true],
                                            ['id' => 'sales-return', 'label' => 'Retur Penjualan', 'checked' => true],
                                            ['id' => 'invoice-swap', 'label' => 'Tukar Faktur', 'checked' => false],
                                            ['id' => 'price-adjustment', 'label' => 'Penyesuaian Harga/Diskon', 'checked' => true],
                                            ['id' => 'open-invoice', 'label' => 'Faktur Dimuka (Mendahului Pengiriman)', 'checked' => true],
                                            ['id' => 'salesman', 'label' => 'Tenaga Penjual (Salesman)', 'checked' => true],
                                            ['id' => 'customer-claim', 'label' => 'Klaim Pelanggan', 'checked' => false],
                                            ['id' => 'packing', 'label' => 'Pengepakan Barang', 'checked' => false],
                                            ['id' => 'unique-code-payment', 'label' => 'Pembayaran dengan Kode Unik', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                        ],
                                    ],
                                    [
                                        'id' => 'sales-misc',
                                        'title' => 'Lainnya',
                                        'icon' => 'numbering',
                                        'column' => 2,
                                        'items' => [
                                            ['id' => 'consignment', 'label' => 'Konsinyasi Barang', 'checked' => true],
                                            ['id' => 'delivery-service', 'label' => 'Jasa Pengiriman', 'checked' => true],
                                            ['id' => 'payment-terms', 'label' => 'Syarat Pembayaran', 'checked' => true],
                                            ['id' => 'pos-settings', 'label' => 'Pengaturan POS', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                            ['id' => 'bca-smartlink', 'label' => 'BCA SmartLink Integration', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                            ['id' => 'uob-smartlink', 'label' => 'UOB SmartLink Integration', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                            ['id' => 'mandiri-smartlink', 'label' => 'Mandiri SmartLink Integration', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'feature-purchase',
                                'label' => 'Pembelian',
                                'sections' => [
                                    [
                                        'id' => 'purchase-features',
                                        'title' => 'Pembelian',
                                        'icon' => 'purchase',
                                        'column' => 1,
                                        'items' => [
                                            ['id' => 'purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => true],
                                            ['id' => 'supplier-claim', 'label' => 'Klaim Pemasok', 'checked' => false],
                                            ['id' => 'supplier-price-list', 'label' => 'Daftar Harga Pemasok', 'checked' => true],
                                            ['id' => 'open-bill', 'label' => 'Tagihan Dimuka (Mendahului Terima Barang)', 'checked' => true],
                                            ['id' => 'other-supplier-cost', 'label' => 'Biaya Pembelian oleh Pemasok lain', 'checked' => true],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'feature-inventory',
                                'label' => 'Persediaan',
                                'sections' => [
                                    [
                                        'id' => 'inventory-features',
                                        'title' => 'Persediaan',
                                        'icon' => 'inventory',
                                        'column' => 1,
                                        'items' => [
                                            ['id' => 'item-request', 'label' => 'Permintaan Barang', 'checked' => true],
                                            ['id' => 'multi-warehouse', 'label' => 'Multi Gudang', 'checked' => true],
                                            ['id' => 'multi-unit', 'label' => 'Multi Satuan Barang', 'checked' => true],
                                            ['id' => 'serial-production', 'label' => 'Nomor Serial/Produksi', 'checked' => true],
                                            ['id' => 'simple-production', 'label' => 'Produksi Sederhana', 'checked' => true],
                                            ['id' => 'manufacture', 'label' => 'Manufaktur', 'checked' => false, 'note' => 'Pelajari lebih lanjut'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'taxTabs' => [
                            [
                                'id' => 'tax-info-company',
                                'label' => 'Info Perusahaan',
                                'contentClassName' => 'max-w-[760px]',
                                'rows' => [
                                    [
                                        'id' => 'tax-company-name-row',
                                        'type' => 'field',
                                        'label' => 'Nama Perusahaan',
                                        'controlsClassName' => 'sm:flex-nowrap',
                                        'controls' => [
                                            [
                                                'id' => 'tax-company-name-link',
                                                'type' => 'action',
                                                'icon' => 'link',
                                                'label' => 'Hubungkan nama perusahaan',
                                            ],
                                            [
                                                'id' => 'tax-company-name',
                                                'type' => 'text',
                                                'value' => '',
                                                'wrapperClassName' => 'w-full max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-pkp-date-row',
                                        'type' => 'field',
                                        'label' => 'Tgl Pengukuhan PKP',
                                        'controls' => [
                                            [
                                                'id' => 'tax-pkp-date',
                                                'type' => 'date',
                                                'value' => '31/05/2016',
                                                'wrapperClassName' => 'w-full max-w-[236px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-pkp-number-row',
                                        'type' => 'field',
                                        'label' => 'No Pengukuhan PKP',
                                        'controls' => [
                                            [
                                                'id' => 'tax-pkp-number',
                                                'type' => 'text',
                                                'value' => '',
                                                'wrapperClassName' => 'w-full max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-business-type-row',
                                        'type' => 'field',
                                        'label' => 'Tipe Usaha',
                                        'controls' => [
                                            [
                                                'id' => 'tax-business-type',
                                                'type' => 'text',
                                                'value' => '',
                                                'wrapperClassName' => 'w-full max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-npwp-row',
                                        'type' => 'field',
                                        'label' => 'NPWP Perusahaan',
                                        'controls' => [
                                            [
                                                'id' => 'tax-company-npwp',
                                                'type' => 'text',
                                                'value' => '',
                                                'placeholder' => '________________',
                                                'inputClassName' => 'tracking-[0.16em]',
                                                'wrapperClassName' => 'w-full max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-klu-row',
                                        'type' => 'field',
                                        'label' => 'KLU',
                                        'controls' => [
                                            [
                                                'id' => 'tax-klu',
                                                'type' => 'text',
                                                'value' => '',
                                                'wrapperClassName' => 'w-full max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-nitku-row',
                                        'type' => 'field',
                                        'label' => 'NITKU',
                                        'controls' => [
                                            [
                                                'id' => 'tax-nitku',
                                                'type' => 'text',
                                                'value' => '',
                                                'wrapperClassName' => 'w-full max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'tax-address',
                                'label' => 'Alamat',
                                'contentClassName' => 'max-w-[760px]',
                                'rows' => [
                                    [
                                        'id' => 'tax-address-street-row',
                                        'type' => 'field',
                                        'label' => 'Alamat',
                                        'controls' => [
                                            [
                                                'id' => 'tax-address-street',
                                                'type' => 'textarea',
                                                'prefix' => 'Jalan',
                                                'rows' => 3,
                                                'value' => "Jl. Pluit Karang Cantik Blok B4 No.39\nPenjaringan, Jakarta Utara - 14450",
                                                'wrapperClassName' => 'w-full max-w-[548px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-address-city-row',
                                        'type' => 'field',
                                        'label' => '',
                                        'controlsClassName' => 'w-full gap-2.5 sm:flex-nowrap',
                                        'controls' => [
                                            [
                                                'id' => 'tax-address-city',
                                                'type' => 'text',
                                                'prefix' => 'Kota',
                                                'value' => 'Jakarta',
                                                'clearable' => true,
                                                'wrapperClassName' => 'w-full max-w-[316px]',
                                            ],
                                            [
                                                'id' => 'tax-address-postal-code',
                                                'type' => 'text',
                                                'prefix' => 'K.Pos',
                                                'value' => '14450',
                                                'clearable' => true,
                                                'wrapperClassName' => 'w-full max-w-[222px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-address-province-row',
                                        'type' => 'field',
                                        'label' => '',
                                        'controls' => [
                                            [
                                                'id' => 'tax-address-province',
                                                'type' => 'text',
                                                'prefix' => 'Provinsi',
                                                'value' => 'DKI Jakarta',
                                                'clearable' => true,
                                                'wrapperClassName' => 'w-full max-w-[548px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-address-country-row',
                                        'type' => 'field',
                                        'label' => '',
                                        'controls' => [
                                            [
                                                'id' => 'tax-address-country',
                                                'type' => 'text',
                                                'prefix' => 'Negara',
                                                'value' => 'Indonesia',
                                                'clearable' => true,
                                                'wrapperClassName' => 'w-full max-w-[548px]',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'tax-others',
                                'label' => 'Lainnya',
                                'contentClassName' => 'max-w-[860px]',
                                'rows' => [
                                    [
                                        'id' => 'tax-address-source-row',
                                        'type' => 'radio',
                                        'label' => "Menggunakan\nalamat",
                                        'value' => 'sales-invoice',
                                        'optionsClassName' => 'sm:gap-x-12',
                                        'options' => [
                                            [
                                                'value' => 'customer-tax',
                                                'label' => 'Pajak Pelanggan',
                                            ],
                                            [
                                                'value' => 'sales-invoice',
                                                'label' => 'Faktur Penjualan',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-efaktur-reference-row',
                                        'type' => 'checkbox-list',
                                        'label' => 'Referensi e-Faktur',
                                        'options' => [
                                            [
                                                'id' => 'invoice-number',
                                                'label' => 'Sertakan Nomor Faktur',
                                                'checked' => true,
                                            ],
                                            [
                                                'id' => 'po-number',
                                                'label' => 'Sertakan Nomor PO',
                                                'checked' => false,
                                            ],
                                            [
                                                'id' => 'branch-name',
                                                'label' => 'Sertakan Nama Cabang',
                                                'checked' => false,
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-default-quantity-price-row',
                                        'type' => 'single-checkbox',
                                        'label' => "Tampilkan Kuantitas\ndan Harga secara\nDefault pada Item\nBarang/Jasa",
                                        'showInfo' => true,
                                        'option' => [
                                            'id' => 'tax-default-quantity-price',
                                            'label' => 'Ya',
                                            'checked' => false,
                                        ],
                                    ],
                                    [
                                        'id' => 'tax-default-dpp-row',
                                        'type' => 'single-checkbox',
                                        'label' => 'Default DPP 11/12',
                                        'showInfo' => true,
                                        'option' => [
                                            'id' => 'tax-default-dpp',
                                            'label' => 'Ya',
                                            'checked' => false,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'salesTabs' => [
                            [
                                'id' => 'sales-settings',
                                'label' => 'Penjualan',
                                'sections' => [
                                    [
                                        'id' => 'sales-order-section',
                                        'title' => 'Pesanan Penjualan',
                                        'icon' => 'receipt',
                                        'rows' => [
                                            [
                                                'id' => 'sales-order-auto-close',
                                                'type' => 'inline-checkbox',
                                                'label' => 'Tutup otomatis',
                                                'showInfo' => true,
                                                'option' => [
                                                    'id' => 'yes',
                                                    'label' => 'Ya',
                                                    'checked' => false,
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'sales-return-section',
                                        'title' => 'Retur Penjualan',
                                        'icon' => 'transfer',
                                        'rows' => [
                                            [
                                                'id' => 'sales-return-value-option',
                                                'type' => 'radio-group',
                                                'label' => 'Opsi Nilai Barang yang di Retur (Nilai pengembalian yang dijurnal)',
                                                'value' => 'latest-cost',
                                                'options' => [
                                                    [
                                                        'value' => 'latest-cost',
                                                        'label' => 'Harga Beli/Biaya masuk terakhir',
                                                    ],
                                                    [
                                                        'value' => 'invoice-cost',
                                                        'label' => 'BPP Faktur Penjualan',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'id' => 'sales-return-no-item-option',
                                                'type' => 'radio-group',
                                                'label' => 'Opsi Jika barang TIDAK dikembalikan saat Retur',
                                                'value' => 'hpp-account',
                                                'options' => [
                                                    [
                                                        'value' => 'hpp-account',
                                                        'label' => 'Dibebankan ke akun HPP barang',
                                                    ],
                                                    [
                                                        'value' => 'custom-account',
                                                        'label' => "Dibebankan ke\nakun",
                                                    ],
                                                ],
                                            ],
                                            [
                                                'id' => 'sales-return-update-cost',
                                                'type' => 'single-checkbox',
                                                'option' => [
                                                    'id' => 'update-cost',
                                                    'label' => 'Perbarui biaya barang saat simpan ulang Retur Penjualan',
                                                    'checked' => false,
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'sales-customer-section',
                                        'title' => 'Pelanggan',
                                        'icon' => 'customer',
                                        'rows' => [
                                            [
                                                'id' => 'sales-customer-tax-default',
                                                'type' => 'single-checkbox',
                                                'option' => [
                                                    'id' => 'customer-tax-default',
                                                    'label' => 'Pelanggan baru selalu termasuk pajak',
                                                    'checked' => false,
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'purchaseTabs' => [
                            [
                                'id' => 'purchase-settings',
                                'label' => 'Pembelian',
                                'sections' => [
                                    [
                                        'id' => 'purchase-order-section',
                                        'title' => 'Pesanan Pembelian',
                                        'icon' => 'purchase',
                                        'rows' => [
                                            [
                                                'id' => 'purchase-order-auto-close',
                                                'type' => 'inline-checkbox',
                                                'label' => 'Tutup otomatis',
                                                'showInfo' => true,
                                                'option' => [
                                                    'id' => 'yes',
                                                    'label' => 'Ya',
                                                    'checked' => false,
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'purchase-receipt-section',
                                        'title' => 'Penerimaan Barang',
                                        'icon' => 'receipt',
                                        'rows' => [
                                            [
                                                'id' => 'purchase-receipt-description',
                                                'type' => 'description',
                                                'label' => 'Biaya Penerimaan Barang akan di update oleh Tagihan dengan pilihan berikut',
                                            ],
                                            [
                                                'id' => 'purchase-receipt-cost-option',
                                                'type' => 'radio-group',
                                                'value' => 'first-bill-same-period',
                                                'options' => [
                                                    [
                                                        'value' => 'updated-by-bill',
                                                        'label' => 'Diperbarui oleh Tagihan',
                                                    ],
                                                    [
                                                        'value' => 'not-updated-by-bill',
                                                        'label' => 'Tidak diperbarui oleh Tagihan',
                                                    ],
                                                    [
                                                        'value' => 'first-bill-same-period',
                                                        'label' => 'Diperbarui jika tanggal tagihan pertama dalam periode yang sama dengan penerimaan barang',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'id' => 'purchase-receipt-unbilled-account',
                                                'type' => 'lookup-block',
                                                'label' => 'Akun selisih pembelian belum tertagih',
                                                'control' => [
                                                    'value' => '[511.000-06] Beban Selisih Pembelian Barang',
                                                    'clearable' => true,
                                                ],
                                                'widthClassName' => 'max-w-[480px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'purchase-invoice-section',
                                        'title' => 'Faktur Pembelian',
                                        'icon' => 'invoice',
                                        'rows' => [
                                            [
                                                'id' => 'purchase-asset-account',
                                                'type' => 'field',
                                                'label' => 'Pembelian Asset',
                                                'control' => [
                                                    'id' => 'purchase-asset-account-input',
                                                    'type' => 'search',
                                                    'value' => '',
                                                    'placeholder' => 'Cari/Pilih...',
                                                ],
                                                'widthClassName' => 'max-w-[420px]',
                                            ],
                                            [
                                                'id' => 'purchase-other-supplier-cost-description',
                                                'type' => 'description',
                                                'label' => 'Akun Selisih pada transaksi pembelian dimana biaya ditagihkan ke pemasok lain',
                                            ],
                                            [
                                                'id' => 'purchase-difference-account',
                                                'type' => 'field',
                                                'label' => 'Akun Selisih',
                                                'control' => [
                                                    'id' => 'purchase-difference-account-input',
                                                    'type' => 'lookup',
                                                    'value' => "[511.000-06] Beban Selisih Pembelian B\nng",
                                                    'clearable' => true,
                                                    'tokenClassName' => 'leading-5',
                                                ],
                                                'widthClassName' => 'max-w-[420px]',
                                            ],
                                            [
                                                'id' => 'purchase-journal-date',
                                                'type' => 'field',
                                                'label' => 'Tanggal Jurnal',
                                                'control' => [
                                                    'id' => 'purchase-journal-date-select',
                                                    'type' => 'select',
                                                    'value' => 'bill-date',
                                                    'options' => [
                                                        [
                                                            'value' => 'bill-date',
                                                            'label' => 'Tanggal Tagihan Biaya',
                                                        ],
                                                        [
                                                            'value' => 'receipt-date',
                                                            'label' => 'Tanggal Penerimaan Barang',
                                                        ],
                                                    ],
                                                ],
                                                'widthClassName' => 'max-w-[420px]',
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'purchase-payment-order-section',
                                        'title' => 'Perintah Pembayaran ke Pemasok',
                                        'icon' => 'payment',
                                        'rows' => [
                                            [
                                                'id' => 'purchase-payment-temporary-account',
                                                'type' => 'field',
                                                'label' => 'Akun Kas Penampungan Pembayaran Sementara',
                                                'showInfo' => true,
                                                'control' => [
                                                    'id' => 'purchase-payment-temporary-account-input',
                                                    'type' => 'search',
                                                    'value' => '',
                                                    'placeholder' => 'Cari/Pilih Akun Perkiraan...',
                                                ],
                                                'widthClassName' => 'max-w-[480px]',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'approvalTabs' => [
                            [
                                'id' => 'approval-sales',
                                'label' => 'Penjualan',
                                'contentClassName' => 'max-w-[760px]',
                                'sections' => [
                                    [
                                        'id' => 'approval-sales-section',
                                        'title' => 'Penjualan',
                                        'icon' => 'sales',
                                        'items' => [
                                            ['id' => 'approval-sales-quote', 'label' => 'Penawaran Penjualan', 'checked' => true],
                                            ['id' => 'approval-sales-order', 'label' => 'Pesanan Penjualan', 'checked' => true],
                                            ['id' => 'approval-sales-delivery', 'label' => 'Pengiriman Pesanan', 'checked' => true],
                                            ['id' => 'approval-sales-invoice', 'label' => 'Faktur Penjualan', 'checked' => true],
                                            ['id' => 'approval-sales-receipt', 'label' => 'Penerimaan Penjualan', 'checked' => false],
                                            ['id' => 'approval-sales-return', 'label' => 'Retur Penjualan', 'checked' => false],
                                            ['id' => 'approval-sales-discount', 'label' => 'Penyesuaian Harga/Diskon', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'approval-purchase',
                                'label' => 'Pembelian',
                                'contentClassName' => 'max-w-[760px]',
                                'sections' => [
                                    [
                                        'id' => 'approval-purchase-section',
                                        'title' => 'Pembelian',
                                        'icon' => 'purchase',
                                        'items' => [
                                            ['id' => 'approval-purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => false],
                                            ['id' => 'approval-purchase-receipt', 'label' => 'Penerimaan Barang', 'checked' => false],
                                            ['id' => 'approval-purchase-invoice', 'label' => 'Faktur Pembelian', 'checked' => false],
                                            ['id' => 'approval-purchase-payment', 'label' => 'Pembayaran Pembelian', 'checked' => false],
                                            ['id' => 'approval-purchase-return', 'label' => 'Retur Pembelian', 'checked' => false],
                                            ['id' => 'approval-purchase-price', 'label' => 'Harga Pemasok', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'approval-inventory',
                                'label' => 'Persediaan',
                                'contentClassName' => 'max-w-[760px]',
                                'sections' => [
                                    [
                                        'id' => 'approval-inventory-section',
                                        'title' => 'Persediaan',
                                        'icon' => 'inventory',
                                        'items' => [
                                            ['id' => 'approval-inventory-request', 'label' => 'Permintaan Barang', 'checked' => false],
                                            ['id' => 'approval-inventory-adjustment', 'label' => 'Penyesuaian Persediaan', 'checked' => false],
                                            ['id' => 'approval-inventory-transfer', 'label' => 'Pemindahan Barang', 'checked' => false],
                                            ['id' => 'approval-inventory-job-order', 'label' => 'Pekerjaan Pesanan', 'checked' => false],
                                            ['id' => 'approval-inventory-material-addition', 'label' => 'Penambahan Bahan Baku', 'checked' => false],
                                            ['id' => 'approval-inventory-job-completion', 'label' => 'Penyelesaian Pesanan', 'checked' => false],
                                            ['id' => 'approval-inventory-stock-opname', 'label' => 'Hasil Stok Opname', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'approval-others',
                                'label' => 'Lainnya',
                                'contentClassName' => 'max-w-[760px]',
                                'sections' => [
                                    [
                                        'id' => 'approval-other-cash-bank',
                                        'title' => 'Kas & Bank',
                                        'icon' => 'bank',
                                        'items' => [
                                            ['id' => 'approval-other-payment', 'label' => 'Pembayaran', 'checked' => false],
                                            ['id' => 'approval-other-receipt', 'label' => 'Penerimaan', 'checked' => false],
                                            ['id' => 'approval-other-bank-transfer', 'label' => 'Transfer Bank', 'checked' => false],
                                        ],
                                    ],
                                    [
                                        'id' => 'approval-other-ledger',
                                        'title' => 'Buku Besar',
                                        'icon' => 'ledger',
                                        'items' => [
                                            ['id' => 'approval-other-expense', 'label' => 'Pencatatan Beban', 'checked' => false],
                                            ['id' => 'approval-other-salary', 'label' => 'Pencatatan Gaji', 'checked' => false],
                                        ],
                                    ],
                                    [
                                        'id' => 'approval-other-asset',
                                        'title' => 'Aset Tetap',
                                        'icon' => 'asset',
                                        'items' => [
                                            ['id' => 'approval-other-transfer-asset', 'label' => 'Pindah Aset', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'attachmentsTabs' => [
                            [
                                'id' => 'attachments-sales',
                                'label' => 'Penjualan',
                                'contentClassName' => 'max-w-[760px]',
                                'notice' => $attachmentsNotice,
                                'sections' => [
                                    [
                                        'id' => 'attachments-sales-section',
                                        'title' => 'Penjualan',
                                        'icon' => 'sales',
                                        'items' => [
                                            ['id' => 'attachments-sales-quote', 'label' => 'Penawaran Penjualan', 'checked' => false],
                                            ['id' => 'attachments-sales-order', 'label' => 'Pesanan Penjualan', 'checked' => false],
                                            ['id' => 'attachments-sales-delivery', 'label' => 'Pengiriman Pesanan', 'checked' => false],
                                            ['id' => 'attachments-sales-invoice', 'label' => 'Faktur Penjualan', 'checked' => false],
                                            ['id' => 'attachments-sales-receipt', 'label' => 'Penerimaan Penjualan', 'checked' => false],
                                            ['id' => 'attachments-sales-return', 'label' => 'Retur Penjualan', 'checked' => false],
                                            ['id' => 'attachments-sales-customer', 'label' => 'Pelanggan', 'checked' => false],
                                            ['id' => 'attachments-sales-discount', 'label' => 'Penyesuaian Harga/Diskon', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'attachments-purchase',
                                'label' => 'Pembelian',
                                'contentClassName' => 'max-w-[760px]',
                                'notice' => $attachmentsNotice,
                                'sections' => [
                                    [
                                        'id' => 'attachments-purchase-section',
                                        'title' => 'Pembelian',
                                        'icon' => 'purchase',
                                        'items' => [
                                            ['id' => 'attachments-purchase-order', 'label' => 'Pesanan Pembelian', 'checked' => false],
                                            ['id' => 'attachments-purchase-receipt', 'label' => 'Penerimaan Barang', 'checked' => false],
                                            ['id' => 'attachments-purchase-invoice', 'label' => 'Faktur Pembelian', 'checked' => false],
                                            ['id' => 'attachments-purchase-payment', 'label' => 'Pembayaran Pembelian', 'checked' => false],
                                            ['id' => 'attachments-purchase-return', 'label' => 'Retur Pembelian', 'checked' => false],
                                            ['id' => 'attachments-purchase-price', 'label' => 'Harga Pemasok', 'checked' => false],
                                            ['id' => 'attachments-purchase-supplier', 'label' => 'Pemasok', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'attachments-inventory',
                                'label' => 'Persediaan',
                                'contentClassName' => 'max-w-[760px]',
                                'notice' => $attachmentsNotice,
                                'sections' => [
                                    [
                                        'id' => 'attachments-inventory-section',
                                        'title' => 'Persediaan',
                                        'icon' => 'inventory',
                                        'items' => [
                                            ['id' => 'attachments-inventory-request', 'label' => 'Permintaan Barang', 'checked' => false],
                                            ['id' => 'attachments-inventory-transfer', 'label' => 'Pemindahan Barang', 'checked' => false],
                                            ['id' => 'attachments-inventory-adjustment', 'label' => 'Penyesuaian Persediaan', 'checked' => false],
                                            ['id' => 'attachments-inventory-job-order', 'label' => 'Pekerjaan Pesanan', 'checked' => false],
                                            ['id' => 'attachments-inventory-material-addition', 'label' => 'Penambahan Bahan Baku', 'checked' => false],
                                            ['id' => 'attachments-inventory-job-completion', 'label' => 'Penyelesaian Pesanan', 'checked' => false],
                                            ['id' => 'attachments-inventory-stock-opname-request', 'label' => 'Perintah Stok Opname', 'checked' => false],
                                            ['id' => 'attachments-inventory-stock-opname-result', 'label' => 'Hasil Stok Opname', 'checked' => false],
                                            ['id' => 'attachments-inventory-minimum-branch-stock', 'label' => 'Minimum Stok Cabang', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'attachments-others',
                                'label' => 'Lainnya',
                                'contentClassName' => 'max-w-[1120px]',
                                'notice' => $attachmentsNotice,
                                'sections' => [
                                    [
                                        'id' => 'attachments-other-ledger',
                                        'title' => 'Buku Besar',
                                        'icon' => 'ledger',
                                        'column' => 1,
                                        'items' => [
                                            ['id' => 'attachments-other-expense-record', 'label' => 'Pencatatan Beban', 'checked' => false],
                                            ['id' => 'attachments-other-salary-record', 'label' => 'Pencatatan Gaji', 'checked' => false],
                                            ['id' => 'attachments-other-employee-loan', 'label' => 'Pinjaman Karyawan', 'checked' => false],
                                            ['id' => 'attachments-other-loan-disbursement', 'label' => 'Pencairan Pinjaman', 'checked' => false],
                                            ['id' => 'attachments-other-installment-payment', 'label' => 'Pembayaran Angsuran', 'checked' => false],
                                            ['id' => 'attachments-other-loan-settlement', 'label' => 'Pelunasan Pinjaman', 'checked' => false],
                                            ['id' => 'attachments-other-general-journal', 'label' => 'Jurnal Umum', 'checked' => false],
                                        ],
                                    ],
                                    [
                                        'id' => 'attachments-other-cash-bank',
                                        'title' => 'Kas & Bank',
                                        'icon' => 'bank',
                                        'column' => 2,
                                        'items' => [
                                            ['id' => 'attachments-other-payment', 'label' => 'Pembayaran', 'checked' => false],
                                            ['id' => 'attachments-other-receipt', 'label' => 'Penerimaan', 'checked' => false],
                                            ['id' => 'attachments-other-bank-transfer', 'label' => 'Transfer Bank', 'checked' => false],
                                        ],
                                    ],
                                    [
                                        'id' => 'attachments-other-fixed-asset',
                                        'title' => 'Aset Tetap',
                                        'icon' => 'asset',
                                        'column' => 2,
                                        'items' => [
                                            ['id' => 'attachments-other-fixed-asset', 'label' => 'Aset Tetap', 'checked' => false],
                                            ['id' => 'attachments-other-fixed-asset-change', 'label' => 'Perubahan Aset Tetap', 'checked' => false],
                                            ['id' => 'attachments-other-fixed-asset-disposal', 'label' => 'Disposisi Aset Tetap', 'checked' => false],
                                            ['id' => 'attachments-other-fixed-asset-transfer', 'label' => 'Pindah Aset', 'checked' => false],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'limitationsTabs' => [
                            [
                                'id' => 'limitations-operator-access',
                                'label' => 'Akses Operator',
                                'sections' => [
                                    [
                                        'id' => 'limitations-operator-access-section',
                                        'title' => 'Pembatasan Akses Database Level Operator',
                                        'icon' => 'restriction',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-operator-access-mode',
                                                'type' => 'radio-group',
                                                'value' => 'not-limited',
                                                'options' => [
                                                    [
                                                        'value' => 'not-limited',
                                                        'label' => 'Tidak dibatasi',
                                                    ],
                                                    [
                                                        'value' => 'limited-all',
                                                        'label' => 'Dibatasi semua',
                                                    ],
                                                    [
                                                        'value' => 'limited-time',
                                                        'label' => 'Akses terbatas hanya pada waktu',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'limitations-transaction-date',
                                'label' => 'Tanggal Transaksi',
                                'sections' => [
                                    [
                                        'id' => 'limitations-transaction-date-section',
                                        'title' => 'Pembatasan Tanggal Transaksi',
                                        'icon' => 'calendar',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-transaction-date-mode',
                                                'type' => 'advanced-radio-group',
                                                'value' => 'date-range',
                                                'options' => [
                                                    [
                                                        'value' => 'not-limited',
                                                        'label' => 'Tidak dibatasi',
                                                    ],
                                                    [
                                                        'value' => 'date-range',
                                                        'label' => 'Berdasarkan rentang waktu',
                                                        'blocks' => [
                                                            [
                                                                'id' => 'date-range-warning',
                                                                'type' => 'timing-rule',
                                                                'label' => 'Peringati Jika',
                                                                'option' => [
                                                                    'checked' => false,
                                                                ],
                                                                'beforeValue' => '',
                                                                'beforeUnit' => 'Hari',
                                                                'afterValue' => '',
                                                                'afterUnit' => 'Hari',
                                                                'unitOptions' => ['Hari', 'Minggu'],
                                                            ],
                                                            [
                                                                'id' => 'date-range-prevent',
                                                                'type' => 'timing-rule',
                                                                'label' => 'Cegah Jika',
                                                                'option' => [
                                                                    'checked' => false,
                                                                ],
                                                                'beforeValue' => '',
                                                                'beforeUnit' => 'Hari',
                                                                'afterValue' => '',
                                                                'afterUnit' => 'Hari',
                                                                'unitOptions' => ['Hari', 'Minggu'],
                                                            ],
                                                            [
                                                                'id' => 'date-range-exception-users',
                                                                'type' => 'search-row',
                                                                'label' => 'Pengecualian pada pengguna',
                                                                'control' => [
                                                                    'value' => '',
                                                                    'placeholder' => 'Cari/Pilih...',
                                                                ],
                                                            ],
                                                            [
                                                                'id' => 'date-range-transaction-scope',
                                                                'type' => 'nested-radio-group',
                                                                'label' => 'Berlakukan pada transaksi',
                                                                'value' => 'all-transactions',
                                                                'options' => [
                                                                    [
                                                                        'value' => 'all-transactions',
                                                                        'label' => 'Semua Transaksi',
                                                                    ],
                                                                    [
                                                                        'value' => 'journaled-transactions',
                                                                        'label' => 'Transaksi berjurnal',
                                                                    ],
                                                                ],
                                                            ],
                                                        ],
                                                    ],
                                                    [
                                                        'value' => 'specific-date',
                                                        'label' => 'Berdasarkan tanggal tertentu',
                                                    ],
                                                    [
                                                        'value' => 'after-period-days',
                                                        'label' => "Berdasarkan jumlah hari setelah akhir periode tanggal\ntransaksi",
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'limitations-others',
                                'label' => 'Lainnya',
                                'sections' => [
                                    [
                                        'id' => 'limitations-general-section',
                                        'title' => 'Pembatasan Umum',
                                        'icon' => 'alert',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-general-items',
                                                'type' => 'checkbox-list',
                                                'items' => [
                                                    [
                                                        'id' => 'process-draft-transaction',
                                                        'label' => 'Dapat memproses transaksi yang sedang diproses oleh transaksi berstatus Draf/Pengajuan',
                                                        'checked' => false,
                                                        'showInfo' => true,
                                                    ],
                                                    [
                                                        'id' => 'print-draft-transaction',
                                                        'label' => 'Dapat mencetak/e-mail transaksi yang berstatus Draf/Pengajuan/Ditolak',
                                                        'checked' => false,
                                                        'showInfo' => true,
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'limitations-serial-section',
                                        'title' => 'Nomor Seri/Produksi Barang',
                                        'icon' => 'numbering',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-serial-items',
                                                'type' => 'checkbox-list',
                                                'items' => [
                                                    [
                                                        'id' => 'serial-required',
                                                        'label' => 'Nomor Seri/Produksi barang harus diisi saat transaksi',
                                                        'checked' => true,
                                                    ],
                                                    [
                                                        'id' => 'serial-without-stock',
                                                        'label' => 'Dapat mengisi nomor meski tidak ada stok (Gudang terpilih)',
                                                        'checked' => false,
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'limitations-return-form-section',
                                        'title' => 'Formulir Retur',
                                        'icon' => 'transfer',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-return-form-items',
                                                'type' => 'checkbox-list',
                                                'items' => [
                                                    [
                                                        'id' => 'sales-return-paid-invoice',
                                                        'label' => 'Retur Penjualan dapat meretur faktur yang sudah lunas',
                                                        'checked' => false,
                                                    ],
                                                    [
                                                        'id' => 'sales-return-paid-down-payment',
                                                        'label' => 'Retur Penjualan dapat meretur uang muka penjualan yang sudah lunas',
                                                        'checked' => false,
                                                    ],
                                                    [
                                                        'id' => 'sales-return-without-invoice',
                                                        'label' => 'Dapat membuat Retur Penjualan tanpa Faktur Penjualan',
                                                        'checked' => true,
                                                    ],
                                                    [
                                                        'id' => 'purchase-return-paid-bill',
                                                        'label' => 'Retur Pembelian dapat meretur tagihan yang sudah lunas',
                                                        'checked' => false,
                                                    ],
                                                    [
                                                        'id' => 'purchase-return-paid-down-payment',
                                                        'label' => 'Retur Pembelian dapat meretur uang muka pembelian yang sudah lunas',
                                                        'checked' => false,
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'limitations-period-end-section',
                                        'title' => 'Proses Akhir Bulan',
                                        'icon' => 'recurring',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-period-end-items',
                                                'type' => 'checkbox-list',
                                                'items' => [
                                                    [
                                                        'id' => 'prevent-period-end-with-negative-stock',
                                                        'label' => 'Cegah Proses Akhir Bulan apabila ada barang yang memiliki stok minus',
                                                        'checked' => false,
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'limitations-advance-payment-section',
                                        'title' => 'Uang Muka Penjualan/Pembelian',
                                        'icon' => 'payment',
                                        'rows' => [
                                            [
                                                'id' => 'limitations-advance-payment-items',
                                                'type' => 'checkbox-list',
                                                'items' => [
                                                    [
                                                        'id' => 'use-only-paid-advance-payment',
                                                        'label' => 'Hanya dapat menggunakan Uang Muka yang sudah lunas',
                                                        'checked' => false,
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'othersTabs' => [
                            [
                                'id' => 'others-general',
                                'label' => 'Lainnya',
                                'contentClassName' => 'max-w-[1020px]',
                                'sections' => [
                                    [
                                        'id' => 'others-format-section',
                                        'title' => 'Format',
                                        'icon' => 'format',
                                        'rows' => [
                                            [
                                                'id' => 'others-decimal-format-row',
                                                'type' => 'field',
                                                'label' => 'Format Desimal',
                                                'controls' => [
                                                    [
                                                        'id' => 'others-decimal-format',
                                                        'type' => 'select',
                                                        'value' => 'Asing (9,999.9)',
                                                        'options' => [
                                                            'Asing (9,999.9)',
                                                            'Indonesia (9.999,9)',
                                                        ],
                                                        'containerClassName' => 'w-full max-w-[316px]',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'id' => 'others-decimal-option-row',
                                                'type' => 'field',
                                                'label' => 'Opsi Desimal',
                                                'note' => 'Opsi decimal hanya berlaku pada bagian daftar transaksi',
                                                'controls' => [
                                                    [
                                                        'id' => 'others-decimal-option-value',
                                                        'type' => 'select',
                                                        'value' => '0.99',
                                                        'options' => ['0.99', '0.999', '0.9999'],
                                                        'containerClassName' => 'w-full max-w-[316px]',
                                                    ],
                                                    [
                                                        'id' => 'others-decimal-option-condition',
                                                        'type' => 'select',
                                                        'value' => 'Jika ada desimal',
                                                        'options' => [
                                                            'Jika ada desimal',
                                                            'Selalu tampil',
                                                        ],
                                                        'containerClassName' => 'w-full max-w-[316px]',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'id' => 'others-date-display-row',
                                                'type' => 'field',
                                                'label' => 'Tampilan Tanggal',
                                                'controls' => [
                                                    [
                                                        'id' => 'others-date-display',
                                                        'type' => 'select',
                                                        'value' => 'Indonesia (9 Agu 2023)',
                                                        'options' => [
                                                            'Indonesia (9 Agu 2023)',
                                                            'Asing (Aug 9, 2023)',
                                                        ],
                                                        'containerClassName' => 'w-full max-w-[316px]',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'others-aging-ar-section',
                                        'title' => 'Umur Utang/Piutang',
                                        'icon' => 'customer',
                                        'rows' => [
                                            [
                                                'id' => 'others-aging-ar-range-row',
                                                'type' => 'field',
                                                'label' => 'Rentang Umur',
                                                'note' => 'Rentang umur utang dan piutang pada laporan',
                                                'controls' => [
                                                    [
                                                        'id' => 'others-aging-ar-range',
                                                        'type' => 'text',
                                                        'value' => '30',
                                                        'inputType' => 'number',
                                                        'containerClassName' => 'w-full max-w-[148px]',
                                                        'inputClassName' => 'text-right',
                                                    ],
                                                    [
                                                        'id' => 'others-aging-ar-unit',
                                                        'type' => 'static',
                                                        'label' => 'Hari',
                                                    ],
                                                ],
                                            ],
                                            [
                                                'id' => 'others-aging-ar-source-row',
                                                'type' => 'radio',
                                                'label' => 'Umur dihitung dari',
                                                'value' => 'invoice-date',
                                                'options' => [
                                                    [
                                                        'value' => 'invoice-date',
                                                        'label' => 'Tanggal Faktur',
                                                    ],
                                                    [
                                                        'value' => 'due-date',
                                                        'label' => 'Jatuh Tempo',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'others-aging-inventory-section',
                                        'title' => 'Umur Persediaan',
                                        'icon' => 'inventory',
                                        'rows' => [
                                            [
                                                'id' => 'others-aging-inventory-range-row',
                                                'type' => 'field',
                                                'label' => 'Rentang Umur',
                                                'note' => 'Rentang umur persediaan pada laporan',
                                                'controls' => [
                                                    [
                                                        'id' => 'others-aging-inventory-range',
                                                        'type' => 'text',
                                                        'value' => '30',
                                                        'inputType' => 'number',
                                                        'containerClassName' => 'w-full max-w-[148px]',
                                                        'inputClassName' => 'text-right',
                                                    ],
                                                    [
                                                        'id' => 'others-aging-inventory-unit',
                                                        'type' => 'static',
                                                        'label' => 'Hari',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    [
                                        'id' => 'others-sales-commission-section',
                                        'title' => 'Komisi Penjual',
                                        'icon' => 'employee',
                                        'rows' => [
                                            [
                                                'id' => 'others-sales-commission-source-row',
                                                'type' => 'field',
                                                'label' => 'Komisi dihitung dari',
                                                'controls' => [
                                                    [
                                                        'id' => 'others-sales-commission-source',
                                                        'type' => 'select',
                                                        'value' => 'Faktur sudah lunas',
                                                        'options' => [
                                                            'Faktur sudah lunas',
                                                            'Saat transaksi disimpan',
                                                        ],
                                                        'containerClassName' => 'w-full max-w-[486px]',
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'id' => 'others-email-transaction',
                                'label' => 'Email Transaksi',
                                'variant' => 'email-config',
                                'contentClassName' => 'max-w-[1120px]',
                                'intro' => [
                                    'title' => 'Konfigurasi Pengiriman Email Transaksi',
                                    'description' => 'TB Nur POS akan menggunakan konfigurasi ini untuk mengirimkan email transaksi anda.',
                                ],
                                'rows' => [
                                    [
                                        'id' => 'others-email-provider-row',
                                        'type' => 'radio',
                                        'value' => 'default-tbnur',
                                        'options' => [
                                            [
                                                'value' => 'default-tbnur',
                                                'label' => 'Default TB Nur POS (info@tbnurpos.local)',
                                            ],
                                            [
                                                'value' => 'company-smtp',
                                                'label' => 'SMTP Perusahaan',
                                                'showInfo' => true,
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'sidebarItems' => [
                            ['id' => 'features', 'label' => 'Fitur'],
                            ['id' => 'tax', 'label' => 'Pajak'],
                            ['id' => 'sales', 'label' => 'Penjualan'],
                            ['id' => 'purchase', 'label' => 'Pembelian'],
                            ['id' => 'limitations', 'label' => 'Pembatasan'],
                            ['id' => 'approval', 'label' => 'Persetujuan'],
                            ['id' => 'attachments', 'label' => 'Lampiran'],
                            ['id' => 'others', 'label' => 'Lain-lain'],
                        ],
                        'actions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'primary',
                                'showLabel' => true,
                            ],
                        ],
                        'companyInfo' => [
                            ['id' => 'company-name', 'label' => 'Nama', 'type' => 'text', 'value' => 'UD. TB Nur', 'clearable' => true],
                            ['id' => 'business-category', 'label' => 'Kategori Usaha', 'type' => 'chip-search', 'value' => 'GROSIR / WHOLESALER'],
                            ['id' => 'business-field', 'label' => 'Bidang Usaha', 'type' => 'search', 'placeholder' => 'Cari Bidang Usaha..'],
                            ['id' => 'phone', 'label' => 'Telepon', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
                            ['id' => 'fax', 'label' => 'Faksimili', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
                            ['id' => 'email', 'label' => 'Email', 'type' => 'text', 'value' => 'admin@tbnur.com', 'clearable' => true],
                            ['id' => 'start-date', 'label' => 'Tgl Mulai Data', 'type' => 'date', 'value' => '01/06/2025'],
                            ['id' => 'accounting-period', 'label' => 'Periode Akuntansi', 'type' => 'select', 'value' => 'Januari - Desember', 'options' => [
                                'Januari - Desember',
                                'Februari - Januari',
                                'Maret - Februari',
                                'April - Maret',
                                'Mei - April',
                                'Juni - Mei',
                                'Juli - Juni',
                                'Agustus - Juli',
                                'September - Agustus',
                                'Oktober - September',
                                'November - Oktober',
                                'Desember - November'
                            ]],
                            ['id' => 'currency', 'label' => 'Mata Uang', 'type' => 'readonly-edit', 'value' => 'Indonesian Rupiah'],
                        ],
                        'companyAddress' => [
                            'label' => 'Alamat',
                            'street' => [
                                'id' => 'street',
                                'label' => 'Jalan',
                                'value' => 'Jl. Tomang raya nomor. 35',
                            ],
                            'tokens' => [
                                ['id' => 'city-token', 'label' => 'Kota Denpasar'],
                            ],
                            'fields' => [
                                ['id' => 'city', 'label' => 'Kota', 'value' => 'Kota Denpasar', 'clearable' => true],
                                ['id' => 'province', 'label' => 'Provinsi', 'value' => 'Bali', 'clearable' => true],
                                ['id' => 'postal-code', 'label' => 'K.Pos', 'value' => '12345', 'clearable' => true],
                                ['id' => 'country', 'label' => 'Negara', 'value' => 'Indonesia', 'clearable' => true],
                            ],
                        ],
                    ],
                ],
                'expense-entry' => array_replace(
                    $navigationPages['expense-entry'],
                    self::expenseEntryPage(),
                ),
                'accounts' => array_replace(
                    $navigationPages['accounts'],
                    self::accountsPage(),
                ),
                'customers' => array_replace(
                    $navigationPages['customers'],
                    self::customersPage(),
                ),
                'suppliers' => array_replace(
                    $navigationPages['suppliers'],
                    self::suppliersPage(),
                ),
                'sales-quote' => array_replace(
                    $navigationPages['sales-quote'],
                    self::salesQuotePage(),
                ),
                'sales-deposit' => array_replace(
                    $navigationPages['sales-deposit'],
                    self::salesDepositPage(),
                ),
                'sales-receipt' => array_replace(
                    $navigationPages['sales-receipt'],
                    self::salesReceiptPage(),
                ),
                'sales-delivery' => array_replace(
                    $navigationPages['sales-delivery'],
                    self::salesDeliveryPage(),
                ),
                'sales-invoice' => array_replace(
                    $navigationPages['sales-invoice'],
                    self::salesInvoicePage(),
                ),
                'sales-order' => array_replace(
                    $navigationPages['sales-order'],
                    self::salesOrderPage(),
                ),
                'purchase-order' => array_replace(
                    $navigationPages['purchase-order'],
                    self::purchaseOrderPage(),
                ),
                'purchase-deposit' => array_replace(
                    $navigationPages['purchase-deposit'],
                    self::purchaseDepositPage(),
                ),
                'purchase-invoice' => array_replace(
                    $navigationPages['purchase-invoice'],
                    self::purchaseInvoicePage(),
                ),
                'purchase-payment' => array_replace(
                    $navigationPages['purchase-payment'],
                    self::purchasePaymentPage(),
                ),
                'purchase-return' => array_replace(
                    $navigationPages['purchase-return'],
                    self::purchaseReturnPage(),
                ),
                'supplier-price' => array_replace(
                    $navigationPages['supplier-price'],
                    self::supplierPricePage(),
                ),
                'supplier-category' => array_replace(
                    $navigationPages['supplier-category'],
                    self::supplierCategoryPage(),
                ),
                'payment-order' => array_replace(
                    $navigationPages['payment-order'],
                    self::paymentOrderPage(),
                ),
                'goods-receipt' => array_replace(
                    $navigationPages['goods-receipt'],
                    self::goodsReceiptPage(),
                ),
                'stock-transfer' => array_replace(
                    $navigationPages['stock-transfer'],
                    self::stockTransferPage(),
                ),
                'work-order' => array_replace(
                    $navigationPages['work-order'],
                    self::workOrderPage(),
                ),
                'material-addition' => array_replace(
                    $navigationPages['material-addition'],
                    self::materialAdditionPage(),
                ),
                'stock-opname-order' => array_replace(
                    $navigationPages['stock-opname-order'],
                    self::stockOpnameOrderPage(),
                ),
                'stock-opname-result' => array_replace(
                    $navigationPages['stock-opname-result'],
                    self::stockOpnameResultPage(),
                ),
                'item-request' => array_replace(
                    $navigationPages['item-request'],
                    self::itemRequestPage(),
                ),
                'work-completion' => array_replace(
                    $navigationPages['work-completion'],
                    self::workCompletionPage(),
                ),
                'order-fulfillment' => array_replace(
                    $navigationPages['order-fulfillment'],
                    self::orderFulfillmentPage(),
                ),
                'fixed-assets' => array_replace(
                    $navigationPages['fixed-assets'],
                    self::fixedAssetsPage(),
                ),
                'asset-category' => array_replace(
                    $navigationPages['asset-category'],
                    self::assetCategoryPage(),
                ),
                'asset-tax-category' => array_replace(
                    $navigationPages['asset-tax-category'],
                    self::assetTaxCategoryPage(),
                ),
                'asset-disposal' => array_replace(
                    $navigationPages['asset-disposal'],
                    self::assetDisposalPage(),
                ),
                'asset-move' => array_replace(
                    $navigationPages['asset-move'],
                    self::assetMovePage(),
                ),
                'warehouse-master' => array_replace(
                    $navigationPages['warehouse-master'],
                    self::warehouseMasterPage(),
                ),
                'items-services' => array_replace(
                    $navigationPages['items-services'],
                    self::itemsServicesPage(),
                ),
                'item-unit' => array_replace(
                    $navigationPages['item-unit'],
                    self::itemUnitPage(),
                ),
                'item-category' => array_replace(
                    $navigationPages['item-category'],
                    self::itemCategoryPage(),
                ),
                'item-location' => array_replace(
                    $navigationPages['item-location'],
                    self::itemLocationPage(),
                ),
                'minimum-stock' => array_replace(
                    $navigationPages['minimum-stock'],
                    self::minimumStockPage(),
                ),
                'customer-category' => array_replace(
                    $navigationPages['customer-category'],
                    self::customerCategoryPage(),
                ),
                'sales-category' => array_replace(
                    $navigationPages['sales-category'],
                    self::salesCategoryPage(),
                ),
                'inventory-adjustment' => array_replace(
                    $navigationPages['inventory-adjustment'],
                    self::inventoryAdjustmentPage(),
                ),
                'price-adjustment' => array_replace(
                    $navigationPages['price-adjustment'],
                    self::priceAdjustmentPage(),
                ),
                'sales-commission' => array_replace(
                    $navigationPages['sales-commission'],
                    self::salesCommissionPage(),
                ),
                'sales-target' => array_replace(
                    $navigationPages['sales-target'],
                    self::salesTargetPage(),
                ),
                'sales-checkin' => array_replace(
                    $navigationPages['sales-checkin'],
                    self::salesCheckinPage(),
                ),
                'general-journal' => array_replace(
                    $navigationPages['general-journal'],
                    self::generalJournalPage(),
                ),
                'cash-payment' => array_replace(
                    $navigationPages['cash-payment'],
                    self::cashPaymentPage(),
                ),
                'cash-receipt' => array_replace(
                    $navigationPages['cash-receipt'],
                    self::cashReceiptPage(),
                ),
                'bank-transfer' => array_replace(
                    $navigationPages['bank-transfer'],
                    self::bankTransferPage(),
                ),
                'budget-monitor' => array_replace(
                    $navigationPages['budget-monitor'],
                    self::budgetMonitorPage(),
                ),
                'journal-activity-log' => array_replace(
                    $navigationPages['journal-activity-log'],
                    self::journalActivityLogPage(),
                ),
                'payroll-entry' => [
                    'id' => 'payroll-entry',
                    'label' => 'Pencatatan Gaji',
                    'subtab' => [
                        'id' => 'payroll-entry-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'payrollEntry' => [
                        'topActions' => [
                            [
                                'id' => 'settings',
                                'label' => 'Pengaturan',
                                'icon' => 'settings',
                                'tone' => 'outline',
                            ],
                        ],
                        'labels' => [
                            'paymentType' => 'Tipe Pembayaran',
                            'branch' => 'Cabang',
                            'periodMonth' => 'Bulan',
                            'numbering' => 'Nomor #',
                            'entryDate' => 'Tanggal',
                            'dueDate' => 'Jatuh Tempo',
                        ],
                        'paymentTypeOptions' => ['Bulanan'],
                        'branchPlaceholder' => 'Cari/Pilih...',
                        'monthOptions' => [
                            'Januari',
                            'Februari',
                            'Maret',
                            'April',
                            'Mei',
                            'Juni',
                            'Juli',
                            'Agustus',
                            'September',
                            'Oktober',
                            'November',
                            'Desember',
                        ],
                        'yearOptions' => ['2026', '2025', '2024'],
                        'numberingOptions' => ['Pencatatan Gaji'],
                        'processButtonLabel' => 'Proses',
                        'takeButtonLabel' => 'Ambil',
                        'employeeLookupPlaceholder' => 'Cari/Pilih...',
                        'employeeSectionTitle' => 'Rincian Karyawan',
                        'additionalInfoTitle' => 'Info lainnya',
                        'sectionTabs' => [
                            [
                                'id' => 'employees',
                                'label' => 'Rincian Karyawan',
                                'icon' => 'form',
                            ],
                            [
                                'id' => 'additional-info',
                                'label' => 'Info lainnya',
                                'icon' => 'info',
                            ],
                        ],
                        'dockActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'primary',
                                'items' => [
                                    ['id' => 'save-now', 'label' => 'Simpan'],
                                    ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                                ],
                            ],
                            [
                                'id' => 'document',
                                'label' => 'Form lain',
                                'icon' => 'document',
                                'tone' => 'secondary',
                                'items' => [
                                    ['id' => 'detail-view', 'label' => 'Lihat detail'],
                                    ['id' => 'print-preview', 'label' => 'Preview dokumen'],
                                ],
                            ],
                            [
                                'id' => 'attachment',
                                'label' => 'Lampiran',
                                'icon' => 'paperclip',
                                'tone' => 'secondary',
                                'items' => [
                                    ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                                    ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                                ],
                            ],
                        ],
                        'defaults' => [
                            'paymentType' => 'Bulanan',
                            'branches' => ['JAKARTA'],
                            'month' => 'April',
                            'year' => '2026',
                            'autoNumber' => true,
                            'numberingType' => 'Pencatatan Gaji',
                            'entryDate' => '25/04/2026',
                            'dueDate' => '25/04/2026',
                            'employeeLookup' => '',
                            'liabilityAccounts' => ['[214.100-01] BYMD - Gaji Jakarta'],
                            'notes' => '',
                        ],
                        'employeeTable' => [
                            'columns' => [
                                [
                                    'id' => 'spacer',
                                    'label' => '',
                                    'kind' => 'spacer',
                                    'widthClassName' => 'w-[36px]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'employeeName',
                                    'label' => 'Nama Karyawan',
                                    'widthClassName' => 'w-[48%]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'grossIncome',
                                    'label' => 'Pendapatan Bruto',
                                    'widthClassName' => 'w-[12%]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'incomeTax',
                                    'label' => 'Pajak Penghasilan',
                                    'widthClassName' => 'w-[12%]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'paidSalary',
                                    'label' => 'Gaji dibayarkan',
                                    'widthClassName' => 'w-[12%]',
                                    'align' => 'center',
                                ],
                            ],
                            'rows' => [],
                            'emptyLabel' => 'Belum ada data',
                        ],
                        'summaryItems' => [
                            [
                                'id' => 'gross-income',
                                'label' => 'Pendapatan Bruto',
                                'value' => 'Rp 0',
                            ],
                            [
                                'id' => 'paid-salary',
                                'label' => 'Gaji dibayarkan',
                                'value' => 'Rp 0',
                            ],
                        ],
                        'additionalInfoFields' => [
                            'liabilityAccountLabel' => 'Hutang Beban',
                            'liabilityAccountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                            'noteLabel' => 'Catatan',
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Pencatatan Gaji',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak',
                            'settingsLabel' => 'Pengaturan tabel',
                            'filterButtonLabel' => 'Filter lanjutan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '8',
                            'filters' => [
                                [
                                    'id' => 'date',
                                    'rowKey' => 'dateFilter',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                        ['value' => '2017', 'label' => 'Tanggal: 2017'],
                                        ['value' => '2016', 'label' => 'Tanggal: 2016'],
                                    ],
                                ],
                                [
                                    'id' => 'status',
                                    'rowKey' => 'statusValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Status: Semua'],
                                        ['value' => 'paid', 'label' => 'Status: Terbayar'],
                                        ['value' => 'partial', 'label' => 'Status: Sebagian dibayar'],
                                    ],
                                ],
                                [
                                    'id' => 'month',
                                    'rowKey' => 'monthValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Bulan: Semua'],
                                        ['value' => 'january', 'label' => 'Bulan: Januari'],
                                        ['value' => 'november', 'label' => 'Bulan: November'],
                                        ['value' => 'december', 'label' => 'Bulan: Desember'],
                                        ['value' => 'october', 'label' => 'Bulan: Oktober'],
                                    ],
                                ],
                                [
                                    'id' => 'year',
                                    'rowKey' => 'yearValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tahun: Semua'],
                                        ['value' => '2017', 'label' => 'Tahun: 2017'],
                                        ['value' => '2016', 'label' => 'Tahun: 2016'],
                                    ],
                                ],
                            ],
                            'columns' => [
                                ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[210px]'],
                                ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                                ['id' => 'dueDate', 'label' => 'Jatuh Tempo', 'widthClassName' => 'w-[120px]'],
                                ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                                ['id' => 'paymentType', 'label' => 'Tipe Pembayaran', 'widthClassName' => 'w-[160px]'],
                                ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[150px]'],
                                ['id' => 'period', 'label' => 'Periode', 'widthClassName' => 'w-[140px]'],
                                ['id' => 'description', 'label' => 'Keterangan'],
                            ],
                            'rows' => [
                                ['id' => 'payroll-2017-02', 'number' => 'EPY.2016.11.00002', 'date' => '10/02/2017', 'dueDate' => '10/02/2017', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'November 2016', 'description' => '', 'dateFilter' => '2017', 'monthValue' => 'november', 'yearValue' => '2017'],
                                ['id' => 'payroll-2017-01-b', 'number' => 'EPY.2017.01.00002', 'date' => '23/01/2017', 'dueDate' => '26/01/2017', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Sebagian dibayar', 'statusValue' => 'partial', 'period' => 'Januari 2017', 'description' => '', 'dateFilter' => '2017', 'monthValue' => 'january', 'yearValue' => '2017'],
                                ['id' => 'payroll-2017-01-a', 'number' => 'EPY.2017.01.00001', 'date' => '20/01/2017', 'dueDate' => '26/01/2017', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Sebagian dibayar', 'statusValue' => 'partial', 'period' => 'Januari 2017', 'description' => '', 'dateFilter' => '2017', 'monthValue' => 'january', 'yearValue' => '2017'],
                                ['id' => 'payroll-2016-12-b', 'number' => 'EPY.2016.12.00002', 'date' => '22/12/2016', 'dueDate' => '26/12/2016', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Desember 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'december', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-12-a', 'number' => 'EPY.2016.12.00001', 'date' => '22/12/2016', 'dueDate' => '26/12/2016', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Desember 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'december', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-11-a', 'number' => 'EPY.2016.11.00001', 'date' => '22/11/2016', 'dueDate' => '25/11/2016', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'November 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'november', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-10-b', 'number' => 'EPY.2016.10.00002', 'date' => '22/10/2016', 'dueDate' => '26/10/2016', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Oktober 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'october', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-10-a', 'number' => 'EPY.2016.10.00001', 'date' => '22/10/2016', 'dueDate' => '26/10/2016', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Oktober 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'october', 'yearValue' => '2016'],
                            ],
                        ],
                    ],
                ],
                'salary-allowance' => [
                    'id' => 'salary-allowance',
                    'label' => 'Gaji/Tunjangan',
                    'salaryAllowance' => [
                        'newTabLabel' => 'Data Baru',
                        'sectionLabel' => 'Gaji/Tunjangan',
                        'tipActions' => [],
                        'formActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'muted',
                            ],
                        ],
                        'editActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'muted',
                            ],
                            [
                                'id' => 'delete',
                                'label' => 'Hapus',
                                'icon' => 'delete',
                                'tone' => 'danger',
                            ],
                        ],
                        'fields' => [
                            'nameLabel' => 'Nama',
                            'typeLabel' => 'Tipe Gaji/Tunjangan',
                            'payDeductLabel' => 'Bayar/Potong',
                            'expenseAccountLabel' => 'Akun Beban',
                            'inactiveLabel' => 'Non Aktif',
                            'inactiveOptionLabel' => 'Ya',
                        ],
                        'typeOptions' => [
                            'Gaji/Pensiun atau THT/JHT',
                            'Tunjangan PPh',
                            'Subsidi PPh',
                            'Tunjangan Lainnya, Uang lembur dan sebagainya',
                            'Tunjangan Jaminan Kecelakaan Kerja, Jaminan Kematian',
                            'Honorarium dan Imbalan lain sejenisnya',
                            'Premi asuransi kesehatan yang dibayarkan pemberi kerja',
                            'Penerimaan dalam bentuk natura dan kenikmatan lainnya',
                            'Tantiem, Bonus, Rapel, Gratifikasi, Jasa Produksi dan THR',
                            'Tunjangan Iuran Pensiun/THT/JHT dibayarkan Pemberi Kerja',
                            'Potongan Gaji (Tidak Mengurangi PPh)',
                            'Pengurangan Gaji (Mengurangi PPh)',
                            'Premi asuransi kesehatan dibayarkan pekerja',
                            'Iuran Pensiun/THT/JHT dibayarkan Pekerja',
                        ],
                        'payDeductOptions' => ['Bulanan'],
                        'accountOptions' => [
                            '[611.002-01] Beban Gaji Umum & Admin',
                            '[611.002-02] Beban Tunjangan Hari Raya',
                            '[611.002-03] Beban Tunjangan Bonus',
                        ],
                        'newEntry' => [
                            'id' => 'draft-new',
                            'name' => '',
                            'type' => 'Gaji/Pensiun atau THT/JHT',
                            'payDeduct' => 'Bulanan',
                            'expenseAccount' => '',
                            'inactive' => false,
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Gaji/Tunjangan',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak atau ekspor',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '17',
                            'filterOptions' => [
                                [
                                    'id' => 'type',
                                    'defaultValue' => 'all',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tipe Gaji/Tunjangan: Semua'],
                                        ['value' => 'salary', 'label' => 'Tipe Gaji/Tunjangan: Gaji/Pensiun atau THT/JHT'],
                                        ['value' => 'allowance', 'label' => 'Tipe Gaji/Tunjangan: Tunjangan'],
                                    ],
                                ],
                                [
                                    'id' => 'inactive',
                                    'defaultValue' => 'all',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                        ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                                        ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                    ],
                                ],
                            ],
                            'columns' => [
                                'Nama',
                                'Tipe Gaji/Tunjangan',
                                'Non Aktif',
                            ],
                        ],
                        'rows' => [
                            [
                                'id' => 'salary-basic',
                                'name' => 'Gaji Pokok',
                                'type' => 'Gaji/Pensiun atau THT/JHT',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'holiday-bonus',
                                'name' => 'Tunjangan Hari Raya',
                                'type' => 'Tantiem, Bonus, Rapel, Gratifikasi, Jasa Produksi dan THR',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-02] Beban Tunjangan Hari Raya',
                            ],
                            [
                                'id' => 'bonus',
                                'name' => 'Tunjangan Bonus',
                                'type' => 'Tantiem, Bonus, Rapel, Gratifikasi, Jasa Produksi dan THR',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-03] Beban Tunjangan Bonus',
                            ],
                            [
                                'id' => 'tax-allowance',
                                'name' => 'Tunjangan PPh',
                                'type' => 'Tunjangan PPh',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'position-allowance',
                                'name' => 'Tunjangan Jabatan',
                                'type' => 'Tunjangan Lainnya, Uang lembur dan sebagainya',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'meal-allowance',
                                'name' => 'Tunjangan Makan',
                                'type' => 'Tunjangan Lainnya, Uang lembur dan sebagainya',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'transport-allowance',
                                'name' => 'Tunjangan Transportasi',
                                'type' => 'Tunjangan Lainnya, Uang lembur dan sebagainya',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'telecom-allowance',
                                'name' => 'Tunjangan Telekomunikasi',
                                'type' => 'Tunjangan Lainnya, Uang lembur dan sebagainya',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'overtime-allowance',
                                'name' => 'Tunjangan Lembur',
                                'type' => 'Tunjangan Lainnya, Uang lembur dan sebagainya',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                            [
                                'id' => 'insurance-allowance',
                                'name' => 'Tunjangan Premi Asuransi',
                                'type' => 'Premi asuransi kesehatan yang dibayarkan pemberi kerja',
                                'inactive' => false,
                                'inactiveLabel' => 'Tidak',
                                'payDeduct' => 'Bulanan',
                                'expenseAccount' => '[611.002-01] Beban Gaji Umum & Admin',
                            ],
                        ],
                    ],
                ],
                ],
            ),
            'widgets' => [
                [
                    'id' => 'integrated-analysis',
                    'title' => 'Matrix Analisis Penjualan (Apriori & ABC)',
                    'subtitle' => 'Integrasi pola belanja bersama (Apriori) dan prioritas nilai penjualan (ABC)',
                    'type' => 'integrated-analysis',
                    'metrics' => [
                        [
                            'label' => 'Transaksi',
                            'value' => '2.184',
                            'helper' => 'Periode April 2026',
                            'tone' => 'blue',
                        ],
                        [
                            'label' => 'Rule Siap Pakai',
                            'value' => '7',
                            'helper' => 'Pola asosiasi kuat',
                            'tone' => 'rose',
                        ],
                        [
                            'label' => 'Fokus Stok (Kat A)',
                            'value' => '14',
                            'helper' => '76% kontribusi omzet',
                            'tone' => 'blue',
                        ],
                        [
                            'label' => 'Nilai Penjualan',
                            'value' => 'Rp 812,4 jt',
                            'helper' => 'Berdasarkan material utama',
                            'tone' => 'rose',
                        ],
                    ],
                    'distributionCaption' => 'Semakin tinggi kontribusi, semakin ketat prioritas stok dan restock gudangnya.',
                    'distribution' => [
                        [
                            'label' => 'A',
                            'title' => 'Material inti proyek dan renovasi',
                            'share' => '76%',
                            'itemCount' => '14 item',
                            'barWidth' => '76%',
                            'color' => '#2d77d1',
                        ],
                        [
                            'label' => 'B',
                            'title' => 'Pelengkap bangunan yang tetap rutin bergerak',
                            'share' => '17%',
                            'itemCount' => '26 item',
                            'barWidth' => '46%',
                            'color' => '#4caf50',
                        ],
                        [
                            'label' => 'C',
                            'title' => 'Aksesoris dan item lambat gerak',
                            'share' => '7%',
                            'itemCount' => '61 item',
                            'barWidth' => '24%',
                            'color' => '#f4a62a',
                        ],
                    ],
                    'topItemsCaption' => 'Daftar material kategori A dengan kontribusi tertinggi terhadap omzet toko bangunan.',
                    'topItems' => [
                        [
                            'name' => 'Semen Portland 50 Kg',
                            'code' => 'SMN-050',
                            'unitsSold' => '1.284 zak',
                            'revenue' => 'Rp 168,6 jt',
                            'share' => '20,8%',
                            'category' => 'A',
                            'categoryColor' => '#2d77d1',
                        ],
                        [
                            'name' => 'Besi Hollow 4x4',
                            'code' => 'BSH-404',
                            'unitsSold' => '742 batang',
                            'revenue' => 'Rp 124,3 jt',
                            'share' => '15,3%',
                            'category' => 'A',
                            'categoryColor' => '#2d77d1',
                        ],
                        [
                            'name' => 'Cat Tembok Interior 25 Kg',
                            'code' => 'CAT-250',
                            'unitsSold' => '318 pail',
                            'revenue' => 'Rp 97,8 jt',
                            'share' => '12,0%',
                            'category' => 'A',
                            'categoryColor' => '#2d77d1',
                        ],
                    ],
                    'rulesCaption' => 'Rule diurutkan berdasarkan confidence dan lift tertinggi dari pola belanja material bangunan.',
                    'rules' => [
                        [
                            'id' => 'apr-1',
                            'segment' => 'Top Rule',
                            'transactionBase' => 'Basis 436 transaksi',
                            'antecedent' => 'Semen Portland 50 Kg',
                            'consequent' => 'Pasir cor per m3',
                            'support' => '16,4%',
                            'confidence' => '68,2%',
                            'lift' => '2,08',
                            'insight' => 'Pembelian semen sering diikuti pasir cor untuk pekerjaan pengecoran dan plester skala kecil-menengah.',
                        ],
                        [
                            'id' => 'apr-2',
                            'segment' => 'Cross-sell',
                            'transactionBase' => 'Basis 312 transaksi',
                            'antecedent' => 'Pipa PVC 3/4 inch',
                            'consequent' => 'Lem PVC 400 gr',
                            'support' => '12,1%',
                            'confidence' => '63,5%',
                            'lift' => '2,21',
                            'insight' => 'Pipa PVC sangat cocok dipasangkan dengan lem PVC karena sering dibeli untuk pekerjaan instalasi yang sama.',
                        ],
                    ],
                    'insight' => 'Hasil integrasi ini menggabungkan penentuan prioritas stok barang (ABC) dengan penempatan dan promosi barang pelengkap (Apriori).',
                    'gridClass' => 'md:col-span-2 lg:col-span-3 xl:col-span-6',
                    'heightClass' => 'min-h-[500px]',
                ],
                [
                    'id' => 'recent-activity',
                    'title' => 'Aktifitas Terakhir Anda (' . (auth()->user()?->name ?? 'Zaki Ramadhan') . ')',
                    'type' => 'recent-activity',
                    'items' => $userActivities,
                    'gridClass' => 'md:col-span-1 lg:col-span-2 xl:col-span-4',
                    'heightClass' => 'min-h-[318px]',
                ],
                [
                    'id' => 'upcoming-activity',
                    'title' => 'Kegiatan Mendatang',
                    'type' => 'note',
                    'note' => 'Tidak ada kegiatan',
                    'gridClass' => 'md:col-span-1 lg:col-span-2 xl:col-span-4',
                    'heightClass' => 'min-h-[318px]',
                ],
                [
                    'id' => 'sales-trend',
                    'title' => 'Tren Penjualan',
                    'type' => 'line',
                    'period' => '(Seminggu terakhir)',
                    'labels' => $salesTrendLabels,
                    'series' => [
                        [
                            'label' => 'Penjualan',
                            'data' => $salesTrendData,
                            'color' => '#7bbaf0',
                            'fillColor' => 'rgba(123, 186, 240, 0.18)',
                        ],
                    ],
                    'valueFormat' => 'currency',
                    'accent' => '#7bbaf0',
                    'gridClass' => 'md:col-span-1 lg:col-span-2 xl:col-span-4',
                    'heightClass' => 'min-h-[318px]',
                ],
                [
                    'id' => 'profit-loss',
                    'title' => 'Laba/Rugi Tahun Ini',
                    'type' => 'ring-breakdown',
                    'percentage' => $profitPercentage,
                    'compare' => 'Dibanding periode lalu',
                    'legend' => [
                        ['label' => 'Pendapatan', 'value' => $formatCurrencyShort($totalSalesVal), 'percent' => $pctRev . '%', 'color' => '#4fd0c5'],
                        ['label' => 'Nilai HPP', 'value' => $formatCurrencyShort($totalHppVal), 'percent' => $pctHpp . '%', 'color' => '#ffc54d'],
                        ['label' => 'Pengeluaran', 'value' => $formatCurrencyShort($totalExpensesVal), 'percent' => $pctExp . '%', 'color' => '#f26b8d'],
                    ],
                    'totalLabel' => 'Laba bersih',
                    'totalValue' => $formatCurrencyShort($netProfitVal),
                    'gridClass' => 'md:col-span-1 lg:col-span-2 xl:col-span-4',
                    'heightClass' => 'min-h-[318px]',
                ],
                [
                    'id' => 'cash-flow',
                    'title' => 'Arus Kas',
                    'type' => 'line',
                    'labels' => $cashFlowLabels,
                    'series' => [
                        [
                            'label' => 'Kas Masuk',
                            'data' => $cashInSeries,
                            'color' => '#1ba7e5',
                            'fillColor' => 'rgba(27, 167, 229, 0.14)',
                        ],
                        [
                            'label' => 'Kas Keluar',
                            'data' => $cashOutSeries,
                            'color' => '#f26b8d',
                            'fillColor' => 'rgba(242, 107, 141, 0.08)',
                        ],
                    ],
                    'valueFormat' => 'currency',
                    'accent' => '#1ba7e5',
                    'gridClass' => 'md:col-span-1 lg:col-span-2 xl:col-span-4',
                    'heightClass' => 'min-h-[318px]',
                ],
                [
                    'id' => 'company-expense',
                    'title' => 'Beban Perusahaan',
                    'type' => 'expense',
                    'percentage' => $pctExp . '%',
                    'compare' => 'Berdasarkan pengeluaran kas',
                    'legend' => [
                        ['label' => 'Gaji', 'value' => $formatCurrencyShort($totalGaji), 'percent' => $pctGaji . '%', 'color' => '#5c8fd8'],
                        ['label' => 'Operasional', 'value' => $formatCurrencyShort($totalOperasional), 'percent' => $pctOpr . '%', 'color' => '#4fd0c5'],
                    ],
                    'totalValue' => $formatCurrencyShort($totalExpense),
                    'gridClass' => 'md:col-span-1 lg:col-span-2 xl:col-span-4',
                    'heightClass' => 'min-h-[318px]',
                ],
                [
                    'id' => 'sales-summary',
                    'title' => 'Penjualan',
                    'type' => 'summary',
                    'sections' => [
                        [
                            'title' => 'Pendapatan',
                            'items' => [
                                ['label' => 'Faktur Lunas', 'value' => $formatCurrencyShort($fakturLunasSales), 'color' => '#66b327'],
                                ['label' => 'Faktur Belum Lunas', 'value' => $formatCurrencyShort($fakturBelumLunasSales), 'color' => '#ff9f1a'],
                            ],
                        ],
                        [
                            'title' => 'Belum Lunas',
                            'items' => [
                                ['label' => 'Belum Jatuh Tempo', 'value' => $formatCurrencyShort($belumJatuhTempoSales), 'color' => '#ff9f1a'],
                                ['label' => 'Lewat Jatuh Tempo', 'value' => $formatCurrencyShort($lewatJatuhTempoSales), 'color' => '#ff3b30'],
                            ],
                        ],
                    ],
                    'headline' => [
                        'label' => 'Hari ini',
                        'value' => $formatCurrencyShort($hariIniSales),
                        'secondaryLabel' => 'Belum Lunas',
                        'secondaryValue' => $formatCurrencyShort($fakturBelumLunasSales),
                    ],
                    'gridClass' => 'md:col-span-2 lg:col-span-3 xl:col-span-6',
                    'heightClass' => 'min-h-[246px]',
                ],
                [
                    'id' => 'purchase-summary',
                    'title' => 'Pembelian',
                    'type' => 'summary',
                    'sections' => [
                        [
                            'title' => 'Pembelian',
                            'items' => [
                                ['label' => 'Faktur Lunas', 'value' => $formatCurrencyShort($fakturLunasPurchase), 'color' => '#66b327'],
                                ['label' => 'Faktur Belum Lunas', 'value' => $formatCurrencyShort($fakturBelumLunasPurchase), 'color' => '#ff9f1a'],
                            ],
                        ],
                        [
                            'title' => 'Belum Lunas',
                            'items' => [
                                ['label' => 'Belum Jatuh Tempo', 'value' => $formatCurrencyShort($belumJatuhTempoPurchase), 'color' => '#ff9f1a'],
                                ['label' => 'Lewat Jatuh Tempo', 'value' => $formatCurrencyShort($lewatJatuhTempoPurchase), 'color' => '#ff3b30'],
                            ],
                        ],
                    ],
                    'headline' => [
                        'label' => 'Hari ini',
                        'value' => $formatCurrencyShort($hariIniPurchase),
                        'secondaryLabel' => 'Belum Lunas',
                        'secondaryValue' => $formatCurrencyShort($fakturBelumLunasPurchase),
                    ],
                    'gridClass' => 'md:col-span-2 lg:col-span-3 xl:col-span-6',
                    'heightClass' => 'min-h-[246px]',
                ],
                [
                    'id' => 'sales-team-performance',
                    'title' => 'Penjualan Penjual (Semua Cabang)',
                    'type' => 'sales-team',
                    'period' => 'Periode Aktif',
                    'rows' => $salesTeamRows,
                    'heightClass' => 'min-h-[280px]',
                ],
                [
                    'id' => 'top-products',
                    'title' => 'Barang Paling Laku (Semua Cabang)',
                    'type' => 'top-products',
                    'period' => 'Periode Aktif',
                    'items' => $topProductsItems,
                    'heightClass' => 'min-h-[280px]',
                ],
                [
                    'id' => 'overdue-activity',
                    'title' => 'Kegiatan Terlewat',
                    'type' => 'note',
                    'note' => 'Tidak ada kegiatan',
                    'heightClass' => 'min-h-[280px]',
                ],
                [
                    'id' => 'cash-availability',
                    'title' => 'Ketersediaan Kas',
                    'type' => 'cash-availability',
                    'period' => 'Periode Aktif',
                    'balanceLabel' => 'Saldo kas tersedia',
                    'balanceValue' => $formatCurrencyShort(28000000000 + ($totalSalesVal - $totalExpensesVal)),
                    'labels' => $cashAvailabilityLabels,
                    'series' => [
                        [
                            'label' => 'Saldo Kas',
                            'data' => $cashAvailabilitySeries,
                            'color' => '#7bbaf0',
                            'fillColor' => 'rgba(123, 186, 240, 0.12)',
                        ],
                    ],
                    'valueFormat' => 'currency',
                    'accent' => '#7bbaf0',
                    'heightClass' => 'min-h-[280px]',
                ],
                [
                    'id' => 'sales-order-status',
                    'title' => 'Pesanan Penjualan (Semua Cabang)',
                    'type' => 'order-status',
                    'primaryLabel' => 'Menunggu diproses',
                    'primaryValue' => (string) $pendingSalesOrders,
                    'statusTitle' => 'Status Pesanan Aktif',
                    'segments' => [
                        [
                            'label' => 'Aktif',
                            'value' => $totalSalesOrders . ' Pesanan',
                            'numericValue' => $totalSalesOrders,
                            'color' => '#ffd15d',
                        ],
                        [
                            'label' => 'Terlewat / Pending',
                            'value' => $pendingSalesOrders . ' Pesanan',
                            'numericValue' => $pendingSalesOrders,
                            'color' => '#ff4a17',
                        ],
                    ],
                    'heightClass' => 'min-h-[280px]',
                ],
            ],
        ];

        // Merge ABC and Apriori data into the respective analytics widgets
        foreach ($data['widgets'] as &$w) {
            if ($w['id'] === 'integrated-analysis' || str_starts_with($w['id'], 'integrated-analysis')) {
                // Combine metrics
                $combinedMetrics = [];
                if ($apriori !== null && isset($apriori['metrics'])) {
                    foreach ($apriori['metrics'] as $m) {
                        if ($m['label'] === 'Transaksi' || $m['label'] === 'Rule Valid') {
                            $combinedMetrics[] = $m;
                        }
                    }
                }
                if ($abc !== null && isset($abc['metrics'])) {
                    foreach ($abc['metrics'] as $m) {
                        if ($m['label'] === 'Item A' || $m['label'] === 'Nilai Analisis') {
                            if ($m['label'] === 'Item A') {
                                $m['label'] = 'Fokus Stok (Kat A)';
                            }
                            $combinedMetrics[] = $m;
                        }
                    }
                }
                
                if (!empty($combinedMetrics)) {
                    $w['metrics'] = $combinedMetrics;
                }

                if ($abc !== null) {
                    $w['distribution'] = $abc['distribution'];
                    $w['topItems'] = $abc['topItems'];
                }

                if ($apriori !== null) {
                    $formattedRules = [];
                    foreach ($apriori['rules'] as $rule) {
                        $formattedRules[] = [
                            'id' => $rule['id'],
                            'segment' => 'Top Rule',
                            'transactionBase' => 'Rule Valid',
                            'antecedent' => $rule['antecedent'],
                            'consequent' => $rule['consequent'],
                            'antecedentAbc' => $rule['antecedentAbc'] ?? null,
                            'antecedentColor' => $rule['antecedentColor'] ?? null,
                            'consequentAbc' => $rule['consequentAbc'] ?? null,
                            'consequentColor' => $rule['consequentColor'] ?? null,
                            'support' => $rule['support'],
                            'confidence' => $rule['confidence'],
                            'lift' => $rule['lift'],
                            'insight' => "Pembelian {$rule['antecedent']} [" . ($rule['antecedentAbc'] ?? 'C') . "] sering diikuti {$rule['consequent']} [" . ($rule['consequentAbc'] ?? 'C') . "].",
                        ];
                    }
                    $w['rules'] = $formattedRules;
                }

                // Make a rich unified insight
                if ($abc !== null && $apriori !== null && !empty($apriori['rules']) && !empty($abc['topItems'])) {
                    $topRule = $apriori['rules'][0];
                    $topItem = $abc['topItems'][0];
                    $w['insight'] = "Rekomendasi Utama: Pelanggan yang membeli {$topRule['antecedent']} [Kat {$topRule['antecedentAbc']}] memiliki peluang {$topRule['confidence']} untuk membeli {$topRule['consequent']} [Kat {$topRule['consequentAbc']}]. Kombinasikan dengan prioritas stok {$topItem['name']} [Kat A] yang menyumbang {$topItem['share']} omzet toko.";
                } else if ($apriori !== null && !empty($apriori['rules'])) {
                    $w['insight'] = $apriori['insight'];
                } else if ($abc !== null) {
                    $w['insight'] = $abc['insight'];
                }
            } else if ($w['id'] === 'abc-analysis' || str_starts_with($w['id'], 'abc-analysis')) {
                if ($abc !== null) {
                    $w['metrics'] = $abc['metrics'];
                    $w['distribution'] = $abc['distribution'];
                    $w['topItems'] = $abc['topItems'];
                    $w['insight'] = $abc['insight'];
                }
            } else if ($w['id'] === 'apriori-analysis' || str_starts_with($w['id'], 'apriori-analysis')) {
                if ($apriori !== null) {
                    $w['metrics'] = $apriori['metrics'];
                    $w['rules'] = $apriori['rules'];
                    $w['insight'] = $apriori['insight'];
                }
            }
        }

        return $data;
    }

    private static function navigationModules(): array
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

    private static function generalJournalPage(): array
    {
        return [
            'subtab' => [
                'id' => 'general-journal-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'generalJournal' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'Nomor #',
                    'transactionNumber' => 'No. Tx #',
                    'transactionType' => 'Tipe Transaksi',
                    'branch' => 'Cabang',
                    'notes' => 'Keterangan',
                ],
                'numberingOptions' => ['Jurnal Umum'],
                'takeButtonLabel' => 'Ambil',
                'branchPlaceholder' => 'Cari/Pilih...',
                'lineSearchPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'lineSectionTitle' => 'Rincian Jurnal',
                'additionalInfoTitle' => 'Info lainnya',
                'sectionTabs' => [
                    [
                        'id' => 'details',
                        'label' => 'Rincian Jurnal',
                        'icon' => 'document',
                    ],
                    [
                        'id' => 'additional-info',
                        'label' => 'Info lainnya',
                        'icon' => 'info',
                    ],
                ],
                'totalLabels' => [
                    'debit' => 'Total Debit',
                    'credit' => 'Total Credit',
                ],
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'muted',
                    ],
                    [
                        'id' => 'document',
                        'label' => 'Form lain',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'open-related', 'label' => 'Buka transaksi terkait'],
                            ['id' => 'preview-document', 'label' => 'Preview jurnal'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                            ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate', 'label' => 'Duplikasi jurnal'],
                            ['id' => 'audit', 'label' => 'Lihat jejak audit'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'defaults' => [
                    'documentNumber' => '',
                    'transactionNumber' => '',
                    'entryDate' => '25/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Jurnal Umum',
                    'transactionType' => 'Jurnal Umum',
                    'transactionTypeValue' => 'general-journal',
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'lineLookup' => '',
                    'lineItems' => [],
                    'totalDebit' => 'Rp 0',
                    'totalCredit' => 'Rp 0',
                    'saveTone' => 'muted',
                ],
                'records' => [
                    'JV.2017.02.00015' => [
                        'id' => 'JV.2017.02.00015',
                        'documentNumber' => 'JV.2017.02.00015',
                        'transactionNumber' => '111.102-01.2017.02.00002',
                        'entryDate' => '24/02/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Jurnal Umum',
                        'transactionType' => 'Penerimaan Penjualan',
                        'transactionTypeValue' => 'sales-receipt',
                        'branches' => ['JAKARTA'],
                        'notes' => 'Pembayaran No. Faktur SI.2016.10.00004, SI.2017.02.00005',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'JV.2017.02.00015-line-1',
                                'accountCode' => '111.102-01',
                                'accountName' => 'Bank BCA IDR Jakarta (069-773-3993)',
                                'debit' => '33,600,000',
                                'credit' => '0',
                            ],
                            [
                                'id' => 'JV.2017.02.00015-line-2',
                                'accountCode' => '112.101-01',
                                'accountName' => 'Piutang Usaha Jakarta - IDR',
                                'debit' => '0',
                                'credit' => '33,600,000',
                            ],
                        ],
                        'totalDebit' => 'Rp 33,600,000',
                        'totalCredit' => 'Rp 33,600,000',
                        'saveTone' => 'muted',
                    ],
                ],
                'lineTable' => [
                    'columns' => [
                        [
                            'id' => 'spacer',
                            'label' => '',
                            'kind' => 'spacer',
                            'widthClassName' => 'w-[36px]',
                            'align' => 'center',
                        ],
                        [
                            'id' => 'accountCode',
                            'label' => 'Akun Perkiraan',
                            'widthClassName' => 'w-[27%]',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'accountName',
                            'label' => 'Nama Perkiraan',
                            'widthClassName' => 'w-[35%]',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'debit',
                            'label' => 'Debit',
                            'widthClassName' => 'w-[19%]',
                            'align' => 'right',
                        ],
                        [
                            'id' => 'credit',
                            'label' => 'Kredit',
                            'widthClassName' => 'w-[19%]',
                            'align' => 'right',
                        ],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Jurnal Umum',
                    'refreshLabel' => 'Muat ulang',
                    'downloadLabel' => 'Unduh',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '506',
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2017', 'label' => 'Tanggal: 2017'],
                            ],
                        ],
                        [
                            'id' => 'transactionType',
                            'rowKey' => 'transactionTypeValue',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                ['value' => 'sales-receipt', 'label' => 'Tipe Transaksi: Penerimaan Penjualan'],
                                ['value' => 'sales-invoice', 'label' => 'Tipe Transaksi: Penjualan'],
                                ['value' => 'purchase-payment', 'label' => 'Tipe Transaksi: Pembayaran Pembelian'],
                                ['value' => 'sales-return', 'label' => 'Tipe Transaksi: Retur Penjualan'],
                                ['value' => 'purchase-return', 'label' => 'Tipe Transaksi: Retur Pembelian'],
                                ['value' => 'period-end', 'label' => 'Tipe Transaksi: Proses Akhir Bulan'],
                            ],
                        ],
                    ],
                    'settingsMenu' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-journal', 'label' => 'Ekspor jurnal umum'],
                    ],
                    'columns' => [
                        ['id' => 'documentNumber', 'label' => 'Nomor #', 'widthClassName' => 'w-[20%]', 'align' => 'left'],
                        ['id' => 'transactionNumber', 'label' => 'No. Trans #', 'widthClassName' => 'w-[20%]', 'align' => 'left'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[12%]', 'align' => 'left'],
                        ['id' => 'description', 'label' => 'Keterangan', 'widthClassName' => 'w-[30%]', 'align' => 'left'],
                        ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[18%]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => 'JV.2017.02.00015', 'documentNumber' => 'JV.2017.02.00015', 'transactionNumber' => '111.102-01.2017.02.00002', 'date' => '24/02/2017', 'description' => 'Pembayaran No. Faktur SI.2016.10.00004, SI.2017.02.00005', 'total' => '33,600,000', 'totalCurrency' => 'Rp 33,600,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-receipt', 'transactionTypeLabel' => 'Penerimaan Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00024', 'documentNumber' => 'JV.2017.02.00024', 'transactionNumber' => '111.102-01.2017.02.00003', 'date' => '11/02/2017', 'description' => 'Pembayaran No. Faktur PI.2016.12.00001', 'total' => '88,320,000', 'totalCurrency' => 'Rp 88,320,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'purchase-payment', 'transactionTypeLabel' => 'Pembayaran Pembelian', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00023', 'documentNumber' => 'JV.2017.02.00023', 'transactionNumber' => 'SI.2017.02.00010', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Abadi Phone Center', 'total' => '3,259,165,568.38', 'totalCurrency' => 'Rp 3,259,165,568.38', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00019', 'documentNumber' => 'JV.2017.02.00019', 'transactionNumber' => '111.201-02.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pembayaran Hutang Pajak PPh Ps 21', 'total' => '1,447,298', 'totalCurrency' => 'Rp 1,447,298', 'dateFilter' => '2017', 'transactionTypeValue' => 'tax-payment', 'transactionTypeLabel' => 'Pembayaran Pajak', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00018', 'documentNumber' => 'JV.2017.02.00018', 'transactionNumber' => '111.101-02.2017.02.00002', 'date' => '10/02/2017', 'description' => 'Pembayaran atas hutang Pajak PPh Ps 21', 'total' => '1,897,540', 'totalCurrency' => 'Rp 1,897,540', 'dateFilter' => '2017', 'transactionTypeValue' => 'tax-payment', 'transactionTypeLabel' => 'Pembayaran Pajak', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00016', 'documentNumber' => 'JV.2017.02.00016', 'transactionNumber' => 'EPY.2016.11.00002', 'date' => '10/02/2017', 'description' => 'Pencatatan Gaji SURABAYA Bulan November 2016', 'total' => '40,213,124', 'totalCurrency' => 'Rp 40,213,124', 'dateFilter' => '2017', 'transactionTypeValue' => 'payroll-entry', 'transactionTypeLabel' => 'Pencatatan Gaji', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00014', 'documentNumber' => 'JV.2017.02.00014', 'transactionNumber' => '111.101-02.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pembayaran No. Faktur SI.2017.02.00007', 'total' => '6,600,000', 'totalCurrency' => 'Rp 6,600,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-receipt', 'transactionTypeLabel' => 'Penerimaan Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00013', 'documentNumber' => 'JV.2017.02.00013', 'transactionNumber' => 'SI.2017.02.00007', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Pelanggan Umum - Jakarta', 'total' => '11,540,000', 'totalCurrency' => 'Rp 11,540,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00011', 'documentNumber' => 'JV.2017.02.00011', 'transactionNumber' => 'SI.2017.02.00005', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Pelanggan Umum - Jakarta', 'total' => '55,696,798.01', 'totalCurrency' => 'Rp 55,696,798.01', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00010', 'documentNumber' => 'JV.2017.02.00010', 'transactionNumber' => 'SI.2017.02.00004', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke PT CIRCLE PHONE', 'total' => '255,518,376.31', 'totalCurrency' => 'Rp 255,518,376.31', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00009', 'documentNumber' => 'JV.2017.02.00009', 'transactionNumber' => 'SI.2017.02.00003', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Abadi Phone Center', 'total' => '3,112,500', 'totalCurrency' => 'Rp 3,112,500', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00008', 'documentNumber' => 'JV.2017.02.00008', 'transactionNumber' => 'DO.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pengiriman Pesanan Ke Abadi Phone Center', 'total' => '1,187,500', 'totalCurrency' => 'Rp 1,187,500', 'dateFilter' => '2017', 'transactionTypeValue' => 'delivery-order', 'transactionTypeLabel' => 'Pengiriman Pesanan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00007', 'documentNumber' => 'JV.2017.02.00007', 'transactionNumber' => 'SI.2017.02.00002', 'date' => '10/02/2017', 'description' => 'Deposit uang muka.', 'total' => '50,000,000', 'totalCurrency' => 'Rp 50,000,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00004', 'documentNumber' => 'JV.2017.02.00004', 'transactionNumber' => '111.102-01.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pembayaran No. Faktur PI.2016.10.00008', 'total' => '41,800,000', 'totalCurrency' => 'Rp 41,800,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'purchase-payment', 'transactionTypeLabel' => 'Pembayaran Pembelian', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00056', 'documentNumber' => 'JV.2017.01.00056', 'transactionNumber' => 'SRT.2017.01.00005', 'date' => '31/01/2017', 'description' => 'Retur Penjualan Dari PT Galaxy Phone', 'total' => '114,602,790.13', 'totalCurrency' => 'Rp 114,602,790.13', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-return', 'transactionTypeLabel' => 'Retur Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00022', 'documentNumber' => 'JV.2017.01.00022', 'transactionNumber' => 'Januari 2017', 'date' => '31/01/2017', 'description' => 'Proses Akhir Bulan (Januari, 2017)', 'total' => '75,172,708.33', 'totalCurrency' => 'Rp 75,172,708.33', 'dateFilter' => '2017', 'transactionTypeValue' => 'period-end', 'transactionTypeLabel' => 'Proses Akhir Bulan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00021', 'documentNumber' => 'JV.2017.01.00021', 'transactionNumber' => 'Januari 2017', 'date' => '31/01/2017', 'description' => 'Proses Akhir Bulan (Januari, 2017)', 'total' => '21,592,694,756', 'totalCurrency' => 'Rp 21,592,694,756', 'dateFilter' => '2017', 'transactionTypeValue' => 'period-end', 'transactionTypeLabel' => 'Proses Akhir Bulan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00055', 'documentNumber' => 'JV.2017.01.00055', 'transactionNumber' => 'SRT.2017.01.00004', 'date' => '30/01/2017', 'description' => 'Retur Penjualan Dari PT CIRCLE PHONE', 'total' => '39,510,396.05', 'totalCurrency' => 'Rp 39,510,396.05', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-return', 'transactionTypeLabel' => 'Retur Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00053', 'documentNumber' => 'JV.2017.01.00053', 'transactionNumber' => 'PRT.2017.01.00003', 'date' => '30/01/2017', 'description' => 'Retur Pembelian Ke SAMSANG', 'total' => '19,892,250', 'totalCurrency' => 'Rp 19,892,250', 'dateFilter' => '2017', 'transactionTypeValue' => 'purchase-return', 'transactionTypeLabel' => 'Retur Pembelian', 'branches' => ['JAKARTA']],
                    ],
                ],
            ],
        ];
    }

    private static function salesOrderPage(): array
    {
        return self::buildSalesTransactionPage('sales-order-create', 'salesOrder');
    }

    private static function accountsPage(): array
    {
        return [
            'subtab' => [
                'id' => 'accounts-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'accounts' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function customersPage(): array
    {
        return [
            'subtab' => [
                'id' => 'customers-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'customers' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function suppliersPage(): array
    {
        return [
            'subtab' => [
                'id' => 'suppliers-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'suppliers' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function salesQuotePage(): array
    {
        return self::buildSalesTransactionPage('sales-quote-create', 'salesQuote');
    }

    private static function salesDepositPage(): array
    {
        return self::buildSalesTransactionPage('sales-deposit-create', 'salesDeposit');
    }

    private static function salesReceiptPage(): array
    {
        return self::buildSalesTransactionPage('sales-receipt-create', 'salesReceipt');
    }

    private static function salesDeliveryPage(): array
    {
        return self::buildSalesTransactionPage('sales-delivery-create', 'salesDelivery');
    }

    private static function salesInvoicePage(): array
    {
        return [
            ...self::buildSalesTransactionPage('sales-invoice-create', 'salesInvoice'),
        ];
    }

    private static function purchaseInvoicePage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-invoice-create', 'purchaseInvoice'),
        ];
    }

    private static function purchaseDepositPage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-deposit-create', 'purchaseDeposit'),
        ];
    }

    private static function purchasePaymentPage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-payment-create', 'purchasePayment'),
        ];
    }

    private static function purchaseReturnPage(): array
    {
        return [
            ...self::buildSalesTransactionPage('purchase-return-create', 'purchaseReturn'),
        ];
    }

    private static function supplierPricePage(): array
    {
        return [
            'subtab' => [
                'id' => 'supplier-price-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'supplierPrice' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'labels' => [
                    'supplier' => 'Pemasok',
                    'effectiveDate' => 'Mulai Berlaku',
                    'autoEndDate' => 'Atur Tanggal Berakhir',
                    'documentNumber' => 'Nomor #',
                    'currency' => 'Mata Uang',
                    'notes' => 'Keterangan',
                ],
                'supplierPlaceholder' => 'Cari/Pilih Pemasok...',
                'currencyPlaceholder' => 'Cari/Pilih...',
                'numberingOptions' => ['Harga Pemasok'],
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Barang', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'itemSearchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                'takeButtonLabel' => 'Ambil',
                'itemSectionTitle' => 'Rincian Barang',
                'additionalInfoTitle' => 'Info lainnya',
                'dockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'primary', 'icon' => 'save'],
                    ['id' => 'attachment', 'label' => 'Lampiran', 'tone' => 'secondary', 'icon' => 'paperclip'],
                    ['id' => 'more', 'label' => 'Opsi lain', 'tone' => 'success', 'icon' => 'kebab'],
                ],
                'draft' => [
                    'supplier' => [],
                    'effectiveDate' => '28/04/2026',
                    'autoEndDate' => false,
                    'autoNumber' => true,
                    'numberingType' => 'Harga Pemasok',
                    'currencies' => ['Indonesian Rupiah'],
                    'notes' => '',
                    'itemSearch' => '',
                ],
                'itemTable' => [
                    'columns' => [
                        ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[42%]'],
                        ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[24%]'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[25%]'],
                        ['id' => 'newPrice', 'label' => 'Harga Baru', 'widthClassName' => 'w-[19%]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Harga Pemasok',
                    'refreshLabel' => 'Muat ulang',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '0',
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                            ],
                        ],
                        [
                            'id' => 'supplier',
                            'rowKey' => 'supplierFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Pemasok: Semua'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'effectiveDate', 'label' => 'Mulai Berlaku', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'notes', 'label' => 'Keterangan'],
                        ['id' => 'endDate', 'label' => 'Tanggal Berakhir', 'widthClassName' => 'w-[18%]'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    private static function customerCategoryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'customer-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'table' => [
                'createLabel' => 'Tambah Kategori Pelanggan',
                'refreshLabel' => 'Muat ulang',
                'leftButtons' => [
                    [
                        'id' => 'link-customer-category',
                        'label' => 'Hubungkan kategori pelanggan',
                    ],
                ],
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '3',
                'emptyLabel' => 'Tidak ada kategori pelanggan yang cocok.',
                'columns' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'widthClassName' => 'w-[72%]',
                    ],
                    [
                        'id' => 'defaultLabel',
                        'label' => 'Kategori Default',
                        'widthClassName' => 'w-[28%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'customer-category-agen-lokal',
                        'name' => 'Agen Lokal',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'Agen Lokal',
                    ],
                    [
                        'id' => 'customer-category-ekspor',
                        'name' => 'Ekspor',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'Ekspor',
                    ],
                    [
                        'id' => 'customer-category-umum',
                        'name' => 'Umum',
                        'defaultLabel' => 'Ya',
                        'isDefault' => true,
                        'isSubCategory' => false,
                        'tabLabel' => 'Umum',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Kategori Pelanggan',
                'saveLabel' => 'Simpan',
                'deleteLabel' => 'Hapus',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'required' => true,
                        'value' => '',
                        'clearable' => true,
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'isDefault',
                        'type' => 'checkbox',
                        'label' => 'Kategori Default',
                        'checkboxLabel' => 'Ya',
                        'checked' => false,
                    ],
                    [
                        'id' => 'isSubCategory',
                        'type' => 'checkbox',
                        'label' => 'Sub Kategori',
                        'checked' => false,
                        'standalone' => true,
                    ],
                ],
            ],
        ];
    }

    private static function supplierCategoryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'supplier-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'supplierCategory' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
            'table' => [
                'createLabel' => 'Tambah Kategori Pemasok',
                'refreshLabel' => 'Muat ulang',
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '4',
                'columns' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'widthClassName' => 'w-[92%]',
                    ],
                    [
                        'id' => 'defaultLabel',
                        'label' => 'Kategori Default',
                        'widthClassName' => 'w-[8%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'supplier-category-accessories',
                        'name' => 'ACCESSORIES',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'ACCESSORIES',
                    ],
                    [
                        'id' => 'supplier-category-handphone',
                        'name' => 'HANDPHONE',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'HANDPHONE',
                    ],
                    [
                        'id' => 'supplier-category-sparepart',
                        'name' => 'SPAREPART',
                        'defaultLabel' => 'Tidak',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'tabLabel' => 'SPAREPART',
                    ],
                    [
                        'id' => 'supplier-category-umum',
                        'name' => 'Umum',
                        'defaultLabel' => 'Ya',
                        'isDefault' => true,
                        'isSubCategory' => false,
                        'tabLabel' => 'Umum',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Kategori Pemasok',
                'saveLabel' => 'Simpan',
                'deleteLabel' => 'Hapus',
                'saveToneCreate' => 'muted',
                'saveToneDetail' => 'muted',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'required' => true,
                        'value' => '',
                        'clearable' => true,
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'isDefault',
                        'type' => 'checkbox',
                        'label' => 'Kategori Default',
                        'checkboxLabel' => 'Ya',
                        'checked' => false,
                    ],
                    [
                        'id' => 'isSubCategory',
                        'type' => 'checkbox',
                        'label' => 'Sub Kategori',
                        'checked' => false,
                        'standalone' => true,
                    ],
                ],
            ],
        ];
    }

    private static function salesCategoryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'sales-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'table' => [
                'createLabel' => 'Tambah Kategori Penjualan',
                'refreshLabel' => 'Muat ulang',
                'leftButtons' => [
                    [
                        'id' => 'link-sales-category',
                        'label' => 'Hubungkan kategori penjualan',
                    ],
                ],
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '1',
                'emptyLabel' => 'Tidak ada kategori penjualan yang cocok.',
                'columns' => [
                    [
                        'id' => 'description',
                        'label' => 'Keterangan',
                        'widthClassName' => 'w-[50%]',
                    ],
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'widthClassName' => 'w-[50%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'sales-category-umum',
                        'name' => 'Umum',
                        'description' => '',
                        'tabLabel' => 'Umum',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Kategori Penjualan',
                'saveLabel' => 'Simpan',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama Kategori',
                        'required' => true,
                        'value' => '',
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'description',
                        'type' => 'textarea',
                        'label' => 'Keterangan',
                        'value' => '',
                        'rows' => 3,
                        'containerClassName' => 'max-w-[420px]',
                        'textareaClassName' => 'min-h-[68px]',
                    ],
                ],
            ],
        ];
    }

    private static function priceAdjustmentPage(): array
    {
        return [
            'subtab' => [
                'id' => 'price-adjustment-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
                'priceAdjustment' => [
                    'topActions' => [
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
                ],
                'labels' => [
                    'salesCategory' => 'Kategori Penjualan',
                    'adjustmentType' => 'Tipe Penyesuaian',
                    'effectiveDate' => 'Mulai Berlaku',
                    'documentNumber' => 'Nomor #',
                    'branch' => 'Berlaku di Cabang',
                    'currency' => 'Mata Uang',
                    'notes' => 'Keterangan',
                ],
                'salesCategoryPlaceholder' => 'Cari/Pilih...',
                'adjustmentTypeOptions' => ['Harga'],
                'numberingOptions' => ['Penyesuaian Harga Jual'],
                'branchOptions' => ['[Semua Cabang]'],
                'currencyPlaceholder' => 'Cari/Pilih...',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Barang', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'itemSearchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                'detailModeLabel' => 'Rincian',
                'detailViewLabel' => 'Tampilan rincian',
                'itemLookupLabel' => 'Cari rincian barang',
                'itemSectionTitle' => 'Rincian Barang',
                'itemTable' => [
                    'columns' => [
                        ['id' => 'number', 'label' => 'No.', 'widthClassName' => 'w-[8%]', 'align' => 'center'],
                        ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[34%]'],
                        ['id' => 'code', 'label' => 'Kode Barang', 'widthClassName' => 'w-[20%]'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'newPrice', 'label' => 'Harga Baru', 'widthClassName' => 'w-[22%]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'additionalInfoTitle' => 'Info lainnya',
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'items' => [
                            ['id' => 'save-now', 'label' => 'Simpan'],
                            ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate', 'label' => 'Duplikasi penyesuaian'],
                        ],
                    ],
                ],
                'draft' => [
                    'salesCategory' => [],
                    'adjustmentType' => 'Harga',
                    'effectiveDate' => '28/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Penyesuaian Harga Jual',
                    'branches' => ['[Semua Cabang]'],
                    'currencies' => ['Indonesian Rupiah'],
                    'notes' => '',
                    'itemSearch' => '',
                ],
                'table' => [
                    'createLabel' => 'Tambah Penyesuaian Harga/Diskon',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '0',
                    'emptyLabel' => 'Belum ada data',
                    'filters' => [
                        ['id' => 'date', 'rowKey' => 'dateFilter', 'options' => [['value' => 'all', 'label' => 'Tanggal: Semua']]],
                        ['id' => 'inactive', 'rowKey' => 'inactiveFilter', 'options' => [['value' => 'all', 'label' => 'Non Aktif: Semua']]],
                        ['id' => 'type', 'rowKey' => 'adjustmentTypeFilter', 'options' => [['value' => 'all', 'label' => 'Tipe Penyesuaian: Semua']]],
                        ['id' => 'category', 'rowKey' => 'salesCategoryFilter', 'options' => [['value' => 'all', 'label' => 'Kategori Penjualan: Semua']]],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'effectiveDate', 'label' => 'Mulai Berlaku', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'salesCategory', 'label' => 'Kategori Penjualan', 'widthClassName' => 'w-[16%]'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[35%]'],
                        ['id' => 'adjustmentType', 'label' => 'Tipe Penyesuaian', 'widthClassName' => 'w-[21%]'],
                    ],
                    'rows' => [],
                ],
            ],
        ];
    }

    private static function paymentOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'payment-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'paymentOrder' => [
                'topActions' => [
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
                ],
                'labels' => [
                    'transferDueDate' => 'Tgl Batas Transfer',
                    'paymentMethod' => 'Metode Bayar',
                    'documentNumber' => 'No Bukti #',
                    'notes' => 'Keterangan',
                    'branch' => 'Cabang',
                ],
                'numberingOptions' => ['Perintah Pembayaran'],
                'paymentMethodOptions' => ['Transfer Bank'],
                'branchPlaceholder' => 'Cari/Pilih...',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Faktur', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'invoiceSearchPlaceholder' => 'Cari/Pilih...',
                'takeButtonLabel' => 'Ambil',
                'invoiceSectionTitle' => 'Faktur',
                'additionalInfoTitle' => 'Info lainnya',
                'footerLabel' => 'Faktur Dibayar',
                'dockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'muted', 'icon' => 'save'],
                    ['id' => 'document', 'label' => 'Dokumen', 'tone' => 'secondary', 'icon' => 'document'],
                ],
                'draft' => [
                    'transferDueDate' => '28/04/2026',
                    'paymentMethod' => 'Transfer Bank',
                    'autoNumber' => true,
                    'numberingType' => 'Perintah Pembayaran',
                    'invoiceSearch' => '',
                    'notes' => '',
                    'branches' => ['JAKARTA'],
                    'footerValue' => '0',
                ],
                'invoiceTable' => [
                    'columns' => [
                        ['id' => 'invoiceNumber', 'label' => 'No.Faktur', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'invoiceDate', 'label' => 'Tgl.Faktur', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'invoiceTotal', 'label' => 'Total Faktur', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                        ['id' => 'balance', 'label' => 'Terutang', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                        ['id' => 'paid', 'label' => 'Bayar', 'widthClassName' => 'w-[10%]', 'align' => 'right'],
                        ['id' => 'discount', 'label' => 'Diskon', 'widthClassName' => 'w-[10%]', 'align' => 'right'],
                        ['id' => 'payment', 'label' => 'Pembayaran', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'supplier', 'label' => 'Nama Pemasok', 'widthClassName' => 'w-[20%]'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Perintah Pembayaran',
                    'refreshLabel' => 'Muat ulang',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '0',
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                            ],
                        ],
                        [
                            'id' => 'status',
                            'rowKey' => 'statusFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Status: Semua'],
                            ],
                        ],
                    ],
                    'settingsItems' => [
                        ['id' => 'payment-order-columns', 'label' => 'Atur kolom'],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'notes', 'label' => 'Keterangan'],
                        ['id' => 'bank', 'label' => 'Bank', 'widthClassName' => 'w-[20%]'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[12%]'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    private static function inventoryAdjustmentPage(): array
    {
        return [
            'subtab' => [
                'id' => 'inventory-adjustment-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'inventoryAdjustment' => [
                'topActions' => [
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
                ],
            ],
        ];
    }

    private static function salesCommissionPage(): array
    {
        return [
            'subtab' => [
                'id' => 'sales-commission-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'salesCommission' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'formTabs' => [
                    ['id' => 'commission', 'label' => 'Komisi Penjual'],
                    ['id' => 'others', 'label' => 'Lain-lain'],
                ],
                'labels' => [
                    'period' => 'Komisi Berlaku',
                    'name' => 'Nama perhitungan komisi',
                    'salespeople' => 'Berlaku ke Tenaga Penjual',
                    'order' => 'Diberikan pada penjual urutan (Urutan input penjual di faktur)',
                    'productScope' => 'Komisi berlaku untuk barang',
                    'supplierScope' => 'Dari pemasok utama',
                    'condition' => 'Dengan syarat perhitungan',
                    'reward' => 'Akan mendapat komisi',
                    'notes' => 'Catatan',
                    'inactive' => 'Non Aktif',
                ],
                'periodOptions' => [
                    ['id' => 'forever', 'label' => 'Selamanya'],
                    ['id' => 'period', 'label' => 'Periode Tertentu'],
                ],
                'salespeopleOptions' => [
                    ['id' => 'all', 'label' => 'Semua'],
                    ['id' => 'specific', 'label' => 'Tertentu'],
                ],
                'orderOptions' => [
                    ['id' => 'first', 'label' => 'Pertama'],
                    ['id' => 'second', 'label' => 'Kedua'],
                    ['id' => 'third', 'label' => 'Ketiga'],
                    ['id' => 'fourth', 'label' => 'Keempat'],
                    ['id' => 'fifth', 'label' => 'Kelima'],
                ],
                'productScopeOptions' => ['Semua Barang'],
                'supplierScopeOptions' => ['Semua Pemasok'],
                'conditionOptions' => [
                    'none' => 'Tanpa batasan dan syarat',
                    'salesRange' => 'Nilai Penjualan antara',
                    'quantityRange' => 'Kuantitas penjualan antara',
                    'quantityUnit' => 'Kuantitas terjual per',
                ],
                'conditionUnitLabel' => 'Unit (Berlaku kelipatan)',
                'rewardTypeOptions' => ['Persentase'],
                'rewardMiddleLabel' => '% dari',
                'rewardBaseOptions' => ['Nilai Penjualan'],
                'inactiveLabel' => 'Ya',
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    ['id' => 'delete', 'label' => 'Hapus', 'icon' => 'trash', 'tone' => 'danger'],
                ],
                'draft' => [
                    'periodType' => 'forever',
                    'name' => '',
                    'sellerScope' => 'all',
                    'orderSelections' => ['first'],
                    'productScope' => 'Semua Barang',
                    'supplierScope' => 'Semua Pemasok',
                    'conditionType' => 'none',
                    'salesValueFrom' => '',
                    'salesValueTo' => '',
                    'quantityFrom' => '',
                    'quantityTo' => '',
                    'quantityUnit' => '',
                    'rewardType' => 'Persentase',
                    'rewardValue' => '',
                    'rewardBase' => 'Nilai Penjualan',
                    'notes' => '',
                    'inactive' => false,
                ],
                'table' => [
                    'createLabel' => 'Tambah Komisi Penjual',
                    'refreshLabel' => 'Muat ulang',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '1',
                    'columns' => [
                        ['id' => 'notes', 'label' => 'Catatan', 'widthClassName' => 'w-[42%]'],
                        ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'periodLabel', 'label' => 'Periode Berlaku', 'widthClassName' => 'w-[40%]'],
                    ],
                    'rows' => [
                        [
                            'id' => 'sales-commission-komisi-team',
                            'name' => 'Komisi Team',
                            'periodLabel' => 'Selamanya',
                            'notes' => '',
                            'periodType' => 'forever',
                            'sellerScope' => 'all',
                            'orderSelections' => ['first', 'second', 'third', 'fourth', 'fifth'],
                            'productScope' => 'Semua Barang',
                            'supplierScope' => 'Semua Pemasok',
                            'conditionType' => 'none',
                            'salesValueFrom' => '',
                            'salesValueTo' => '',
                            'quantityFrom' => '',
                            'quantityTo' => '',
                            'quantityUnit' => '',
                            'rewardType' => 'Persentase',
                            'rewardValue' => '7',
                            'rewardBase' => 'Nilai Penjualan',
                            'inactive' => false,
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function salesTargetPage(): array
    {
        return [
            'subtab' => [
                'id' => 'sales-target-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'salesTarget' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'labels' => [
                    'name' => 'Nama Target',
                    'type' => 'Tipe Target',
                    'branch' => 'Penjualan Cabang',
                    'startDate' => 'Dari Tanggal',
                    'endDate' => 'S/d Tanggal',
                    'notes' => 'Catatan',
                    'analyst' => 'Penganalisa',
                ],
                'targetTypeOptions' => ['Per Barang', 'Per Penjual'],
                'branchOptions' => ['[Semua Cabang]', 'Berlaku di Semua Cabang'],
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'additionalInfoTitle' => 'Info lainnya',
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    [
                        'id' => 'detail',
                        'label' => 'Rincian target',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'detail-preview', 'label' => 'Lihat rincian target'],
                        ],
                    ],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    [
                        'id' => 'detail',
                        'label' => 'Rincian target',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'detail-preview', 'label' => 'Lihat rincian target'],
                        ],
                    ],
                    ['id' => 'delete', 'label' => 'Hapus', 'icon' => 'trash', 'tone' => 'danger'],
                ],
                'draft' => [
                    'name' => '',
                    'targetType' => 'Per Barang',
                    'branch' => '[Semua Cabang]',
                    'startDate' => '01/04/2026',
                    'endDate' => '30/04/2026',
                    'notes' => '',
                    'analyst' => '',
                    'detailConfig' => [
                        'title' => 'Rincian Barang',
                        'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                        'columns' => [
                            ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'],
                            ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'],
                            ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                            ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right'],
                        ],
                        'rows' => [],
                        'modal' => null,
                    ],
                ],
                'table' => [
                    'createLabel' => 'Tambah Target Penjualan',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '10',
                    'filters' => [
                        [
                            'id' => 'targetType',
                            'rowKey' => 'targetTypeFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tipe Target: Semua'],
                                ['value' => 'per-item', 'label' => 'Tipe Target: Per Barang'],
                                ['value' => 'per-sales', 'label' => 'Tipe Target: Per Penjual'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'endDate', 'label' => 'S/d Tanggal', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'startDate', 'label' => 'Dari Tanggal', 'widthClassName' => 'w-[12%]'],
                        ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[76%]'],
                    ],
                    'rows' => [
                        [
                            'id' => 'sales-target-october-2016',
                            'name' => 'Target Sales Oktober 16',
                            'startDate' => '01/10/2016',
                            'endDate' => '31/10/2016',
                            'targetType' => 'Per Penjual',
                            'targetTypeFilter' => 'per-sales',
                            'branch' => 'Berlaku di Semua Cabang',
                            'notes' => '',
                            'analyst' => '',
                            'detailConfig' => [
                                'title' => 'Rincian Penjual',
                                'searchPlaceholder' => 'Cari/Pilih...',
                                'columns' => [
                                    ['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'],
                                    ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right'],
                                ],
                                'rows' => [
                                    [
                                        'id' => 'sales-target-october-2016-jhonni',
                                        'salesperson' => 'Jhonni Haris',
                                        'value' => '100,000,000',
                                        'salespersonName' => 'Jhonni Haris',
                                        'targetValue' => '100,000,000,00',
                                    ],
                                    [
                                        'id' => 'sales-target-october-2016-adam',
                                        'salesperson' => 'Adam',
                                        'value' => '200,000,000',
                                        'salespersonName' => 'Adam',
                                        'targetValue' => '200,000,000,00',
                                    ],
                                ],
                                'modal' => [
                                    'title' => 'Rincian Penjual',
                                    'tabLabel' => 'Target Per Penjual',
                                    'deleteLabel' => 'Hapus',
                                    'submitLabel' => 'Lanjut',
                                    'fields' => [
                                        ['id' => 'salespersonName', 'label' => 'Nama Penjual'],
                                        ['id' => 'targetValue', 'label' => 'Nilai', 'type' => 'currency', 'prefix' => 'Rp'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'item-target-october-2016',
                            'name' => 'Target Barang Oktober 2016',
                            'startDate' => '01/10/2016',
                            'endDate' => '31/10/2016',
                            'targetType' => 'Per Barang',
                            'targetTypeFilter' => 'per-item',
                            'branch' => 'Berlaku di Semua Cabang',
                            'detailConfig' => [
                                'title' => 'Rincian Barang',
                                'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...',
                                'columns' => [
                                    ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'],
                                    ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'],
                                    ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                                    ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right'],
                                ],
                                'rows' => [
                                    ['id' => 'item-target-october-2016-1', 'name' => 'Laptop Bisnis', 'code' => 'BRG-001', 'quantity' => '10', 'value' => '150,000,000'],
                                ],
                                'modal' => null,
                            ],
                        ],
                        ['id' => 'sales-target-november-2016', 'name' => 'Target Sales Nov 2016', 'startDate' => '01/11/2016', 'endDate' => '30/11/2016', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'annual-target-2016', 'name' => 'Target Bulanan Tahun 2016', 'startDate' => '01/02/2016', 'endDate' => '31/12/2016', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'annual-target-2017', 'name' => 'Target Bulanan Tahun 2017', 'startDate' => '01/02/2017', 'endDate' => '31/12/2017', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'item-target-november-2016', 'name' => 'Target Barang Nov 16', 'startDate' => '01/11/2016', 'endDate' => '30/11/2016', 'targetType' => 'Per Barang', 'targetTypeFilter' => 'per-item', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Barang', 'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...', 'columns' => [['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'], ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'], ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'sales-target-december-2016', 'name' => 'Target Sales Des 16', 'startDate' => '01/12/2016', 'endDate' => '31/12/2016', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'item-target-december-2016', 'name' => 'Target Barang Des 16', 'startDate' => '01/12/2016', 'endDate' => '31/12/2016', 'targetType' => 'Per Barang', 'targetTypeFilter' => 'per-item', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Barang', 'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...', 'columns' => [['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'], ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'], ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'sales-target-january-2017', 'name' => 'Target Sales Jan 17', 'startDate' => '01/01/2017', 'endDate' => '31/01/2017', 'targetType' => 'Per Penjual', 'targetTypeFilter' => 'per-sales', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Penjual', 'searchPlaceholder' => 'Cari/Pilih...', 'columns' => [['id' => 'salesperson', 'label' => 'Nama Penjual', 'widthClassName' => 'w-[82%]'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[18%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                        ['id' => 'item-target-january-2017', 'name' => 'Target Barang Jan 17', 'startDate' => '01/01/2017', 'endDate' => '31/01/2017', 'targetType' => 'Per Barang', 'targetTypeFilter' => 'per-item', 'branch' => 'Berlaku di Semua Cabang', 'detailConfig' => ['title' => 'Rincian Barang', 'searchPlaceholder' => 'Cari/Pilih Barang & Jasa...', 'columns' => [['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[58%]'], ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[14%]'], ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[12%]', 'align' => 'right'], ['id' => 'value', 'label' => 'Nilai', 'widthClassName' => 'w-[16%]', 'align' => 'right']], 'rows' => [], 'modal' => null]],
                    ],
                ],
            ],
        ];
    }

    private static function salesCheckinPage(): array
    {
        return [
            'table' => [
                'refreshLabel' => 'Muat ulang',
                'settingsLabel' => 'Pengaturan tabel',
                'filterButtonLabel' => 'Filter lanjutan',
                'searchPlaceholder' => 'Cari...',
                'searchWidthClassName' => 'sm:w-[342px]',
                'pageValue' => '6',
                'tableClassName' => 'min-w-[1320px]',
                'searchKeys' => ['dateLabel', 'number', 'customerName', 'salesName', 'transactionName'],
                'filters' => [
                    [
                        'id' => 'date',
                        'rowKey' => 'dateFilter',
                        'options' => [
                            ['value' => 'all', 'label' => 'Tanggal: Semua'],
                            ['value' => '2026-04-28', 'label' => 'Tanggal: 28/04/2026'],
                            ['value' => '2026-04-27', 'label' => 'Tanggal: 27/04/2026'],
                        ],
                    ],
                    [
                        'id' => 'sales',
                        'rowKey' => 'salesFilter',
                        'options' => [
                            ['value' => 'all', 'label' => 'Sales: Semua'],
                            ['value' => 'adam-pratama', 'label' => 'Sales: Adam Pratama'],
                            ['value' => 'jhonni-haris', 'label' => 'Sales: Jhonni Haris'],
                            ['value' => 'nur-aulia', 'label' => 'Sales: Nur Aulia'],
                        ],
                    ],
                ],
                'columns' => [
                    ['id' => 'dateLabel', 'label' => 'Tanggal', 'widthClassName' => 'w-[18%]'],
                    ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[30%]'],
                    ['id' => 'customerName', 'label' => 'Nama Pelanggan (Saat Check In)', 'widthClassName' => 'w-[26%]'],
                    ['id' => 'salesName', 'label' => 'Sales', 'widthClassName' => 'w-[12%]'],
                    ['id' => 'transactionName', 'label' => 'Transaksi', 'widthClassName' => 'w-[14%]'],
                ],
                'rows' => [
                    [
                        'id' => 'sales-checkin-1',
                        'dateLabel' => '28/04/2026 09:10',
                        'number' => 'CI.2026.04.00018',
                        'customerName' => 'PT Sumber Retail Nusantara',
                        'salesName' => 'Adam Pratama',
                        'transactionName' => 'Pesanan Penjualan',
                        'dateFilter' => '2026-04-28',
                        'salesFilter' => 'adam-pratama',
                    ],
                    [
                        'id' => 'sales-checkin-2',
                        'dateLabel' => '28/04/2026 10:24',
                        'number' => 'CI.2026.04.00019',
                        'customerName' => 'CV Mitra Karya Abadi',
                        'salesName' => 'Jhonni Haris',
                        'transactionName' => 'Faktur Penjualan',
                        'dateFilter' => '2026-04-28',
                        'salesFilter' => 'jhonni-haris',
                    ],
                    [
                        'id' => 'sales-checkin-3',
                        'dateLabel' => '28/04/2026 13:42',
                        'number' => 'CI.2026.04.00020',
                        'customerName' => 'Toko Sentosa Elektronik',
                        'salesName' => 'Nur Aulia',
                        'transactionName' => 'Penawaran Penjualan',
                        'dateFilter' => '2026-04-28',
                        'salesFilter' => 'nur-aulia',
                    ],
                    [
                        'id' => 'sales-checkin-4',
                        'dateLabel' => '27/04/2026 16:08',
                        'number' => 'CI.2026.04.00017',
                        'customerName' => 'PT Arta Boga Sejahtera',
                        'salesName' => 'Adam Pratama',
                        'transactionName' => 'Pesanan Penjualan',
                        'dateFilter' => '2026-04-27',
                        'salesFilter' => 'adam-pratama',
                    ],
                    [
                        'id' => 'sales-checkin-5',
                        'dateLabel' => '27/04/2026 11:55',
                        'number' => 'CI.2026.04.00016',
                        'customerName' => 'UD Makmur Jaya',
                        'salesName' => 'Jhonni Haris',
                        'transactionName' => 'Retur Penjualan',
                        'dateFilter' => '2026-04-27',
                        'salesFilter' => 'jhonni-haris',
                    ],
                    [
                        'id' => 'sales-checkin-6',
                        'dateLabel' => '27/04/2026 09:18',
                        'number' => 'CI.2026.04.00015',
                        'customerName' => 'PT Graha Niaga Mandiri',
                        'salesName' => 'Nur Aulia',
                        'transactionName' => 'Penerimaan Penjualan',
                        'dateFilter' => '2026-04-27',
                        'salesFilter' => 'nur-aulia',
                    ],
                ],
                'emptyLabel' => 'Belum ada data',
            ],
        ];
    }

    private static function goodsReceiptPage(): array
    {
        return [
            'subtab' => [
                'id' => 'goods-receipt-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'goodsReceipt' => [
                'topActions' => self::salesTransactionTopActions(),
                'customerPlaceholder' => 'Cari/Pilih Pemasok...',
                'customerSearchLabel' => 'Cari pemasok',
                'labels' => [
                    'customer' => 'Terima dari',
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'No Form #',
                    'paymentTerms' => 'Syarat Pembayaran',
                    'purchaseOrderNumber' => 'No Terima #',
                    'address' => 'Alamat',
                    'branch' => 'Cabang',
                    'notes' => 'Keterangan',
                    'shippingDate' => 'Tgl Kirim',
                    'shippingMethod' => 'Pengiriman',
                    'fob' => 'FOB',
                ],
                'numberingOptions' => ['Penerimaan Barang'],
                'secondaryActionLabel' => 'Faktur',
                'showPaymentTerms' => false,
                'showPurchaseOrderNumber' => false,
                'showTaxInfo' => false,
                'showShippingInfo' => true,
                'showExtraInfo' => false,
                'showFobInShippingInfo' => true,
                'showFooter' => false,
                'headerTextField' => [
                    'label' => 'No Terima #',
                    'valueKey' => 'receiptNumber',
                    'required' => true,
                ],
                'itemModal' => [
                    'enabled' => true,
                ],
                'table' => [
                    'createLabel' => 'Tambah Penerimaan Barang',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'receiptNumber', 'label' => 'No Terima #', 'widthClassName' => 'w-[180px]', 'align' => 'left'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]', 'align' => 'left'],
                        ['id' => 'customer', 'label' => 'Pemasok', 'widthClassName' => 'w-[190px]', 'align' => 'left'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[44%]', 'align' => 'left'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[170px]', 'align' => 'left'],
                    ],
                    'rows' => [
                        ['id' => 'RI.2017.01.00002', 'number' => 'RI.2017.01.00002', 'receiptNumber' => 'SJGP-34217', 'date' => '10/01/2017', 'customer' => 'CV Ganda Putra', 'notes' => '', 'status' => 'Difaktur'],
                        ['id' => 'RI.2017.01.00001', 'number' => 'RI.2017.01.00001', 'receiptNumber' => 'SJAPL-409317', 'date' => '05/01/2017', 'customer' => 'Applus', 'notes' => '', 'status' => 'Difaktur Sebagian'],
                        ['id' => 'RI.2016.10.00004', 'number' => 'RI.2016.10.00004', 'receiptNumber' => 'TMM SJ 852456', 'date' => '20/10/2016', 'customer' => 'Toko Mega Mendung', 'notes' => '', 'status' => 'Difaktur'],
                        ['id' => 'RI.2016.10.00003', 'number' => 'RI.2016.10.00003', 'receiptNumber' => 'TSS RI 7895', 'date' => '11/10/2016', 'customer' => 'Toko Samudra Sparepart', 'notes' => 'stock barang di Toko Samudra Sparepart kosong jadi dikirim hanya sebagian saja.', 'status' => 'Difaktur Sebagian'],
                        ['id' => 'RI.2016.10.00002', 'number' => 'RI.2016.10.00002', 'receiptNumber' => 'SAM 20161007015', 'date' => '07/10/2016', 'customer' => 'SAMSANG', 'notes' => '', 'status' => 'Difaktur'],
                        ['id' => 'RI.2016.10.00001', 'number' => 'RI.2016.10.00001', 'receiptNumber' => 'RI 061016001', 'date' => '06/10/2016', 'customer' => 'PT Selaras Inti', 'notes' => '', 'status' => 'Difaktur'],
                    ],
                    'filters' => [
                        ['id' => 'date', 'rowKey' => 'date', 'options' => [['value' => 'all', 'label' => 'Tanggal: Semua'], ['value' => '10/01/2017', 'label' => 'Tanggal: 10/01/2017']]],
                        ['id' => 'status', 'rowKey' => 'status', 'options' => [['value' => 'all', 'label' => 'Status: Semua'], ['value' => 'Difaktur', 'label' => 'Status: Difaktur'], ['value' => 'Difaktur Sebagian', 'label' => 'Status: Difaktur Sebagian']]],
                        ['id' => 'customer', 'rowKey' => 'customer', 'options' => [['value' => 'all', 'label' => 'Terima dari: Semua'], ['value' => 'CV Ganda Putra', 'label' => 'Terima dari: CV Ganda Putra'], ['value' => 'Applus', 'label' => 'Terima dari: Applus']]],
                    ],
                    'downloadItems' => [],
                    'printItems' => [['id' => 'print-list', 'label' => 'Cetak daftar penerimaan barang']],
                    'settingsItems' => [['id' => 'arrange-columns', 'label' => 'Atur kolom']],
                ],
                'itemTable' => [
                    'columns' => [
                        ['id' => 'spacer', 'label' => '', 'kind' => 'spacer', 'widthClassName' => 'w-[38px]', 'align' => 'center'],
                        ['id' => 'name', 'label' => 'Nama Barang', 'widthClassName' => 'w-[70%]', 'align' => 'left'],
                        ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[130px]', 'align' => 'center'],
                        ['id' => 'quantity', 'label' => 'Kuantitas', 'widthClassName' => 'w-[110px]', 'align' => 'right'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[92px]', 'align' => 'center'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                    'minWidthClassName' => 'min-w-[880px]',
                ],
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Barang', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'draft' => [
                    'customer' => [],
                    'entryDate' => '28/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Penerimaan Barang',
                    'documentNumber' => '',
                    'currency' => '',
                    'receiptNumber' => '',
                    'itemSearch' => '',
                    'items' => [
                        ['id' => 'goods-receipt-draft-item-1', 'name' => 'Adaptor Fast Charging 20W', 'code' => 'AC2001', 'quantity' => '24', 'unit' => 'PCS'],
                        ['id' => 'goods-receipt-draft-item-2', 'name' => 'Type-C Cable Premium', 'code' => 'TC3004', 'quantity' => '16', 'unit' => 'PCS'],
                    ],
                    'itemCountLabel' => '2 Barang (40)',
                    'address' => '',
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'shippingDate' => '28/04/2026',
                    'shippingMethod' => [],
                    'fob' => [],
                    'showSecondaryHeaderAction' => true,
                    'showProcessButton' => false,
                    'processDisabled' => false,
                    'subtotal' => '0',
                    'discountValue' => '0',
                    'discountPrefix' => '',
                    'taxLabel' => '',
                    'taxValue' => '',
                    'total' => '0',
                    'itemModal' => [
                        'title' => 'Rincian Barang',
                        'tabs' => [
                            ['id' => 'details', 'label' => 'Rincian Barang'],
                            ['id' => 'info', 'label' => 'Info lainnya'],
                        ],
                        'values' => [
                            'code' => 'AC2001',
                            'name' => 'Adaptor Fast Charging 20W',
                            'quantity' => '24',
                            'unit' => ['PCS'],
                            'warehouse' => ['GD. JAKARTA'],
                            'department' => [],
                            'notes' => 'Contoh item penerimaan barang.',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'RI.2017.01.00002' => [
                        'customer' => ['[VJKT-0008] CV Ganda Putra'],
                        'entryDate' => '10/01/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Penerimaan Barang',
                        'documentNumber' => 'RI.2017.01.00002',
                        'currency' => 'IDR',
                        'receiptNumber' => 'SJGP-34217',
                        'itemSearch' => '',
                        'items' => [
                            ['id' => 'RI.2017.01.00002-item-1', 'name' => 'Xiaomi Mi4s', 'code' => '1300003', 'quantity' => '154', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-2', 'name' => 'Xiaomi Mi5', 'code' => '1300002', 'quantity' => '165', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-3', 'name' => 'Xiaomi Note Pro', 'code' => '1300005', 'quantity' => '106', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-4', 'name' => 'Xiaomi Redmi 3', 'code' => '1300001', 'quantity' => '108', 'unit' => 'PCS'],
                            ['id' => 'RI.2017.01.00002-item-5', 'name' => 'Xiaomi Redmi Note 3', 'code' => '1300004', 'quantity' => '100', 'unit' => 'PCS'],
                        ],
                        'itemCountLabel' => '5 Barang (633)',
                        'address' => '',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'shippingDate' => '10/01/2017',
                        'shippingMethod' => [],
                        'fob' => [],
                        'showSecondaryHeaderAction' => false,
                        'showProcessButton' => false,
                        'processDisabled' => false,
                        'subtotal' => '0',
                        'discountValue' => '0',
                        'discountPrefix' => '',
                        'taxLabel' => '',
                        'taxValue' => '',
                        'total' => '0',
                        'itemModal' => [
                            'title' => 'Rincian Barang',
                            'tabs' => [
                                ['id' => 'details', 'label' => 'Rincian Barang'],
                                ['id' => 'info', 'label' => 'Info lainnya'],
                            ],
                            'values' => [
                                'code' => '1300003',
                                'name' => 'Xiaomi Mi4s',
                                'quantity' => '154',
                                'unit' => ['PCS'],
                                'warehouse' => ['GD. JAKARTA'],
                                'department' => [],
                                'notes' => 'Batch penerimaan awal dari pemasok utama.',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function itemRequestPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-request-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemRequest' => [
                'topActions' => [
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
                ],
            ],
        ];
    }

    private static function stockTransferPage(): array
    {
        return [
            'subtab' => [
                'id' => 'stock-transfer-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockTransfer' => [
                'topActions' => [
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
                ],
            ],
        ];
    }

    private static function warehouseMasterPage(): array
    {
        return [
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
        ];
    }

    private static function itemsServicesPage(): array
    {
        return [
            'subtab' => [
                'id' => 'items-services-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemsServices' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function itemUnitPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-unit-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemUnit' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
            'table' => [
                'createLabel' => 'Tambah Satuan Barang',
                'refreshLabel' => 'Muat ulang',
                'printLabel' => 'Cetak',
                'searchPlaceholder' => 'Cari...',
                'pageValue' => '5',
                'leftButtons' => [
                    [
                        'id' => 'refresh-link',
                        'label' => 'Sinkronkan satuan barang',
                    ],
                ],
                'columns' => [
                    [
                        'id' => 'spacer',
                        'label' => '',
                        'kind' => 'spacer',
                        'align' => 'left',
                        'widthClassName' => 'w-[34px]',
                        'cellClassName' => 'px-0',
                    ],
                    [
                        'id' => 'name',
                        'label' => 'Nama',
                        'align' => 'center',
                    ],
                ],
                'rows' => [
                    [
                        'id' => 'item-unit-box',
                        'name' => 'Box',
                        'tabLabel' => 'Box',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-dus',
                        'name' => 'Dus',
                        'tabLabel' => 'Dus',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-lusin',
                        'name' => 'Lusin',
                        'tabLabel' => 'Lusin',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-pcs',
                        'name' => 'PCS',
                        'tabLabel' => 'PCS',
                        'taxCode' => '',
                    ],
                    [
                        'id' => 'item-unit-unit',
                        'name' => 'Unit',
                        'tabLabel' => 'Unit',
                        'taxCode' => '',
                    ],
                ],
            ],
            'form' => [
                'sectionLabel' => 'Satuan Barang',
                'saveLabel' => 'Simpan',
                'deleteLabel' => 'Hapus',
                'saveToneCreate' => 'muted',
                'saveToneDetail' => 'muted',
                'fields' => [
                    [
                        'id' => 'name',
                        'label' => 'Nama',
                        'required' => true,
                        'value' => '',
                        'clearable' => true,
                        'containerClassName' => 'max-w-[420px]',
                    ],
                    [
                        'id' => 'tax-heading',
                        'type' => 'heading',
                        'label' => 'Pajak',
                    ],
                    [
                        'id' => 'taxCode',
                        'type' => 'lookup',
                        'label' => 'Ref Kode Pajak',
                        'info' => true,
                        'value' => '',
                        'placeholder' => 'Cari/Pilih...',
                        'containerClassName' => 'max-w-[420px]',
                    ],
                ],
            ],
        ];
    }

    private static function itemCategoryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemCategory' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'tabs' => [
                    ['id' => 'item-category-general', 'label' => 'Kategori Barang'],
                    ['id' => 'item-category-accounts', 'label' => 'Akun'],
                ],
                'labels' => [
                    'name' => 'Nama',
                    'isDefault' => 'Kategori Default',
                    'isSubCategory' => 'Sub Kategori',
                    'yes' => 'Ya',
                ],
                'accountIntro' => 'Tentukan default akun perkiraan yang akan digunakan pada barang & jasa kategori ini',
                'accountPlaceholder' => 'Cari/Pilih...',
                'accountNote' => 'Akun-akun yang dapat dipilih sesuai dengan akun-akun yang dimasukkan pada formulir Preferensi bagian akun default barang',
                'accountFields' => [
                    ['id' => 'inventoryAccount', 'label' => 'Persediaan'],
                    ['id' => 'expenseAccount', 'label' => 'Beban'],
                    ['id' => 'salesAccount', 'label' => 'Penjualan'],
                    ['id' => 'salesReturnAccount', 'label' => 'Retur Penjualan'],
                    ['id' => 'salesDiscountAccount', 'label' => 'Diskon Penjualan'],
                    ['id' => 'goodsInTransitAccount', 'label' => 'Barang Terkirim'],
                    ['id' => 'costOfGoodsSoldAccount', 'label' => 'Beban Pokok Penjualan'],
                    ['id' => 'purchaseReturnAccount', 'label' => 'Retur Pembelian'],
                    ['id' => 'unbilledPurchaseAccount', 'label' => 'Pembelian Belum Tertagih'],
                ],
                'createDefaults' => [
                    'name' => '',
                    'isDefault' => false,
                    'isSubCategory' => false,
                    'accounts' => [],
                ],
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'muted', 'icon' => 'save'],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'tone' => 'muted', 'icon' => 'save'],
                    ['id' => 'delete', 'label' => 'Hapus', 'tone' => 'danger', 'icon' => 'trash'],
                ],
                'table' => [
                    'createLabel' => 'Tambah Kategori Barang',
                    'refreshLabel' => 'Muat ulang',
                    'downloadLabel' => 'Unduh daftar kategori barang',
                    'shareLabel' => 'Opsi tautan kategori barang',
                    'printLabel' => 'Cetak daftar kategori barang',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '5',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'shareItems' => [
                        ['id' => 'open-report', 'label' => 'Buka laporan kategori barang'],
                        ['id' => 'copy-link', 'label' => 'Salin tautan tampilan'],
                    ],
                    'columns' => [
                        [
                            'id' => 'spacer',
                            'label' => '',
                            'kind' => 'spacer',
                            'align' => 'center',
                            'widthClassName' => 'w-[34px]',
                            'cellClassName' => 'px-0',
                        ],
                        [
                            'id' => 'name',
                            'label' => 'Nama',
                            'align' => 'center',
                            'widthClassName' => 'w-[82%]',
                        ],
                        [
                            'id' => 'defaultLabel',
                            'label' => 'Kategori Default',
                            'align' => 'center',
                            'widthClassName' => 'w-[18%]',
                        ],
                    ],
                    'rows' => [
                        [
                            'id' => 'item-category-accessories',
                            'name' => 'Accessories',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Accessories',
                        ],
                        [
                            'id' => 'item-category-handphone',
                            'name' => 'Handphone',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Handphone',
                        ],
                        [
                            'id' => 'item-category-jasa',
                            'name' => 'Jasa',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Jasa',
                        ],
                        [
                            'id' => 'item-category-sparepart',
                            'name' => 'Sparepart',
                            'defaultLabel' => 'Tidak',
                            'isDefault' => false,
                            'isSubCategory' => false,
                            'tabLabel' => 'Sparepart',
                        ],
                        [
                            'id' => 'item-category-umum',
                            'name' => 'Umum',
                            'defaultLabel' => 'Ya',
                            'isDefault' => true,
                            'isSubCategory' => false,
                            'tabLabel' => 'Umum',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'item-category-accessories' => [
                        'name' => 'Accessories',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-03] Persediaan Assesoris Handphone',
                            'expenseAccount' => '[611.001-01] Beban Gaji Penjualan',
                            'salesAccount' => '[411.000-03] Penjualan Assesoris Handphone',
                            'salesReturnAccount' => '[431.000-03] Retur Penjualan Assesoris Handphone',
                            'salesDiscountAccount' => '[421.000-03] Potongan Penjualan Assesoris Handphone',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-03] Beban Pokok Penjualan Assesoris Handphone',
                            'purchaseReturnAccount' => '[115.000-03] Persediaan Assesoris Handphone',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-handphone' => [
                        'name' => 'Handphone',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-01] Persediaan Handphone',
                            'expenseAccount' => '[611.001-04] Beban Angkut Pembelian',
                            'salesAccount' => '[411.000-01] Penjualan Handphone',
                            'salesReturnAccount' => '[431.000-01] Retur Penjualan Handphone',
                            'salesDiscountAccount' => '[421.000-01] Potongan Penjualan Handphone',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-01] Beban Pokok Penjualan Handphone',
                            'purchaseReturnAccount' => '[115.000-01] Persediaan Handphone',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-jasa' => [
                        'name' => 'Jasa',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '',
                            'expenseAccount' => '[611.001-02] Beban Operasional Jasa',
                            'salesAccount' => '[411.000-05] Penjualan Jasa',
                            'salesReturnAccount' => '[431.000-05] Retur Penjualan Jasa',
                            'salesDiscountAccount' => '[421.000-05] Potongan Penjualan Jasa',
                            'goodsInTransitAccount' => '',
                            'costOfGoodsSoldAccount' => '[511.000-05] Beban Pokok Penjualan Jasa',
                            'purchaseReturnAccount' => '',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-sparepart' => [
                        'name' => 'Sparepart',
                        'isDefault' => false,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-04] Persediaan Sparepart',
                            'expenseAccount' => '[611.001-03] Beban Sparepart',
                            'salesAccount' => '[411.000-04] Penjualan Sparepart',
                            'salesReturnAccount' => '[431.000-04] Retur Penjualan Sparepart',
                            'salesDiscountAccount' => '[421.000-04] Potongan Penjualan Sparepart',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-04] Beban Pokok Penjualan Sparepart',
                            'purchaseReturnAccount' => '[115.000-04] Persediaan Sparepart',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                    'item-category-umum' => [
                        'name' => 'Umum',
                        'isDefault' => true,
                        'isSubCategory' => false,
                        'accounts' => [
                            'inventoryAccount' => '[115.000-10] Persediaan Umum',
                            'expenseAccount' => '[611.001-10] Beban Umum',
                            'salesAccount' => '[411.000-10] Penjualan Umum',
                            'salesReturnAccount' => '[431.000-10] Retur Penjualan Umum',
                            'salesDiscountAccount' => '[421.000-10] Potongan Penjualan Umum',
                            'goodsInTransitAccount' => '[115.000-99] Barang Terkirim',
                            'costOfGoodsSoldAccount' => '[511.000-10] Beban Pokok Penjualan Umum',
                            'purchaseReturnAccount' => '[115.000-10] Persediaan Umum',
                            'unbilledPurchaseAccount' => '[213.000-99] Penerimaan Belum Tertagih',
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function itemLocationPage(): array
    {
        return [
            'subtab' => [
                'id' => 'item-location-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'itemLocation' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'controls' => [
                    [
                        'id' => 'itemType',
                        'type' => 'select',
                        'value' => 'goods',
                        'options' => [
                            ['value' => 'goods', 'label' => 'Barang'],
                        ],
                        'className' => 'w-[220px]',
                    ],
                    [
                        'id' => 'itemSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Barang',
                        'className' => 'w-full sm:w-[470px]',
                    ],
                    [
                        'id' => 'asOfDate',
                        'type' => 'date',
                        'value' => '28/04/2026',
                        'className' => 'w-[260px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'link',
                        'label' => 'Muat ulang barang per gudang',
                    ],
                    [
                        'id' => 'share',
                        'type' => 'icon-button',
                        'icon' => 'external-link',
                        'label' => 'Bagikan barang per gudang',
                    ],
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1180px]',
                    'columns' => [
                        ['id' => 'warehouse', 'label' => 'Gudang', 'widthClassName' => 'w-[300px]', 'align' => 'center'],
                        ['id' => 'multiUnitQuantity', 'label' => 'Kuantitas Multi Satuan', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'saleableStock', 'label' => 'Stok dapat dijual', 'widthClassName' => 'w-[200px]', 'align' => 'center'],
                        ['id' => 'address', 'label' => 'Alamat', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    private static function minimumStockPage(): array
    {
        return [
            'minimumStock' => [
                'controls' => [
                    [
                        'id' => 'supplierSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Pemasok...',
                        'className' => 'w-full sm:w-[420px]',
                    ],
                    [
                        'id' => 'warehouseSearch',
                        'type' => 'lookup',
                        'value' => '',
                        'placeholder' => 'Cari/Pilih Gudang...',
                        'className' => 'w-full sm:w-[420px]',
                    ],
                    [
                        'id' => 'refresh',
                        'type' => 'icon-button',
                        'icon' => 'link',
                        'label' => 'Muat ulang barang stok minimum',
                    ],
                    [
                        'id' => 'order',
                        'type' => 'button',
                        'label' => 'Pesan',
                    ],
                    [
                        'id' => 'request',
                        'type' => 'button',
                        'label' => 'Minta',
                    ],
                ],
                'search' => [
                    'placeholder' => 'Cari Nama/Kode Barang...',
                    'className' => 'w-full lg:w-[520px]',
                ],
                'table' => [
                    'tableClassName' => 'min-w-[1800px]',
                    'searchKeys' => ['supplier', 'itemName', 'itemCode'],
                    'columns' => [
                        ['id' => 'selected', 'label' => '', 'kind' => 'checkbox', 'widthClassName' => 'w-[52px]', 'align' => 'center'],
                        ['id' => 'supplier', 'label' => 'Pemasok', 'widthClassName' => 'w-[340px]', 'align' => 'center'],
                        ['id' => 'itemName', 'label' => 'Nama Barang', 'widthClassName' => 'w-[320px]', 'align' => 'center'],
                        ['id' => 'itemCode', 'label' => 'Kode Barang', 'widthClassName' => 'w-[220px]', 'align' => 'center'],
                        ['id' => 'unit', 'label' => 'Satuan', 'widthClassName' => 'w-[170px]', 'align' => 'center'],
                        ['id' => 'availableStock', 'label' => 'Stok tersedia', 'widthClassName' => 'w-[190px]', 'align' => 'center'],
                        ['id' => 'ordered', 'label' => 'Dipesan', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'requested', 'label' => 'Diminta', 'widthClassName' => 'w-[160px]', 'align' => 'center'],
                        ['id' => 'minimumLimit', 'label' => 'Batas Minimum Stok', 'widthClassName' => 'w-[250px]', 'align' => 'center'],
                    ],
                    'rows' => [],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    private static function purchaseOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'purchase-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'purchaseOrder' => [
                'topActions' => self::salesTransactionTopActions(),
                'customerPlaceholder' => 'Cari/Pilih Pemasok...',
                'customerSearchLabel' => 'Cari pemasok',
                'labels' => [
                    'customer' => 'Pemasok',
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'Nomor #',
                    'paymentTerms' => 'Syarat Pembayaran',
                    'purchaseOrderNumber' => 'No. PO',
                    'address' => 'Alamat Kirim',
                    'branch' => 'Cabang',
                    'notes' => 'Keterangan',
                    'tax' => 'Pajak',
                    'shippingDate' => 'Tgl Pengiriman',
                    'shippingMethod' => 'Pengiriman',
                    'fob' => 'FOB',
                    'exchangeRate' => 'Kurs',
                ],
                'numberingOptions' => ['Pesanan Pembelian'],
                'showAddressPinButton' => true,
                'showPurchaseOrderNumber' => false,
                'itemModal' => [
                    'enabled' => true,
                ],
                'table' => [
                    'createLabel' => 'Tambah Pesanan Pembelian',
                    'refreshLabel' => 'Muat ulang',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '11',
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]', 'align' => 'left'],
                        ['id' => 'customerShort', 'label' => 'Pemasok', 'widthClassName' => 'w-[200px]', 'align' => 'left'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[48%]', 'align' => 'left'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[170px]', 'align' => 'left'],
                        ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => 'PO.2017.01.00002', 'number' => 'PO.2017.01.00002', 'date' => '12/01/2017', 'customer' => 'Applus', 'customerShort' => 'Applus', 'notes' => '', 'status' => 'Terproses', 'total' => '214,569', 'printedStatus' => 'all'],
                        ['id' => 'PO.2017.01.00003', 'number' => 'PO.2017.01.00003', 'date' => '08/01/2017', 'customer' => 'CV Ganda Putra', 'customerShort' => 'CV Ganda Putra', 'notes' => '', 'status' => 'Terproses', 'total' => '2,259,860,000', 'printedStatus' => 'all'],
                        ['id' => 'PO.2017.01.00001', 'number' => 'PO.2017.01.00001', 'date' => '01/01/2017', 'customer' => 'Applus', 'customerShort' => 'Applus', 'notes' => '', 'status' => 'Terproses', 'total' => '177,632', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.11.00001', 'number' => 'PO.2016.11.00001', 'date' => '15/11/2016', 'customer' => 'Toko Mega Mendung', 'customerShort' => 'Toko Mega Mendung', 'notes' => '', 'status' => 'Terproses', 'total' => '4,165,417,500', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00007', 'number' => 'PO.2016.10.00007', 'date' => '19/10/2016', 'customer' => 'Applus', 'customerShort' => 'Applus', 'notes' => '', 'status' => 'Terproses', 'total' => '19,452,500', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00006', 'number' => 'PO.2016.10.00006', 'date' => '17/10/2016', 'customer' => 'Toko Mega Mendung', 'customerShort' => 'Toko Mega Mendung', 'notes' => '', 'status' => 'Terproses', 'total' => '8,360,000', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00005', 'number' => 'PO.2016.10.00005', 'date' => '12/10/2016', 'customer' => 'Toko Berkat Cell', 'customerShort' => 'Toko Berkat Cell', 'notes' => '', 'status' => 'Menunggu diproses', 'total' => '2,612,500', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00004', 'number' => 'PO.2016.10.00004', 'date' => '11/10/2016', 'customer' => 'Toko Samudra Sparepart', 'customerShort' => 'Toko Samudra Sparepart', 'notes' => 'Karena ada permintaan perbaikan HP untuk speaker dan permintaan penjualan dimohon segera di proses.', 'status' => 'Sebagian diproses', 'total' => '16,720,000', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00003', 'number' => 'PO.2016.10.00003', 'date' => '10/10/2016', 'customer' => 'Beautiful Cellular', 'customerShort' => 'Beautiful Cellular', 'notes' => '', 'status' => 'Ditutup', 'total' => '3,814,250', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00002', 'number' => 'PO.2016.10.00002', 'date' => '05/10/2016', 'customer' => 'SAMSANG', 'customerShort' => 'SAMSANG', 'notes' => '', 'status' => 'Terproses', 'total' => '3,548', 'printedStatus' => 'all'],
                        ['id' => 'PO.2016.10.00001', 'number' => 'PO.2016.10.00001', 'date' => '04/10/2016', 'customer' => 'PT Selaras Inti', 'customerShort' => 'PT Selaras Inti', 'notes' => 'Dibutuhkan segera karena banyak pesanan untuk Item yang Di PO kan', 'status' => 'Terproses', 'total' => '55,123,750', 'printedStatus' => 'all'],
                    ],
                    'filters' => [
                        ['id' => 'date', 'rowKey' => 'date', 'options' => [['value' => 'all', 'label' => 'Tanggal: Semua'], ['value' => '12/01/2017', 'label' => 'Tanggal: 12/01/2017']]],
                        ['id' => 'customer', 'rowKey' => 'customer', 'options' => [['value' => 'all', 'label' => 'Pemasok: Semua'], ['value' => 'Applus', 'label' => 'Pemasok: Applus'], ['value' => 'Toko Mega Mendung', 'label' => 'Pemasok: Toko Mega Mendung']]],
                        ['id' => 'status', 'rowKey' => 'status', 'options' => [['value' => 'all', 'label' => 'Status: Semua'], ['value' => 'Terproses', 'label' => 'Status: Terproses'], ['value' => 'Menunggu diproses', 'label' => 'Status: Menunggu diproses'], ['value' => 'Sebagian diproses', 'label' => 'Status: Sebagian diproses'], ['value' => 'Ditutup', 'label' => 'Status: Ditutup']]],
                    ],
                    'downloadItems' => [['id' => 'download-excel', 'label' => 'Unduh Excel']],
                    'printItems' => [['id' => 'print-list', 'label' => 'Cetak daftar pesanan pembelian']],
                    'settingsItems' => [['id' => 'arrange-columns', 'label' => 'Atur kolom']],
                ],
                'costTable' => [
                    'columns' => [
                        ['id' => 'spacer', 'label' => '', 'kind' => 'spacer', 'widthClassName' => 'w-[38px]', 'align' => 'center'],
                        ['id' => 'name', 'label' => 'Nama Biaya', 'widthClassName' => 'w-[58%]', 'align' => 'left'],
                        ['id' => 'code', 'label' => 'Kode #', 'widthClassName' => 'w-[120px]', 'align' => 'center'],
                        ['id' => 'amount', 'label' => 'Jumlah', 'widthClassName' => 'w-[120px]', 'align' => 'right'],
                        ['id' => 'notes', 'label' => 'Keterangan', 'widthClassName' => 'w-[22%]', 'align' => 'left'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'draft' => [
                    'customer' => [],
                    'entryDate' => '28/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Pesanan Pembelian',
                    'documentNumber' => '',
                    'currency' => '',
                    'exchangeRate' => '',
                    'exchangeRateLabel' => '',
                    'exchangeRatePrefix' => 'Rp',
                    'itemSearch' => '',
                    'items' => [
                        ['id' => 'purchase-order-draft-item-1', 'name' => 'Adaptor Fast Charging 20W', 'code' => 'AC2001', 'quantity' => '50', 'unit' => 'PCS', 'price' => '65,000', 'discount' => '0', 'total' => '3,250,000'],
                    ],
                    'itemCountLabel' => '1 Barang (50)',
                    'paymentTerms' => [],
                    'purchaseOrderNumber' => '',
                    'address' => '',
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'taxEnabled' => false,
                    'taxIncluded' => false,
                    'shippingDate' => '28/04/2026',
                    'shippingMethod' => [],
                    'fob' => [],
                    'costSearch' => '',
                    'additionalCosts' => [
                        ['id' => 'purchase-order-draft-cost-1', 'name' => 'Biaya Pengiriman', 'code' => 'ONGKIR', 'amount' => '150,000', 'notes' => 'Estimasi pengiriman awal'],
                    ],
                    'summary' => [
                        ['Total', 'Rp 3,400,000'],
                        ['Status', 'Menunggu diproses'],
                        ['Dicetak/email', 'Belum cetak/email'],
                    ],
                    'processedBy' => null,
                    'approvalStamp' => '',
                    'processStamp' => '',
                    'showProcessButton' => false,
                    'processDisabled' => false,
                    'subtotal' => 'Rp 3,250,000',
                    'discountValue' => '0',
                    'discountPrefix' => 'Rp',
                    'taxLabel' => '',
                    'taxValue' => '',
                    'total' => 'Rp 3,400,000',
                    'itemModal' => [
                        'title' => 'Rincian Barang',
                        'tabs' => [
                            ['id' => 'details', 'label' => 'Rincian Barang'],
                            ['id' => 'info', 'label' => 'Info lainnya'],
                        ],
                        'values' => [
                            'code' => 'AC2001',
                            'name' => 'Adaptor Fast Charging 20W',
                            'quantity' => '50',
                            'unit' => ['PCS'],
                            'price' => '65,000',
                            'discountPercent' => '',
                            'discountValue' => '0',
                            'total' => 'Rp 3,250,000',
                            'taxChecked' => false,
                            'taxLabel' => 'PPN 10 %',
                            'warehouse' => ['GD. JAKARTA'],
                            'salesPerson' => [],
                            'department' => [],
                            'notes' => 'Pembelian untuk stok cabang utama.',
                        ],
                    ],
                ],
                'detailRecords' => [
                    'PO.2017.01.00002' => [
                        'customer' => ['[VJKT-0002] Applus'],
                        'entryDate' => '12/01/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Pesanan Pembelian',
                        'documentNumber' => 'PO.2017.01.00002',
                        'currency' => 'USD',
                        'exchangeRate' => '12,560',
                        'exchangeRateLabel' => '1 USD=XXX IDR',
                        'exchangeRatePrefix' => 'Rp',
                        'itemSearch' => '',
                        'items' => [
                            ['id' => 'PO.2017.01.00002-item-1', 'name' => 'Iphone 6 S Plus 32 GB', 'code' => '6316001', 'quantity' => '243', 'unit' => 'PCS', 'price' => '883', 'discount' => '0', 'total' => '214,569'],
                        ],
                        'itemCountLabel' => '1 Barang (243)',
                        'paymentTerms' => ['Net 30 Hari'],
                        'purchaseOrderNumber' => '',
                        'address' => '',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'taxEnabled' => false,
                        'taxIncluded' => false,
                        'shippingDate' => '12/01/2017',
                        'shippingMethod' => ['Ekspedisi Internal'],
                        'fob' => ['Gudang Supplier'],
                        'costSearch' => '',
                        'additionalCosts' => [
                            ['id' => 'PO.2017.01.00002-cost-1', 'name' => 'Biaya Asuransi', 'code' => 'ASR-01', 'amount' => '850', 'notes' => 'Proteksi pengiriman impor'],
                        ],
                        'summary' => [
                            ['Total', '$ 214,569'],
                            ['Status', 'Terproses'],
                            ['Dicetak/email', 'Belum cetak/email'],
                        ],
                        'processedBy' => [
                            ['number' => 'PB.2017.01.00004', 'date' => '15/01/2017'],
                        ],
                        'approvalStamp' => '',
                        'processStamp' => 'TERPROSES',
                        'showProcessButton' => true,
                        'processDisabled' => true,
                        'subtotal' => '$ 214,569',
                        'discountValue' => '0',
                        'discountPrefix' => '$',
                        'taxLabel' => '',
                        'taxValue' => '',
                        'total' => '$ 214,569',
                        'itemModal' => [
                            'title' => 'Rincian Barang',
                            'tabs' => [
                                ['id' => 'details', 'label' => 'Rincian Barang'],
                                ['id' => 'info', 'label' => 'Info lainnya'],
                            ],
                            'values' => [
                                'code' => '6316001',
                                'name' => 'Iphone 6 S Plus 32 GB',
                                'quantity' => '243',
                                'unit' => ['PCS'],
                                'price' => '883',
                                'discountPercent' => '',
                                'discountValue' => '0',
                                'total' => '$ 214,569',
                                'taxChecked' => false,
                                'taxLabel' => 'PPN 10 %',
                                'warehouse' => ['GD. IMPORT'],
                                'salesPerson' => [],
                                'department' => [],
                                'notes' => 'Pembelian impor untuk restock awal tahun.',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function buildSalesTransactionPage(string $subtabId, string $configKey): array
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

    private static function salesTransactionTopActions(): array
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

    private static function budgetMonitorPage(): array
    {
        return [
            'budgetMonitor' => [
                'typeOptions' => ['Umum', 'Departemen'],
                'monthOptions' => ['Januari', 'Februari', 'Maret', 'April'],
                'yearOptions' => ['2026', '2025', '2024'],
                'defaults' => [
                    'type' => 'Umum',
                    'month' => 'Januari',
                    'year' => '2026',
                ],
                'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'syncLabel' => 'Muat ulang monitor anggaran',
                'table' => [
                    'emptyLabel' => 'Belum ada data',
                    'columns' => [
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'accountCode', 'label' => 'Kode#', 'widthClassName' => 'w-[13%]'],
                        ['id' => 'budget', 'label' => 'Anggaran', 'widthClassName' => 'w-[13%]', 'align' => 'right'],
                        ['id' => 'usedBudget', 'label' => 'Penggunaan Anggaran', 'widthClassName' => 'w-[13%]', 'align' => 'right'],
                        ['id' => 'remainingBudget', 'label' => 'Sisa Anggaran', 'align' => 'right'],
                    ],
                ],
            ],
        ];
    }

    private static function cashPaymentPage(): array
    {
        return [
            'subtab' => [
                'id' => 'cash-payment-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'cashPayment' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'cashBank' => 'Kas/Bank',
                    'documentNumber' => 'No Bukti #',
                    'entryDate' => 'Tanggal',
                    'checkNumber' => 'No Cek #',
                    'recipient' => 'Penerima',
                    'voided' => 'V O I D',
                    'branch' => 'Cabang',
                    'notes' => 'Catatan',
                    'reconcileStatus' => 'Terekonsiliasi',
                    'printStatus' => 'Dicetak/email',
                    'kapKjs' => 'No KAP - No KJS',
                    'ntpn' => 'NTPN',
                ],
                'cashBankPlaceholder' => 'Cari/Pilih...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'numberingOptions' => [
                    'Bank BCA IDR Jakarta (069-773-3993)',
                    'Bank Mandiri IDR Surabaya',
                    'Kas Besar Kantor Jakarta',
                ],
                'takeButtonLabel' => 'Ambil',
                'lineSearchPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'lineSectionTitle' => 'Rincian Pembayaran',
                'infoTitle' => 'Info lainnya',
                'additionalInfoTitle' => 'Info Tambahan',
                'totalCardLabel' => 'Nilai',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Pembayaran', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'items' => [
                            ['id' => 'save-now', 'label' => 'Simpan'],
                            ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                        ],
                    ],
                    [
                        'id' => 'document',
                        'label' => 'Form lain',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'open-document', 'label' => 'Buka dokumen terkait'],
                            ['id' => 'preview-document', 'label' => 'Preview dokumen'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                            ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate-transaction', 'label' => 'Duplikasi transaksi'],
                            ['id' => 'mark-review', 'label' => 'Tandai untuk review'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'draft' => [
                    'bankAccounts' => [],
                    'entryDate' => '25/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Bank BCA IDR Jakarta (069-773-3993)',
                    'documentNumber' => '',
                    'checkNumber' => '',
                    'recipient' => '',
                    'voided' => false,
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'lineItems' => [],
                    'totalValue' => '0',
                    'saveTone' => 'primary',
                    'kapNumber' => '',
                    'kjsNumber' => '',
                    'ntpn' => '',
                    'reconcileStatus' => '',
                    'printStatus' => '',
                ],
                'lineTable' => [
                    'columns' => [
                        ['id' => 'spacer', 'label' => '', 'kind' => 'spacer', 'widthClassName' => 'w-[40px]', 'align' => 'center'],
                        ['id' => 'accountCode', 'label' => 'Akun', 'widthClassName' => 'w-[130px]', 'align' => 'left'],
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'align' => 'left'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Pembayaran',
                    'refreshLabel' => 'Sinkron pembayaran',
                    'downloadLabel' => 'Unduh data pembayaran',
                    'printLabel' => 'Cetak pembayaran',
                    'settingsLabel' => 'Pengaturan tabel pembayaran',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '32',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'settingsItems' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-payment', 'label' => 'Ekspor pembayaran'],
                    ],
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2017', 'label' => 'Tanggal: 2017'],
                                ['value' => '2016', 'label' => 'Tanggal: 2016'],
                            ],
                        ],
                        [
                            'id' => 'bank',
                            'rowKey' => 'bankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Kas/Bank: Semua'],
                                ['value' => 'cash-jkt', 'label' => 'Kas/Bank: Kas Jakarta'],
                                ['value' => 'cash-sby', 'label' => 'Kas/Bank: Kas Surabaya'],
                                ['value' => 'bank-bca', 'label' => 'Kas/Bank: Bank BCA'],
                                ['value' => 'bank-mandiri', 'label' => 'Kas/Bank: Bank Mandiri'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[210px]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                        ['id' => 'cashBank', 'label' => 'Kas/Bank', 'widthClassName' => 'w-[200px]'],
                        ['id' => 'checkNumber', 'label' => 'No Cek #', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'description', 'label' => 'Keterangan'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[160px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => '111.201-02.2017.02.00001', 'number' => '111.201-02.2017.02.00001', 'date' => '10/02/2017', 'cashBank' => 'Kas Besar Kantor Surab...', 'cashBankFull' => 'Kas Besar Kantor Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran Hutang Pajak PPh Ps 21', 'amount' => '1,447,298', 'dateFilter' => '2017', 'bankFilter' => 'cash-sby', 'branch' => 'SURABAYA', 'accountCode' => '215.000-02', 'accountName' => 'Hutang Pajak PPh Ps 21', 'voided' => true, 'reconcileStatus' => 'Belum', 'printStatus' => 'Belum cetak/email'],
                        ['id' => '111.101-02.2017.02.00002', 'number' => '111.101-02.2017.02.00002', 'date' => '10/02/2017', 'cashBank' => 'Kas Besar Kantor Jakarta', 'cashBankFull' => 'Kas Besar Kantor Jakarta', 'checkNumber' => '', 'description' => 'Pembayaran atas hutang Pajak PPh Ps 21', 'amount' => '1,897,540', 'dateFilter' => '2017', 'bankFilter' => 'cash-jkt', 'branch' => 'JAKARTA'],
                        ['id' => '111.202-04.2017.01.00008', 'number' => '111.202-04.2017.01.00008', 'date' => '26/01/2017', 'cashBank' => 'Bank Mandiri IDR Surab...', 'cashBankFull' => 'Bank Mandiri IDR Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran Beban Gaji', 'amount' => '35,059,002', 'dateFilter' => '2017', 'bankFilter' => 'bank-mandiri', 'branch' => 'SURABAYA'],
                        ['id' => '111.102-01.2017.01.00009', 'number' => '111.102-01.2017.01.00009', 'date' => '26/01/2017', 'cashBank' => 'Bank BCA IDR Jakarta (0...', 'cashBankFull' => 'Bank BCA IDR Jakarta (069-773-3993)', 'checkNumber' => '', 'description' => 'Pembayaran Gaji Bulan', 'amount' => '49,136,660', 'dateFilter' => '2017', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.202-04.2017.01.00007', 'number' => '111.202-04.2017.01.00007', 'date' => '11/01/2017', 'cashBank' => 'Bank Mandiri IDR Surab...', 'cashBankFull' => 'Bank Mandiri IDR Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran beban Iklan dan Komisi Penjualan', 'amount' => '117,814,000', 'dateFilter' => '2017', 'bankFilter' => 'bank-mandiri', 'branch' => 'SURABAYA'],
                        ['id' => '111.202-04.2017.01.00006', 'number' => '111.202-04.2017.01.00006', 'date' => '11/01/2017', 'cashBank' => 'Bank Mandiri IDR Surab...', 'cashBankFull' => 'Bank Mandiri IDR Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran BPJS Ketenaga Kerjaan dan Kesehatan - Surabaya', 'amount' => '3,706,824', 'dateFilter' => '2017', 'bankFilter' => 'bank-mandiri', 'branch' => 'SURABAYA'],
                        ['id' => '111.102-04.2017.01.00005', 'number' => '111.102-04.2017.01.00005', 'date' => '10/01/2017', 'cashBank' => 'Bank Mandiri IDR Jakart...', 'cashBankFull' => 'Bank Mandiri IDR Jakarta', 'checkNumber' => '', 'description' => 'Pembayaran BPJS Ketenaga Kerjaan dan Kesehatan - Jakarta', 'amount' => '4,984,096', 'dateFilter' => '2017', 'bankFilter' => 'bank-mandiri', 'branch' => 'JAKARTA'],
                        ['id' => '111.202-01.2016.12.00007', 'number' => '111.202-01.2016.12.00007', 'date' => '26/12/2016', 'cashBank' => 'Bank BCA IDR Surabaya...', 'cashBankFull' => 'Bank BCA IDR Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran Gaji - Surabaya', 'amount' => '36,506,300', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'SURABAYA'],
                        ['id' => '111.102-01.2016.12.00006', 'number' => '111.102-01.2016.12.00006', 'date' => '26/12/2016', 'cashBank' => 'Bank BCA IDR Jakarta (0...', 'cashBankFull' => 'Bank BCA IDR Jakarta (069-773-3993)', 'checkNumber' => '', 'description' => 'Pembayaran Gaji - Jakarta', 'amount' => '51,034,200', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.101-01.2016.12.00005', 'number' => '111.101-01.2016.12.00005', 'date' => '21/12/2016', 'cashBank' => 'Kas Kecil Kantor Jakarta', 'cashBankFull' => 'Kas Kecil Kantor Jakarta', 'checkNumber' => '', 'description' => 'Pembayaran Sumbangan', 'amount' => '20,000,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-jkt', 'branch' => 'JAKARTA'],
                        ['id' => '111.201-01.2016.12.00004', 'number' => '111.201-01.2016.12.00004', 'date' => '16/12/2016', 'cashBank' => 'Kas Kecil Kantor Suraba...', 'cashBankFull' => 'Kas Kecil Kantor Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran Biaya Iklan - (Banner)', 'amount' => '345,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-sby', 'branch' => 'SURABAYA'],
                        ['id' => '111.101-01.2016.12.00004', 'number' => '111.101-01.2016.12.00004', 'date' => '16/12/2016', 'cashBank' => 'Kas Kecil Kantor Jakarta', 'cashBankFull' => 'Kas Kecil Kantor Jakarta', 'checkNumber' => '', 'description' => 'Pembelian Alat Tulis Kantor', 'amount' => '550,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-jkt', 'branch' => 'JAKARTA'],
                        ['id' => '111.201-02.2016.12.00003', 'number' => '111.201-02.2016.12.00003', 'date' => '16/12/2016', 'cashBank' => 'Kas Besar Kantor Surab...', 'cashBankFull' => 'Kas Besar Kantor Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran Biaya Asuran - Surabaya', 'amount' => '3,700,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-sby', 'branch' => 'SURABAYA'],
                        ['id' => '111.101-02.2016.12.00003', 'number' => '111.101-02.2016.12.00003', 'date' => '16/12/2016', 'cashBank' => 'Kas Besar Kantor Jakarta', 'cashBankFull' => 'Kas Besar Kantor Jakarta', 'checkNumber' => '', 'description' => 'Pembayaran Biaya sewa Kantor - Jakarta', 'amount' => '25,000,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-jkt', 'branch' => 'JAKARTA'],
                        ['id' => '111.101-01.2016.12.00002', 'number' => '111.101-01.2016.12.00002', 'date' => '16/12/2016', 'cashBank' => 'Kas Kecil Kantor Jakarta', 'cashBankFull' => 'Kas Kecil Kantor Jakarta', 'checkNumber' => '', 'description' => 'Pembayaran Listrik dan Air - Jakarta', 'amount' => '3,350,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-jkt', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-01.2016.12.00002', 'number' => '111.102-01.2016.12.00002', 'date' => '09/12/2016', 'cashBank' => 'Bank BCA IDR Jakarta (0...', 'cashBankFull' => 'Bank BCA IDR Jakarta (069-773-3993)', 'checkNumber' => '', 'description' => 'Pembayaran Hutang Bunga', 'amount' => '86,250,000', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-01.2016.12.00001', 'number' => '111.102-01.2016.12.00001', 'date' => '08/12/2016', 'cashBank' => 'Bank BCA IDR Jakarta (0...', 'cashBankFull' => 'Bank BCA IDR Jakarta (069-773-3993)', 'checkNumber' => '', 'description' => 'Pembayaran Hutang Bunga - Surabaya', 'amount' => '52,500,000', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'SURABAYA'],
                        ['id' => '111.201-01.2016.12.00001', 'number' => '111.201-01.2016.12.00001', 'date' => '01/12/2016', 'cashBank' => 'Kas Kecil Kantor Suraba...', 'cashBankFull' => 'Kas Kecil Kantor Surabaya', 'checkNumber' => '', 'description' => 'Pembayaran Beban Listrik dan Air - Surabaya', 'amount' => '2,750,000', 'dateFilter' => '2016', 'bankFilter' => 'cash-sby', 'branch' => 'SURABAYA'],
                        ['id' => '111.101-02.2016.11.00002', 'number' => '111.101-02.2016.11.00002', 'date' => '25/11/2016', 'cashBank' => 'Kas Besar Kantor Jakarta', 'cashBankFull' => 'Kas Besar Kantor Jakarta', 'checkNumber' => '', 'description' => 'Pembayaran BPJS Ketenaga Kerjaan dan Kesehatan - Jakarta', 'amount' => '4,984,096', 'dateFilter' => '2016', 'bankFilter' => 'cash-jkt', 'branch' => 'JAKARTA'],
                    ],
                ],
                'detailRecords' => [
                    '111.201-02.2017.02.00001' => [
                        'bankAccounts' => ['Kas Besar Kantor Surabaya'],
                        'entryDate' => '10/02/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Bank BCA IDR Jakarta (069-773-3993)',
                        'documentNumber' => '111.201-02.2017.02.00001',
                        'checkNumber' => '',
                        'recipient' => '',
                        'voided' => true,
                        'branches' => ['SURABAYA'],
                        'notes' => 'Pembayaran Hutang Pajak PPh Ps 21',
                        'lineItems' => [
                            [
                                'id' => 'cash-payment-line-1',
                                'accountCode' => '215.000-02',
                                'accountName' => 'Hutang Pajak PPh Ps 21',
                                'amount' => '1,447,298',
                            ],
                        ],
                        'totalValue' => 'Rp 1,447,298',
                        'saveTone' => 'muted',
                        'kapNumber' => '',
                        'kjsNumber' => '',
                        'ntpn' => '',
                        'reconcileStatus' => 'Belum',
                        'printStatus' => 'Belum cetak/email',
                    ],
                ],
            ],
        ];
    }

    private static function cashReceiptPage(): array
    {
        return [
            'subtab' => [
                'id' => 'cash-receipt-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'cashReceipt' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'cashBank' => 'Kas/Bank',
                    'documentNumber' => 'No Bukti #',
                    'entryDate' => 'Tanggal',
                    'checkNumber' => 'No Cek #',
                    'payer' => 'Pemberi',
                    'voided' => 'V O I D',
                    'branch' => 'Cabang',
                    'notes' => 'Catatan',
                    'reconcileStatus' => 'Terekonsiliasi',
                    'printStatus' => 'Dicetak/email',
                ],
                'cashBankPlaceholder' => 'Cari/Pilih...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'numberingOptions' => [
                    'Bank BCA IDR Jakarta (069-773-3993)',
                    'Bank Mandiri IDR Surabaya (276-129-4178)',
                    'Bank BCA IDR Surabaya (388-308-3993)',
                ],
                'lineSearchPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'lineSectionTitle' => 'Rincian Penerimaan',
                'infoTitle' => 'Info lainnya',
                'totalCardLabel' => 'Nilai',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Penerimaan', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'items' => [
                            ['id' => 'save-now', 'label' => 'Simpan'],
                            ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                        ],
                    ],
                    [
                        'id' => 'document',
                        'label' => 'Form lain',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'open-document', 'label' => 'Buka dokumen terkait'],
                            ['id' => 'preview-document', 'label' => 'Preview dokumen'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                            ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate-transaction', 'label' => 'Duplikasi transaksi'],
                            ['id' => 'mark-review', 'label' => 'Tandai untuk review'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'draft' => [
                    'bankAccounts' => [],
                    'entryDate' => '25/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Bank BCA IDR Jakarta (069-773-3993)',
                    'documentNumber' => '',
                    'checkNumber' => '',
                    'payer' => '',
                    'voided' => false,
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'lineItems' => [],
                    'totalValue' => '0',
                    'saveTone' => 'primary',
                    'reconcileStatus' => '',
                    'reconcileDate' => '',
                    'printStatus' => '',
                ],
                'lineTable' => [
                    'columns' => [
                        ['id' => 'accountCode', 'label' => 'Akun', 'widthClassName' => 'w-[130px]', 'align' => 'left'],
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'align' => 'left'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Penerimaan',
                    'refreshLabel' => 'Sinkron penerimaan',
                    'downloadLabel' => 'Unduh data penerimaan',
                    'printLabel' => 'Cetak penerimaan',
                    'settingsLabel' => 'Pengaturan tabel penerimaan',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'settingsItems' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-receipt', 'label' => 'Ekspor penerimaan'],
                    ],
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2016', 'label' => 'Tanggal: 2016'],
                            ],
                        ],
                        [
                            'id' => 'bank',
                            'rowKey' => 'bankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Kas/Bank: Semua'],
                                ['value' => 'bank-bca', 'label' => 'Kas/Bank: Bank BCA'],
                                ['value' => 'bank-mandiri', 'label' => 'Kas/Bank: Bank Mandiri'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[210px]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                        ['id' => 'cashBank', 'label' => 'Kas/Bank', 'widthClassName' => 'w-[200px]'],
                        ['id' => 'checkNumber', 'label' => 'No Cek #', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'description', 'label' => 'Keterangan'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[160px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => '111.202-04.2016.12.00001', 'number' => '111.202-04.2016.12.00001', 'date' => '31/12/2016', 'cashBank' => 'Bank Mandiri IDR Surab...', 'cashBankFull' => 'Bank Mandiri IDR Surabaya (276-129-4178)', 'checkNumber' => '', 'description' => '', 'amount' => '4,346,346', 'dateFilter' => '2016', 'bankFilter' => 'bank-mandiri', 'branch' => 'JAKARTA', 'accountCode' => '811.000-01', 'accountName' => 'Pendapatan Bunga Bank', 'reconcileStatus' => 'Ya', 'reconcileDate' => '(11/02/2017)', 'printStatus' => 'Belum cetak/email'],
                        ['id' => '111.202-02.2016.12.00002', 'number' => '111.202-02.2016.12.00002', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA USD Surabay...', 'cashBankFull' => 'Bank BCA USD Surabaya (247-878-6241)', 'checkNumber' => '', 'description' => '', 'amount' => '307', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-02.2016.12.00004', 'number' => '111.102-02.2016.12.00004', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA USD Jakarta (...', 'cashBankFull' => 'Bank BCA USD Jakarta (247-878-6241)', 'checkNumber' => '', 'description' => '', 'amount' => '1,023', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.202-01.2016.12.00003', 'number' => '111.202-01.2016.12.00003', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA IDR Surabaya...', 'cashBankFull' => 'Bank BCA IDR Surabaya (388-308-3993)', 'checkNumber' => '', 'description' => '', 'amount' => '8,765,000', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-01.2016.12.00003', 'number' => '111.102-01.2016.12.00003', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA IDR Jakarta (0...', 'cashBankFull' => 'Bank BCA IDR Jakarta (069-773-3993)', 'checkNumber' => '', 'description' => '', 'amount' => '10,340,000', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-04.2016.11.00001', 'number' => '111.102-04.2016.11.00001', 'date' => '30/11/2016', 'cashBank' => 'Bank Mandiri IDR Jakart...', 'cashBankFull' => 'Bank Mandiri IDR Jakarta', 'checkNumber' => '', 'description' => '', 'amount' => '6,004,500', 'dateFilter' => '2016', 'bankFilter' => 'bank-mandiri', 'branch' => 'JAKARTA'],
                    ],
                ],
                'detailRecords' => [
                    '111.202-04.2016.12.00001' => [
                        'bankAccounts' => ['Bank Mandiri IDR Surabaya (276-129-4178)'],
                        'entryDate' => '31/12/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Bank BCA IDR Jakarta (069-773-3993)',
                        'documentNumber' => '111.202-04.2016.12.00001',
                        'checkNumber' => '',
                        'payer' => '',
                        'voided' => false,
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'lineItems' => [
                            [
                                'id' => 'cash-receipt-line-1',
                                'accountCode' => '811.000-01',
                                'accountName' => 'Pendapatan Bunga Bank',
                                'amount' => '4,346,346',
                            ],
                        ],
                        'totalValue' => 'Rp 4,346,346',
                        'saveTone' => 'muted',
                        'reconcileStatus' => 'Ya',
                        'reconcileDate' => '(11/02/2017)',
                        'printStatus' => 'Belum cetak/email',
                    ],
                ],
            ],
        ];
    }

    private static function bankTransferPage(): array
    {
        return [
            'subtab' => [
                'id' => 'bank-transfer-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'bankTransfer' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'Nomor #',
                    'fromBank' => 'Dari Kas/Bank',
                    'fromBranch' => 'Cabang',
                    'exchangeRate' => 'Kurs',
                    'transferValue' => 'Nilai Transfer',
                    'toBank' => 'Ke Kas/Bank',
                    'toBranch' => 'Ke Cabang',
                    'resultValue' => 'Hasil Transfer',
                    'notes' => 'Catatan',
                    'reconcileStatus' => 'Terekonsiliasi',
                ],
                'bankPlaceholder' => 'Cari/Pilih...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'feeLookupPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'numberingOptions' => ['Transfer Bank'],
                'transferTitle' => 'Transfer Uang',
                'feeTitle' => 'Biaya Transfer',
                'infoTitle' => 'Info lainnya',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Transfer Uang', 'icon' => 'document'],
                    ['id' => 'fee', 'label' => 'Biaya Transfer', 'icon' => 'payment'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                ],
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'items' => [
                            ['id' => 'save-now', 'label' => 'Simpan'],
                            ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                        ],
                    ],
                    [
                        'id' => 'document',
                        'label' => 'Form lain',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'open-document', 'label' => 'Buka dokumen terkait'],
                            ['id' => 'preview-document', 'label' => 'Preview dokumen'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                            ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate-transaction', 'label' => 'Duplikasi transaksi'],
                            ['id' => 'mark-review', 'label' => 'Tandai untuk review'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'draft' => [
                    'entryDate' => '25/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Transfer Bank',
                    'documentNumber' => '',
                    'fromBankAccounts' => [],
                    'fromBranches' => ['JAKARTA'],
                    'exchangeRate' => '',
                    'exchangeRateLabel' => '',
                    'transferValue' => '',
                    'transferPrefix' => '',
                    'transferWords' => '',
                    'toBankAccounts' => [],
                    'toBranches' => ['JAKARTA'],
                    'resultValue' => '',
                    'resultPrefix' => '',
                    'resultWords' => '',
                    'notes' => '',
                    'feeRows' => [],
                    'fromTotalLabel' => 'Total',
                    'fromTotalValue' => '0',
                    'toTotalLabel' => 'Total',
                    'toTotalValue' => '0',
                    'saveTone' => 'primary',
                    'reconciliations' => [],
                ],
                'feeTable' => [
                    'columns' => [
                        ['id' => 'accountCode', 'label' => 'Akun', 'widthClassName' => 'w-[25%]'],
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'widthClassName' => 'w-[25%]'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[25%]', 'align' => 'right'],
                        ['id' => 'chargedTo', 'label' => 'Dibebankan ke', 'widthClassName' => 'w-[25%]'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Transfer Bank',
                    'refreshLabel' => 'Sinkron transfer bank',
                    'downloadLabel' => 'Unduh data transfer bank',
                    'printLabel' => 'Cetak transfer bank',
                    'settingsLabel' => 'Pengaturan tabel transfer bank',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'settingsItems' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-transfer', 'label' => 'Ekspor transfer bank'],
                    ],
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2016', 'label' => 'Tanggal: 2016'],
                            ],
                        ],
                        [
                            'id' => 'from-bank',
                            'rowKey' => 'fromBankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Dari Kas/Bank: Semua'],
                                ['value' => 'cash', 'label' => 'Dari Kas/Bank: Kas'],
                                ['value' => 'bank-bca', 'label' => 'Dari Kas/Bank: Bank BCA'],
                            ],
                        ],
                        [
                            'id' => 'to-bank',
                            'rowKey' => 'toBankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Ke Kas/Bank: Semua'],
                                ['value' => 'cash', 'label' => 'Ke Kas/Bank: Kas'],
                                ['value' => 'bank-bca', 'label' => 'Ke Kas/Bank: Bank BCA'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[190px]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                        ['id' => 'fromBank', 'label' => 'Bank (Keluar)', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'toBank', 'label' => 'Bank (Masuk)', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'description', 'label' => 'Keterangan', 'widthClassName' => 'w-[32%]'],
                        ['id' => 'transferTotal', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                        ['id' => 'purchasePayment', 'label' => 'Pembayaran Pembelian', 'widthClassName' => 'w-[220px]'],
                        ['id' => 'feeTotal', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => 'BT.2016.12.00006', 'number' => 'BT.2016.12.00006', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA USD S...', 'fromBankFull' => 'Bank BCA USD Surabaya (247-878-6241)', 'toBank' => 'Bank BCA IDR Su...', 'toBankFull' => 'Bank BCA IDR Surabaya (388-308-3993)', 'description' => '', 'transferTotal' => '29,491,200', 'purchasePayment' => '', 'feeTotal' => '2,304', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'bank-bca', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA', 'exchangeRateLabel' => '1 USD=XXX IDR', 'exchangeRate' => '12,800', 'transferValue' => '2,304', 'transferPrefix' => 'USD', 'transferWords' => '# Dua ribu tiga ratus empat #', 'resultValue' => '29,491,200', 'resultPrefix' => 'IDR', 'resultWords' => '# Dua puluh sembilan juta empat ratus sembilan puluh satu ribu dua ratus #', 'fromTotalLabel' => 'Total Bank BCA USD Surabaya (24...', 'fromTotalValue' => '$ 2,304', 'toTotalLabel' => 'Total Bank BCA IDR Surabaya (388...', 'toTotalValue' => 'Rp 29,491,200', 'reconciliations' => [['id' => 'recon-a', 'bank' => 'Bank BCA USD Surabaya (247-878-6241)', 'status' => 'Belum', 'date' => ''], ['id' => 'recon-b', 'bank' => 'Bank BCA IDR Surabaya (388-308-3993)', 'status' => 'Ya', 'date' => '(11/02/2017)']]],
                        ['id' => 'BT.2016.12.00005', 'number' => 'BT.2016.12.00005', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA USD J...', 'fromBankFull' => 'Bank BCA USD Jakarta', 'toBank' => 'Bank BCA IDR Ja...', 'toBankFull' => 'Bank BCA IDR Jakarta', 'description' => '', 'transferTotal' => '71,120,000', 'purchasePayment' => '', 'feeTotal' => '5,600', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'bank-bca', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00004', 'number' => 'BT.2016.12.00004', 'date' => '16/12/2016', 'fromBank' => 'Kas Besar Kantor...', 'fromBankFull' => 'Kas Besar Kantor Jakarta', 'toBank' => 'Kas Kecil Kantor ...', 'toBankFull' => 'Kas Kecil Kantor Jakarta', 'description' => '', 'transferTotal' => '8,750,000', 'purchasePayment' => '', 'feeTotal' => '8,750,000', 'dateFilter' => '2016', 'fromBankFilter' => 'cash', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00003', 'number' => 'BT.2016.12.00003', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA IDR Su...', 'fromBankFull' => 'Bank BCA IDR Surabaya', 'toBank' => 'Kas Besar Kantor...', 'toBankFull' => 'Kas Besar Kantor Surabaya', 'description' => '', 'transferTotal' => '11,200,000', 'purchasePayment' => '', 'feeTotal' => '11,200,000', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00002', 'number' => 'BT.2016.12.00002', 'date' => '16/12/2016', 'fromBank' => 'Kas Besar Kantor...', 'fromBankFull' => 'Kas Besar Kantor Jakarta', 'toBank' => 'Kas Kecil Kantor ...', 'toBankFull' => 'Kas Kecil Kantor Jakarta', 'description' => 'Transfer Uang', 'transferTotal' => '12,700,000', 'purchasePayment' => '', 'feeTotal' => '12,700,000', 'dateFilter' => '2016', 'fromBankFilter' => 'cash', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00001', 'number' => 'BT.2016.12.00001', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA IDR Ja...', 'fromBankFull' => 'Bank BCA IDR Jakarta', 'toBank' => 'Kas Besar Kantor...', 'toBankFull' => 'Kas Besar Kantor Surabaya', 'description' => 'Transfer Untuk Gaji Nov 2016', 'transferTotal' => '127,500,000', 'purchasePayment' => '', 'feeTotal' => '127,500,000', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                    ],
                ],
                'detailRecords' => [
                    'BT.2016.12.00006' => [
                        'entryDate' => '16/12/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Transfer Bank',
                        'documentNumber' => 'BT.2016.12.00006',
                        'fromBankAccounts' => ['Bank BCA USD Surabaya (247-878-6241)'],
                        'fromBranches' => ['JAKARTA'],
                        'exchangeRateLabel' => '1 USD=XXX IDR',
                        'exchangeRate' => '12,800',
                        'transferValue' => '2,304',
                        'transferPrefix' => 'USD',
                        'transferWords' => '# Dua ribu tiga ratus empat #',
                        'toBankAccounts' => ['Bank BCA IDR Surabaya (388-308-3993)'],
                        'toBranches' => ['JAKARTA'],
                        'resultValue' => '29,491,200',
                        'resultPrefix' => 'IDR',
                        'resultWords' => '# Dua puluh sembilan juta empat ratus sembilan puluh satu ribu dua ratus #',
                        'notes' => '',
                        'feeRows' => [],
                        'fromTotalLabel' => 'Total Bank BCA USD Surabaya (24...',
                        'fromTotalValue' => '$ 2,304',
                        'toTotalLabel' => 'Total Bank BCA IDR Surabaya (388...',
                        'toTotalValue' => 'Rp 29,491,200',
                        'saveTone' => 'muted',
                        'reconciliations' => [
                            ['id' => 'transfer-recon-a', 'bank' => 'Bank BCA USD Surabaya (247-878-6241)', 'status' => 'Belum', 'date' => ''],
                            ['id' => 'transfer-recon-b', 'bank' => 'Bank BCA IDR Surabaya (388-308-3993)', 'status' => 'Ya', 'date' => '(11/02/2017)'],
                        ],
                    ],
                ],
            ],
        ];
    }

    private static function journalActivityLogPage(): array
    {
        $journalRows = array_slice(self::generalJournalPage()['generalJournal']['table']['rows'], 0, 20);

        return [
            'showViewIndicator' => true,
            'detailTabsOnly' => true,
            'journalActivityLog' => [
                'sectionLabel' => 'Pemeriksaan',
                'labels' => [
                    'date' => 'Tanggal',
                    'transactionType' => 'Tipe Transaksi',
                    'display' => 'Tampilkan',
                    'number' => 'Nomor #',
                    'transactionNumber' => 'No. Trans #',
                    'accountCode' => 'Akun Perkiraan',
                    'accountName' => 'Nama Perkiraan',
                    'debit' => 'Debit',
                    'credit' => 'Kredit',
                ],
                'displayOptions' => ['Semua Perubahan', 'Perubahan Aktif', 'Perubahan Sebelumnya'],
                'table' => [
                    'refreshLabel' => 'Muat ulang log aktifitas jurnal',
                    'settingsLabel' => 'Pengaturan log aktifitas jurnal',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '632',
                    'menuItems' => [
                        ['id' => 'journal-log-columns', 'label' => 'Atur kolom'],
                        ['id' => 'journal-log-export', 'label' => 'Ekspor log aktifitas jurnal'],
                    ],
                    'columns' => [
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[34%]'],
                        ['id' => 'transactionNumber', 'label' => 'No. Trans #', 'widthClassName' => 'w-[34%]'],
                        ['id' => 'typeLabel', 'label' => 'Tipe Transaksi', 'widthClassName' => 'w-[260px]'],
                    ],
                    'rows' => array_map(
                        fn (array $row) => [
                            'id' => $row['id'],
                            'date' => $row['date'],
                            'number' => $row['documentNumber'],
                            'transactionNumber' => $row['transactionNumber'],
                            'typeLabel' => self::resolveJournalActivityTypeLabel(
                                $row['transactionTypeValue'] ?? '',
                                $row['transactionTypeLabel'] ?? ''
                            ),
                            'amount' => $row['totalCurrency'] ?? 'Rp 0',
                        ],
                        $journalRows,
                    ),
                ],
                'detailRecords' => [
                    'JV.2017.02.00015' => [
                        'documentNumber' => 'JV.2017.02.00015',
                        'transactionNumber' => '111.102-01.2017.02.00002',
                        'date' => '24 Feb 2017',
                        'transactionType' => 'Penerimaan Penjualan',
                        'selectedDisplay' => 'Semua Perubahan',
                        'reviewedAt' => 'Per 10 Feb 2017 22:56:52 (Aktif)',
                        'reviewer' => 'Pengguna : Jhonni Haris Limbong',
                        'entries' => [
                            [
                                'id' => 'journal-log-detail-1',
                                'accountCode' => '111.102-01',
                                'accountName' => 'Bank BCA IDR Jakarta (069-773-3993)',
                                'debit' => '33,600,000',
                                'credit' => '',
                            ],
                            [
                                'id' => 'journal-log-detail-2',
                                'accountCode' => '112.101-01',
                                'accountName' => 'Piutang Usaha Jakarta - IDR',
                                'debit' => '',
                                'credit' => '33,600,000',
                            ],
                        ],
                        'totalDebit' => '33,600,000',
                        'totalCredit' => '33,600,000',
                    ],
                ],
            ],
        ];
    }

    private static function resolveJournalActivityTypeLabel(string $transactionTypeValue, string $fallback): string
    {
        return match ($transactionTypeValue) {
            'sales-receipt' => 'Penerimaan Penjualan',
            'purchase-payment' => 'Pembayaran Pembelian',
            'sales-invoice' => 'Faktur Penjualan',
            'tax-payment' => 'Pembayaran',
            'payroll-entry' => 'Pencatatan Gaji',
            'delivery-order' => 'Pengiriman Pesanan',
            'sales-return' => 'Retur Penjualan',
            'purchase-return' => 'Retur Pembelian',
            'period-end' => 'Jurnal Umum',
            default => $fallback ?: 'Jurnal Umum',
        };
    }

    private static function expenseEntryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'expense-entry-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'expenseEntry' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'liabilityAccount' => 'Hutang Beban',
                    'documentNumber' => 'No Beban #',
                    'entryDate' => 'Tanggal',
                    'dueDate' => 'Jatuh Tempo',
                    'branch' => 'Cabang',
                    'notes' => 'Catatan',
                ],
                'numberingOptions' => ['Pencatatan Beban'],
                'liabilityAccountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'takeButtonLabel' => 'Ambil',
                'processButtonLabel' => 'Proses',
                'lineSearchPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'lineSectionTitle' => 'Rincian Beban',
                'additionalInfoTitle' => 'Info lainnya',
                'summaryTitle' => 'Informasi Pencatatan Beban',
                'totalCardLabel' => 'Total',
                'sectionTabs' => [
                    [
                        'id' => 'details',
                        'label' => 'Rincian Beban',
                        'icon' => 'document',
                    ],
                    [
                        'id' => 'additional-info',
                        'label' => 'Info lainnya',
                        'icon' => 'info',
                    ],
                    [
                        'id' => 'summary',
                        'label' => 'Informasi Pencatatan Beban',
                        'icon' => 'expense',
                    ],
                ],
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'items' => [
                            ['id' => 'save-now', 'label' => 'Simpan'],
                            ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                        ],
                    ],
                    [
                        'id' => 'document',
                        'label' => 'Form lain',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'view-details', 'label' => 'Lihat rincian'],
                            ['id' => 'open-summary', 'label' => 'Buka informasi pencatatan'],
                        ],
                    ],
                    [
                        'id' => 'attachment',
                        'label' => 'Lampiran',
                        'icon' => 'paperclip',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                            ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                        ],
                    ],
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate', 'label' => 'Duplikasi transaksi'],
                            ['id' => 'mark-review', 'label' => 'Tandai untuk review'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'draft' => [
                    'liabilityAccounts' => [],
                    'entryDate' => '25/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Pencatatan Beban',
                    'documentNumber' => '',
                    'dueDate' => '25/04/2026',
                    'branches' => ['JAKARTA'],
                    'notes' => '',
                    'lineLookup' => '',
                    'lineItems' => [],
                    'paidAmount' => 'Rp 0',
                    'status' => 'Draft',
                    'totalValue' => '0',
                    'saveTone' => 'primary',
                ],
                'records' => [
                    'EXP.2016.12.00006' => [
                        'id' => 'EXP.2016.12.00006',
                        'documentNumber' => 'EXP.2016.12.00006',
                        'liabilityAccounts' => ['[214.200-08] BYMD - Hutang Bunga Bank Surabaya'],
                        'entryDate' => '30/12/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Pencatatan Beban',
                        'dueDate' => '06/01/2017',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'expense-entry-line-1',
                                'account' => '711.000-03',
                                'accountName' => 'Bunga Pinjaman',
                                'amount' => '52,500,000',
                            ],
                        ],
                        'paidAmount' => 'Rp 0',
                        'status' => 'Sedang diproses',
                        'totalValue' => 'Rp 52,500,000',
                        'saveTone' => 'muted',
                    ],
                    'EXP.2016.12.00005' => [
                        'id' => 'EXP.2016.12.00005',
                        'documentNumber' => 'EXP.2016.12.00005',
                        'liabilityAccounts' => ['[214.200-02] BYMD - Hutang Beban Iklan'],
                        'entryDate' => '30/12/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Pencatatan Beban',
                        'dueDate' => '06/01/2017',
                        'branches' => ['JAKARTA'],
                        'notes' => 'Pembebanan biaya promosi akhir tahun.',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'expense-entry-line-2',
                                'account' => '712.100-01',
                                'accountName' => 'Biaya Iklan dan Promosi',
                                'amount' => '86,250,000',
                            ],
                        ],
                        'paidAmount' => 'Rp 0',
                        'status' => 'Sedang diproses',
                        'totalValue' => 'Rp 86,250,000',
                        'saveTone' => 'muted',
                    ],
                    'EXP.2016.11.00002' => [
                        'id' => 'EXP.2016.11.00002',
                        'documentNumber' => 'EXP.2016.11.00002',
                        'liabilityAccounts' => ['[214.200-05] BYMD - Hutang Beban Konsultan'],
                        'entryDate' => '30/11/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Pencatatan Beban',
                        'dueDate' => '08/12/2016',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'expense-entry-line-3',
                                'account' => '713.300-01',
                                'accountName' => 'Jasa Profesional',
                                'amount' => '52,500,000',
                            ],
                        ],
                        'paidAmount' => 'Rp 52,500,000',
                        'status' => 'Terbayar',
                        'totalValue' => 'Rp 52,500,000',
                        'saveTone' => 'muted',
                    ],
                    'EXP.2016.11.00001' => [
                        'id' => 'EXP.2016.11.00001',
                        'documentNumber' => 'EXP.2016.11.00001',
                        'liabilityAccounts' => ['[214.200-03] BYMD - Hutang Beban Operasional'],
                        'entryDate' => '30/11/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Pencatatan Beban',
                        'dueDate' => '09/12/2016',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'expense-entry-line-4',
                                'account' => '714.200-01',
                                'accountName' => 'Beban Operasional Kantor',
                                'amount' => '86,250,000',
                            ],
                        ],
                        'paidAmount' => 'Rp 86,250,000',
                        'status' => 'Terbayar',
                        'totalValue' => 'Rp 86,250,000',
                        'saveTone' => 'muted',
                    ],
                    'EXP.2016.10.00002' => [
                        'id' => 'EXP.2016.10.00002',
                        'documentNumber' => 'EXP.2016.10.00002',
                        'liabilityAccounts' => ['[214.200-04] BYMD - Hutang Beban Utilitas'],
                        'entryDate' => '31/10/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Pencatatan Beban',
                        'dueDate' => '11/11/2016',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'expense-entry-line-5',
                                'account' => '715.100-01',
                                'accountName' => 'Beban Listrik dan Air',
                                'amount' => '86,250,000',
                            ],
                        ],
                        'paidAmount' => 'Rp 86,250,000',
                        'status' => 'Terbayar',
                        'totalValue' => 'Rp 86,250,000',
                        'saveTone' => 'muted',
                    ],
                    'EXP.2016.10.00001' => [
                        'id' => 'EXP.2016.10.00001',
                        'documentNumber' => 'EXP.2016.10.00001',
                        'liabilityAccounts' => ['[214.200-01] BYMD - Hutang Beban Sewa'],
                        'entryDate' => '31/10/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Pencatatan Beban',
                        'dueDate' => '10/11/2016',
                        'branches' => ['JAKARTA'],
                        'notes' => '',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'expense-entry-line-6',
                                'account' => '716.100-01',
                                'accountName' => 'Beban Sewa Gedung',
                                'amount' => '52,500,000',
                            ],
                        ],
                        'paidAmount' => 'Rp 52,500,000',
                        'status' => 'Terbayar',
                        'totalValue' => 'Rp 52,500,000',
                        'saveTone' => 'muted',
                    ],
                ],
                'lineTable' => [
                    'columns' => [
                        [
                            'id' => 'spacer',
                            'label' => '',
                            'kind' => 'spacer',
                            'widthClassName' => 'w-[36px]',
                            'align' => 'center',
                        ],
                        [
                            'id' => 'account',
                            'label' => 'Akun',
                            'widthClassName' => 'w-[35%]',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'accountName',
                            'label' => 'Nama Akun',
                            'widthClassName' => 'w-[40%]',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'amount',
                            'label' => 'Nilai',
                            'widthClassName' => 'w-[25%]',
                            'align' => 'right',
                        ],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'summaryRows' => [
                    'paidAmountLabel' => 'Dibayar',
                    'statusLabel' => 'Status',
                ],
                'table' => [
                    'createLabel' => 'Tambah Pencatatan Beban',
                    'refreshLabel' => 'Muat ulang',
                    'downloadLabel' => 'Unduh',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2016', 'label' => 'Tanggal: 2016'],
                            ],
                        ],
                        [
                            'id' => 'status',
                            'rowKey' => 'statusFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Status: Semua'],
                                ['value' => 'processing', 'label' => 'Status: Sedang diproses'],
                                ['value' => 'paid', 'label' => 'Status: Terbayar'],
                            ],
                        ],
                    ],
                    'settingsMenu' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-expense', 'label' => 'Ekspor pencatatan beban'],
                    ],
                    'columns' => [
                        ['id' => 'documentNumber', 'label' => 'Nomor #', 'widthClassName' => 'w-[16%]', 'align' => 'left'],
                        ['id' => 'entryDate', 'label' => 'Tanggal', 'widthClassName' => 'w-[10%]', 'align' => 'left'],
                        ['id' => 'dueDate', 'label' => 'Jatuh Tempo', 'widthClassName' => 'w-[12%]', 'align' => 'left'],
                        ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[12%]', 'align' => 'right'],
                        ['id' => 'paid', 'label' => 'Dibayar', 'widthClassName' => 'w-[10%]', 'align' => 'right'],
                        ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[12%]', 'align' => 'left'],
                        ['id' => 'note', 'label' => 'Keterangan', 'align' => 'left'],
                    ],
                    'rows' => [
                        [
                            'id' => 'EXP.2016.12.00006',
                            'documentNumber' => 'EXP.2016.12.00006',
                            'entryDate' => '30/12/2016',
                            'dueDate' => '06/01/2017',
                            'total' => '52,500,000',
                            'paid' => '0',
                            'status' => 'Sedang diproses',
                            'note' => '',
                            'dateFilter' => '2016',
                            'statusFilter' => 'processing',
                        ],
                        [
                            'id' => 'EXP.2016.12.00005',
                            'documentNumber' => 'EXP.2016.12.00005',
                            'entryDate' => '30/12/2016',
                            'dueDate' => '06/01/2017',
                            'total' => '86,250,000',
                            'paid' => '0',
                            'status' => 'Sedang diproses',
                            'note' => '',
                            'dateFilter' => '2016',
                            'statusFilter' => 'processing',
                        ],
                        [
                            'id' => 'EXP.2016.11.00002',
                            'documentNumber' => 'EXP.2016.11.00002',
                            'entryDate' => '30/11/2016',
                            'dueDate' => '08/12/2016',
                            'total' => '52,500,000',
                            'paid' => '52,500,000',
                            'status' => 'Terbayar',
                            'note' => '',
                            'dateFilter' => '2016',
                            'statusFilter' => 'paid',
                        ],
                        [
                            'id' => 'EXP.2016.11.00001',
                            'documentNumber' => 'EXP.2016.11.00001',
                            'entryDate' => '30/11/2016',
                            'dueDate' => '09/12/2016',
                            'total' => '86,250,000',
                            'paid' => '86,250,000',
                            'status' => 'Terbayar',
                            'note' => '',
                            'dateFilter' => '2016',
                            'statusFilter' => 'paid',
                        ],
                        [
                            'id' => 'EXP.2016.10.00002',
                            'documentNumber' => 'EXP.2016.10.00002',
                            'entryDate' => '31/10/2016',
                            'dueDate' => '11/11/2016',
                            'total' => '86,250,000',
                            'paid' => '86,250,000',
                            'status' => 'Terbayar',
                            'note' => '',
                            'dateFilter' => '2016',
                            'statusFilter' => 'paid',
                        ],
                        [
                            'id' => 'EXP.2016.10.00001',
                            'documentNumber' => 'EXP.2016.10.00001',
                            'entryDate' => '31/10/2016',
                            'dueDate' => '10/11/2016',
                            'total' => '52,500,000',
                            'paid' => '52,500,000',
                            'status' => 'Terbayar',
                            'note' => '',
                            'dateFilter' => '2016',
                            'statusFilter' => 'paid',
                        ],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
            ],
        ];
    }

    private static function navModule(string $id, string $label, string $icon, array $items): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'items' => $items,
        ];
    }

    private static function accessCategory(string $id, string $label, string $icon, array $sections): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'sections' => $sections,
        ];
    }

    private static function accessSection(string $id, string $label, array $rows): array
    {
        return [
            'id' => $id,
            'label' => $label,
            'rows' => $rows,
        ];
    }

    private static function accessRow(string $id, string $label, array $permissions = [], bool $info = false): array
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

    private static function navItem(
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

    private static function buildSidebarItems(array $modules): array
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

    private static function isImplementedWorkspacePage(string $pageId): bool
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

    private static function workOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'work-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'workOrder' => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    private static function materialAdditionPage(): array
    {
        return [
            'subtab' => [
                'id' => 'material-addition-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'materialAddition' => [
                'topActions' => self::salesTransactionTopActions(),
            ],
        ];
    }

    private static function stockOpnameOrderPage(): array
    {
        return [
            'subtab' => [
                'id' => 'stock-opname-order-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockOpnameOrder' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function stockOpnameResultPage(): array
    {
        return [
            'subtab' => [
                'id' => 'stock-opname-result-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'stockOpnameResult' => [
                'topActions' => [
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
                ],
            ],
        ];
    }

    private static function workCompletionPage(): array
    {
        return [
            'subtab' => [
                'id' => 'work-completion-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'workCompletion' => [
                'topActions' => [
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
                ],
            ],
        ];
    }

    private static function orderFulfillmentPage(): array
    {
        return [
            'orderFulfillment' => [],
        ];
    }

    private static function fixedAssetsPage(): array
    {
        return [
            'subtab' => [
                'id' => 'fixed-assets-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'fixedAssets' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function assetCategoryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'asset-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetCategory' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function assetTaxCategoryPage(): array
    {
        return [
            'subtab' => [
                'id' => 'asset-tax-category-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetTaxCategory' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function assetDisposalPage(): array
    {
        return [
            'subtab' => [
                'id' => 'asset-disposal-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetDisposal' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
            ],
        ];
    }

    private static function assetMovePage(): array
    {
        return [
            'subtab' => [
                'id' => 'asset-move-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'assetMove' => [
                'topActions' => [
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
                ],
            ],
        ];
    }

    private static function buildNavigationPages(array $modules): array
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
