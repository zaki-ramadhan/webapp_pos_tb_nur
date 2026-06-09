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

        return Carbon::parse((string) $value);
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @param  array<string, mixed>  $filters
     */
    protected function paginateRows(Collection $rows, array $filters): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 100));
        $page = max(1, (int) request()->query('page', 1));

        return ArrayPaginatorFactory::make($rows, $perPage, $page);
    }

    protected function formatNumber(float $value): string
    {
        return number_format($value, 2, '.', '');
    }
}
