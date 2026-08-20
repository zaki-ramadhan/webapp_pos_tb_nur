<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Support\Models\DomainModel;
use App\Domain\Support\Traits\HasAttachments;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends DomainModel
{
    use HasAttachments, SoftDeletes;
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
        'item_condition',
        'expiry_date',
        'condition_notes',
        'minimum_stock',
        'default_purchase_price',
        'default_sale_price',
        'notes',
        'is_active',
        'print_group_details',
        'allow_edit_group_quantity',
        'use_group_price',
    ];

    protected array $searchable = ['code', 'barcode', 'name', 'product_type', 'item_condition'];

    protected $appends = ['main_supplier', 'main_supplier_id'];

    public function getMainSupplierAttribute(): ?array
    {
        return null;
    }

    public function getMainSupplierIdAttribute(): ?int
    {
        return null;
    }

    protected static function boot()
    {
        parent::boot();
        static::saving(function ($product) {
            if (is_null($product->category_id)) {
                $defaultCat = ProductCategory::where('is_default', true)->first();
                if ($defaultCat) {
                    $product->category_id = $defaultCat->id;
                }
            }
            if (is_null($product->item_condition)) {
                $product->item_condition = 'normal';
            }
            if (is_null($product->minimum_stock)) {
                $product->minimum_stock = 0;
            }
            if (is_null($product->default_purchase_price)) {
                $product->default_purchase_price = 0;
            }
            if (is_null($product->default_sale_price)) {
                $product->default_sale_price = 0;
            }

            if (!\Illuminate\Support\Facades\Schema::hasColumn('products', 'item_condition')) {
                unset($product->attributes['item_condition'], $product->attributes['expiry_date'], $product->attributes['condition_notes']);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'minimum_stock' => 'decimal:2',
            'default_purchase_price' => 'decimal:2',
            'default_sale_price' => 'decimal:2',
            'expiry_date' => 'date',
            'is_active' => 'boolean',
            'print_group_details' => 'boolean',
            'allow_edit_group_quantity' => 'boolean',
        ];
    }

    public function groupItems(): HasMany
    {
        return $this->hasMany(ProductGroupItem::class, 'parent_product_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
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
}
