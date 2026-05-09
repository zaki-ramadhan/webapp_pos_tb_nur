<?php

namespace App\Domain\Support\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

abstract class DomainModel extends Model
{
    /**
     * @var list<string>
     */
    protected array $searchable = [];

    public function scopeSearch(Builder $query, ?string $term, ?array $columns = null): Builder
    {
        $keyword = trim((string) $term);
        $searchColumns = $columns ?? $this->searchable;

        if ($keyword === '' || $searchColumns === []) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($keyword, $searchColumns): void {
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
