<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RealisticDataSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus data lama
        $tablesToTruncate = [
            'operation_document_user',
            'operation_document_lines',
            'operation_documents',
            'fixed_asset_locations',
            'fixed_asset_expenses',
            'fixed_assets',
            'asset_tax_categories',
            'asset_categories',
            'product_group_items',
            'product_unit_conversions',
            'product_prices',
            'supplier_prices',
            'products',
            'product_categories',
            'units',
            'brands',
            'customers',
            'suppliers',
            'customer_categories',
            'salary_allowances',
            'accounts',
            'currencies',
            'taxes',
            'employee_bank_accounts',
            'employees',
            'warehouses',
            'branches',
            'role_user',
            'roles',
            'access_group_user',
            'access_group_permissions',
            'access_groups',
            'activity_logs',
            'users',
            'report_catalogs',
        ];

        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        foreach ($tablesToTruncate as $table) {
            if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

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
