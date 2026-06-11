<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Inventory\Models\InventoryBatch;
use App\Domain\Organization\Models\Branch;
use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class InventoryCostingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Warehouse $warehouseA;
    protected Warehouse $warehouseB;
    protected Unit $unit;
    protected Product $product;
    protected Supplier $supplier;
    protected Customer $customer;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();

        $this->user = User::factory()->create();

        $this->branch = Branch::query()->create([
            'code' => 'BR-TEST-01',
            'name' => 'Cabang Test',
            'is_active' => true,
        ]);

        $this->warehouseA = Warehouse::query()->create([
            'branch_id' => $this->branch->id,
            'code' => 'GD-TEST-A',
            'name' => 'Gudang Utama A',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);

        $this->warehouseB = Warehouse::query()->create([
            'branch_id' => $this->branch->id,
            'code' => 'GD-TEST-B',
            'name' => 'Gudang Utama B',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);

        $this->unit = Unit::query()->create([
            'code' => 'PCS',
            'name' => 'Pcs',
        ]);

        $this->product = Product::query()->create([
            'base_unit_id' => $this->unit->id,
            'code' => 'PROD-COST-01',
            'name' => 'Semen Instan Premium',
            'product_type' => 'goods',
            'minimum_stock' => 5,
            'default_purchase_price' => 120,
            'is_active' => true,
        ]);

        $this->supplier = Supplier::query()->create([
            'code' => 'SUP-TEST-01',
            'name' => 'PT Supplier Test',
            'is_active' => true,
        ]);

        $this->customer = Customer::query()->create([
            'code' => 'CUST-TEST-01',
            'name' => 'Pelanggan Test',
            'is_active' => true,
        ]);
    }

    public function test_goods_receipt_creates_inventory_batches(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00001',
            'entry_date' => '2026-06-11',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 100,
                    'description' => 'First Batch',
                ],
            ],
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('inventory_batches', [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouseA->id,
            'qty_received' => 10,
            'qty_remaining' => 10,
            'unit_cost' => 100,
            'source_type' => \App\Domain\Purchasing\Models\GoodsReceipt::class,
        ]);
    }

    public function test_sales_delivery_consumes_inventory_batches_fifo(): void
    {
        // 1. Create Batch 1: Qty 10 @ 100
        $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00001',
            'entry_date' => '2026-06-11',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 100,
                ],
            ],
        ])->assertCreated();

        // 2. Create Batch 2: Qty 10 @ 150
        $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00002',
            'entry_date' => '2026-06-12',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 150,
                ],
            ],
        ])->assertCreated();

        // 3. Make Sales Delivery: Qty 15 (should consume 10 from Batch 1 and 5 from Batch 2)
        $deliveryResponse = $this->actingAs($this->user)->postJson('/api/backend/sales-deliveries', [
            'warehouse_id' => $this->warehouseA->id,
            'customer_id' => $this->customer->id,
            'document_number' => 'DO.2026.06.00001',
            'entry_date' => '2026-06-13',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 15,
                ],
            ],
        ]);

        $deliveryResponse->assertCreated();

        // Assert Batch 1 is fully consumed
        $this->assertDatabaseHas('inventory_batches', [
            'qty_received' => 10,
            'qty_remaining' => 0,
            'unit_cost' => 100,
        ]);

        // Assert Batch 2 is partially consumed (10 - 5 = 5 remaining)
        $this->assertDatabaseHas('inventory_batches', [
            'qty_received' => 10,
            'qty_remaining' => 5,
            'unit_cost' => 150,
        ]);

        // Assert delivery line has correct attributes (COGS = 10 * 100 + 5 * 150 = 1750)
        $lineId = $deliveryResponse->json('data.lines.0.id');
        $deliveryLine = \App\Domain\Support\Models\OperationDocumentLine::find($lineId);
        $this->assertNotNull($deliveryLine);
        $attributes = $deliveryLine->attributes;
        $this->assertNotEmpty($attributes['consumed_batches']);
        $this->assertEquals(1750, $attributes['cogs']);
    }

    public function test_deleting_goods_receipt_reverts_inventory_batches(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00001',
            'entry_date' => '2026-06-11',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 100,
                ],
            ],
        ]);

        $response->assertCreated();
        $docId = $response->json('data.id');

        $this->assertDatabaseHas('inventory_batches', [
            'product_id' => $this->product->id,
            'qty_received' => 10,
        ]);

        // Delete the Goods Receipt
        $deleteResponse = $this->actingAs($this->user)->deleteJson('/api/backend/goods-receipts/' . $docId);
        $deleteResponse->assertOk();

        // Assert batch is deleted
        $this->assertDatabaseMissing('inventory_batches', [
            'product_id' => $this->product->id,
        ]);
    }

    public function test_updating_sales_delivery_reverts_and_reapplies_costing(): void
    {
        // 1. Create Batch 1: Qty 10 @ 100
        $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00001',
            'entry_date' => '2026-06-11',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 100,
                ],
            ],
        ])->assertCreated();

        // 2. Create Batch 2: Qty 10 @ 150
        $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00002',
            'entry_date' => '2026-06-12',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 150,
                ],
            ],
        ])->assertCreated();

        // 3. Make Sales Delivery: Qty 15 (consuming 10 from Batch 1 and 5 from Batch 2)
        $deliveryResponse = $this->actingAs($this->user)->postJson('/api/backend/sales-deliveries', [
            'warehouse_id' => $this->warehouseA->id,
            'customer_id' => $this->customer->id,
            'document_number' => 'DO.2026.06.00001',
            'entry_date' => '2026-06-13',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 15,
                ],
            ],
        ]);

        $deliveryResponse->assertCreated();
        $deliveryId = $deliveryResponse->json('data.id');
        $lineId = $deliveryResponse->json('data.lines.0.id');

        // Update Sales Delivery: reduce qty to 5 (should consume only 5 from Batch 1, and Batch 2 should be fully restored)
        $updateResponse = $this->actingAs($this->user)->putJson('/api/backend/sales-deliveries/' . $deliveryId, [
            'warehouse_id' => $this->warehouseA->id,
            'customer_id' => $this->customer->id,
            'document_number' => 'DO.2026.06.00001',
            'entry_date' => '2026-06-13',
            'status' => 'Posted',
            'lines' => [
                [
                    'id' => $lineId,
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 5,
                ],
            ],
        ]);

        $updateResponse->assertOk();

        // Batch 1: remaining should now be 5 (qty 10 - 5 consumed)
        $this->assertDatabaseHas('inventory_batches', [
            'qty_received' => 10,
            'qty_remaining' => 5,
            'unit_cost' => 100,
        ]);

        // Batch 2: remaining should be fully restored to 10
        $this->assertDatabaseHas('inventory_batches', [
            'qty_received' => 10,
            'qty_remaining' => 10,
            'unit_cost' => 150,
        ]);

        // Line attributes: COGS should be 500 (5 * 100)
        $deliveryLine = \App\Domain\Support\Models\OperationDocumentLine::find($lineId);
        $this->assertEquals(500, $deliveryLine->attributes['cogs']);
    }

    public function test_stock_transfer_consumes_from_origin_and_creates_batch_in_destination(): void
    {
        // 1. Create Batch 1 in Warehouse A: Qty 10 @ 100
        $this->actingAs($this->user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $this->warehouseA->id,
            'supplier_id' => $this->supplier->id,
            'document_number' => 'GR.2026.06.00001',
            'entry_date' => '2026-06-11',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'warehouse_id' => $this->warehouseA->id,
                    'quantity' => 10,
                    'unit_price' => 100,
                ],
            ],
        ])->assertCreated();

        // 2. Make Stock Transfer from Warehouse A to Warehouse B: Qty 6
        $transferResponse = $this->actingAs($this->user)->postJson('/api/backend/stock-transfers', [
            'branch_id' => $this->branch->id,
            'warehouse_id' => $this->warehouseA->id,
            'counterpart_warehouse_id' => $this->warehouseB->id,
            'document_number' => 'TR.2026.06.00001',
            'process_type' => 'Mutasi Barang',
            'document_date' => '2026-06-12',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 6,
                ],
            ],
        ]);

        $transferResponse->assertCreated();

        // Warehouse A's batch should have 4 remaining (10 - 6 consumed)
        $this->assertDatabaseHas('inventory_batches', [
            'warehouse_id' => $this->warehouseA->id,
            'qty_remaining' => 4,
            'unit_cost' => 100,
        ]);

        // A new batch should be created in Warehouse B for the transferred quantity: Qty 6 @ 100
        $this->assertDatabaseHas('inventory_batches', [
            'warehouse_id' => $this->warehouseB->id,
            'qty_received' => 6,
            'qty_remaining' => 6,
            'unit_cost' => 100,
            'source_type' => \App\Domain\Inventory\Models\StockTransfer::class,
        ]);
    }
}
