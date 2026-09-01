<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated user can load all master data pages via dashboard', function () {
    $user = testAdmin();
    $pages = [
        'customers',
        'suppliers',
        'warehouse-master',
        'accounts',
        'currency-master',
    ];

    foreach ($pages as $pageId) {
        $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('customer and supplier creation require valid name', function () {
    $user = testAdmin();

    $customerRes = $this->actingAs($user)->postJson('/api/backend/customers', []);
    expect($customerRes->status())->toBeIn([422, 400]);

    $supplierRes = $this->actingAs($user)->postJson('/api/backend/suppliers', []);
    expect($supplierRes->status())->toBeIn([422, 400]);
});

test('warehouse rejects empty name', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/warehouses', [
        'name' => '',
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('chart of accounts requires code and valid name', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/accounts', [
        'code' => '',
        'name' => '',
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('currency rejects negative or zero exchange rate', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/currencies', [
        'code' => 'USD',
        'name' => 'US Dollar',
        'exchange_rate' => -15000,
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

