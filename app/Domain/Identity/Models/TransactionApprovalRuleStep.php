<?php

namespace App\Domain\Identity\Models;

use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionApprovalRuleStep extends DomainModel
{
    protected $fillable = [
        'transaction_approval_rule_id',
        'approver_user_id',
        'approver_role_id',
        'step_order',
        'min_approvals',
    ];

    protected function casts(): array
    {
        return [
            'step_order' => 'integer',
            'min_approvals' => 'integer',
        ];
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(TransactionApprovalRule::class, 'transaction_approval_rule_id');
    }

    public function approverUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_user_id');
    }

    public function approverRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'approver_role_id');
    }
}
