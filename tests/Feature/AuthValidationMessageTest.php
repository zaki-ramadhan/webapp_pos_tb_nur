<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthValidationMessageTest extends TestCase
{
    public function test_login_empty_payload_returns_indonesian_validation_messages(): void
    {
        $response = $this->from('/')->post('/login', []);

        $response
            ->assertRedirect('/')
            ->assertSessionHasErrors([
                'identifier' => 'Email atau nomor handphone wajib diisi.',
                'password' => 'Password wajib diisi.',
            ]);
    }

    public function test_forgot_password_empty_payload_returns_indonesian_validation_message(): void
    {
        $response = $this->from('/')->post('/forgot-password', []);

        $response
            ->assertRedirect('/')
            ->assertSessionHasErrors([
                'identifier' => 'Email atau nomor handphone wajib diisi.',
            ]);
    }

    public function test_reset_password_empty_payload_returns_indonesian_validation_messages(): void
    {
        $response = $this->from('/reset-password/sample-token')->post('/reset-password', []);

        $response
            ->assertRedirect('/reset-password/sample-token')
            ->assertSessionHasErrors([
                'email' => 'Email wajib diisi.',
                'password' => 'Password baru wajib diisi.',
            ]);
    }
}
