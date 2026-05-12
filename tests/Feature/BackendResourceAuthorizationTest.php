<?php

namespace Tests\Feature;

use App\Domain\Identity\Models\AccessGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class BackendResourceAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_bootstrap_mode_lists_resources_without_exposing_model_class_names(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/backend/resources')
            ->assertOk()
            ->assertJsonFragment([
                'key' => 'branches',
                'label' => 'Branches',
            ])
            ->assertJsonPath('data.0.abilities.view', true)
            ->assertJsonMissingPath('data.0.model');
    }

    public function test_resources_are_filtered_by_access_group_permissions_once_access_control_exists(): void
    {
        $user = User::factory()->create();
        $group = AccessGroup::query()->create([
            'code' => 'OPS',
            'name' => 'Operational',
            'is_active' => true,
        ]);

        $group->permissions()->create([
            'menu_key' => 'branches',
            'can_access' => true,
            'can_view' => true,
            'can_create' => false,
            'can_update' => false,
            'can_delete' => false,
        ]);

        $user->accessGroups()->attach($group);

        $response = $this->actingAs($user)->getJson('/api/backend/resources');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'key' => 'branches',
                'label' => 'Branches',
            ]);

        $this->assertSame(['branches'], array_column($response->json('data'), 'key'));
    }

    public function test_view_permission_does_not_imply_create_permission(): void
    {
        $user = User::factory()->create();
        $group = AccessGroup::query()->create([
            'code' => 'VIEWER',
            'name' => 'Viewer',
            'is_active' => true,
        ]);

        $group->permissions()->create([
            'menu_key' => 'branches',
            'can_access' => true,
            'can_view' => true,
            'can_create' => false,
            'can_update' => false,
            'can_delete' => false,
        ]);

        $user->accessGroups()->attach($group);

        $this->actingAs($user)
            ->getJson('/api/backend/branches')
            ->assertOk();

        $this->actingAs($user)
            ->postJson('/api/backend/branches', [
                'code' => 'BR-001',
                'name' => 'Cabang Utama',
            ])
            ->assertForbidden();
    }

    public function test_store_payload_is_sanitized_before_persistence(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/backend/branches', [
                'code' => 'BR-002',
                'name' => '  Cabang Timur  ',
                'email' => '  INFO@TOKONUR.ID  ',
                'city' => '   ',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Cabang Timur')
            ->assertJsonPath('data.email', 'info@tokonur.id')
            ->assertJsonPath('data.city', null);

        $this->assertDatabaseHas('branches', [
            'code' => 'BR-002',
            'name' => 'Cabang Timur',
            'email' => 'info@tokonur.id',
            'city' => null,
        ]);
    }
}
