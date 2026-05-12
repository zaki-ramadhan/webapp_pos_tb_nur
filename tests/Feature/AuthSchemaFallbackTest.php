<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use PDO;
use Tests\TestCase;

class AuthSchemaFallbackTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_login_still_works_when_optional_user_profile_columns_are_not_migrated(): void
    {
        $this->dropOptionalUserProfileColumns();

        $user = User::query()->create([
            'name' => 'Zaki Ramadhan',
            'email' => 'zakiram4dhan@gmail.com',
            'password' => Hash::make('secret123'),
        ]);

        $this->post('/login', [
            'identifier' => 'zakiram4dhan@gmail.com',
            'password' => 'secret123',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_register_still_works_when_optional_user_profile_columns_are_not_migrated(): void
    {
        $this->dropOptionalUserProfileColumns();

        $this->post('/register', [
            'name' => 'Zaki Ramadhan',
            'email' => 'zakiram4dhan@gmail.com',
            'phone' => '08123456789',
            'password' => 'secret123',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'name' => 'Zaki Ramadhan',
            'email' => 'zakiram4dhan@gmail.com',
        ]);
    }

    private function dropOptionalUserProfileColumns(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['phone', 'is_active', 'last_login_at']);
        });
    }
}
