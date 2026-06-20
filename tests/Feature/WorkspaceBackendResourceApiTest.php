<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Finance\Models\Account;
use App\Domain\Organization\Models\Branch;
use App\Domain\Support\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class WorkspaceBackendResourceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();
    }

    public function test_preference_resource_can_store_setting_and_write_activity_log(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/backend/preferences', [
            'group_key' => 'feature-sales',
            'setting_key' => 'salesman',
            'label' => 'Tenaga Penjual',
            'data_type' => 'boolean',
            'value' => ['checked' => true],
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.group_key', 'feature-sales')
            ->assertJsonPath('data.setting_key', 'salesman');

        $this->assertDatabaseHas('preference_settings', [
            'group_key' => 'feature-sales',
            'setting_key' => 'salesman',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'resource_key' => 'preferences',
            'action' => 'create',
            'actor_user_id' => $user->id,
        ]);
    }

    public function test_sales_checkin_resource_can_store_checkin(): void
    {
        $user = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-01',
            'name' => 'Cabang Pusat',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/backend/sales-checkins', [
            'branch_id' => $branch->id,
            'sales_user_id' => $user->id,
            'checkin_number' => 'CI.2026.05.00001',
            'transaction_name' => 'Pesanan Penjualan',
            'checked_in_at' => '2026-05-13 09:15:00',
            'notes' => 'Check in toko pelanggan.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.checkin_number', 'CI.2026.05.00001')
            ->assertJsonPath('data.sales_user_id', $user->id);

        $this->assertDatabaseHas('sales_checkins', [
            'checkin_number' => 'CI.2026.05.00001',
            'sales_user_id' => $user->id,
        ]);

        $activityLog = ActivityLog::query()
            ->where('resource_key', 'sales-checkins')
            ->where('action', 'create')
            ->latest('id')
            ->first();

        $this->assertNotNull($activityLog);
        $this->assertSame('2026-05-13', data_get($activityLog->metadata, 'transaction_date'));
    }

    public function test_bank_statement_resource_can_return_read_only_ledger_rows(): void
    {
        $user = User::factory()->create();
        $account = Account::query()->create([
            'code' => '111.102-01',
            'name' => 'Bank Operasional',
            'account_type' => 'bank',
            'opening_balance' => 0,
        ]);

        $this->actingAs($user)->postJson('/api/backend/cash-receipts', [
            'primary_account_id' => $account->id,
            'document_number' => 'CR.2026.05.00001',
            'entry_date' => '2026-05-13',
            'paid_amount' => 1500000,
            'total_amount' => 1500000,
            'status' => 'Posted',
            'lines' => [
                [
                    'description' => 'Penerimaan kas',
                    'total_amount' => 1500000,
                ],
            ],
        ])->assertCreated();

        $response = $this->actingAs($user)->getJson('/api/backend/bank-statements?account_id='.$account->id);

        $response
            ->assertOk()
            ->assertJsonPath('data.0.document_number', 'CR.2026.05.00001')
            ->assertJsonPath('data.0.account_id', $account->id);
    }

    public function test_bank_reconciliation_can_reconcile_documents(): void
    {
        $user = User::factory()->create();
        $account = Account::query()->create([
            'code' => '111.102-02',
            'name' => 'Bank Rekonsiliasi',
            'account_type' => 'bank',
            'opening_balance' => 0,
        ]);

        $this->actingAs($user)->postJson('/api/backend/cash-receipts', [
            'primary_account_id' => $account->id,
            'document_number' => 'CR.2026.05.00002',
            'entry_date' => '2026-05-13',
            'paid_amount' => 1500000,
            'total_amount' => 1500000,
            'status' => 'Posted',
            'lines' => [
                [
                    'description' => 'Penerimaan kas',
                    'total_amount' => 1500000,
                ],
            ],
        ])->assertCreated();

        $this->assertDatabaseHas('operation_documents', [
            'document_number' => 'CR.2026.05.00002',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/api/backend/bank-reconciliations/reconcile', [
            'document_numbers' => ['CR.2026.05.00002'],
            'is_closed' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('operation_documents', [
            'document_number' => 'CR.2026.05.00002',
            'is_closed' => true,
        ]);
    }

    public function test_item_location_and_minimum_stock_resources_can_return_inventory_inquiry_rows(): void
    {
        $user = User::factory()->create();
        $branch = Branch::query()->create([
            'code' => 'BR-02',
            'name' => 'Cabang Gudang',
            'street' => 'Jl. Industri 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'country' => 'Indonesia',
            'is_active' => true,
        ]);
        $warehouse = Warehouse::query()->create([
            'branch_id' => $branch->id,
            'code' => 'WH-01',
            'name' => 'Gudang Utama',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);
        $unit = Unit::query()->create([
            'code' => 'PCS',
            'name' => 'Pcs',
        ]);
        $product = Product::query()->create([
            'base_unit_id' => $unit->id,
            'code' => 'ITM-001',
            'name' => 'Semen Instan',
            'product_type' => 'goods',
            'minimum_stock' => 20,
            'is_active' => true,
        ]);

        $this->actingAs($user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $warehouse->id,
            'supplier_id' => null,
            'document_number' => 'GR.2026.05.00001',
            'entry_date' => '2026-05-13',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity' => 5,
                    'description' => 'Semen Instan',
                    'total_amount' => 500000,
                ],
            ],
        ])->assertStatus(422);

        $supplier = \App\Domain\Partner\Models\Supplier::query()->create([
            'code' => 'SUP-INV-01',
            'name' => 'PT Supplier Inventori',
            'is_active' => true,
        ]);

        $this->actingAs($user)->postJson('/api/backend/goods-receipts', [
            'warehouse_id' => $warehouse->id,
            'supplier_id' => $supplier->id,
            'document_number' => 'GR.2026.05.00001',
            'entry_date' => '2026-05-13',
            'status' => 'Posted',
            'lines' => [
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity' => 5,
                    'description' => 'Semen Instan',
                    'total_amount' => 500000,
                ],
            ],
        ])->assertCreated();

        $itemLocationResponse = $this->actingAs($user)->getJson('/api/backend/item-locations?product_id='.$product->id);
        $minimumStockResponse = $this->actingAs($user)->getJson('/api/backend/minimum-stocks');

        $itemLocationResponse
            ->assertOk()
            ->assertJsonPath('data.0.product_code', 'ITM-001')
            ->assertJsonPath('data.0.warehouse', 'Gudang Utama');

        $minimumStockResponse
            ->assertOk()
            ->assertJsonPath('data.0.item_code', 'ITM-001')
            ->assertJsonPath('data.0.available_stock', '5.00');
    }

    public function test_taxes_resource_can_be_imported(): void
    {
        $user = User::factory()->create();

        $rows = [
            [
                'code' => 'TAX-IMP-01',
                'name' => 'Imported Tax 1',
                'tax_type' => 'Value Added Tax',
                'rate' => 10.0,
            ],
            [
                'code' => 'TAX-IMP-02',
                'name' => 'Imported Tax 2',
                'tax_type' => 'Service Tax',
                'rate' => 5.5,
            ],
        ];

        $response = $this->actingAs($user)->postJson('/api/backend/taxes/import', [
            'rows' => $rows,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Berhasil mengimpor 2 data ke database.');

        $this->assertDatabaseHas('taxes', [
            'code' => 'TAX-IMP-01',
            'name' => 'Imported Tax 1',
            'rate' => 10.0000,
        ]);

        $this->assertDatabaseHas('taxes', [
            'code' => 'TAX-IMP-02',
            'name' => 'Imported Tax 2',
            'rate' => 5.5000,
        ]);
    }

    public function test_import_rolls_back_entire_transaction_on_failure(): void
    {
        $user = User::factory()->create();

        $rows = [
            [
                'code' => 'TAX-IMP-GOOD',
                'name' => 'Good Tax',
                'tax_type' => 'VAT',
                'rate' => 10.0,
            ],
            [
                'code' => 'TAX-IMP-BAD',
                // missing 'name' which is required, causing validation failure
                'tax_type' => 'VAT',
                'rate' => -5.0, // invalid negative rate
            ],
        ];

        $response = $this->actingAs($user)->postJson('/api/backend/taxes/import', [
            'rows' => $rows,
        ]);

        $response->assertStatus(422);

        // Assert that the first tax (TAX-IMP-GOOD) is NOT in database due to transaction rollback
        $this->assertDatabaseMissing('taxes', [
            'code' => 'TAX-IMP-GOOD',
        ]);
    }
}
