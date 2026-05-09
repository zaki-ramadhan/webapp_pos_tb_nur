<?php

namespace App\Domain\Identity\Models;

use App\Domain\Support\Models\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NumberingSequenceComponent extends DomainModel
{
    protected $fillable = [
        'numbering_sequence_id',
        'component_key',
        'component_value',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(NumberingSequence::class, 'numbering_sequence_id');
    }
}
