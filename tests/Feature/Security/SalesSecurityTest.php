<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated user can load all sales pages via dashboard', function () {
    $user = testAdmin();
    $pages = [
        'sales-invoice',
        'sales-deposit',
        'sales-receipt',
        'sales-return',
        'sales-checkin',
    ];

    foreach ($pages as $pageId) {
        $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('sales invoice rejects empty customer and empty items payload', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/sales-invoices', []);
    expect($response->status())->toBeIn([422, 400]);

    $noItemsResponse = $this->actingAs($user)->postJson('/api/backend/sales-invoices', [
        'customer_id' => 1,
        'transaction_date' => now()->toDateString(),
        'items' => [],
    ]);
    expect($noItemsResponse->status())->toBeIn([422, 400]);
});

test('sales transactions reject negative unit price and negative quantity', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/sales-invoices', [
        'customer_id' => 1,
        'transaction_date' => now()->toDateString(),
        'items' => [
            [
                'product_id' => 1,
                'quantity' => -5,
                'unit_price' => -10000,
            ],
        ],
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('sales return validates target invoice or items properly', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/sales-returns', [
        'customer_id' => 1,
        'transaction_date' => now()->toDateString(),
        'items' => [],
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('sales receipt rejects negative payment amount', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/sales-receipts', [
        'customer_id' => 1,
        'payment_amount' => -250000,
        'transaction_date' => now()->toDateString(),
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

