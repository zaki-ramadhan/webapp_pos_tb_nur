<?php

namespace App\Domain\Organization\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends DomainModel
{
    protected $fillable = [
        'branch_id',
        'department_id',
        'employee_code',
        'salutation',
        'full_name',
        'position',
        'email',
        'mobile_phone',
        'office_phone',
        'whatsapp_phone',
        'nationality',
        'employment_status',
        'joined_at',
        'tax_status',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['employee_code', 'full_name', 'position', 'email', 'mobile_phone'];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(EmployeeBankAccount::class);
    }
}
