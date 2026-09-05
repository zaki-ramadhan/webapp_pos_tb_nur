<?php

namespace App\Support\Presentation\Blueprints\Pages;

class NumberingHelper
{
    /**
     * Get the standardized numbering options for cash/bank transactions.
     * Shared across Cash Receipt and Cash Payment pages.
     *
     * @return array<string>
     */
    public static function getCashBankNumberingOptions(): array
    {
        return [
            'Nomor Bukti Kas (Tunai)',
            'Nomor Bukti Bank (Transfer)',
        ];
    }
}
