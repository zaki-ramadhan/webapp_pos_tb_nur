<?php

namespace App\Domain\Inventory\Models;

use Illuminate\Database\Eloquent\Builder;

abstract class AbstractInventoryDocument extends InventoryDocument
{
    abstract protected static function documentType(): string;

    public static function backendDocumentType(): string
    {
        return static::documentType();
    }

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
