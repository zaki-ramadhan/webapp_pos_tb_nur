<?php

namespace App\Support\Backend;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

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
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), 1000));
        $query = $modelClass::query()->with($blueprint->with);

        $user = auth()->user();
        if ($user && ! $user->hasAnyRoleCodes(['super_admin'])) {
            $modelInstance = new $modelClass();
            $tableName = $modelInstance->getTable();
            if (Schema::hasColumn($tableName, 'branch_id')) {
                if ($user->branches()->exists()) {
                    $allowedBranchIds = $user->branches->pluck('id')->toArray();
                    $query->whereIn("{$tableName}.branch_id", $allowedBranchIds);
                }
            }
        }

        if ($search !== '') {
            $this->applySearch($query, $search, $blueprint->searchColumns);
        }

        $modelInstance = new $modelClass();
        $tableName = $modelInstance->getTable();
        foreach ($filters as $key => $value) {
            if (in_array($key, ['search', 'per_page', 'page'], true)) {
                continue;
            }
            if ($key === 'exclude_type' && Schema::hasColumn($tableName, 'account_type')) {
                $query->where("{$tableName}.account_type", '!=', $value);
                continue;
            }
            if (Schema::hasColumn($tableName, $key)) {
                $query->where("{$tableName}.{$key}", $value);
            }
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
