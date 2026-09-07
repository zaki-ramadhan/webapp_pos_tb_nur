<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Catalog\Models\Warehouse;
use App\Domain\Organization\Models\Branch;
use App\Domain\Partner\Models\Customer;
use App\Domain\Support\Models\OperationDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PDO;
use Tests\TestCase;

class SystemConcurrencyAndIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Warehouse $warehouse;
    protected Unit $unit;
    protected Product $product;

    protected function setUp(): void
    {
        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        parent::setUp();

        $this->user = User::factory()->create();

        $this->branch = Branch::query()->create([
            'code' => 'BR-TEST-01',
            'name' => 'Cabang Test',
            'is_active' => true,
        ]);

        $this->warehouse = Warehouse::query()->create([
            'branch_id' => $this->branch->id,
            'code' => 'GD-TEST-01',
            'name' => 'Gudang Utama',
            'warehouse_type' => 'main',
            'is_active' => true,
        ]);

        $this->unit = Unit::query()->create([
            'code' => 'PCS',
            'name' => 'Pcs',
        ]);

        $this->product = Product::query()->create([
            'base_unit_id' => $this->unit->id,
            'code' => 'PROD-TEST-01',
            'name' => 'Barang Uji',
            'product_type' => 'goods',
            'default_purchase_price' => 50000,
            'is_active' => true,
        ]);
    }

    public function test_customer_and_supplier_auto_code_generation(): void
    {
        // 1. Simpan customer tanpa kode -> harus otomatis dapat CUST-001
        $resCust1 = $this->actingAs($this->user)->postJson('/api/backend/customers', [
            'name' => 'Budi Santoso',
        ]);
        $resCust1->assertCreated();
        $this->assertEquals('CUST-001', $resCust1->json('data.code'));

        // 2. Simpan customer kedua tanpa kode -> harus otomatis CUST-002
        $resCust2 = $this->actingAs($this->user)->postJson('/api/backend/customers', [
            'name' => 'Ahmad Dahlan',
        ]);
        $resCust2->assertCreated();
        $this->assertEquals('CUST-002', $resCust2->json('data.code'));

        // 3. Simpan supplier tanpa kode -> harus otomatis SUPP-001
        $resSupp1 = $this->actingAs($this->user)->postJson('/api/backend/suppliers', [
            'name' => 'PT Semen Perkasa',
        ]);
        $resSupp1->assertCreated();
        $this->assertEquals('SUPP-001', $resSupp1->json('data.code'));
    }

    public function test_sales_receipt_rejects_overpayment(): void
    {
        $customer = Customer::query()->create([
            'code' => 'CUST-001',
            'name' => 'Pelanggan A',
            'is_active' => true,
        ]);

        // Buat Faktur Penjualan Rp 100.000
        $invoice = OperationDocument::query()->create([
            'document_type' => 'sales_invoice',
            'document_number' => 'FP.2026.09.0001',
            'entry_date' => '2026-09-07',
            'customer_id' => $customer->id,
            'warehouse_id' => $this->warehouse->id,
            'total_amount' => 100000,
            'paid_amount' => 0,
            'outstanding_amount' => 100000,
            'status' => 'Belum Lunas',
        ]);

        // Coba bayar Rp 150.000 (melebihi tagihan Rp 100.000)
        $response = $this->actingAs($this->user)->postJson('/api/backend/sales-receipts', [
            'customer_id' => $customer->id,
            'entry_date' => '2026-09-07',
            'lines' => [
                [
                    'reference_code' => 'FP.2026.09.0001',
                    'total_amount' => 150000,
                ],
            ],
        ]);

        // Harus ditolak dengan status 422
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['lines']);

        // Bayar tepat Rp 100.000 -> harus berhasil 201
        $validRes = $this->actingAs($this->user)->postJson('/api/backend/sales-receipts', [
            'customer_id' => $customer->id,
            'entry_date' => '2026-09-07',
            'lines' => [
                [
                    'reference_code' => 'FP.2026.09.0001',
                    'total_amount' => 100000,
                ],
            ],
        ]);
        $validRes->assertCreated();

        // Verifikasi status faktur berubah menjadi Lunas
        $invoice->refresh();
        $this->assertEquals('Lunas', $invoice->status);
        $this->assertEquals(0, $invoice->outstanding_amount);
    }

    public function test_stock_transfer_rejects_same_origin_and_destination_warehouse(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/backend/stock-transfers', [
            'branch_id' => $this->branch->id,
            'warehouse_id' => $this->warehouse->id,
            'counterpart_warehouse_id' => $this->warehouse->id,
            'document_date' => '2026-09-07',
            'lines' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 5,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['counterpart_warehouse_id']);
    }

    public function test_general_journal_rejects_unbalanced_entries(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/backend/general-journals', [
            'entry_date' => '2026-09-07',
            'lines' => [
                [
                    'reference_code' => '1101',
                    'debit_amount' => 50000,
                    'credit_amount' => 0,
                ],
                [
                    'reference_code' => '1102',
                    'debit_amount' => 0,
                    'credit_amount' => 30000,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['lines']);
    }
}
