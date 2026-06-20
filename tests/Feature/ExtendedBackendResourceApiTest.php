<?php

namespace Tests\Feature;

use App\Domain\Partner\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class ExtendedBackendResourceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_purchase_order_resource_can_store_basic_operation_document(): void
    {
        $user = User::factory()->create();
        $supplier = Supplier::query()->create([
            'code' => 'SUP-001',
            'name' => 'PT Supplier Uji',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/backend/purchase-orders', [
            'supplier_id' => $supplier->id,
            'document_number' => 'PO.2026.05.00001',
            'entry_date' => '2026-05-13',
            'status' => 'Draft',
            'notes' => 'Pesanan pembelian awal.',
            'lines' => [
                [
                    'description' => 'Besi Hollow 4x4',
                    'reference_code' => 'BHL-44',
                    'quantity' => 50,
                    'unit_price' => 125000,
                    'total_amount' => 6250000,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.document_type', 'purchase_order')
            ->assertJsonPath('data.supplier_id', $supplier->id)
            ->assertJsonPath('data.lines.0.description', 'Besi Hollow 4x4');

        $this->assertDatabaseHas('operation_documents', [
            'document_type' => 'purchase_order',
            'document_number' => 'PO.2026.05.00001',
            'supplier_id' => $supplier->id,
        ]);
    }

    public function test_fixed_asset_resource_can_store_master_with_locations(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/backend/fixed-assets', [
            'code' => 'FA-0001',
            'name' => 'Mesin Potong Keramik',
            'purchase_date' => '2026-05-13',
            'quantity' => 1,
            'acquisition_cost' => 12500000,
            'book_value' => 12500000,
            'location_rows' => [
                [
                    'location_name' => 'Gudang Utama',
                    'location_address' => 'Jl. Raya Industri 1',
                    'quantity' => 1,
                    'is_current' => true,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', 'FA-0001')
            ->assertJsonPath('data.locations.0.location_name', 'Gudang Utama');

        $this->assertDatabaseHas('fixed_assets', [
            'code' => 'FA-0001',
            'name' => 'Mesin Potong Keramik',
        ]);
    }

    public function test_account_auto_code_generation(): void
    {
        $user = \App\Models\User::factory()->create();

        $parent = \App\Domain\Finance\Models\Account::query()->create([
            'code' => '111.001-01',
            'name' => 'Kas Utama',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
        ]);

        $response1 = $this->actingAs($user)->postJson('/api/backend/accounts', [
            'parent_id' => $parent->id,
            'auto_code' => true,
            'name' => 'Kas Kecil A',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
        ]);

        $response1->assertCreated();
        $this->assertDatabaseHas('accounts', [
            'name' => 'Kas Kecil A',
            'code' => '111.001-01.01',
            'parent_id' => $parent->id,
            'auto_code' => 1,
        ]);

        $response2 = $this->actingAs($user)->postJson('/api/backend/accounts', [
            'parent_id' => $parent->id,
            'auto_code' => true,
            'name' => 'Kas Kecil B',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
        ]);

        $response2->assertCreated();
        $this->assertDatabaseHas('accounts', [
            'name' => 'Kas Kecil B',
            'code' => '111.001-01.02',
            'parent_id' => $parent->id,
            'auto_code' => 1,
        ]);

        $response3 = $this->actingAs($user)->postJson('/api/backend/accounts', [
            'parent_id' => $parent->id,
            'auto_code' => false,
            'code' => '111.001-01.custom',
            'name' => 'Kas Kecil Custom',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
        ]);

        $response3->assertCreated();
        $this->assertDatabaseHas('accounts', [
            'name' => 'Kas Kecil Custom',
            'code' => '111.001-01.custom',
            'parent_id' => $parent->id,
            'auto_code' => 0,
        ]);

        $childId = $response1->json('data.id');
        $responseUpdate1 = $this->actingAs($user)->putJson("/api/backend/accounts/{$childId}", [
            'parent_id' => $parent->id,
            'auto_code' => true,
            'name' => 'Kas Kecil A Edited',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
        ]);

        $responseUpdate1->assertOk();
        $this->assertDatabaseHas('accounts', [
            'id' => $childId,
            'name' => 'Kas Kecil A Edited',
            'code' => '111.001-01.01',
        ]);

        $newParent = \App\Domain\Finance\Models\Account::query()->create([
            'code' => '222.002-02',
            'name' => 'Kewajiban Baru',
            'account_type' => 'Liability',
            'is_active' => true,
        ]);

        $responseUpdate2 = $this->actingAs($user)->putJson("/api/backend/accounts/{$childId}", [
            'parent_id' => $newParent->id,
            'auto_code' => true,
            'name' => 'Kas Kecil A Moved',
            'account_type' => 'Cash/Bank',
            'is_active' => true,
        ]);

        $responseUpdate2->assertOk();
        $this->assertDatabaseHas('accounts', [
            'id' => $childId,
            'name' => 'Kas Kecil A Moved',
            'code' => '222.002-02.01',
            'parent_id' => $newParent->id,
        ]);
    }
}
