<?php

namespace App\Domain\Identity\Models;

use App\Domain\Organization\Models\Branch;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionApprovalRule extends DomainModel
{
    protected $fillable = [
        'rule_name',
        'transaction_type',
        'branch_id',
        'threshold_amount',
        'is_active',
    ];

    protected array $searchable = ['rule_name', 'transaction_type'];

    protected function casts(): array
    {
        return [
            'threshold_amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(TransactionApprovalRuleStep::class);
    }
}
