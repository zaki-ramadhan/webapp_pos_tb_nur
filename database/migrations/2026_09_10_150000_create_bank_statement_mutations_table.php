<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bank_statement_mutations')) {
            Schema::create('bank_statement_mutations', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('account_id')->nullable()->index();
                $table->string('bank_account_number', 100)->index();
                $table->string('bank_name', 150)->nullable();
                $table->string('import_file_name', 255)->nullable();
                $table->date('transaction_date')->index();
                $table->text('description');
                $table->decimal('amount', 18, 2);
                $table->string('type', 10);
                $table->decimal('balance', 18, 2)->default(0);
                $table->string('status', 50)->default('Unreconciled')->index();
                $table->timestamps();

                $table->index(['bank_account_number', 'transaction_date'], 'bsm_acc_date_idx');
                $table->index(['account_id', 'transaction_date'], 'bsm_aid_date_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_statement_mutations');
    }
};
