<?php

namespace App\Support\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class BackendRelationSync
{
    /**
     * @param  array<int, int|string>|null  $ids
     */
    public static function syncBelongsToMany(Model $record, string $relation, ?array $ids): void
    {
        if (! method_exists($record, $relation)) {
            return;
        }

        $record->{$relation}()->sync($ids ?? []);
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $rows
     * @param  array<int, string>  $fillableColumns
     * @param  callable(array<string, mixed>): bool|null  $filter
     */
    public static function syncHasMany(
        Model $record,
        string $relation,
        ?array $rows,
        array $fillableColumns,
        ?callable $filter = null,
    ): void {
        if (! method_exists($record, $relation)) {
            return;
        }

        /** @var HasMany $relationQuery */
        $relationQuery = $record->{$relation}();
        $normalizedRows = Collection::make($rows ?? [])
            ->filter(fn ($row) => is_array($row))
            ->map(fn (array $row) => Arr::only($row, array_merge(['id'], $fillableColumns)))
            ->when($filter !== null, fn (Collection $collection) => $collection->filter($filter))
            ->values();

        $keptIds = $normalizedRows
            ->pluck('id')
            ->filter(fn ($id) => filled($id))
            ->map(fn ($id) => (int) $id)
            ->all();

        $relationQuery
            ->when($keptIds !== [], fn (HasMany $query) => $query->whereNotIn('id', $keptIds), fn (HasMany $query) => $query)
            ->delete();

        foreach ($normalizedRows as $row) {
            $attributes = Arr::only($row, $fillableColumns);
            $id = Arr::get($row, 'id');

            if (filled($id)) {
                $relationQuery->updateOrCreate(['id' => $id], $attributes);
                continue;
            }

            $relationQuery->create($attributes);
        }
    }
}
