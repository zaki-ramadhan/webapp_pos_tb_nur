<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryAndCatalogSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_inventory_and_catalog_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'items-services',
            'item-category',
            'item-unit',
            'inventory-adjustment',
            'item-location',
            'minimum-stock',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_product_creation_rejects_empty_payload_and_sanitizes_malicious_input(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/products', []);
        $this->assertContains($response->status(), [422, 400]);

        $xssProduct = [
            'name' => '<script>alert(1)</script>Paku Beton 5cm',
            'code' => 'PB-05',
            'unit_id' => 1,
            'purchase_price' => 15000,
            'selling_price' => 20000,
        ];

        $createResponse = $this->actingAs($user)->postJson('/api/backend/products', $xssProduct);
        if ($createResponse->isSuccessful()) {
            $data = $createResponse->json('data') ?? $createResponse->json();
            $this->assertStringNotContainsString('<script>', $data['name'] ?? '');
        }
    }

    public function test_product_categories_reject_empty_name(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/product-categories', [
            'name' => '',
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_units_reject_empty_code_or_name(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/units', [
            'name' => '',
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_inventory_adjustment_requires_valid_warehouse_and_items(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/inventory-adjustments', [
            'warehouse_id' => null,
            'items' => [],
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }
}


