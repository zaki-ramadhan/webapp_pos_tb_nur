<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

use App\Models\User;

test('authenticated user can load all accounting and system pages via dashboard', function () {
    $user = testAdmin();
    $pages = [
        'general-journal',
        'journal-activity-log',
        'activity-log',
        'expense-entry',
        'delivery-order',
        'preferences',
        'group-access',
        'users',
    ];

    foreach ($pages as $pageId) {
        $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('general journal rejects unbalanced debit and credit entries', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/general-journals', [
        'transaction_date' => now()->toDateString(),
        'items' => [
            ['account_id' => 1, 'debit' => 100000, 'credit' => 0],
            ['account_id' => 2, 'debit' => 0, 'credit' => 50000], // Unbalanced: 100k vs 50k
        ],
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('expense entry rejects zero or negative expense amount', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/expense-entries', [
        'account_id' => 1,
        'amount' => -50000,
        'transaction_date' => now()->toDateString(),
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('unauthorized non-admin user cannot modify access groups or preferences', function () {
    // Create unprivileged user
    $regularUser = User::factory()->create(['is_active' => true]);

    $groupResponse = $this->actingAs($regularUser)->postJson('/api/backend/access-groups', [
        'name' => 'Hacker Admin Group',
        'is_active' => true,
    ]);
    expect($groupResponse->status())->toBeIn([403, 401]);

    $prefResponse = $this->actingAs($regularUser)->postJson('/api/backend/preferences', [
        'store_name' => 'Compromised Store',
    ]);
    expect($prefResponse->status())->toBeIn([403, 401]);
});

test('delivery order requires valid customer and items payload', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/delivery-orders', []);
    expect($response->status())->toBeIn([422, 400]);
});

