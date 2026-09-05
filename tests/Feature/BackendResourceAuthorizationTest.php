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

    public function test_non_super_admin_cannot_view_system_administrator_users_or_roles(): void
    {
        $superRole = \App\Domain\Identity\Models\Role::query()->create([
            'code' => 'super_admin',
            'name' => 'Administrator Sistem',
            'is_active' => true,
        ]);
        $regularRole = \App\Domain\Identity\Models\Role::query()->create([
            'code' => 'staff',
            'name' => 'Staff Toko',
            'is_active' => true,
        ]);

        $adminUser = User::factory()->create([
            'name' => 'System Admin Hidden',
            'email' => 'sysadmin@dev.local',
        ]);
        $adminUser->roles()->attach($superRole);

        $regularUser = User::factory()->create([
            'name' => 'Kasir Reguler',
            'email' => 'kasir@toko.local',
        ]);
        $regularUser->roles()->attach($regularRole);

        $group = AccessGroup::query()->create([
            'code' => 'STAFF_GRP',
            'name' => 'Staff Group',
            'is_active' => true,
        ]);
        $group->permissions()->createMany([
            [
                'menu_key' => 'users',
                'can_access' => true,
                'can_view' => true,
            ],
            [
                'menu_key' => 'roles',
                'can_access' => true,
                'can_view' => true,
            ],
        ]);
        $regularUser->accessGroups()->attach($group);

        // Regular user accessing users list
        $userListRes = $this->actingAs($regularUser)->getJson('/api/backend/users');
        $userListRes->assertOk();
        $userIds = array_column($userListRes->json('data'), 'id');
        $this->assertNotContains($adminUser->id, $userIds);

        // Regular user accessing roles list
        $roleListRes = $this->actingAs($regularUser)->getJson('/api/backend/roles');
        $roleListRes->assertOk();
        $roleCodes = array_column($roleListRes->json('data'), 'code');
        $this->assertNotContains('super_admin', $roleCodes);

        // Regular user trying direct access to admin user
        $this->actingAs($regularUser)->getJson("/api/backend/users/{$adminUser->id}")
            ->assertForbidden();

        // Regular user trying direct access to super admin role
        $this->actingAs($regularUser)->getJson("/api/backend/roles/{$superRole->id}")
            ->assertForbidden();

        // Admin user can see both
        $adminUsersRes = $this->actingAs($adminUser)->getJson('/api/backend/users');
        $adminUsersRes->assertOk();
        $this->assertContains($adminUser->id, array_column($adminUsersRes->json('data'), 'id'));

        $adminRolesRes = $this->actingAs($adminUser)->getJson('/api/backend/roles');
        $adminRolesRes->assertOk();
        $this->assertContains('super_admin', array_column($adminRolesRes->json('data'), 'code'));
    }
}

