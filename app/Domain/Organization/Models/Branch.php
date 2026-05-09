<?php

namespace App\Domain\Organization\Models;

use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'phone',
        'email',
        'street',
        'city',
        'postal_code',
        'province',
        'country',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'phone', 'email', 'city', 'province'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }
}
