<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Middleware\Authenticate;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPageTest extends TestCase
{
    public function test_the_dashboard_page_redirects_guests_to_home(): void
    {
        $this->get('/dashboard')
            ->assertRedirect(route('home'));
    }

    public function test_the_dashboard_page_renders_when_auth_middleware_is_bypassed(): void
    {
        $this->withoutMiddleware(Authenticate::class)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('DashboardPage')
                ->where('dashboard.user.name', 'Zaki Ramadhan')
                ->where('dashboard.sample.id', 'retail')
                ->has('dashboard.sampleDashboard.widgets', 15));
    }

    public function test_the_dashboard_page_uses_authenticated_user_identity_for_the_header(): void
    {
        $user = User::factory()->make([
            'id' => 99,
            'name' => 'Google User',
            'email' => 'google.user@example.com',
            'google_avatar' => 'https://example.com/avatar.png',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('DashboardPage')
                ->where('dashboard.user.name', 'Google User')
                ->where('dashboard.user.email', 'google.user@example.com')
                ->where('dashboard.user.avatarUrl', 'https://example.com/avatar.png')
                ->where('dashboard.user.status', 'active')
                ->where('auth.user.name', 'Google User')
                ->where('auth.user.avatarUrl', 'https://example.com/avatar.png'));
    }
}
