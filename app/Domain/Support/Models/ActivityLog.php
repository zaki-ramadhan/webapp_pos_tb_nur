<?php

namespace App\Domain\Support\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends DomainModel
{
    protected $fillable = [
        'log_group',
        'resource_key',
        'resource_label',
        'permission_key',
        'action',
        'subject_type',
        'subject_id',
        'subject_label',
        'document_number',
        'description',
        'actor_user_id',
        'actor_name',
        'actor_email',
        'ip_address',
        'occurred_at',
        'before_payload',
        'after_payload',
        'metadata',
    ];

    protected array $searchable = [
        'resource_key',
        'resource_label',
        'permission_key',
        'action',
        'subject_label',
        'document_number',
        'description',
        'actor_name',
        'actor_email',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'before_payload' => 'array',
            'after_payload' => 'array',
            'metadata' => 'array',
        ];
    }

    public function actorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
