<?php

namespace App\Domain\Partner\Models;

use App\Domain\Finance\Models\Currency;
use App\Domain\Organization\Models\Branch;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Customer extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'mobile_phone',
        'email',
        'billing_address',
        'shipping_address',
        'credit_limit',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'mobile_phone', 'email'];

    protected $appends = [];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function getBalanceAttribute(): float
    {
        if (array_key_exists('balance', $this->attributes)) {
            return (float) $this->attributes['balance'];
        }

        return (float) \App\Domain\Support\Models\OperationDocument::where('customer_id', $this->id)
            ->where('document_type', 'sales_invoice')
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhereNotIn('status', ['Void', 'Cancelled']);
            })
            ->sum('outstanding_amount');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CustomerCategory::class, 'category_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'customer_branch');
    }
}
