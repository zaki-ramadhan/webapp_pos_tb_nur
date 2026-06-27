<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegisterPageTest extends TestCase
{
    public function test_the_register_page_renders_the_auth_flow(): void
    {
        config()->set('pos.auth.allow_public_registration', true);

        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('RegisterPage')
                ->where('carousel.imageSrc', '/auth_bg.png')
                ->has('register'));
    }
}
