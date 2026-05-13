<?php

namespace App\Domain\Asset\Models;

use App\Domain\Finance\Models\Account;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetCategory extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'depreciation_method',
        'asset_life_months',
        'depreciation_rate',
        'asset_account_id',
        'accumulated_depreciation_account_id',
        'depreciation_expense_account_id',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'depreciation_method', 'notes'];

    protected function casts(): array
    {
        return [
            'asset_life_months' => 'integer',
            'depreciation_rate' => 'decimal:4',
            'is_active' => 'boolean',
        ];
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

    public function fixedAssets(): HasMany
    {
        return $this->hasMany(FixedAsset::class);
    }
}
