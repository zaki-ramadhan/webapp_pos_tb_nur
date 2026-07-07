<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RealisticDataSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus data lama
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('operation_document_user')->truncate();
        DB::table('operation_document_lines')->truncate();
        DB::table('operation_documents')->truncate();
        DB::table('fixed_asset_locations')->truncate();
        DB::table('fixed_asset_expenses')->truncate();
        DB::table('fixed_assets')->truncate();
        DB::table('asset_tax_categories')->truncate();
        DB::table('asset_categories')->truncate();
        DB::table('products')->truncate();
        DB::table('product_categories')->truncate();
        DB::table('units')->truncate();
        DB::table('brands')->truncate();
        DB::table('customers')->truncate();
        DB::table('suppliers')->truncate();
        DB::table('customer_categories')->truncate();
        DB::table('supplier_categories')->truncate();
        DB::table('sales_categories')->truncate();
        DB::table('salary_allowances')->truncate();
        DB::table('accounts')->truncate();
        DB::table('currencies')->truncate();
        DB::table('taxes')->truncate();
        DB::table('employee_bank_accounts')->truncate();
        DB::table('employees')->truncate();
        DB::table('departments')->truncate();
        DB::table('warehouses')->truncate();
        DB::table('branches')->truncate();
        DB::table('role_user')->truncate();
        DB::table('roles')->truncate();
        DB::table('access_group_user')->truncate();
        DB::table('access_group_permissions')->truncate();
        DB::table('access_groups')->truncate();
        DB::table('activity_logs')->truncate();
        DB::table('users')->truncate();
        DB::table('report_catalogs')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Panggil seeder modular secara berurutan
        $this->call([
            CoreOrganizationSeeder::class,
            FinancialEntitySeeder::class,
            PartyEntitySeeder::class,
            InventoryEntitySeeder::class,
            SecuritySeeder::class,
            TransactionDataSeeder::class,
        ]);
    }
}
