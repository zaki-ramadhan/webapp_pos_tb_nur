<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated user can load all purchase pages via dashboard', function () {
    $user = testAdmin();
    $pages = [
        'purchase-invoice',
        'purchase-deposit',
        'purchase-payment',
        'purchase-return',
    ];

    foreach ($pages as $pageId) {
        $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('purchase invoice rejects empty supplier or empty items payload', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/purchase-invoices', []);
    expect($response->status())->toBeIn([422, 400]);

    $noItemsResponse = $this->actingAs($user)->postJson('/api/backend/purchase-invoices', [
        'supplier_id' => 1,
        'transaction_date' => now()->toDateString(),
        'items' => [],
    ]);
    expect($noItemsResponse->status())->toBeIn([422, 400]);
});

test('purchase payment rejects negative or zero payment amount', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/purchase-payments', [
        'supplier_id' => 1,
        'payment_amount' => -100000,
        'transaction_date' => now()->toDateString(),
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('purchase return requires valid supplier and items', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/purchase-returns', [
        'supplier_id' => 1,
        'transaction_date' => now()->toDateString(),
        'items' => [],
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

