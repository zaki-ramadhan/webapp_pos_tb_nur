<?php

namespace App\Domain\Organization\Models;

use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Finance\Models\Account;
use App\Domain\Identity\Models\TransactionApprovalRule;
use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'phone',
        'email',
        'street',
        'city',
        'postal_code',
        'province',
        'country',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'phone', 'email', 'city', 'province'];

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

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }

    public function accounts(): BelongsToMany
    {
        return $this->belongsToMany(Account::class);
    }

    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'customer_branch');
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, 'branch_supplier');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function transactionApprovalRules(): HasMany
    {
        return $this->hasMany(TransactionApprovalRule::class);
    }
}
