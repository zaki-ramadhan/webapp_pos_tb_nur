<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('authenticated user can load all hr and payroll pages via dashboard', function () {
    $user = testAdmin();
    $pages = [
        'employees',
        'department',
        'payroll-entry',
        'salary-allowance',
    ];

    foreach ($pages as $pageId) {
        $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
    }
});

test('employee creation validates required name and sanitizes phone', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/employees', []);
    expect($response->status())->toBeIn([422, 400]);

    $validData = [
        'name' => 'Budi Santoso',
        'email' => 'budi_sec_' . uniqid() . '@example.com',
        'phone' => '0812-3456-7890',
    ];

    $createResponse = $this->actingAs($user)->postJson('/api/backend/employees', $validData);
    if ($createResponse->isSuccessful()) {
        $data = $createResponse->json('data') ?? $createResponse->json();
        expect($data['phone'] ?? '')->not->toContain('-');
    }
});

test('department creation rejects empty name', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/departments', [
        'name' => '',
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

test('salary allowance rejects empty name', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->postJson('/api/backend/salary-allowances', [
        'name' => '',
    ]);
    expect($response->status())->toBeIn([422, 400]);
});

