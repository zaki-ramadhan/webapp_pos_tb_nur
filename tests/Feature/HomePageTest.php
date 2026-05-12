<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    public function test_the_home_page_renders_the_login_flow_that_targets_the_dashboard(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('HomePage')
                ->where('carousel.imageSrc', 'https://images.unsplash.com/photo-1726065235239-b20b88d43eea?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600')
                ->where('login.submitHref', route('dashboard'))
                ->has('login'));
    }
}
