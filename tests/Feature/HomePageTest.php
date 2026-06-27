<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PDO;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;
    public function test_the_home_page_renders_the_login_flow_that_targets_the_dashboard(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('HomePage')
                ->where('carousel.imageSrc', '/auth_bg.png')
                ->where('login.submitHref', route('dashboard'))
                ->has('login'));
    }

    public function test_home_page_can_auto_login_first_user_when_local_dev_flag_is_enabled(): void
    {
        $this->skipWhenSqliteDriverIsUnavailable();

        config()->set('pos.auth.allow_local_auto_login', true);

        $user = User::factory()->create();

        $this->get('/login')
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_home_page_can_auto_login_configured_user_when_local_dev_flag_is_enabled(): void
    {
        $this->skipWhenSqliteDriverIsUnavailable();

        config()->set('pos.auth.allow_local_auto_login', true);

        User::factory()->create(['email' => 'other@example.com']);
        $targetUser = User::factory()->create(['email' => 'chosen@example.com']);

        config()->set('pos.auth.local_auto_login_email', 'chosen@example.com');

        $this->get('/login')
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($targetUser);
    }

    private function skipWhenSqliteDriverIsUnavailable(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }
    }
}
