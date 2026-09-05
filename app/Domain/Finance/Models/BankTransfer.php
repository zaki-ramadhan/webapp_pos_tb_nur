<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class BankTransfer extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'bank_transfer';
    }

    protected static function booted(): void
    {
        parent::booted();

        static::saving(function (self $model): void {
            if (empty(trim($model->notes ?? ''))) {
                $fromName = $model->primaryAccount?->name ?? 'Kas/Bank Asal';
                $toName = $model->secondaryAccount?->name ?? 'Kas/Bank Tujuan';
                $model->notes = "Transfer dari {$fromName} ke {$toName}";
            }
        });
    }
}
