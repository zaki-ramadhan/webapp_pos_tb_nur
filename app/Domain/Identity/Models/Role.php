<?php

namespace App\Domain\Identity\Models;

use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'is_active',
    ];

    protected array $searchable = ['code', 'name'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function approvalSteps(): HasMany
    {
        return $this->hasMany(TransactionApprovalRuleStep::class, 'approver_role_id');
    }
}
