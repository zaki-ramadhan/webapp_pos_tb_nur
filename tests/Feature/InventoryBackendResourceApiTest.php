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

    public function test_item_request_resource_can_store_header_and_lines(): void
    {
        $user = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-INV',
            'name' => 'Cabang Inventori',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/backend/item-requests', [
            'branch_id' => $branch->id,
            'document_number' => 'PR.2026.05.00001',
            'request_type' => 'Beli Barang',
            'numbering_type' => 'Permintaan Pembelian',
            'status' => 'Menunggu diproses',
            'document_date' => '2026-05-13',
            'notes' => 'Permintaan stok untuk gudang utama.',
            'lines' => [
                [
                    'item_name' => 'Semen Instan 40kg',
                    'item_code' => 'SMN-040',
                    'quantity' => 25,
                    'line_date' => '2026-05-15',
                    'notes' => 'Prioritas tinggi',
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.document_type', 'item_request')
            ->assertJsonPath('data.branch_id', $branch->id)
            ->assertJsonPath('data.lines.0.item_name', 'Semen Instan 40kg');

        $this->assertDatabaseHas('inventory_documents', [
            'document_type' => 'item_request',
            'document_number' => 'PR.2026.05.00001',
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
}
