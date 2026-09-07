<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class DataMaintenanceController extends Controller
{
    /**
     * Memverifikasi hak akses Administrator Sistem atau Owner.
     */
    protected function authorizeAdmin(Request $request): User
    {
        $user = $request->user();
        if (! $user || (! $user->isSystemAdmin() && ! $user->isOwner())) {
            abort(403, 'Akses ditolak. Fitur pemeliharaan data hanya dapat diakses oleh Administrator Sistem.');
        }

        return $user;
    }

    /**
     * Mendapatkan statistik lengkap seluruh data halaman modul sistem.
     */
    public function status(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        try {
            $docCounts = DB::table('operation_documents')
                ->select('document_type', DB::raw('count(*) as aggregate'))
                ->groupBy('document_type')
                ->pluck('aggregate', 'document_type')
                ->toArray();

            $countTable = static function (string $table): int {
                return Schema::hasTable($table) ? DB::table($table)->count() : 0;
            };

            $totalTransactions = DB::table('operation_documents')->count();
            $productsCount = $countTable('products');
            $customersCount = $countTable('customers');
            $suppliersCount = $countTable('suppliers');
            $employeesCount = $countTable('employees');

            $categories = [
                [
                    'category' => 'Penjualan',
                    'items' => [
                        ['name' => 'Faktur Penjualan', 'count' => (int) ($docCounts['sales_invoice'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Penerimaan Penjualan', 'count' => (int) ($docCounts['sales_receipt'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Uang Muka Penjualan', 'count' => (int) ($docCounts['sales_deposit'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Retur Penjualan', 'count' => (int) ($docCounts['sales_return'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pesanan Penjualan', 'count' => (int) ($docCounts['sales_order'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Penawaran Penjualan', 'count' => (int) ($docCounts['sales_quote'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pengiriman Pesanan', 'count' => (int) ($docCounts['sales_delivery'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pelanggan', 'count' => $customersCount, 'policy' => 'master_dummy'],
                    ],
                ],
                [
                    'category' => 'Pembelian',
                    'items' => [
                        ['name' => 'Faktur Pembelian', 'count' => (int) ($docCounts['purchase_invoice'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pembayaran Pembelian', 'count' => (int) ($docCounts['purchase_payment'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Uang Muka Pembelian', 'count' => (int) ($docCounts['purchase_deposit'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Retur Pembelian', 'count' => (int) ($docCounts['purchase_return'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pesanan Pembelian', 'count' => (int) ($docCounts['purchase_order'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Penerimaan Barang', 'count' => (int) ($docCounts['goods_receipt'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pemasok', 'count' => $suppliersCount, 'policy' => 'master_dummy'],
                    ],
                ],
                [
                    'category' => 'Kas & Bank',
                    'items' => [
                        ['name' => 'Pembayaran Kas/Bank', 'count' => (int) ($docCounts['cash_payment'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Penerimaan Kas/Bank', 'count' => (int) ($docCounts['cash_receipt'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Transfer Bank', 'count' => (int) ($docCounts['bank_transfer'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Rekonsiliasi Bank', 'count' => $countTable('bank_reconciliations'), 'policy' => 'transaksi'],
                    ],
                ],
                [
                    'category' => 'Buku Besar & Keuangan',
                    'items' => [
                        ['name' => 'Jurnal Umum', 'count' => (int) ($docCounts['general_journal'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pencatatan Beban', 'count' => (int) ($docCounts['expense_entry'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Pencatatan Gaji', 'count' => (int) ($docCounts['payroll_entry'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Akun Perkiraan (COA)', 'count' => $countTable('accounts'), 'policy' => 'dilindungi'],
                    ],
                ],
                [
                    'category' => 'Persediaan & Logistik',
                    'items' => [
                        ['name' => 'Barang & Jasa', 'count' => $productsCount, 'policy' => 'master_dummy'],
                        ['name' => 'Kategori Barang', 'count' => $countTable('product_categories'), 'policy' => 'master_dummy'],
                        ['name' => 'Merek Barang', 'count' => $countTable('brands'), 'policy' => 'master_dummy'],
                        ['name' => 'Penyesuaian Persediaan', 'count' => (int) ($docCounts['inventory_adjustment'] ?? 0), 'policy' => 'transaksi'],
                        ['name' => 'Gudang', 'count' => $countTable('warehouses'), 'policy' => 'dilindungi'],
                        ['name' => 'Satuan Barang', 'count' => $countTable('units'), 'policy' => 'dilindungi'],
                    ],
                ],
                [
                    'category' => 'Organisasi & Keamanan',
                    'items' => [
                        ['name' => 'Karyawan', 'count' => $employeesCount, 'policy' => 'master_dummy'],
                        ['name' => 'Gaji atau Tunjangan', 'count' => $countTable('salary_allowances'), 'policy' => 'master_dummy'],
                        ['name' => 'Departemen', 'count' => $countTable('departments'), 'policy' => 'dilindungi'],
                        ['name' => 'Pengguna Sistem', 'count' => $countTable('users'), 'policy' => 'pengguna_admin'],
                        ['name' => 'Akses Grup', 'count' => $countTable('access_groups'), 'policy' => 'dilindungi'],
                        ['name' => 'Log Aktivitas', 'count' => $countTable('activity_logs'), 'policy' => 'transaksi'],
                        ['name' => 'Preferensi Toko', 'count' => $countTable('preference_settings'), 'policy' => 'dilindungi'],
                    ],
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'transactions_count' => $totalTransactions,
                    'products_count' => $productsCount,
                    'customers_count' => $customersCount,
                    'suppliers_count' => $suppliersCount,
                    'employees_count' => $employeesCount,
                    'is_demo_active' => ($totalTransactions > 0 || $productsCount > 0),
                    'categories' => $categories,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membaca status database: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Membersihkan seluruh data demo (transaksi, produk contoh, kontak dummy)
     * dengan tetap melindungi akun Admin, Owner, COA (Akun Perkiraan), dan referensi pokok.
     */
    public function purgeDemoData(Request $request): JsonResponse
    {
        $user = $this->authorizeAdmin($request);

        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi konfirmasi tidak valid. Harap periksa kembali kata sandi akun Anda.',
            ], 422);
        }

        try {
            DB::transaction(function () use ($user): void {
                Schema::disableForeignKeyConstraints();

                // 1. Bersihkan transaksi & jurnal operasional
                DB::table('operation_document_user')->truncate();
                DB::table('operation_document_lines')->truncate();
                DB::table('operation_documents')->truncate();
                DB::table('inventory_batches')->truncate();
                DB::table('activity_logs')->truncate();

                // 2. Bersihkan master dummy barang & aset tetap
                DB::table('fixed_asset_expenses')->truncate();
                DB::table('fixed_asset_locations')->truncate();
                DB::table('fixed_assets')->truncate();
                DB::table('asset_tax_categories')->truncate();
                DB::table('asset_categories')->truncate();
                DB::table('products')->truncate();
                DB::table('product_categories')->truncate();
                DB::table('brands')->truncate();

                // 3. Bersihkan master dummy pihak ketiga
                DB::table('salary_allowances')->truncate();
                DB::table('employee_bank_accounts')->truncate();
                DB::table('employees')->truncate();
                DB::table('customers')->truncate();
                DB::table('suppliers')->truncate();
                DB::table('customer_categories')->truncate();
                DB::table('supplier_categories')->truncate();

                // 4. Bersihkan user dummy kasir, lindungi akun Admin & Owner
                $developerEmails = User::getDeveloperEmails();
                $ownerEmails = User::getOwnerEmails();
                $preservedUserIds = User::query()
                    ->whereIn('email', array_merge($developerEmails, $ownerEmails))
                    ->orWhere('id', $user->id)
                    ->pluck('id')
                    ->all();

                $dummyUserIds = User::whereNotIn('id', $preservedUserIds)->pluck('id')->all();
                if (! empty($dummyUserIds)) {
                    DB::table('role_user')->whereIn('user_id', $dummyUserIds)->delete();
                    DB::table('access_group_user')->whereIn('user_id', $dummyUserIds)->delete();
                    DB::table('account_user')->whereIn('user_id', $dummyUserIds)->delete();
                    User::whereIn('id', $dummyUserIds)->delete();
                }

                Schema::enableForeignKeyConstraints();
            });

            return response()->json([
                'success' => true,
                'message' => 'Seluruh data demo dan transaksi berhasil dibersihkan. Sistem kini siap digunakan untuk operasional riil.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal membersihkan data demo: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membersihkan data: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mereset seluruh transaksi dan jurnal saja, tanpa menghapus master produk atau kontak yang sudah diinput.
     */
    public function resetTransactionsOnly(Request $request): JsonResponse
    {
        $user = $this->authorizeAdmin($request);

        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi konfirmasi tidak valid. Harap periksa kembali kata sandi akun Anda.',
            ], 422);
        }

        try {
            DB::transaction(function (): void {
                Schema::disableForeignKeyConstraints();

                DB::table('operation_document_user')->truncate();
                DB::table('operation_document_lines')->truncate();
                DB::table('operation_documents')->truncate();
                DB::table('inventory_batches')->truncate();
                DB::table('activity_logs')->truncate();

                Schema::enableForeignKeyConstraints();
            });

            return response()->json([
                'success' => true,
                'message' => 'Seluruh riwayat transaksi dan jurnal berhasil direset. Data barang dan kontak Anda tetap aman.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal mereset transaksi: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset transaksi: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Memuat ulang seluruh data seeder (sampel/demo) lengkap ke database.
     */
    public function reseedDemoData(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        try {
            @ini_set('max_execution_time', 180);
            @set_time_limit(180);

            Artisan::call('db:seed', [
                '--class' => 'RealisticDataSeeder',
                '--force' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Seluruh data sampel seeder berhasil dimuat ulang ke dalam database.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal memuat ulang data sampel: '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat ulang data seeder: '.$e->getMessage(),
            ], 500);
        }
    }
}
