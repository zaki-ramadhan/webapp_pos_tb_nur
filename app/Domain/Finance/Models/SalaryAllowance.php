<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryAllowance extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'allowance_type',
        'account_id',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'allowance_type', 'notes'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
