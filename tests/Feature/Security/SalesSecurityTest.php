<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SalesSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_sales_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'sales-invoice',
            'sales-deposit',
            'sales-receipt',
            'sales-return',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_sales_invoice_rejects_empty_customer_and_empty_items_payload(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/sales-invoices', []);
        $this->assertContains($response->status(), [422, 400]);

        $noItemsResponse = $this->actingAs($user)->postJson('/api/backend/sales-invoices', [
            'customer_id' => 1,
            'transaction_date' => now()->toDateString(),
            'items' => [],
        ]);
        $this->assertContains($noItemsResponse->status(), [422, 400]);
    }

    public function test_sales_transactions_reject_negative_unit_price_and_negative_quantity(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/sales-invoices', [
            'customer_id' => 1,
            'transaction_date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => 1,
                    'quantity' => -5,
                    'unit_price' => -10000,
                ],
            ],
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_sales_return_validates_target_invoice_or_items_properly(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/sales-returns', [
            'customer_id' => 1,
            'transaction_date' => now()->toDateString(),
            'items' => [],
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_sales_receipt_rejects_negative_payment_amount(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/sales-receipts', [
            'customer_id' => 1,
            'payment_amount' => -250000,
            'transaction_date' => now()->toDateString(),
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }
}


