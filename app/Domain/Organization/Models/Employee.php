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
        'employee_id_type',
        'salutation',
        'full_name',
        'position',
        'email',
        'mobile_phone',
        'office_phone',
        'home_phone',
        'whatsapp_phone',
        'website',
        'identity_number',
        'street',
        'city',
        'postal_code',
        'province',
        'country',
        'nationality',
        'employment_status',
        'joined_at',
        'tax_status',
        'subject_to_income_tax',
        'tax_number',
        'tax_allowance_applies',
        'tax_allowance_status',
        'tax_start_month',
        'tax_start_year',
        'previous_income',
        'previous_tax',
        'is_salesperson',
        'user_id',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['employee_code', 'full_name', 'position', 'email', 'mobile_phone'];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'subject_to_income_tax' => 'boolean',
            'is_salesperson' => 'boolean',
            'previous_income' => 'decimal:2',
            'previous_tax' => 'decimal:2',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function attachments(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(\App\Domain\Support\Models\Attachment::class, 'attachable');
    }
}
