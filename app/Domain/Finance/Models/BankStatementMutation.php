<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankStatementMutation extends DomainModel
{
    protected $table = 'bank_statement_mutations';

    protected $fillable = [
        'account_id',
        'bank_account_number',
        'bank_name',
        'import_file_name',
        'transaction_date',
        'description',
        'amount',
        'type',
        'balance',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
            'balance' => 'decimal:2',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
