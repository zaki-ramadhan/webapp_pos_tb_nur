<?php

namespace App\Domain\Support\Models;

use App\Domain\Asset\Models\FixedAsset;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Finance\Models\Account;
use App\Domain\Organization\Models\Department;
use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationDocumentLine extends DomainModel
{
    protected $fillable = [
        'line_type',
        'product_id',
        'fixed_asset_id',
        'account_id',
        'unit_id',
        'warehouse_id',
        'department_id',
        'customer_id',
        'supplier_id',
        'description',
        'reference_code',
        'quantity',
        'unit_price',
        'discount_amount',
        'tax_amount',
        'debit_amount',
        'credit_amount',
        'total_amount',
        'line_date',
        'due_date',
        'attributes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'debit_amount' => 'decimal:2',
            'credit_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'line_date' => 'date',
            'due_date' => 'date',
            'attributes' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(OperationDocument::class, 'operation_document_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function fixedAsset(): BelongsTo
    {
        return $this->belongsTo(FixedAsset::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
