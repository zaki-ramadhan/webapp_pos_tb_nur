<?php

namespace App\Domain\Catalog\Models;

use App\Domain\Organization\Models\Branch;
use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Warehouse extends DomainModel
{
    protected $fillable = [
        'branch_id',
        'code',
        'name',
        'warehouse_type',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'warehouse_type'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
