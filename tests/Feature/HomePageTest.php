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
                ->where('carousel.autoplayMs', 5000)
                ->where('login.submitHref', route('dashboard'))
                ->has('carousel.slides', 3)
                ->has('login'));
    }
}
