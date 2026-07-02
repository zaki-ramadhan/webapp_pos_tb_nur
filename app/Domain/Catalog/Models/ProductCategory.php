<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends DomainModel
{
    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'slug',
        'is_default',
        'is_active',
        'inventory_account_id',
        'expense_account_id',
        'sales_account_id',
        'sales_return_account_id',
        'sales_discount_account_id',
        'goods_in_transit_account_id',
        'cost_of_goods_sold_account_id',
        'purchase_return_account_id',
        'unbilled_purchase_account_id',
    ];

    protected array $searchable = ['code', 'name', 'slug'];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    public function inventoryAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'inventory_account_id');
    }

    public function expenseAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'expense_account_id');
    }

    public function salesAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'sales_account_id');
    }

    public function salesReturnAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'sales_return_account_id');
    }

    public function salesDiscountAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'sales_discount_account_id');
    }

    public function goodsInTransitAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'goods_in_transit_account_id');
    }

    public function costOfGoodsSoldAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'cost_of_goods_sold_account_id');
    }

    public function purchaseReturnAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'purchase_return_account_id');
    }

    public function unbilledPurchaseAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'unbilled_purchase_account_id');
    }
}
