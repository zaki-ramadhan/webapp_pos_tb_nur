<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductCategory;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Support\Models\ActivityLog;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Partner\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class TableSortingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    private function createAdminUser(): User
    {
        return $this->createAuthorizedUser();
    }

    public function test_activity_logs_backend_supports_sorting_by_columns(): void
    {
        $admin = $this->createAdminUser();

        $userA = User::factory()->create(['name' => 'Alpha User', 'email' => 'alpha@test.com']);
        $userZ = User::factory()->create(['name' => 'Zeta User', 'email' => 'zeta@test.com']);

        ActivityLog::query()->create([
            'actor_user_id' => $userA->id,
            'actor_name' => 'Alpha User',
            'action' => 'create',
            'resource_key' => 'products',
            'description' => 'Barang A',
            'occurred_at' => now()->subDays(2),
        ]);

        ActivityLog::query()->create([
            'actor_user_id' => $userZ->id,
            'actor_name' => 'Zeta User',
            'action' => 'update',
            'resource_key' => 'sales-invoices',
            'description' => 'Faktur Z',
            'occurred_at' => now()->subDays(1),
        ]);

        // Sort by userName asc
        $resAsc = $this->actingAs($admin)->getJson('/api/backend/activity-logs?sort_by=userName&sort_direction=asc');
        $resAsc->assertOk();
        $rowsAsc = $resAsc->json('data.data') ?? $resAsc->json('data');
        $this->assertEquals('Alpha User', $rowsAsc[0]['actor_name'] ?? $rowsAsc[0]['actor_user']['name']);

        // Sort by userName desc
        $resDesc = $this->actingAs($admin)->getJson('/api/backend/activity-logs?sort_by=userName&sort_direction=desc');
        $resDesc->assertOk();
        $rowsDesc = $resDesc->json('data.data') ?? $resDesc->json('data');
        $this->assertEquals('Zeta User', $rowsDesc[0]['actor_name'] ?? $rowsDesc[0]['actor_user']['name']);

        // Sort by referenceName (description) asc
        $resRefAsc = $this->actingAs($admin)->getJson('/api/backend/activity-logs?sort_by=referenceName&sort_direction=asc');
        $resRefAsc->assertOk();
        $rowsRefAsc = $resRefAsc->json('data.data') ?? $resRefAsc->json('data');
        $this->assertEquals('Barang A', $rowsRefAsc[0]['description']);
    }

    public function test_operation_documents_sorting_with_column_mapping_and_joins(): void
    {
        $admin = $this->createAdminUser();

        $custA = Customer::query()->create(['code' => 'CUST-A', 'name' => 'Ahmad Toko']);
        $custB = Customer::query()->create(['code' => 'CUST-B', 'name' => 'Budi Bangunan']);

        OperationDocument::query()->create([
            'document_type' => 'sales_invoice',
            'document_number' => 'SI-001',
            'entry_date' => '2026-08-01',
            'total_amount' => 100000.00,
            'customer_id' => $custB->id,
            'status' => 'Belum Lunas',
        ]);

        OperationDocument::query()->create([
            'document_type' => 'sales_invoice',
            'document_number' => 'SI-002',
            'entry_date' => '2026-08-10',
            'total_amount' => 500000.00,
            'customer_id' => $custA->id,
            'status' => 'Lunas',
        ]);

        // Sort by customerName asc
        $resCustAsc = $this->actingAs($admin)->getJson('/api/backend/sales-invoices?sort_by=customerName&sort_direction=asc');
        $resCustAsc->assertOk();
        $rowsCustAsc = $resCustAsc->json('data.data') ?? $resCustAsc->json('data');
        $this->assertEquals('SI-002', $rowsCustAsc[0]['document_number']);

        // Sort by totalAmount desc
        $resTotalDesc = $this->actingAs($admin)->getJson('/api/backend/sales-invoices?sort_by=totalAmount&sort_direction=desc');
        $resTotalDesc->assertOk();
        $rowsTotalDesc = $resTotalDesc->json('data.data') ?? $resTotalDesc->json('data');
        $this->assertEquals(500000, (int) $rowsTotalDesc[0]['total_amount']);

        // Sort by entryDate asc
        $resDateAsc = $this->actingAs($admin)->getJson('/api/backend/sales-invoices?sort_by=entryDate&sort_direction=asc');
        $resDateAsc->assertOk();
        $rowsDateAsc = $resDateAsc->json('data.data') ?? $resDateAsc->json('data');
        $this->assertEquals('SI-001', $rowsDateAsc[0]['document_number']);
    }

    public function test_products_sorting_with_category_joins(): void
    {
        $admin = $this->createAdminUser();

        $catA = ProductCategory::query()->create(['code' => 'CAT-A', 'name' => 'Alat']);
        $catC = ProductCategory::query()->create(['code' => 'CAT-C', 'name' => 'Cat']);
        $unit = Unit::query()->create(['code' => 'PCS', 'name' => 'Pcs']);

        Product::query()->create([
            'code' => 'PRD-01',
            'name' => 'Z-Cat Tembok',
            'category_id' => $catC->id,
            'base_unit_id' => $unit->id,
        ]);

        Product::query()->create([
            'code' => 'PRD-02',
            'name' => 'A-Cangkul Baja',
            'category_id' => $catA->id,
            'base_unit_id' => $unit->id,
        ]);

        // Sort by categoryName asc
        $resCatAsc = $this->actingAs($admin)->getJson('/api/backend/products?sort_by=categoryName&sort_direction=asc');
        $resCatAsc->assertOk();
        $rowsCatAsc = $resCatAsc->json('data.data') ?? $resCatAsc->json('data');
        $this->assertEquals('PRD-02', $rowsCatAsc[0]['code']);
    }
}
