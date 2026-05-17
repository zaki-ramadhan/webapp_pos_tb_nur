<?php

namespace Tests\Feature;

use App\Domain\Identity\Models\AccessGroup;
use App\Domain\Identity\Models\AccessGroupPermission;
use App\Models\User;
use App\Support\Backend\BackendResourceRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class ActiveWorkspaceBackendCrudCoverageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_delivery_order_and_period_end_resources_are_registered(): void
    {
        $resources = BackendResourceRegistry::all();

        $this->assertArrayHasKey('delivery-orders', $resources);
        $this->assertSame('delivery-order', $resources['delivery-orders']->permissionKey());

        $this->assertArrayHasKey('period-ends', $resources);
        $this->assertSame('period-end', $resources['period-ends']->permissionKey());
    }

    public function test_access_group_resource_can_store_and_update_users_and_permissions(): void
    {
        $actor = User::factory()->create();
        $firstUser = User::factory()->create(['name' => 'User Satu']);
        $secondUser = User::factory()->create(['name' => 'User Dua']);

        $createResponse = $this->actingAs($actor)->postJson('/api/backend/access-groups', [
            'name' => 'Tim Operasional',
            'description' => 'Akses gudang dan kasir',
            'user_ids' => [$firstUser->id],
            'permissions' => [
                [
                    'menu_key' => 'cash-payment',
                    'can_access' => true,
                    'can_create' => true,
                    'can_update' => true,
                    'can_delete' => false,
                    'can_view' => true,
                ],
                [
                    'menu_key' => 'inventory-adjustment',
                    'can_access' => true,
                    'can_create' => false,
                    'can_update' => false,
                    'can_delete' => false,
                    'can_view' => true,
                ],
            ],
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Tim Operasional')
            ->assertJsonPath('data.users.0.id', $firstUser->id)
            ->assertJsonPath('data.permissions.0.menu_key', 'cash-payment');

        $groupId = $createResponse->json('data.id');

        $this->assertDatabaseHas('access_groups', [
            'id' => $groupId,
            'name' => 'Tim Operasional',
            'description' => 'Akses gudang dan kasir',
        ]);

        $this->assertDatabaseHas('access_group_user', [
            'access_group_id' => $groupId,
            'user_id' => $firstUser->id,
        ]);

        $this->assertDatabaseHas('access_group_permissions', [
            'access_group_id' => $groupId,
            'menu_key' => 'cash-payment',
            'can_access' => true,
            'can_create' => true,
            'can_update' => true,
            'can_delete' => false,
            'can_view' => true,
        ]);

        $group = AccessGroup::query()->findOrFail($groupId);
        $cashPaymentPermission = AccessGroupPermission::query()
            ->where('access_group_id', $groupId)
            ->where('menu_key', 'cash-payment')
            ->firstOrFail();
        $inventoryPermission = AccessGroupPermission::query()
            ->where('access_group_id', $groupId)
            ->where('menu_key', 'inventory-adjustment')
            ->firstOrFail();

        $updateResponse = $this->actingAs($actor)->putJson("/api/backend/access-groups/{$groupId}", [
            'name' => 'Tim Operasional Pusat',
            'description' => 'Akses operasional terbarukan',
            'user_ids' => [$firstUser->id, $secondUser->id],
            'permissions' => [
                [
                    'id' => $cashPaymentPermission->id,
                    'menu_key' => 'cash-payment',
                    'can_access' => true,
                    'can_create' => true,
                    'can_update' => false,
                    'can_delete' => false,
                    'can_view' => true,
                ],
                [
                    'menu_key' => 'general-journal',
                    'can_access' => true,
                    'can_create' => false,
                    'can_update' => false,
                    'can_delete' => false,
                    'can_view' => true,
                ],
            ],
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('data.name', 'Tim Operasional Pusat');

        $group->refresh();

        $this->assertSame('Tim Operasional Pusat', $group->name);
        $this->assertSame('Akses operasional terbarukan', $group->description);
        $this->assertEqualsCanonicalizing(
            [$firstUser->id, $secondUser->id],
            $group->users()->pluck('users.id')->all(),
        );

        $this->assertDatabaseHas('access_group_permissions', [
            'id' => $cashPaymentPermission->id,
            'access_group_id' => $groupId,
            'menu_key' => 'cash-payment',
            'can_update' => false,
        ]);

        $this->assertDatabaseMissing('access_group_permissions', [
            'id' => $inventoryPermission->id,
        ]);

        $this->assertDatabaseHas('access_group_permissions', [
            'access_group_id' => $groupId,
            'menu_key' => 'general-journal',
            'can_access' => true,
            'can_view' => true,
        ]);
    }
}
