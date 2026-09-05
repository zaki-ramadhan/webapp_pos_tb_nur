<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountingAndSystemSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_accounting_and_system_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'general-journal',
            'journal-activity-log',
            'activity-log',
            'expense-entry',
            'delivery-order',
            'preferences',
            'group-access',
            'users',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_general_journal_rejects_unbalanced_debit_and_credit_entries(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/general-journals', [
            'transaction_date' => now()->toDateString(),
            'items' => [
                ['account_id' => 1, 'debit' => 100000, 'credit' => 0],
                ['account_id' => 2, 'debit' => 0, 'credit' => 50000],
            ],
        ]);

        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_expense_entry_rejects_zero_or_negative_expense_amount(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/expense-entries', [
            'account_id' => 1,
            'amount' => -50000,
            'transaction_date' => now()->toDateString(),
        ]);

        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_unauthorized_non_admin_user_cannot_modify_access_groups_or_preferences(): void
    {
        $regularUser = User::factory()->create(['is_active' => true]);

        $groupResponse = $this->actingAs($regularUser)->postJson('/api/backend/access-groups', [
            'name' => 'Hacker Admin Group',
            'is_active' => true,
        ]);
        $this->assertContains($groupResponse->status(), [403, 401]);

        $prefResponse = $this->actingAs($regularUser)->postJson('/api/backend/preferences', [
            'store_name' => 'Compromised Store',
        ]);
        $this->assertContains($prefResponse->status(), [403, 401]);
    }

    public function test_delivery_order_requires_valid_customer_and_items_payload(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/delivery-orders', []);
        $this->assertContains($response->status(), [422, 400]);
    }
}


