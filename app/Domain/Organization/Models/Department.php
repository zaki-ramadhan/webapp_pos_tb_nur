<?php

namespace App\Domain\Organization\Models;

use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'notes',
        'is_active',
    ];

    protected array $searchable = ['code', 'name', 'notes'];

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

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
