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
        'category_id',
        'currency_id',
        'code',
        'name',
        'business_phone',
        'mobile_phone',
        'whatsapp_phone',
        'email',
        'fax',
        'website',
        'billing_address',
        'shipping_address',
        'credit_limit',
        'tax_number',
        'notes',
        'extended_details',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'business_phone', 'mobile_phone', 'email'];

    protected $appends = ['balance'];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'extended_details' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function getBalanceAttribute(): float
    {
        $invoiceBalance = (float) \App\Domain\Support\Models\OperationDocument::where('customer_id', $this->id)
            ->where('document_type', 'sales_invoice')
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhereNotIn('status', ['Void', 'Cancelled']);
            })
            ->sum('outstanding_amount');

        $openingBalance = 0.0;
        $details = $this->extended_details;
        if (is_array($details) && isset($details['openingBalanceRows']) && is_array($details['openingBalanceRows'])) {
            foreach ($details['openingBalanceRows'] as $row) {
                $amt = $row['amount'] ?? 0;
                if (is_string($amt)) {
                    $amt = (float) preg_replace('/[^\d.]/', '', str_replace(',', '.', $amt));
                }
                $openingBalance += (float) $amt;
            }
        }

        return round($invoiceBalance + $openingBalance, 2);
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
