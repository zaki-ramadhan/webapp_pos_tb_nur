<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SecuritySeeder extends Seeder
{
    public function run(): void
    {
        // Seed preference settings
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('preference_settings')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $settings = [
            ['group_key' => 'company_info', 'setting_key' => 'company-name', 'value' => 'UD. TB Nur', 'label' => 'Nama Perusahaan'],
            ['group_key' => 'company_info', 'setting_key' => 'business-category', 'value' => 'GROSIR / WHOLESALER', 'label' => 'Kategori Usaha'],
            ['group_key' => 'company_info', 'setting_key' => 'business-field', 'value' => 'Bahan Bangunan', 'label' => 'Bidang Usaha'],
            ['group_key' => 'company_info', 'setting_key' => 'phone', 'value' => '021-56693463', 'label' => 'Telepon'],
            ['group_key' => 'company_info', 'setting_key' => 'fax', 'value' => '021-56693463', 'label' => 'Faksimili'],
            ['group_key' => 'company_info', 'setting_key' => 'email', 'value' => 'admin@tbnur.com', 'label' => 'Email'],
            ['group_key' => 'company_info', 'setting_key' => 'start-date', 'value' => '01/06/2025', 'label' => 'Tanggal Mulai Data'],
            ['group_key' => 'company_info', 'setting_key' => 'accounting-period', 'value' => 'Januari - Desember', 'label' => 'Periode Akuntansi'],
            ['group_key' => 'company_info', 'setting_key' => 'currency', 'value' => 'Indonesian Rupiah', 'label' => 'Mata Uang Dasar'],
            ['group_key' => 'company_info', 'setting_key' => 'street', 'value' => 'Jl. Tomang Raya No. 35', 'label' => 'Jalan'],
            ['group_key' => 'company_info', 'setting_key' => 'city', 'value' => 'Kab. Badung', 'label' => 'Kota'],
            ['group_key' => 'company_info', 'setting_key' => 'province', 'value' => 'Bali', 'label' => 'Provinsi'],
            ['group_key' => 'company_info', 'setting_key' => 'postal-code', 'value' => '80361', 'label' => 'Kode Pos'],
            ['group_key' => 'company_info', 'setting_key' => 'country', 'value' => 'Indonesia', 'label' => 'Negara'],
            ['group_key' => 'features', 'setting_key' => 'multi-branch', 'value' => 'false', 'label' => 'Multi Cabang'],
            ['group_key' => 'features', 'setting_key' => 'multi-currency', 'value' => 'true', 'label' => 'Multi Mata Uang'],
            ['group_key' => 'features', 'setting_key' => 'tax-feature', 'value' => 'true', 'label' => 'Pajak'],
            ['group_key' => 'features', 'setting_key' => 'approval-feature', 'value' => 'true', 'label' => 'Persetujuan'],
            ['group_key' => 'features', 'setting_key' => 'asset-feature', 'value' => 'true', 'label' => 'Pencatatan Aset'],
            ['group_key' => 'features', 'setting_key' => 'budget-feature', 'value' => 'true', 'label' => 'Anggaran'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-quote', 'value' => 'true', 'label' => 'Persetujuan Penawaran Penjualan'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-order', 'value' => 'true', 'label' => 'Persetujuan Pesanan Penjualan'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-delivery', 'value' => 'true', 'label' => 'Persetujuan Pengiriman Pesanan'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-invoice', 'value' => 'true', 'label' => 'Persetujuan Faktur Penjualan'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-receipt', 'value' => 'false', 'label' => 'Persetujuan Penerimaan Penjualan'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-return', 'value' => 'false', 'label' => 'Persetujuan Retur Penjualan'],
            ['group_key' => 'features', 'setting_key' => 'approval-sales-discount', 'value' => 'false', 'label' => 'Persetujuan Penyesuaian Harga/Diskon'],
            ['group_key' => 'features', 'setting_key' => 'approval-purchase-order', 'value' => 'false', 'label' => 'Persetujuan Pesanan Pembelian'],
            ['group_key' => 'features', 'setting_key' => 'approval-purchase-receipt', 'value' => 'false', 'label' => 'Persetujuan Penerimaan Barang'],
            ['group_key' => 'features', 'setting_key' => 'approval-purchase-invoice', 'value' => 'false', 'label' => 'Persetujuan Faktur Pembelian'],
            ['group_key' => 'features', 'setting_key' => 'approval-purchase-payment', 'value' => 'false', 'label' => 'Persetujuan Pembayaran Pembelian'],
            ['group_key' => 'features', 'setting_key' => 'approval-purchase-return', 'value' => 'false', 'label' => 'Persetujuan Retur Pembelian'],
            ['group_key' => 'features', 'setting_key' => 'approval-purchase-price', 'value' => 'false', 'label' => 'Persetujuan Harga Pemasok'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-request', 'value' => 'false', 'label' => 'Persetujuan Permintaan Barang'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-adjustment', 'value' => 'false', 'label' => 'Persetujuan Penyesuaian Persediaan'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-transfer', 'value' => 'false', 'label' => 'Persetujuan Pemindahan Barang'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-job-order', 'value' => 'false', 'label' => 'Persetujuan Pekerjaan Pesanan'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-material-addition', 'value' => 'false', 'label' => 'Persetujuan Penambahan Bahan Baku'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-job-completion', 'value' => 'false', 'label' => 'Persetujuan Penyelesaian Pesanan'],
            ['group_key' => 'features', 'setting_key' => 'approval-inventory-stock-opname', 'value' => 'false', 'label' => 'Persetujuan Hasil Stok Opname'],
            ['group_key' => 'features', 'setting_key' => 'approval-other-payment', 'value' => 'false', 'label' => 'Persetujuan Pembayaran Kas Keluar'],
            ['group_key' => 'features', 'setting_key' => 'approval-other-receipt', 'value' => 'false', 'label' => 'Persetujuan Penerimaan Kas Masuk'],
            ['group_key' => 'features', 'setting_key' => 'approval-other-bank-transfer', 'value' => 'false', 'label' => 'Persetujuan Transfer Bank'],
            ['group_key' => 'features', 'setting_key' => 'approval-other-expense', 'value' => 'false', 'label' => 'Persetujuan Catatan Beban'],
            ['group_key' => 'features', 'setting_key' => 'approval-other-salary', 'value' => 'false', 'label' => 'Persetujuan Gaji Karyawan'],
            ['group_key' => 'features', 'setting_key' => 'approval-other-transfer-asset', 'value' => 'false', 'label' => 'Persetujuan Pindah Aset'],
        ];

        foreach ($settings as $setting) {
            DB::table('preference_settings')->insert(array_merge($setting, [
                'scope_type' => 'company',
                'scope_key' => 'default',
                'data_type' => 'string',
                'value' => json_encode($setting['value']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Seed roles
        $superAdminRoleId = DB::table('roles')->insertGetId([
            'code' => 'super_admin',
            'name' => 'Super Admin',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $adminRoleId = DB::table('roles')->insertGetId([
            'code' => 'admin',
            'name' => 'Administrator',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $operatorRoleId = DB::table('roles')->insertGetId([
            'code' => 'operator',
            'name' => 'Operator',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed access groups & permissions
        $adminGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'ADMIN',
            'name' => 'Administrator',
            'description' => 'Akses penuh ke semua modul sistem',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('access_group_permissions')->insert([
            'access_group_id' => $adminGroupId,
            'menu_key' => '*',
            'can_access' => true,
            'can_view' => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownerGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'OWNER',
            'name' => 'Owner',
            'description' => 'Manajemen pemilik dengan akses pengawasan dan laporan',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('access_group_permissions')->insert([
            'access_group_id' => $ownerGroupId,
            'menu_key' => '*',
            'can_access' => true,
            'can_view' => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashierGroupId = DB::table('access_groups')->insertGetId([
            'code' => 'KASIR',
            'name' => 'Kasir Utama',
            'description' => 'Akses untuk modul POS, kasir, dan daftar barang',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cashierMenus = ['sales-invoices', 'sales-receipts', 'customers', 'products'];
        foreach ($cashierMenus as $menu) {
            DB::table('access_group_permissions')->insert([
                'access_group_id' => $cashierGroupId,
                'menu_key' => $menu,
                'can_access' => true,
                'can_view' => true,
                'can_create' => true,
                'can_update' => true,
                'can_delete' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed users
        $usersData = [
            [
                'name' => 'Zaki Ramadhan',
                'email' => 'piscokpiscok2610@gmail.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'H. Nurhasan (Owner)',
                'email' => 'owner@tbnur.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Aminah (Kasir)',
                'email' => 'siti@tbnur.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Andi Pratama',
                'email' => 'andi@tbnur.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi@tbnur.com',
                'password' => Hash::make('password'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        $usersMap = [];
        foreach ($usersData as $userData) {
            $uId = DB::table('users')->insertGetId($userData);
            $usersMap[$userData['email']] = $uId;
        }

        // Link roles & groups to users
        DB::table('role_user')->insert(['role_id' => $superAdminRoleId, 'user_id' => $usersMap['piscokpiscok2610@gmail.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $adminGroupId, 'user_id' => $usersMap['piscokpiscok2610@gmail.com']]);

        DB::table('role_user')->insert(['role_id' => $superAdminRoleId, 'user_id' => $usersMap['test@example.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $adminGroupId, 'user_id' => $usersMap['test@example.com']]);

        DB::table('role_user')->insert(['role_id' => $superAdminRoleId, 'user_id' => $usersMap['owner@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $ownerGroupId, 'user_id' => $usersMap['owner@tbnur.com']]);

        DB::table('role_user')->insert(['role_id' => $operatorRoleId, 'user_id' => $usersMap['siti@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $cashierGroupId, 'user_id' => $usersMap['siti@tbnur.com']]);

        DB::table('role_user')->insert(['role_id' => $operatorRoleId, 'user_id' => $usersMap['andi@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $cashierGroupId, 'user_id' => $usersMap['andi@tbnur.com']]);

        DB::table('role_user')->insert(['role_id' => $operatorRoleId, 'user_id' => $usersMap['rudi@tbnur.com']]);
        DB::table('access_group_user')->insert(['access_group_id' => $cashierGroupId, 'user_id' => $usersMap['rudi@tbnur.com']]);

        // Seed activity logs
        $logs = [
            [
                'log_group' => 'general',
                'resource_key' => 'preferences',
                'resource_label' => 'Preferences',
                'permission_key' => 'preference',
                'action' => 'update',
                'subject_type' => 'App\\Domain\\Support\\Models\\PreferenceSetting',
                'subject_id' => 1,
                'subject_label' => 'Nama Perusahaan',
                'document_number' => null,
                'description' => 'Mengubah nama profil perusahaan menjadi UD. TB Nur',
                'actor_user_id' => $usersMap['piscokpiscok2610@gmail.com'],
                'actor_name' => 'Zaki Ramadhan',
                'actor_email' => 'piscokpiscok2610@gmail.com',
                'ip_address' => '127.0.0.1',
                'occurred_at' => now()->subHours(5),
                'created_at' => now()->subHours(5),
                'updated_at' => now()->subHours(5),
            ],
            [
                'log_group' => 'general',
                'resource_key' => 'products',
                'resource_label' => 'Products',
                'permission_key' => 'product',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Catalog\\Models\\Product',
                'subject_id' => 1,
                'subject_label' => 'Semen Portland 50 Kg',
                'document_number' => null,
                'description' => 'Membuat produk baru: Semen Portland 50 Kg',
                'actor_user_id' => $usersMap['piscokpiscok2610@gmail.com'],
                'actor_name' => 'Zaki Ramadhan',
                'actor_email' => 'piscokpiscok2610@gmail.com',
                'ip_address' => '127.0.0.1',
                'occurred_at' => now()->subHours(4),
                'created_at' => now()->subHours(4),
                'updated_at' => now()->subHours(4),
            ],
            [
                'log_group' => 'general',
                'resource_key' => 'employees',
                'resource_label' => 'Employees',
                'permission_key' => 'employee',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Organization\\Models\\Employee',
                'subject_id' => 1,
                'subject_label' => 'Budi Santoso',
                'document_number' => null,
                'description' => 'Menambahkan data karyawan baru: Budi Santoso',
                'actor_user_id' => $usersMap['owner@tbnur.com'],
                'actor_name' => 'H. Nurhasan (Owner)',
                'actor_email' => 'owner@tbnur.com',
                'ip_address' => '192.168.1.10',
                'occurred_at' => now()->subHours(3),
                'created_at' => now()->subHours(3),
                'updated_at' => now()->subHours(3),
            ],
            [
                'log_group' => 'journal',
                'resource_key' => 'general-journals',
                'resource_label' => 'General Journals',
                'permission_key' => 'general-journal',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Finance\\Models\\GeneralJournal',
                'subject_id' => 1,
                'subject_label' => 'Jurnal Penyesuaian Saldo Awal',
                'document_number' => 'GJ.2026.00001',
                'description' => 'Membuat entri jurnal umum GJ.2026.00001 untuk Saldo Awal',
                'actor_user_id' => $usersMap['owner@tbnur.com'],
                'actor_name' => 'H. Nurhasan (Owner)',
                'actor_email' => 'owner@tbnur.com',
                'ip_address' => '192.168.1.15',
                'occurred_at' => now()->subHours(2),
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
            [
                'log_group' => 'journal',
                'resource_key' => 'budgets',
                'resource_label' => 'Budgets',
                'permission_key' => 'budget',
                'action' => 'create',
                'subject_type' => 'App\\Domain\\Finance\\Models\\Budget',
                'subject_id' => 1,
                'subject_label' => 'Anggaran Biaya Gaji Q2 2026',
                'document_number' => 'BGT.2026.00001',
                'description' => 'Membuat anggaran biaya BGT.2026.00001 senilai Rp 50.000.000,00',
                'actor_user_id' => $usersMap['owner@tbnur.com'],
                'actor_name' => 'H. Nurhasan (Owner)',
                'actor_email' => 'owner@tbnur.com',
                'ip_address' => '192.168.1.10',
                'occurred_at' => now()->subHours(1),
                'created_at' => now()->subHours(1),
                'updated_at' => now()->subHours(1),
            ],
        ];

        DB::table('activity_logs')->insert($logs);

        // Seed report catalogs
        $reportCatalogs = [
            ['category_key' => 'memorize', 'report_key' => 'memorize-sales-by-customer', 'title' => 'Penjualan Barang per Pelanggan', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penjualan barang per pelanggan.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'finance', 'report_key' => 'finance-cashflow', 'title' => 'Arus Kas Ringkas', 'section_label' => 'Keuangan', 'icon' => 'reports', 'description' => 'Ringkasan arus kas masuk dan keluar per periode.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'finance', 'report_key' => 'finance-profit-loss', 'title' => 'Laba Rugi Standar', 'section_label' => 'Keuangan', 'icon' => 'ledger', 'description' => 'Menampilkan laporan laba rugi standar periode ini.', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'finance', 'report_key' => 'finance-balance-sheet', 'title' => 'Neraca Standar', 'section_label' => 'Keuangan', 'icon' => 'ledger', 'description' => 'Menampilkan neraca saldo standar untuk menilai posisi keuangan.', 'sort_order' => 30, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'profit-center', 'report_key' => 'profit-center-summary', 'title' => 'Laba Rugi per Departemen', 'section_label' => 'Analisa', 'icon' => 'ledger', 'description' => 'Memantau kontribusi laba rugi berdasarkan departemen dan pusat biaya.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'profit-center', 'report_key' => 'profit-center-distribution', 'title' => 'Distribusi Beban Departemen', 'section_label' => 'Analisa', 'icon' => 'reports', 'description' => 'Menganalisis distribusi beban operasional untuk setiap departemen.', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'ledger', 'report_key' => 'ledger-account-mutation', 'title' => 'Mutasi Akun Perkiraan', 'section_label' => 'Buku Besar', 'icon' => 'ledger', 'description' => 'Menampilkan histori mutasi akun perkiraan lengkap dengan saldo berjalan.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'ledger', 'report_key' => 'ledger-general-journal', 'title' => 'Jurnal Umum Lengkap', 'section_label' => 'Buku Besar', 'icon' => 'document', 'description' => 'Daftar semua jurnal transaksi keuangan per periode.', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'ledger', 'report_key' => 'ledger-detail', 'title' => 'Buku Besar Rincian', 'section_label' => 'Buku Besar', 'icon' => 'ledger', 'description' => 'Rincian mutasi debit dan kredit seluruh akun perkiraan secara kronologis.', 'sort_order' => 30, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'cash-bank', 'report_key' => 'cash-bank-daily-balance', 'title' => 'Saldo Harian Bank', 'section_label' => 'Kas & Bank', 'icon' => 'ledger', 'description' => 'Memantau saldo dan mutasi kas/bank per hari.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'cash-bank-history', 'report_key' => 'cash-bank-history-report', 'title' => 'Histori Transaksi Bank', 'section_label' => 'Kas & Bank', 'icon' => 'document', 'description' => 'Daftar mutasi kas masuk dan keluar secara rinci.', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'receivable', 'report_key' => 'receivable-aging', 'title' => 'Umur Piutang Pelanggan', 'section_label' => 'Piutang', 'icon' => 'ledger', 'description' => 'Membantu menilai jatuh tempo piutang dan tagihan tertunda.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'receivable', 'report_key' => 'receivable-outstanding', 'title' => 'Rincian Piutang Belum Lunas', 'section_label' => 'Piutang', 'icon' => 'document', 'description' => 'Menampilkan daftar piutang aktif yang belum terselesaikan.', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-by-customer', 'title' => 'Penjualan per Pelanggan', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan daftar nilai penjualan per pelanggan', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-by-item', 'title' => 'Penjualan per Barang', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan daftar nilai penjualan per barang', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-by-brand', 'title' => 'Penjualan per Merek', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penjualan per merk barang', 'sort_order' => 30, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-item-by-customer', 'title' => 'Penjualan Barang per Pelanggan', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan daftar nilai penjualan barang per pelanggan', 'sort_order' => 40, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-item-by-warehouse', 'title' => 'Penjualan Barang per Gudang', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penjualan barang per gudang', 'sort_order' => 50, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-customer-by-item', 'title' => 'Penjualan Pelanggan per Barang', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penjualan pelanggan per barang', 'sort_order' => 60, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-process-history', 'title' => 'Histori Proses Penjualan', 'section_label' => 'Penjualan', 'icon' => 'activity', 'description' => 'Menampilkan rantai proses penjualan dari penawaran hingga pembayaran', 'sort_order' => 70, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-detail-by-customer', 'title' => 'Rincian Penjualan per Pelanggan', 'section_label' => 'Penjualan', 'icon' => 'document', 'description' => 'Menampilkan rincian nilai penjualan per pelanggan', 'sort_order' => 80, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-detail-by-item', 'title' => 'Rincian Penjualan per Barang', 'section_label' => 'Penjualan', 'icon' => 'document', 'description' => 'Menampilkan rincian nilai penjualan per barang', 'sort_order' => 90, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-by-branch', 'title' => 'Penjualan per Cabang', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan daftar nilai penjualan per cabang', 'sort_order' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-item-by-branch', 'title' => 'Penjualan Barang per Cabang', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penjualan barang per cabang', 'sort_order' => 110, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-return-by-item', 'title' => 'Retur Penjualan per Barang', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai retur penjualan per barang', 'sort_order' => 120, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-monthly-chart', 'title' => 'Grafik Penjualan Bulanan', 'section_label' => 'Penjualan', 'icon' => 'reports', 'description' => 'Menampilkan grafik batang penjualan per bulan', 'sort_order' => 130, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-share-by-customer', 'title' => 'Porsi Penjualan per Pelanggan', 'section_label' => 'Penjualan', 'icon' => 'reports', 'description' => 'Menampilkan porsi penjualan dari pelanggan', 'sort_order' => 140, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-share-by-item', 'title' => 'Porsi Penjualan per Barang', 'section_label' => 'Penjualan', 'icon' => 'reports', 'description' => 'Menampilkan porsi penjualan dari barang', 'sort_order' => 150, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-quote-by-customer-unprocessed', 'title' => 'Penawaran per Pelanggan (Belum Proses)', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penawaran penjualan yang belum di proses per pelanggan', 'sort_order' => 160, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-quote-by-item-unprocessed', 'title' => 'Penawaran per Barang (Belum Proses)', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai penawaran penjualan yang belum di proses per barang', 'sort_order' => 170, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-order-by-customer-unprocessed', 'title' => 'Pesanan per Pelanggan (Belum Proses)', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai pesanan penjualan yang belum di proses per pelanggan', 'sort_order' => 180, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-order-by-item-unprocessed', 'title' => 'Pesanan per Barang (Belum Proses)', 'section_label' => 'Penjualan', 'icon' => 'ledger', 'description' => 'Menampilkan nilai pesanan penjualan yang belum di proses per barang', 'sort_order' => 190, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-advance-payment', 'title' => 'Uang Muka Penjualan', 'section_label' => 'Penjualan', 'icon' => 'document', 'description' => 'Menampilkan daftar uang muka penjualan grup per pelanggan', 'sort_order' => 200, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-target-item', 'title' => 'Target Penjualan Barang', 'section_label' => 'Penjualan', 'icon' => 'document', 'description' => 'Target Penjualan Barang', 'sort_order' => 210, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'sales', 'report_key' => 'sales-target-category', 'title' => 'Target Penjualan per Kategori', 'section_label' => 'Penjualan', 'icon' => 'document', 'description' => 'Target Penjualan per Kategori', 'sort_order' => 220, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'salesperson', 'report_key' => 'salesperson-performance', 'title' => 'Kinerja Tenaga Penjual', 'section_label' => 'Tenaga Penjual', 'icon' => 'reports', 'description' => 'Menampilkan pencapaian omzet, margin, dan target per tenaga penjual.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'payable', 'report_key' => 'payable-aging', 'title' => 'Umur Utang Pemasok', 'section_label' => 'Utang', 'icon' => 'ledger', 'description' => 'Membantu memetakan tagihan pemasok yang segera jatuh tempo.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'purchase', 'report_key' => 'purchase-by-supplier', 'title' => 'Pembelian per Pemasok', 'section_label' => 'Pembelian', 'icon' => 'ledger', 'description' => 'Meringkas total pembelian, retur, dan saldo pembelian per pemasok.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'inventory', 'report_key' => 'inventory-movement', 'title' => 'Pergerakan Stok Barang', 'section_label' => 'Persediaan', 'icon' => 'ledger', 'description' => 'Melihat stok masuk, keluar, dan saldo akhir per barang.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'warehouse', 'report_key' => 'warehouse-stock-value', 'title' => 'Nilai Stok per Gudang', 'section_label' => 'Gudang', 'icon' => 'ledger', 'description' => 'Ringkasan kuantitas dan nilai stok per gudang.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'fixed-assets', 'report_key' => 'fixed-assets-depreciation', 'title' => 'Penyusutan Aset Tetap', 'section_label' => 'Aset Tetap', 'icon' => 'ledger', 'description' => 'Menampilkan nilai buku, penyusutan, dan umur aset tetap.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'tax', 'report_key' => 'tax-vat-summary', 'title' => 'Ringkasan PPN Keluaran dan Masukan', 'section_label' => 'Pajak', 'icon' => 'ledger', 'description' => 'Meringkas perhitungan PPN untuk kebutuhan pelaporan pajak.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'inspection', 'report_key' => 'inspection-audit-trail', 'title' => 'Jejak Audit Transaksi', 'section_label' => 'Pemeriksaan', 'icon' => 'document', 'description' => 'Menampilkan aktivitas perubahan transaksi untuk kebutuhan pemeriksaan.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['category_key' => 'others', 'report_key' => 'others-custom-form', 'title' => 'Daftar Form Kustom', 'section_label' => 'Lain-lain', 'icon' => 'document', 'description' => 'Kumpulan laporan pendukung dan utilitas tambahan.', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('report_catalogs')->insert($reportCatalogs);
    }
}
