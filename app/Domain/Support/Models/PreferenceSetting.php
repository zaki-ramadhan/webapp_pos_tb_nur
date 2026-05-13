<?php

namespace App\Domain\Support\Models;

class PreferenceSetting extends DomainModel
{
    protected $fillable = [
        'group_key',
        'setting_key',
        'scope_type',
        'scope_key',
        'label',
        'data_type',
        'value',
        'is_active',
        'notes',
    ];

    protected array $searchable = [
        'group_key',
        'setting_key',
        'scope_type',
        'scope_key',
        'label',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
