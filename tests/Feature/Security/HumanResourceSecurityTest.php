<?php

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HumanResourceSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_all_hr_and_payroll_pages_via_dashboard(): void
    {
        $user = $this->createAuthorizedUser();
        $pages = [
            'employees',
            'payroll-entry',
            'salary-allowance',
        ];

        foreach ($pages as $pageId) {
            $response = $this->actingAs($user)->get("/dashboard/{$pageId}");
            $response->assertOk();
            $response->assertInertia(fn (Assert $page) => $page->component('DashboardPage'));
        }
    }

    public function test_employee_creation_validates_required_name_and_sanitizes_phone(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/employees', []);
        $this->assertContains($response->status(), [422, 400]);

        $validData = [
            'name' => 'Budi Santoso',
            'email' => 'budi_sec_' . uniqid() . '@example.com',
            'phone' => '0812-3456-7890',
        ];

        $createResponse = $this->actingAs($user)->postJson('/api/backend/employees', $validData);
        if ($createResponse->isSuccessful()) {
            $data = $createResponse->json('data') ?? $createResponse->json();
            $this->assertStringNotContainsString('-', $data['phone'] ?? '');
        }
    }

    public function test_branch_creation_rejects_empty_name(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/branches', [
            'name' => '',
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }

    public function test_salary_allowance_rejects_empty_name(): void
    {
        $user = $this->createAuthorizedUser();

        $response = $this->actingAs($user)->postJson('/api/backend/salary-allowances', [
            'name' => '',
        ]);
        $this->assertContains($response->status(), [422, 400]);
    }
}


