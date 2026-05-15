<?php

namespace App\Domain\Organization\Models;

use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends DomainModel
{
    protected $fillable = [
        'code',
        'name',
        'notes',
        'parent_department_id',
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

    public function parentDepartment(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_department_id');
    }

    public function childDepartments(): HasMany
    {
        return $this->hasMany(self::class, 'parent_department_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
