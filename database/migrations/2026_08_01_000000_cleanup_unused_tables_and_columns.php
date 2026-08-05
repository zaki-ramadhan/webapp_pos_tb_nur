<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Drop unused tables
        Schema::dropIfExists('product_prices');
        Schema::dropIfExists('product_unit_conversions');
        Schema::dropIfExists('supplier_prices');
        Schema::dropIfExists('sales_checkins');
        Schema::dropIfExists('sales_categories');
        Schema::dropIfExists('transaction_approval_rule_steps');
        Schema::dropIfExists('transaction_approval_rules');
        Schema::dropIfExists('department_user');
        Schema::dropIfExists('departments');

        // 2. Drop unused department_id columns
        if (Schema::hasColumn('operation_documents', 'department_id')) {
            Schema::table('operation_documents', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            });
        }
        if (Schema::hasColumn('operation_document_lines', 'department_id')) {
            Schema::table('operation_document_lines', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            });
        }
        if (Schema::hasColumn('inventory_documents', 'department_id')) {
            Schema::table('inventory_documents', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            });
        }
        if (Schema::hasColumn('inventory_document_lines', 'department_id')) {
            Schema::table('inventory_document_lines', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            });
        }
        if (Schema::hasColumn('fixed_assets', 'department_id')) {
            Schema::table('fixed_assets', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            });
        }
        if (Schema::hasColumn('employees', 'department_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            });
        }

        // 3. Drop unused employee salesperson column
        if (Schema::hasColumn('employees', 'is_salesperson')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('is_salesperson');
            });
        }

        // 4. Drop unused product COA override columns
        Schema::table('products', function (Blueprint $table) {
            $cols = [
                'inventory_account_id', 'sales_account_id', 'sales_return_account_id',
                'sales_discount_account_id', 'delivered_goods_account_id', 'cogs_account_id',
                'purchase_return_account_id', 'uninvoiced_purchase_account_id'
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('products', $col)) {
                    $table->dropForeign([$col]);
                    $table->dropColumn($col);
                }
            }
        });

        // 5. Drop unused supplier & customer corporate contact columns
        Schema::table('suppliers', function (Blueprint $table) {
            foreach (['fax', 'website', 'tax_number', 'extended_details'] as $col) {
                if (Schema::hasColumn('suppliers', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
        Schema::table('customers', function (Blueprint $table) {
            foreach (['fax', 'website', 'tax_number', 'extended_details'] as $col) {
                if (Schema::hasColumn('customers', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 6. Drop unused fixed_asset intangible column
        if (Schema::hasColumn('fixed_assets', 'is_intangible')) {
            Schema::table('fixed_assets', function (Blueprint $table) {
                $table->dropColumn('is_intangible');
            });
        }

        // 8. Drop unused product_categories COA account override columns
        Schema::table('product_categories', function (Blueprint $table) {
            $catCols = [
                'inventory_account_id', 'expense_account_id', 'sales_account_id',
                'sales_return_account_id', 'sales_discount_account_id', 'goods_in_transit_account_id',
                'cost_of_goods_sold_account_id', 'purchase_return_account_id', 'unbilled_purchase_account_id'
            ];
            foreach ($catCols as $col) {
                if (Schema::hasColumn('product_categories', $col)) {
                    $table->dropForeign([$col]);
                    $table->dropColumn($col);
                }
            }
        });

        // 9. Drop unused corporate ERP columns on operation_documents
        Schema::table('operation_documents', function (Blueprint $table) {
            $opCols = ['tax_id', 'external_number', 'numbering_type', 'process_type', 'shipping_date', 'effective_date', 'flags'];
            foreach ($opCols as $col) {
                if (Schema::hasColumn('operation_documents', $col)) {
                    if ($col === 'tax_id') {
                        $table->dropForeign(['tax_id']);
                    }
                    $table->dropColumn($col);
                }
            }
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op for cleanup
    }
};
