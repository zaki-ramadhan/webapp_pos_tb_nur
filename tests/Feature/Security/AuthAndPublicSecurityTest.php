<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthAndPublicSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_visitor_cannot_access_dashboard_and_is_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_public_auth_pages_are_accessible_without_authentication(): void
    {
        $this->get('/login')->assertOk();
        $this->get('/register')->assertOk();
    }

    public function test_login_requires_identifier_and_password(): void
    {
        $response = $this->post('/login', [
            'identifier' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['identifier', 'password']);
    }

    public function test_login_rejects_sql_injection_payloads_in_identifier_gracefully(): void
    {
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
    }

    public function test_register_sanitizes_xss_injection_payload_in_name(): void
    {
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
            $this->assertStringNotContainsString('<script>', $createdUser->name);
        }
    }

    public function test_authenticated_user_can_view_dashboard_with_inertia_state(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
    }

    public function test_logout_revokes_session_and_redirects(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->post('/logout');
        $response->assertRedirect('/');
        $this->assertGuest();
    }
}


