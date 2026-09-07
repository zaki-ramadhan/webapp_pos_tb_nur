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
     * Mendapatkan statistik data saat ini dan status mode database.
     */
    public function status(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        try {
            $transactionsCount = DB::table('operation_documents')->count();
            $productsCount = DB::table('products')->count();
            $customersCount = DB::table('customers')->count();
            $suppliersCount = DB::table('suppliers')->count();
            $employeesCount = DB::table('employees')->count();

            $isDemoActive = ($transactionsCount > 0 || $productsCount > 0);

            return response()->json([
                'success' => true,
                'data' => [
                    'transactions_count' => $transactionsCount,
                    'products_count' => $productsCount,
                    'customers_count' => $customersCount,
                    'suppliers_count' => $suppliersCount,
                    'employees_count' => $employeesCount,
                    'is_demo_active' => $isDemoActive,
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
