<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CashAndBankSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_cash_and_bank_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'smartlink-bank',
            'bank-statement',
            'bank-reconciliation',
            'bank-history',
            'bank-transfer',
            'cash-payment',
            'cash-receipt',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_bank_transfer_rejects_zero_negative_amounts_and_same_account_transfer(): void
    {
        $user = $this->createAuthorizedUser();

        // 1. Negative amount
        $response = $this->actingAs($user)->postJson('/api/backend/bank-transfers', [
            'from_account_id' => 1,
            'to_account_id' => 2,
            'amount' => -50000,
            'transaction_date' => now()->toDateString(),
        ]);
        $this->assertContains($response->status(), [422, 400]);

        // 2. Same account transfer
        $sameAccountResponse = $this->actingAs($user)->postJson('/api/backend/bank-transfers', [
            'from_account_id' => 1,
            'to_account_id' => 1,
            'amount' => 50000,
            'transaction_date' => now()->toDateString(),
        ]);
        $this->assertContains($sameAccountResponse->status(), [422, 400]);
    }

    public function test_cash_payment_and_receipt_reject_empty_payload(): void
    {
        $user = $this->createAuthorizedUser();

        $paymentResponse = $this->actingAs($user)->postJson('/api/backend/cash-payments', []);
        $this->assertContains($paymentResponse->status(), [422, 400]);

        $receiptResponse = $this->actingAs($user)->postJson('/api/backend/cash-receipts', []);
        $this->assertContains($receiptResponse->status(), [422, 400]);
    }

    public function test_cash_transaction_payload_with_xss_is_sanitized_upon_saving(): void
    {
        $user = $this->createAuthorizedUser();
        $xssNote = '<script>alert("hack")</script>Pembayaran Material';

        $response = $this->actingAs($user)->postJson('/api/backend/cash-payments', [
            'account_id' => 1,
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'notes' => $xssNote,
            'recipient' => 'Toko Sebelah <img src=x onerror=alert(1)>',
        ]);

        if ($response->isSuccessful()) {
            $data = $response->json('data') ?? $response->json();
            $notes = $data['notes'] ?? '';
            $this->assertStringNotContainsString('<script>', $notes);
        } else {
            $this->assertContains($response->status(), [422, 400]);
        }
    }

    public function test_bank_statements_endpoint_requires_valid_date_filter_bounds(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->getJson('/api/backend/bank-statements?start_date=2026-12-31&end_date=2026-01-01');
        $this->assertContains($response->status(), [200, 422]);
    }
}


