<?php

namespace App\Support\Presentation\Blueprints\Pages;

class NumberingHelper
{
    /**
     * Get the standardized numbering options for cash/bank transactions.
     * Shared across Cash Receipt, Cash Payment, and Bank Transfer pages.
     *
     * @return array<string>
     */
    public static function getCashBankNumberingOptions(): array
    {
        return [
            'Nomor Bukti Kas/Bank',
            'Kas & Bank',
            'Kas Kecil',
            'Bank',
            'Transfer Bank',
        ];
    }
}
