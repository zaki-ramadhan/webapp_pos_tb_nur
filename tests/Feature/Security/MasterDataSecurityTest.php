<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MasterDataSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_master_data_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'customers',
            'suppliers',
            'warehouse-master',
            'accounts',
            'users',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_customer_and_supplier_creation_require_valid_name(): void
    {
        $user = $this->createAuthorizedUser();

        $customerRes = $this->actingAs($user)->postJson('/api/backend/customers', []);
        $this->assertContains($customerRes->status(), [422, 400]);

        $supplierRes = $this->actingAs($user)->postJson('/api/backend/suppliers', []);
        $this->assertContains($supplierRes->status(), [422, 400]);
    }

    public function test_warehouse_rejects_empty_name(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/warehouses', [
            'name' => '',
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_chart_of_accounts_requires_code_and_valid_name(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/accounts', [
            'code' => '',
            'name' => '',
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_currency_rejects_negative_or_zero_exchange_rate(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/currencies', [
            'code' => 'USD',
            'name' => 'US Dollar',
            'exchange_rate' => -15000,
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }
}


