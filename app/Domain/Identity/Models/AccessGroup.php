<?php

namespace App\Domain\Identity\Models;

use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccessGroup extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'description'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(AccessGroupPermission::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
