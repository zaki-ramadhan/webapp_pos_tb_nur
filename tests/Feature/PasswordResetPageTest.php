<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PasswordResetPageTest extends TestCase
{
    public function test_the_reset_password_page_renders_the_auth_flow(): void
    {
        $this->get('/reset-password/sample-token?email=user@example.com')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ResetPasswordPage')
                ->where('resetPassword.token', 'sample-token')
                ->where('resetPassword.email', 'user@example.com')
                ->where('carousel.imageSrc', '/auth_bg.png'));
    }
}
