<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Organization\Models\Branch;
use App\Models\User;
use App\Support\Backend\Queries\InventoryInquiryQueryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class ProductMultiUnitConversionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_product_resource_can_create_and_sync_multi_unit_conversions(): void
    {
        $user = User::factory()->create();
        $pcs = Unit::query()->create(['code' => 'PCS', 'name' => 'PCS']);
        $box = Unit::query()->create(['code' => 'BOX', 'name' => 'Box']);
        $karton = Unit::query()->create(['code' => 'KRT', 'name' => 'Karton']);

        // 1. Create product with multi unit conversions
        $response = $this->actingAs($user)->postJson('/api/backend/products', [
            'code' => 'PRD-MULTI-01',
            'name' => 'Barang Multi Satuan',
            'product_type' => 'Persediaan',
            'base_unit_id' => $pcs->id,
            'unit_conversions' => [
                ['unit_id' => $box->id, 'quantity' => 24],
                ['unit_id' => $karton->id, 'quantity' => 120],
            ],
        ]);

        $response->assertCreated();
        $productId = $response->json('data.id');

        $this->assertDatabaseHas('product_unit_conversions', [
            'product_id' => $productId,
            'unit_id' => $box->id,
            'quantity' => 24,
        ]);
        $this->assertDatabaseHas('product_unit_conversions', [
            'product_id' => $productId,
            'unit_id' => $karton->id,
            'quantity' => 120,
        ]);

        // 2. Fetch product via GET and verify relations are loaded
        $getResponse = $this->actingAs($user)->getJson('/api/backend/products/' . $productId);
        $getResponse->assertOk();
        $this->assertCount(2, $getResponse->json('data.unit_conversions'));

        // 3. Update product: change Box ratio to 12, delete Karton
        $updateResponse = $this->actingAs($user)->putJson('/api/backend/products/' . $productId, [
            'code' => 'PRD-MULTI-01',
            'name' => 'Barang Multi Satuan Updated',
            'product_type' => 'Persediaan',
            'base_unit_id' => $pcs->id,
            'unit_conversions' => [
                ['unit_id' => $box->id, 'quantity' => 12],
            ],
        ]);

        $updateResponse->assertOk();
        $this->assertDatabaseHas('product_unit_conversions', [
            'product_id' => $productId,
            'unit_id' => $box->id,
            'quantity' => 12,
        ]);
        $this->assertDatabaseMissing('product_unit_conversions', [
            'product_id' => $productId,
            'unit_id' => $karton->id,
        ]);
    }

    public function test_inventory_inquiry_formats_multi_unit_breakdown(): void
    {
        $branch = Branch::query()->create([
            'code' => 'BR-01',
            'name' => 'Cabang Utama',
            'is_active' => true,
        ]);
        $warehouse = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'WH-01',
            'name' => 'Gudang Utama',
            'is_active' => true,
        ]);

        $pcs = Unit::query()->create(['code' => 'PCS', 'name' => 'PCS']);
        $box = Unit::query()->create(['code' => 'BOX', 'name' => 'Box']);

        $product = Product::query()->create([
            'code' => 'PRD-TEST-50',
            'name' => 'Barang Uji Multi Satuan',
            'product_type' => 'Persediaan',
            'base_unit_id' => $pcs->id,
        ]);

        $product->unitConversions()->create([
            'unit_id' => $box->id,
            'quantity' => 24,
        ]);

        $service = app(InventoryInquiryQueryService::class);

        // Reflection to test formatMultiUnitQuantity
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('formatMultiUnitQuantity');
        $method->setAccessible(true);

        // 50 PCS with 1 Box = 24 PCS => 2 Box 2 PCS
        $formatted50 = $method->invoke($service, 50.0, $product);
        $this->assertEquals('2 Box 2 PCS', $formatted50);

        // 48 PCS with 1 Box = 24 PCS => 2 Box
        $formatted48 = $method->invoke($service, 48.0, $product);
        $this->assertEquals('2 Box', $formatted48);

        // 10 PCS with 1 Box = 24 PCS => 10 PCS
        $formatted10 = $method->invoke($service, 10.0, $product);
        $this->assertEquals('10 PCS', $formatted10);

        // 0 PCS => 0 PCS
        $formatted0 = $method->invoke($service, 0.0, $product);
        $this->assertEquals('0 PCS', $formatted0);
    }
}
