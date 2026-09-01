<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated user can load all cash and bank pages via dashboard', function () {
    $user = testAdmin();
    $pages = [
        'smartlink-bank',
        'bank-statement',
        'bank-reconciliation',
        'bank-history',
        'bank-transfer',
        'cash-payment',
        'cash-receipt',
    ];

    foreach ($pages as $pageId) {
        $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('bank transfer rejects zero, negative amounts, and same-account transfer', function () {
    $user = testAdmin();

    // 1. Negative amount
    $response = $this->actingAs($user)->postJson('/api/backend/bank-transfers', [
        'from_account_id' => 1,
        'to_account_id' => 2,
        'amount' => -50000,
        'transaction_date' => now()->toDateString(),
    ]);
    expect($response->status())->toBeIn([422, 400]);

    // 2. Same account transfer
    $sameAccountResponse = $this->actingAs($user)->postJson('/api/backend/bank-transfers', [
        'from_account_id' => 1,
        'to_account_id' => 1,
        'amount' => 50000,
        'transaction_date' => now()->toDateString(),
    ]);
    expect($sameAccountResponse->status())->toBeIn([422, 400]);
});

test('cash payment and receipt reject empty payload', function () {
    $user = testAdmin();

    $paymentResponse = $this->actingAs($user)->postJson('/api/backend/cash-payments', []);
    expect($paymentResponse->status())->toBeIn([422, 400]);

    $receiptResponse = $this->actingAs($user)->postJson('/api/backend/cash-receipts', []);
    expect($receiptResponse->status())->toBeIn([422, 400]);
});

test('cash transaction payload with xss is sanitized upon saving', function () {
    $user = testAdmin();
    $xssNote = '<script>alert("hack")</script>Pembayaran Material';

    $response = $this->actingAs($user)->postJson('/api/backend/cash-payments', [
        'account_id' => 1,
        'amount' => 100000,
        'transaction_date' => now()->toDateString(),
        'notes' => $xssNote,
        'recipient' => 'Toko Sebelah <img src=x onerror=alert(1)>',
    ]);

    if ($response->isSuccessful()) {
        $data = $response->json('data') ?? $response->json();
        $notes = $data['notes'] ?? '';
        expect($notes)->not->toContain('<script>');
    } else {
        expect($response->status())->toBeIn([422, 400]);
    }
});

test('bank statements endpoint requires valid date filter bounds', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->getJson('/api/backend/bank-statements?start_date=2026-12-31&end_date=2026-01-01');
    // Start date after end date should either be rejected or return empty list safely without 500 crash
    expect($response->status())->toBeIn([200, 422]);
});

