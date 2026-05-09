<?php

namespace App\Domain\Identity\Models;

use App\Domain\Support\Models\DomainModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NumberingSequence extends DomainModel
{
    protected $fillable = [
        'transaction_type',
        'name',
        'sequence_type',
        'counter_digits',
        'current_counter',
        'prefix',
        'suffix',
        'is_active',
    ];

    protected array $searchable = ['transaction_type', 'name', 'prefix', 'suffix'];

    protected function casts(): array
    {
        return [
            'counter_digits' => 'integer',
            'current_counter' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function components(): HasMany
    {
        return $this->hasMany(NumberingSequenceComponent::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
