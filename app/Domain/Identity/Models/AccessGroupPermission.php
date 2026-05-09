<?php

namespace App\Domain\Identity\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessGroupPermission extends DomainModel
{
    protected $fillable = [
        'access_group_id',
        'menu_key',
        'can_access',
        'can_create',
        'can_update',
        'can_delete',
        'can_view',
    ];

    protected function casts(): array
    {
        return [
            'can_access' => 'boolean',
            'can_create' => 'boolean',
            'can_update' => 'boolean',
            'can_delete' => 'boolean',
            'can_view' => 'boolean',
        ];
    }

    public function accessGroup(): BelongsTo
    {
        return $this->belongsTo(AccessGroup::class);
    }
}
