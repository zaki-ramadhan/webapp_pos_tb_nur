<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as OAuthUser;
use Laravel\Socialite\Facades\Socialite;
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

        config()->set('services.google.client_id', 'test-google-client');
        config()->set('services.google.client_secret', 'test-google-secret');
        config()->set('services.google.redirect', 'http://localhost/auth/google/callback');
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

    public function test_google_callback_logs_in_existing_user_and_links_google_identity(): void
    {
        $user = User::factory()->create([
            'email' => 'google.user@example.com',
            'is_active' => true,
            'google_id' => null,
            'google_avatar' => null,
        ]);

        $this->mockGoogleUser(
            id: 'google-user-123',
            email: 'google.user@example.com',
            name: 'Google User',
            avatar: 'https://example.com/avatar.png',
        );

        $this->get('/auth/google/callback?code=fake-code')
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user->fresh());
        $this->assertSame('google-user-123', $user->fresh()->google_id);
        $this->assertSame('https://example.com/avatar.png', $user->fresh()->google_avatar);
        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_google_callback_creates_new_user_when_email_not_registered(): void
    {
        $this->mockGoogleUser(
            id: 'google-new-456',
            email: 'new.google.user@example.com',
            name: 'New Google User',
            avatar: 'https://example.com/new-avatar.png',
        );

        $this->get('/auth/google/callback?code=fake-code')
            ->assertRedirect(route('dashboard'));

        $user = User::query()->where('email', 'new.google.user@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertSame('google-new-456', $user->google_id);
        $this->assertSame('https://example.com/new-avatar.png', $user->google_avatar);
        $this->assertTrue((bool) $user->is_active);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_google_callback_rejects_inactive_existing_user(): void
    {
        User::factory()->create([
            'email' => 'inactive.google.user@example.com',
            'is_active' => false,
        ]);

        $this->mockGoogleUser(
            id: 'google-inactive-789',
            email: 'inactive.google.user@example.com',
            name: 'Inactive Google User',
            avatar: 'https://example.com/inactive-avatar.png',
        );

        $this->from('/')->get('/auth/google/callback?code=fake-code')
            ->assertRedirect(route('home'))
            ->assertSessionHasErrors([
                'auth' => 'Akun ini tidak aktif. Hubungi administrator.',
            ]);

        $this->assertGuest();
    }

    public function test_google_callback_popup_success(): void
    {
        $user = User::factory()->create([
            'email' => 'google.popup@example.com',
            'is_active' => true,
        ]);

        $this->mockGoogleUser(
            id: 'google-popup-123',
            email: 'google.popup@example.com',
            name: 'Popup User',
            avatar: 'https://example.com/avatar.png',
        );

        $this->withSession(['auth_use_popup' => true])
            ->get('/auth/google/callback?code=fake-code')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
            ->assertSee('window.opener.postMessage')
            ->assertSee('success')
            ->assertSee('Berhasil masuk dengan Google.');

        $this->assertAuthenticatedAs($user->fresh());
    }

    public function test_google_callback_popup_error_inactive_user(): void
    {
        User::factory()->create([
            'email' => 'inactive.popup@example.com',
            'is_active' => false,
        ]);

        $this->mockGoogleUser(
            id: 'google-popup-456',
            email: 'inactive.popup@example.com',
            name: 'Inactive Popup User',
            avatar: 'https://example.com/avatar.png',
        );

        $this->withSession(['auth_use_popup' => true])
            ->get('/auth/google/callback?code=fake-code')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
            ->assertSee('window.opener.postMessage')
            ->assertSee('error')
            ->assertSee('Akun ini tidak aktif. Hubungi administrator.');

        $this->assertGuest();
    }

    public function test_google_redirect_popup_error_when_config_missing(): void
    {
        config()->set('services.google.client_id', null);

        $this->get('/auth/google?popup=1')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
            ->assertSee('window.opener.postMessage')
            ->assertSee('error')
            ->assertSee('Login Google belum dikonfigurasi.');
    }

    private function mockGoogleUser(string $id, string $email, string $name, string $avatar): void
    {
        $oauthUser = \Mockery::mock(OAuthUser::class);
        $oauthUser->shouldReceive('getId')->andReturn($id);
        $oauthUser->shouldReceive('getEmail')->andReturn($email);
        $oauthUser->shouldReceive('getName')->andReturn($name);
        $oauthUser->shouldReceive('getNickname')->andReturn(null);
        $oauthUser->shouldReceive('getAvatar')->andReturn($avatar);

        $provider = \Mockery::mock(Provider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($oauthUser);

        Socialite::shouldReceive('driver')
            ->once()
            ->with('google')
            ->andReturn($provider);
    }
}
