<?php

namespace App\Support\Backend;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class BackendResourceIndexQuery
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(BackendResourceBlueprint $blueprint, array $filters): LengthAwarePaginator|array
    {
        $customResult = $blueprint->runIndex($filters);

        if ($customResult !== null) {
            return $customResult;
        }

        $modelClass = $blueprint->modelClass();
        $search = trim((string) ($filters['search'] ?? ''));
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 100));
        $query = $modelClass::query()->with($blueprint->with);

        if ($search !== '') {
            $this->applySearch($query, $search, $blueprint->searchColumns);
        }

        return $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array<int, string>  $searchColumns
     */
    protected function applySearch(Builder $query, string $keyword, array $searchColumns): void
    {
        if ($searchColumns === []) {
            return;
        }

        if (method_exists($query->getModel(), 'scopeSearch')) {
            $query->search($keyword, $searchColumns);

            return;
        }

        $query->where(function (Builder $builder) use ($keyword, $searchColumns): void {
            foreach ($searchColumns as $index => $column) {
                if ($index === 0) {
                    $builder->where($column, 'like', "%{$keyword}%");
                    continue;
                }

                $builder->orWhere($column, 'like', "%{$keyword}%");
            }
        });
    }
}
