<?php

namespace Tests\Feature;

use Illuminate\Auth\Middleware\Authenticate;
use Tests\TestCase;

class BackendResourceApiTest extends TestCase
{
    public function test_backend_resource_api_requires_authentication(): void
    {
        $response = $this->getJson('/api/backend/not-a-resource');

        $response
            ->assertUnauthorized()
            ->assertJson([
                'message' => 'Authentication is required for this request.',
            ]);
    }

    public function test_unknown_backend_resource_returns_json_not_found_when_authenticated_layer_is_bypassed(): void
    {
        $response = $this
            ->withoutMiddleware(Authenticate::class)
            ->getJson('/api/backend/not-a-resource');

        $response
            ->assertNotFound()
            ->assertJson([
                'message' => 'Resource not found.',
            ]);
    }
}
