<?php

namespace App\Domain\Asset\Models;

use App\Domain\Finance\Models\Account;
use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FixedAsset extends DomainModel
{
    protected $fillable = [
        'asset_category_id',
        'asset_tax_category_id',
        'branch_id',
        'department_id',
        'asset_account_id',
        'accumulated_depreciation_account_id',
        'depreciation_expense_account_id',
        'code',
        'name',
        'purchase_date',
        'usage_date',
        'is_intangible',
        'depreciation_method',
        'quantity',
        'asset_life_years',
        'asset_life_months',
        'depreciation_ratio',
        'residual_value',
        'acquisition_cost',
        'book_value',
        'tax_enabled',
        'last_depreciation_at',
        'initial_location_name',
        'initial_location_address',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'initial_location_name', 'notes'];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'usage_date' => 'date',
            'is_intangible' => 'boolean',
            'quantity' => 'integer',
            'asset_life_years' => 'integer',
            'asset_life_months' => 'integer',
            'depreciation_ratio' => 'decimal:4',
            'residual_value' => 'decimal:2',
            'acquisition_cost' => 'decimal:2',
            'book_value' => 'decimal:2',
            'tax_enabled' => 'boolean',
            'last_depreciation_at' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function taxCategory(): BelongsTo
    {
        return $this->belongsTo(AssetTaxCategory::class, 'asset_tax_category_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function assetAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'asset_account_id');
    }

    public function accumulatedDepreciationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'accumulated_depreciation_account_id');
    }

    public function depreciationExpenseAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'depreciation_expense_account_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(FixedAssetExpense::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(FixedAssetLocation::class);
    }
}
