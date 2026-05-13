<?php

namespace App\Domain\Sales\Models;

use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use App\Domain\Partner\Models\Customer;
use App\Domain\Support\Models\DomainModel;
use App\Domain\Support\Models\OperationDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesCheckin extends DomainModel
{
    protected $fillable = [
        'branch_id',
        'department_id',
        'customer_id',
        'sales_user_id',
        'related_document_id',
        'checkin_number',
        'transaction_name',
        'checked_in_at',
        'notes',
        'metadata',
    ];

    protected array $searchable = [
        'checkin_number',
        'transaction_name',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
            'metadata' => 'array',
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_user_id');
    }

    public function relatedDocument(): BelongsTo
    {
        return $this->belongsTo(OperationDocument::class, 'related_document_id');
    }
}
