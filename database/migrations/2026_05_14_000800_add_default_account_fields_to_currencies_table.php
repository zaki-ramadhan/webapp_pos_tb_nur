<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const ACCOUNT_COLUMNS = [
        'accounts_payable_account_id',
        'accounts_receivable_account_id',
        'purchase_advance_account_id',
        'sales_advance_account_id',
        'sales_discount_account_id',
        'realized_gain_loss_account_id',
        'unrealized_gain_loss_account_id',
    ];

    public function up(): void
    {
        if (! Schema::hasTable('currencies')) {
            return;
        }

        Schema::table('currencies', function (Blueprint $table): void {
            foreach (self::ACCOUNT_COLUMNS as $column) {
                if (! Schema::hasColumn('currencies', $column)) {
                    $table->foreignId($column)->nullable()->constrained('accounts')->nullOnDelete();
                }
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('currencies')) {
            return;
        }

        Schema::table('currencies', function (Blueprint $table): void {
            foreach (self::ACCOUNT_COLUMNS as $column) {
                if (Schema::hasColumn('currencies', $column)) {
                    $table->dropConstrainedForeignId($column);
                }
            }
        });
    }
};
