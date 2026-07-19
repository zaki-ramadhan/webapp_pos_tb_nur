<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;
use App\Domain\Support\Traits\HasAttachments;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends DomainModel
{
    use HasAttachments;
    protected $fillable = [
        'category_id',
        'brand_id',
        'base_unit_id',
        'purchase_unit_id',
        'sales_unit_id',
        'code',
        'barcode',
        'name',
        'product_type',
        'minimum_stock',
        'default_purchase_price',
        'default_sale_price',
        'notes',
        'is_active',
        'inventory_account_id',
        'sales_account_id',
        'sales_return_account_id',
        'sales_discount_account_id',
        'delivered_goods_account_id',
        'cogs_account_id',
        'purchase_return_account_id',
        'uninvoiced_purchase_account_id',
    ];

    protected array $searchable = ['code', 'barcode', 'name', 'product_type'];

    protected static function boot()
    {
        parent::boot();
        static::saving(function ($product) {
            if (is_null($product->minimum_stock)) {
                $product->minimum_stock = 0;
            }
            if (is_null($product->default_purchase_price)) {
                $product->default_purchase_price = 0;
            }
            if (is_null($product->default_sale_price)) {
                $product->default_sale_price = 0;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'minimum_stock' => 'decimal:2',
            'default_purchase_price' => 'decimal:2',
            'default_sale_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function baseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'base_unit_id');
    }

    public function purchaseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'purchase_unit_id');
    }

    public function salesUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'sales_unit_id');
    }

    public function unitConversions(): HasMany
    {
        return $this->hasMany(ProductUnitConversion::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function supplierPrices(): HasMany
    {
        return $this->hasMany(SupplierPrice::class);
    }

    public function inventoryAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'inventory_account_id');
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

    public function deliveredGoodsAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'delivered_goods_account_id');
    }

    public function cogsAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'cogs_account_id');
    }

    public function purchaseReturnAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'purchase_return_account_id');
    }

    public function uninvoicedPurchaseAccount(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Finance\Models\Account::class, 'uninvoiced_purchase_account_id');
    }
}
