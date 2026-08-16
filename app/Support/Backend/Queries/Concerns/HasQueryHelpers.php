<?php

namespace App\Support\Backend\Queries\Concerns;

use App\Support\Backend\Queries\ArrayPaginatorFactory;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

trait HasQueryHelpers
{
    protected function resolveDateFilter(mixed $value): ?CarbonInterface
    {
        if (! filled($value)) {
            return null;
        }

        $str = trim((string) $value);

        if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $str)) {
            try {
                return Carbon::createFromFormat('d/m/Y', $str)->startOfDay();
            } catch (\Throwable) {
                // fallback
            }
        }

        try {
            return Carbon::parse($str);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @param  array<string, mixed>  $filters
     */
    protected function paginateRows(Collection $rows, array $filters): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 100));
        $page = max(1, (int) ($filters['page'] ?? request()->query('page', 1)));

        return ArrayPaginatorFactory::make($rows, $perPage, $page);
    }

    protected function formatNumber(float $value): string
    {
        if (floor($value) == $value) {
            return number_format($value, 0, '.', '');
        }

        return rtrim(rtrim(number_format($value, 4, '.', ''), '0'), '.');
    }
}
