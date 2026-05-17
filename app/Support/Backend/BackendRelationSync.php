<?php

namespace App\Support\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

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

        $normalizedIds = Collection::make($ids ?? [])
            ->filter(fn ($id) => filled($id) && is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $record->{$relation}()->sync($normalizedIds);
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

        $existingIds = $relationQuery->pluck('id')->map(fn ($id) => (int) $id)->all();
        $invalidIds = array_values(array_diff($keptIds, $existingIds));

        if ($invalidIds !== []) {
            throw ValidationException::withMessages([
                $relation => ['One or more related records do not belong to the current resource.'],
            ]);
        }

        $deleteQuery = clone $relationQuery;

        if ($keptIds !== []) {
            $deleteQuery->whereNotIn('id', $keptIds);
        }

        $deleteQuery->delete();

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
