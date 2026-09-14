<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class ProductDimensionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_product_can_save_and_update_dimensions_and_weight(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/backend/products', [
            'code' => 'PRD-DIM-01',
            'name' => 'Keramik Granit 60x60',
            'product_type' => 'Persediaan',
            'length' => 60.5,
            'width' => 60.5,
            'height' => 1.2,
            'weight' => 3500,
        ]);

        $response->assertCreated();
        $productId = $response->json('data.id');

        $this->assertDatabaseHas('products', [
            'id' => $productId,
            'length' => 60.5,
            'width' => 60.5,
            'height' => 1.2,
            'weight' => 3500,
        ]);

        // Update dimensions
        $updateResponse = $this->actingAs($user)->putJson("/api/backend/products/{$productId}", [
            'code' => 'PRD-DIM-01',
            'name' => 'Keramik Granit 60x60 (Updated)',
            'product_type' => 'Persediaan',
            'length' => 61.0,
            'width' => 61.0,
            'height' => 1.5,
            'weight' => 3600,
        ]);

        $updateResponse->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $productId,
            'length' => 61.0,
            'width' => 61.0,
            'height' => 1.5,
            'weight' => 3600,
        ]);

        $getResponse = $this->actingAs($user)->getJson("/api/backend/products/{$productId}");
        $getResponse->assertOk();
        $this->assertEquals(61.0, (float) $getResponse->json('data.length'));
        $this->assertEquals(61.0, (float) $getResponse->json('data.width'));
        $this->assertEquals(1.5, (float) $getResponse->json('data.height'));
        $this->assertEquals(3600, (float) $getResponse->json('data.weight'));
    }
}
