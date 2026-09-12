<?php

namespace Tests\Feature;

use App\Domain\Organization\Models\Branch;
use App\Domain\Catalog\Models\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class InventoryBackendResourceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_stock_transfer_resource_can_store_header_and_lines(): void
    {
        $user = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-INV',
            'name' => 'Cabang Inventori',
            'is_active' => true,
        ]);
        $warehouse1 = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'WH-01',
            'name' => 'Gudang 1',
            'is_active' => true,
        ]);
        $warehouse2 = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'WH-02',
            'name' => 'Gudang 2',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/backend/stock-transfers', [
            'branch_id' => $branch->id,
            'warehouse_id' => $warehouse1->id,
            'counterpart_warehouse_id' => $warehouse2->id,
            'document_number' => 'ST.2026.05.00001',
            'process_type' => 'Transfer',
            'status' => 'Selesai',
            'document_date' => '2026-05-13',
            'notes' => 'Transfer stok antar gudang.',
            'lines' => [
                [
                    'item_name' => 'Semen Instan 40kg',
                    'item_code' => 'SMN-040',
                    'quantity' => 25,
                    'notes' => 'Prioritas tinggi',
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.document_type', 'stock_transfer')
            ->assertJsonPath('data.branch_id', $branch->id)
            ->assertJsonPath('data.lines.0.item_name', 'Semen Instan 40kg');

        $this->assertDatabaseHas('inventory_documents', [
            'document_type' => 'stock_transfer',
            'document_number' => 'ST.2026.05.00001',
            'branch_id' => $branch->id,
        ]);

        $this->assertDatabaseHas('inventory_document_lines', [
            'item_name' => 'Semen Instan 40kg',
            'item_code' => 'SMN-040',
        ]);
    }

    public function test_stock_opname_resources_can_link_order_result_and_workers(): void
    {
        $user = User::factory()->create();
        $worker = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-OPS',
            'name' => 'Cabang Operasional',
            'is_active' => true,
        ]);
        $warehouse = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'GD-OPS',
            'name' => 'Gudang Operasional',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);

        $orderResponse = $this->actingAs($user)->postJson('/api/backend/stock-opname-orders', [
            'branch_id' => $branch->id,
            'warehouse_id' => $warehouse->id,
            'responsible_user_id' => $worker->id,
            'worker_ids' => [$worker->id],
            'document_number' => 'OPO.2026.05.00001',
            'numbering_type' => 'Perintah Stok Opname',
            'status' => 'Draft',
            'document_date' => '2026-05-13',
            'effective_date' => '2026-05-14',
            'notes' => 'Hitung ulang stok proyek.',
            'lines' => [
                [
                    'item_name' => 'Cat Tembok Premium',
                    'item_code' => 'CAT-001',
                    'system_quantity' => 18,
                    'counted_quantity' => 17,
                ],
            ],
        ]);

        $orderResponse
            ->assertCreated()
            ->assertJsonPath('data.document_type', 'stock_opname_order')
            ->assertJsonPath('data.workers.0.id', $worker->id);

        $orderId = $orderResponse->json('data.id');

        $this->assertDatabaseHas('inventory_document_user', [
            'inventory_document_id' => $orderId,
            'user_id' => $worker->id,
        ]);

        $resultResponse = $this->actingAs($user)->postJson('/api/backend/stock-opname-results', [
            'branch_id' => $branch->id,
            'warehouse_id' => $warehouse->id,
            'related_document_id' => $orderId,
            'document_number' => 'OPR.2026.05.00001',
            'numbering_type' => 'Hasil Stok Opname',
            'document_date' => '2026-05-14',
            'notes' => 'Ada selisih satu item.',
            'lines' => [
                [
                    'item_name' => 'Cat Tembok Premium',
                    'item_code' => 'CAT-001',
                    'counted_quantity' => 17,
                ],
            ],
        ]);

        $resultResponse
            ->assertCreated()
            ->assertJsonPath('data.document_type', 'stock_opname_result')
            ->assertJsonPath('data.related_document_id', $orderId);

        $this->assertDatabaseHas('inventory_documents', [
            'document_type' => 'stock_opname_result',
            'document_number' => 'OPR.2026.05.00001',
            'related_document_id' => $orderId,
        ]);
    }

    public function test_optimistic_locking_prevents_lost_update(): void
    {
        $user = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-OPT',
            'name' => 'Cabang Optimistic',
            'is_active' => true,
        ]);
        $warehouse = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'WH-OPT',
            'name' => 'Gudang Optimistic',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);

        // Simpan data gudang dengan update pertama
        $originalUpdatedAt = $warehouse->updated_at->toIso8601String();

        // User A memperbarui data terlebih dahulu di database (updated_at berubah)
        sleep(1);
        $warehouse->name = 'Gudang Optimistic Updated by User A';
        $warehouse->save();

        // User B yang masih memegang timestamp awal mencoba menyimpan perubahan
        $response = $this->actingAs($user)->putJson("/api/backend/warehouses/{$warehouse->id}", [
            'branch_id' => $branch->id,
            'code' => 'WH-OPT',
            'name' => 'Gudang Optimistic Overwritten by User B',
            'warehouse_type' => 'main',
            'is_active' => true,
            'expected_updated_at' => $originalUpdatedAt,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['concurrency']);
    }

    public function test_inventory_adjustment_prevents_excessive_deduction(): void
    {
        $user = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-ADJ',
            'name' => 'Cabang Penyesuaian',
            'is_active' => true,
        ]);
        $warehouse = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'WH-ADJ',
            'name' => 'Gudang Penyesuaian',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);

        $unit = \App\Domain\Catalog\Models\Unit::query()->create([
            'code' => 'PCS',
            'name' => 'Pcs',
            'is_active' => true,
        ]);

        $product = \App\Domain\Catalog\Models\Product::query()->create([
            'code' => 'PRD-ADJ-01',
            'name' => 'Paku Beton 5cm',
            'base_unit_id' => $unit->id,
            'is_active' => true,
        ]);

        // Coba kurangi stok saat stok masih 0
        $response = $this->actingAs($user)->postJson('/api/backend/inventory-adjustments', [
            'branch_id' => $branch->id,
            'warehouse_id' => $warehouse->id,
            'document_number' => 'IA.2026.05.00001',
            'entry_date' => '2026-05-15',
            'status' => 'Selesai',
            'lines' => [
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity' => 10,
                    'attributes' => [
                        'adjustment_type' => 'Pengurangan',
                    ],
                ],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['lines']);
    }
}

