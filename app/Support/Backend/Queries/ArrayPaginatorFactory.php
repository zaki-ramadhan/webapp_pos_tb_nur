<?php

namespace App\Support\Backend\Queries;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Collection;

class ArrayPaginatorFactory
{
    /**
     * @param  Collection<int, array<string, mixed>>  $items
     */
    public static function make(Collection $items, int $perPage, int $page): LengthAwarePaginator
    {
        $total = $items->count();
        $results = $items
            ->forPage($page, $perPage)
            ->values()
            ->all();

        return new Paginator(
            $results,
            $total,
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ],
        );
    }
}
