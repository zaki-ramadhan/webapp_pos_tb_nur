<?php

namespace App\Support\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BackendResourceWriter
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function create(BackendResourceBlueprint $blueprint, array $payload): Model
    {
        $modelClass = $blueprint->modelClass();

        /** @var Model $record */
        $record = new $modelClass();

        return $this->persist($blueprint, $record, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function update(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        return $this->persist($blueprint, $record, $payload);
    }

    public function delete(Model $record): void
    {
        DB::transaction(function () use ($record): void {
            $record->delete();
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function persist(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        return DB::transaction(function () use ($blueprint, $record, $payload): Model {
            $record->fill(Arr::only($payload, $record->getFillable()));
            $record->save();

            $blueprint->sync($record, $payload);

            return $record->fresh($blueprint->with) ?? $record;
        });
    }
}
