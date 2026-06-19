<?php

namespace App\Domain\Finance\Models;

use App\Domain\Support\Models\ScopedOperationDocument;

class PeriodEnd extends ScopedOperationDocument
{
    protected static function documentType(): string
    {
        return 'period_end';
    }

    protected $appends = [
        'month',
        'year',
        'rates',
        'month_value',
        'year_value',
        'document_date',
        'date',
    ];

    public function getMonthAttribute(): ?string
    {
        return $this->metadata['month'] ?? null;
    }

    public function getYearAttribute(): ?string
    {
        return $this->metadata['year'] ?? null;
    }

    public function getRatesAttribute(): array
    {
        return $this->metadata['rates'] ?? [];
    }

    public function getMonthValueAttribute(): string
    {
        if (!empty($this->metadata['month']) && !empty($this->metadata['year'])) {
            $monthsMap = [
                'Januari' => 'january',
                'Februari' => 'february',
                'Maret' => 'march',
                'April' => 'april',
                'Mei' => 'may',
                'Juni' => 'june',
                'Juli' => 'july',
                'Agustus' => 'august',
                'September' => 'september',
                'Oktober' => 'october',
                'November' => 'november',
                'Desember' => 'december',
            ];
            $monthIndo = $this->metadata['month'];
            $monthEng = $monthsMap[$monthIndo] ?? strtolower($monthIndo);
            return $monthEng . '-' . $this->metadata['year'];
        }
        return '';
    }

    public function getYearValueAttribute(): string
    {
        return $this->metadata['year'] ?? '';
    }

    public function getDocumentDateAttribute(): ?string
    {
        return $this->entry_date ? $this->entry_date->format('d/m/Y') : null;
    }

    public function getDateAttribute(): ?string
    {
        return $this->entry_date ? $this->entry_date->format('d/m/Y') : null;
    }
}
