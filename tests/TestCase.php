<?php

namespace Tests;

use App\Domain\Identity\Models\AccessGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function createAuthorizedUser(array $attributes = []): User
    {
        $user = User::factory()->create(array_merge(['is_active' => true], $attributes));

        $group = AccessGroup::query()->firstOrCreate(
            ['name' => 'Super Admin Test'],
            ['description' => 'Test Group', 'is_active' => true]
        );

        $user->accessGroups()->syncWithoutDetaching([$group->id]);

        return $user;
    }
}
