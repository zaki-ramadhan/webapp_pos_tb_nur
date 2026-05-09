<?php

namespace App\Domain\Partner\Models;

use App\Domain\Finance\Models\Currency;
use App\Domain\Finance\Models\PaymentTerm;
use App\Domain\Organization\Models\Branch;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Customer extends DomainModel
{
    protected $fillable = [
        'category_id',
        'currency_id',
        'payment_term_id',
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
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'business_phone', 'mobile_phone', 'email'];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CustomerCategory::class, 'category_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function paymentTerm(): BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'customer_branch');
    }
}
