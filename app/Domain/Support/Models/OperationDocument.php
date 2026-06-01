<?php

namespace App\Domain\Support\Models;

use App\Domain\Asset\Models\FixedAsset;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Finance\Models\Account;
use App\Domain\Finance\Models\Currency;
use App\Domain\Finance\Models\PaymentTerm;
use App\Domain\Finance\Models\Tax;
use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OperationDocument extends DomainModel
{
    protected $table = 'operation_documents';

    protected $fillable = [
        'document_type',
        'branch_id',
        'department_id',
        'warehouse_id',
        'counterpart_warehouse_id',
        'customer_id',
        'supplier_id',
        'currency_id',
        'payment_term_id',
        'primary_account_id',
        'secondary_account_id',
        'tax_id',
        'related_document_id',
        'responsible_user_id',
        'document_number',
        'external_number',
        'reference_number',
        'numbering_type',
        'status',
        'process_type',
        'payment_method',
        'entry_date',
        'due_date',
        'shipping_date',
        'check_date',
        'effective_date',
        'is_closed',
        'subtotal',
        'discount_total',
        'tax_total',
        'total_amount',
        'paid_amount',
        'outstanding_amount',
        'flags',
        'metadata',
        'notes',
    ];

    protected array $searchable = [
        'document_number',
        'external_number',
        'reference_number',
        'status',
        'process_type',
        'payment_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'due_date' => 'date',
            'shipping_date' => 'date',
            'check_date' => 'date',
            'effective_date' => 'date',
            'is_closed' => 'boolean',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'outstanding_amount' => 'decimal:2',
            'flags' => 'array',
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

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function counterpartWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'counterpart_warehouse_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function paymentTerm(): BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function primaryAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'primary_account_id');
    }

    public function secondaryAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'secondary_account_id');
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function relatedDocument(): BelongsTo
    {
        return $this->belongsTo(self::class, 'related_document_id');
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'operation_document_user', 'operation_document_id', 'user_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(OperationDocumentLine::class, 'operation_document_id');
    }
}
