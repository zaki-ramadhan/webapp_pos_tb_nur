<?php

namespace Tests\Feature;

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
}
