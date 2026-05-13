<?php

namespace App\Domain\Support\Models;

class ReportCatalog extends DomainModel
{
    protected $fillable = [
        'category_key',
        'section_key',
        'report_key',
        'title',
        'section_label',
        'icon',
        'description',
        'is_active',
        'sort_order',
        'metadata',
    ];

    protected array $searchable = [
        'category_key',
        'section_key',
        'report_key',
        'title',
        'section_label',
        'icon',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
