<?php

namespace Tests\Feature;

use App\Domain\Identity\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MobileApiV1Test extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'kasir@tbnur.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'kasir@tbnur.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_without_store_role_cannot_login_on_mobile(): void
    {
        $user = User::factory()->create([
            'email' => 'orangluar@gmail.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'orangluar@gmail.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Akun Anda belum memiliki peran toko yang sah. Hubungi Owner untuk mengaktifkan akses Anda.');
    }

    public function test_user_without_store_role_cannot_access_conventional_backend_api(): void
    {
        $user = User::factory()->create([
            'email' => 'orangluar@gmail.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/backend/banks');

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Akun Anda belum memiliki peran toko yang sah. Hubungi Owner untuk mengaktifkan akses Anda.');
    }

    public function test_mobile_login_succeeds_and_returns_bearer_token(): void
    {
        $role = Role::create([
            'name' => 'Super Admin',
            'code' => 'super_admin',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'name' => 'Zaki Ramadhan',
            'email' => 'zaki@tbnur.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $user->roles()->attach($role);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'zaki@tbnur.com',
            'password' => 'password123',
            'device_name' => 'Samsung Kasir',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'zaki@tbnur.com')
            ->assertJsonPath('data.token_type', 'Bearer');

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_protected_routes_require_bearer_token(): void
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/products');
        $response->assertStatus(401);
    }

    public function test_authenticated_mobile_user_can_access_me_and_resources(): void
    {
        $role = Role::create([
            'name' => 'Super Admin',
            'code' => 'super_admin',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'name' => 'Owner TB Nur',
            'email' => 'owner@tbnur.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);
        $user->roles()->attach($role);

        $token = $user->createToken('TestDevice')->plainTextToken;

        // Test GET /api/v1/auth/me
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'owner@tbnur.com');

        // Test GET /api/v1/products
        $productResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/products');

        $productResponse->assertOk();

        // Test POST /api/v1/auth/logout
        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $logoutResponse->assertOk()
            ->assertJsonPath('success', true);

        // Verifikasi token telah dihapus dari database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }
}
