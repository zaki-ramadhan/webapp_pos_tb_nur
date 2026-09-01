<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated user can load all inventory and catalog pages via dashboard', function () {
    $user = testAdmin();
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
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('product creation rejects empty payload and sanitizes malicious input', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/products', []);
    expect($response->status())->toBeIn([422, 400]);

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
        expect($data['name'] ?? '')->not->toContain('<script>');
    }
});

test('product categories reject empty name', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/product-categories', [
        'name' => '',
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('units reject empty code or name', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/units', [
        'name' => '',
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('inventory adjustment requires valid warehouse and items', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/inventory-adjustments', [
        'warehouse_id' => null,
        'items' => [],
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

