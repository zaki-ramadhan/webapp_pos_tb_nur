<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

use App\Models\User;

test('unauthenticated visitor cannot access dashboard and is redirected to login', function () {
    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
});

test('public auth pages are accessible without authentication', function () {
    $this->get('/login')->assertOk();
    $this->get('/register')->assertOk();
});

test('login requires identifier and password', function () {
    $response = $this->post('/login', [
        'identifier' => '',
        'password' => '',
    ]);

    $response->assertSessionHasErrors(['identifier', 'password']);
});

test('login rejects sql injection payloads in identifier gracefully', function () {
    $payloads = [
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT 1, 'admin', 'password'--",
    ];

    foreach ($payloads as $payload) {
        $response = $this->post('/login', [
            'identifier' => $payload,
            'password' => 'anypassword',
        ]);

        $response->assertSessionHasErrors('auth');
    }
});

test('register sanitizes xss injection payload in name', function () {
    config()->set('pos.auth.allow_public_registration', true);

    $xssPayload = '<script>alert("XSS")</script>Test User';
    $uniqueEmail = 'xss_sec_' . uniqid() . '@example.com';

    $response = $this->post('/register', [
        'name' => $xssPayload,
        'email' => $uniqueEmail,
        'phone' => '081234567890',
        'password' => '11223344',
        'password_confirmation' => '11223344',
    ]);

    $createdUser = User::where('email', $uniqueEmail)->first();
    if ($createdUser) {
        expect($createdUser->name)->not->toContain('<script>');
    }
});

test('authenticated user can view dashboard with inertia state', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('DashboardPage'));
});

test('logout revokes session and redirects', function () {
    $user = testAdmin();

    $response = $this->actingAs($user)->post('/logout');
    $response->assertRedirect('/');
    $this->assertGuest();
});

