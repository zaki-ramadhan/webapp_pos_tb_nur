<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tax extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'tax_type',
        'rate',
        'output_account_id',
        'input_account_id',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'tax_type'];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:4',
            'is_active' => 'boolean',
        ];
    }

    public function outputAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'output_account_id');
    }

    public function inputAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'input_account_id');
    }
}
