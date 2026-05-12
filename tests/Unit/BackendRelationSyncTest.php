<?php

namespace Tests\Unit;

use App\Support\Backend\BackendRelationSync;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

class BackendRelationSyncTest extends TestCase
{
    public function test_sync_belongs_to_many_normalizes_ids_before_syncing(): void
    {
        $relation = Mockery::mock(BelongsToMany::class);
        $relation->shouldReceive('sync')->once()->with([1, 2]);

        $record = new class extends Model
        {
            protected BelongsToMany $relation;

            public function setRelationQuery(BelongsToMany $relation): void
            {
                $this->relation = $relation;
            }

            public function roles(): BelongsToMany
            {
                return $this->relation;
            }
        };
        $record->setRelationQuery($relation);

        BackendRelationSync::syncBelongsToMany($record, 'roles', ['1', 2, null, '', 2, 'x']);

        $this->assertTrue(true);
    }

    public function test_sync_has_many_rejects_ids_not_owned_by_parent_relation(): void
    {
        $relation = Mockery::mock(HasMany::class);
        $relation->shouldReceive('pluck')->once()->with('id')->andReturn(new Collection([99]));

        $record = new class extends Model
        {
            protected HasMany $relation;

            public function setRelationQuery(HasMany $relation): void
            {
                $this->relation = $relation;
            }

            public function permissions(): HasMany
            {
                return $this->relation;
            }
        };
        $record->setRelationQuery($relation);

        $this->expectException(ValidationException::class);

        BackendRelationSync::syncHasMany(
            $record,
            'permissions',
            [[
                'id' => 100,
                'menu_key' => 'sales',
            ]],
            ['menu_key'],
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }
}
