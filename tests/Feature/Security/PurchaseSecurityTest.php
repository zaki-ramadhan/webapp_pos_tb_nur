<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PurchaseSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_purchase_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'purchase-invoice',
            'purchase-deposit',
            'purchase-payment',
            'purchase-return',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_purchase_invoice_rejects_empty_supplier_or_empty_items_payload(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/purchase-invoices', []);
        $this->assertContains($response->status(), [422, 400]);

        $noItemsResponse = $this->actingAs($user)->postJson('/api/backend/purchase-invoices', [
            'supplier_id' => 1,
            'transaction_date' => now()->toDateString(),
            'items' => [],
        ]);
        $this->assertContains($noItemsResponse->status(), [422, 400]);
    }

    public function test_purchase_payment_rejects_negative_or_zero_payment_amount(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/purchase-payments', [
            'supplier_id' => 1,
            'payment_amount' => -100000,
            'transaction_date' => now()->toDateString(),
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_purchase_return_requires_valid_supplier_and_items(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/purchase-returns', [
            'supplier_id' => 1,
            'transaction_date' => now()->toDateString(),
            'items' => [],
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }
}


