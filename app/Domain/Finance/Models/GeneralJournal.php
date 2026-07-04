<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\OperationDocument;

class GeneralJournal extends OperationDocument
{
    protected static function booted(): void
    {
        static::creating(function (self $record): void {
            if (! filled($record->document_type)) {
                $record->document_type = 'general_journal';
            }
        });
    }
}
