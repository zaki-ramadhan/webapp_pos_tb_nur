<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicRegistrationAvailabilityTest extends TestCase
{
    public function test_login_page_hides_signup_prompt_when_public_registration_is_disabled(): void
    {
        config()->set('pos.auth.allow_public_registration', false);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('HomePage')
                ->where('login.signupPrompt', null)
                ->where('login.signupCta', null)
                ->where('login.signupHref', null));
    }

    public function test_register_page_returns_not_found_when_public_registration_is_disabled(): void
    {
        config()->set('pos.auth.allow_public_registration', false);

        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
    }
}
