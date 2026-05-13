<?php

namespace App\Domain\Asset\Models;

use App\Domain\Finance\Models\Account;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedAssetExpense extends DomainModel
{
    protected $fillable = [
        'account_id',
        'code',
        'description',
        'expense_date',
        'amount',
        'notes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'expense_date' => 'date',
            'amount' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function fixedAsset(): BelongsTo
    {
        return $this->belongsTo(FixedAsset::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
