<?php

namespace App\Support\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class BackendResourceWriter
{
    public function __construct(
        protected BackendActivityLogger $activityLogger,
    ) {
    }

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

    public function delete(BackendResourceBlueprint $blueprint, Model $record): void
    {
        DB::transaction(function () use ($blueprint, $record): void {
            $before = $this->activityLogger->snapshot($record);
            $record->delete();
            $this->activityLogger->logMutation(
                $blueprint,
                'delete',
                $record,
                $before,
                null,
            );
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function persist(BackendResourceBlueprint $blueprint, Model $record, array $payload): Model
    {
        return DB::transaction(function () use ($blueprint, $record, $payload): Model {
            $before = $record->exists ? $this->activityLogger->snapshot($record) : null;
            $record->fill(Arr::only($payload, $record->getFillable()));
            $record->save();

            $blueprint->sync($record, $payload);

            $freshRecord = $record->fresh($blueprint->with) ?? $record;

            $this->activityLogger->logMutation(
                $blueprint,
                $record->wasRecentlyCreated ? 'create' : 'update',
                $freshRecord,
                $before,
                $this->activityLogger->snapshot($freshRecord),
            );

            return $freshRecord;
        });
    }
}
