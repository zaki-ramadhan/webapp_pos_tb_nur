<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\OperationDocument;
use Illuminate\Database\Eloquent\Builder;

class GeneralJournal extends OperationDocument
{
    protected static function booted(): void
    {
        static::addGlobalScope('document_type', function (Builder $builder): void {
            $builder->where('document_type', 'general_journal');
        });

        static::creating(function (self $record): void {
            if (! filled($record->document_type)) {
                $record->document_type = 'general_journal';
            }
        });
    }
}
