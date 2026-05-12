<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PDO;
use Tests\TestCase;

class AuthFlowRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_registered_user_can_logout_and_login_again_with_same_credentials(): void
    {
        config()->set('pos.auth.allow_public_registration', true);

        $credentials = [
            'name' => 'Zaki Ramadhan',
            'email' => 'zakiram4dhan@gmail.com',
            'phone' => '081214772370',
            'password' => '11223344',
        ];

        $this->post('/register', $credentials)
            ->assertRedirect(route('dashboard'));

        $user = User::query()->where('email', 'zakiram4dhan@gmail.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertTrue(Hash::check('11223344', $user->password));

        $this->post('/logout')
            ->assertRedirect(route('home'));

        $this->assertGuest();

        $this->post('/login', [
            'identifier' => 'zakiram4dhan@gmail.com',
            'password' => '11223344',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user->fresh());
    }

    public function test_login_accepts_equivalent_phone_formats_for_same_user(): void
    {
        $user = User::factory()->create([
            'email' => 'zakiram4dhan@gmail.com',
            'phone' => '+6281214772370',
            'password' => Hash::make('11223344'),
            'is_active' => true,
        ]);

        $this->post('/login', [
            'identifier' => '081214772370',
            'password' => '11223344',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_rejects_wrong_password_for_existing_user(): void
    {
        User::factory()->create([
            'email' => 'zakiram4dhan@gmail.com',
            'phone' => '+6281214772370',
            'password' => Hash::make('11223344'),
            'is_active' => true,
        ]);

        $this->from('/')->post('/login', [
            'identifier' => 'zakiram4dhan@gmail.com',
            'password' => 'salah-total',
        ])->assertRedirect('/')
            ->assertSessionHasErrors([
                'auth' => 'Email, nomor handphone, atau password tidak valid.',
            ]);

        $this->assertGuest();
    }

    public function test_login_rejects_inactive_user_even_with_valid_password(): void
    {
        User::factory()->create([
            'email' => 'zakiram4dhan@gmail.com',
            'phone' => '+6281214772370',
            'password' => Hash::make('11223344'),
            'is_active' => false,
        ]);

        $this->from('/')->post('/login', [
            'identifier' => 'zakiram4dhan@gmail.com',
            'password' => '11223344',
        ])->assertRedirect('/')
            ->assertSessionHasErrors([
                'auth' => 'Email, nomor handphone, atau password tidak valid.',
            ]);

        $this->assertGuest();
    }
}
