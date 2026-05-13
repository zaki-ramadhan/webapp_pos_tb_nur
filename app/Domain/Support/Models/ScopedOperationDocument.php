<?php

namespace App\Domain\Support\Models;

use Illuminate\Database\Eloquent\Builder;

abstract class ScopedOperationDocument extends OperationDocument
{
    abstract protected static function documentType(): string;

    protected static function booted(): void
    {
        static::addGlobalScope('document_type', function (Builder $query): void {
            $query->where('document_type', static::documentType());
        });

        static::creating(function (self $record): void {
            if (! filled($record->document_type)) {
                $record->document_type = static::documentType();
            }
        });
    }
}
