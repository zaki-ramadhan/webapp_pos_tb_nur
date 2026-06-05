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
    ];

    protected array $searchable = ['code', 'barcode', 'name', 'product_type'];

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
}
