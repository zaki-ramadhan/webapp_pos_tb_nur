<?php

namespace App\Domain\Inventory\Models;

use App\Domain\Catalog\Models\Brand;
use App\Domain\Catalog\Models\ProductCategory;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use App\Domain\Partner\Models\Supplier;
use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryDocument extends DomainModel
{
    protected $table = 'inventory_documents';

    protected $fillable = [
        'document_type',
        'branch_id',
        'department_id',
        'warehouse_id',
        'counterpart_warehouse_id',
        'related_document_id',
        'product_category_id',
        'brand_id',
        'supplier_id',
        'responsible_user_id',
        'document_number',
        'reference_number',
        'request_type',
        'process_type',
        'numbering_type',
        'status',
        'document_date',
        'effective_date',
        'is_closed',
        'notes',
        'metadata',
    ];

    protected array $searchable = [
        'document_number',
        'reference_number',
        'request_type',
        'process_type',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'document_date' => 'date',
            'effective_date' => 'date',
            'is_closed' => 'boolean',
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

    public function relatedDocument(): BelongsTo
    {
        return $this->belongsTo(self::class, 'related_document_id');
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'inventory_document_user', 'inventory_document_id', 'user_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InventoryDocumentLine::class, 'inventory_document_id');
    }
}
