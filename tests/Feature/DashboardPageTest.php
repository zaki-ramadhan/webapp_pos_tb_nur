<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPageTest extends TestCase
{
    public function test_the_dashboard_page_renders_the_post_login_experience(): void
    {
        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('DashboardPage')
                ->where('dashboard.user.name', 'Zaki Ramadhan')
                ->where('dashboard.sample.id', 'retail')
                ->has('dashboard.sampleDashboard.widgets', 8));
    }
}
