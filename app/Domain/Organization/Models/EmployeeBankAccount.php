<?php

namespace App\Domain\Organization\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeBankAccount extends DomainModel
{
    protected $fillable = [
        'employee_id',
        'bank_name',
        'account_name',
        'account_number',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
