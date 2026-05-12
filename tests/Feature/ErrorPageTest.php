<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    public function test_missing_web_route_renders_the_friendly_error_page(): void
    {
        $this->get('/halaman-yang-tidak-ada')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page
                ->component('ErrorPage')
                ->where('status', 404));
    }

    public function test_maintenance_response_renders_the_friendly_error_page(): void
    {
        Route::middleware('web')->get('/_test/error-503', fn () => abort(503));

        $this->get('/_test/error-503')
            ->assertStatus(503)
            ->assertInertia(fn (Assert $page) => $page
                ->component('ErrorPage')
                ->where('status', 503));
    }

    public function test_server_exception_renders_the_friendly_error_page(): void
    {
        Route::middleware('web')->get('/_test/error-500', function () {
            throw new RuntimeException('forced failure');
        });

        $this->get('/_test/error-500')
            ->assertStatus(500)
            ->assertInertia(fn (Assert $page) => $page
                ->component('ErrorPage')
                ->where('status', 500));
    }
}
