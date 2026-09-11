<?php

namespace Tests\Unit;

use App\Domain\Finance\Models\Account;
use App\Domain\Partner\Models\Customer;
use App\Domain\Partner\Models\Supplier;
use App\Support\Backend\BackendResourceIndexQuery;
use App\Support\Backend\BackendResourceRegistry;
use App\Support\Backend\Queries\BankInquiryQueryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountBalanceBatchOptimizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_accounts_batch_balance_calculation(): void
    {
        $parent = Account::create([
            'code' => '1100',
            'name' => 'Kas & Bank',
            'account_type' => 'Cash/Bank',
            'opening_balance' => 0,
            'is_active' => true,
        ]);

        $child1 = Account::create([
            'parent_id' => $parent->id,
            'code' => '1101',
            'name' => 'Kas Toko',
            'account_type' => 'Cash/Bank',
            'opening_balance' => 500000,
            'is_active' => true,
        ]);

        $child2 = Account::create([
            'parent_id' => $parent->id,
            'code' => '1102',
            'name' => 'Bank BCA',
            'account_type' => 'Cash/Bank',
            'opening_balance' => 1500000,
            'is_active' => true,
        ]);

        $bankService = app(BankInquiryQueryService::class);
        $balances = $bankService->calculateAccountsBalanceMap([$parent->id, $child1->id, $child2->id]);

        $this->assertEquals(0, $balances[$parent->id] ?? 0);
        $this->assertEquals(500000, $balances[$child1->id] ?? 0);
        $this->assertEquals(1500000, $balances[$child2->id] ?? 0);

        $blueprint = BackendResourceRegistry::find('accounts');
        $paginator = app(BackendResourceIndexQuery::class)->paginate($blueprint, ['per_page' => 25]);

        $items = collect($paginator->items())->keyBy('code');
        $this->assertTrue($items->has('1100'));
        $parentItem = $items->get('1100');
        $this->assertEquals(2000000, $parentItem->current_balance);
        $this->assertArrayHasKey('current_balance', $parentItem->toArray());
    }

    public function test_customers_and_suppliers_batch_balance_calculation(): void
    {
        $customer = Customer::create([
            'code' => 'CUST-001',
            'name' => 'Pelanggan Uji',
            'is_active' => true,
        ]);

        $supplier = Supplier::create([
            'code' => 'SUPP-001',
            'name' => 'Pemasok Uji',
            'is_active' => true,
        ]);

        \App\Domain\Support\Models\OperationDocument::create([
            'document_type' => 'sales_invoice',
            'document_number' => 'INV-001',
            'customer_id' => $customer->id,
            'entry_date' => now()->toDateString(),
            'outstanding_amount' => 150000,
            'status' => 'Belum Lunas',
        ]);

        \App\Domain\Support\Models\OperationDocument::create([
            'document_type' => 'purchase_invoice',
            'document_number' => 'PINV-001',
            'supplier_id' => $supplier->id,
            'entry_date' => now()->toDateString(),
            'outstanding_amount' => 350000,
            'status' => 'Belum Lunas',
        ]);

        $custBlueprint = BackendResourceRegistry::find('customers');
        $custPaginator = app(BackendResourceIndexQuery::class)->paginate($custBlueprint, ['per_page' => 25]);
        $custItem = collect($custPaginator->items())->firstWhere('id', $customer->id);
        $this->assertNotNull($custItem);
        $this->assertEquals(150000, $custItem->balance);
        $this->assertArrayHasKey('balance', $custItem->toArray());

        $suppBlueprint = BackendResourceRegistry::find('suppliers');
        $suppPaginator = app(BackendResourceIndexQuery::class)->paginate($suppBlueprint, ['per_page' => 25]);
        $suppItem = collect($suppPaginator->items())->firstWhere('id', $supplier->id);
        $this->assertNotNull($suppItem);
        $this->assertEquals(350000, $suppItem->balance);
        $this->assertArrayHasKey('balance', $suppItem->toArray());
    }

    public function test_account_hierarchy_code_regeneration_and_stability(): void
    {
        $writer = app(\App\Support\Backend\BackendResourceWriter::class);
        $blueprint = BackendResourceRegistry::find('accounts');

        $root1 = $writer->create($blueprint, [
            'name' => 'Kas Induk',
            'account_type' => 'Cash/Bank',
            'auto_code' => true,
        ]);
        $this->assertEquals('1101', $root1->code);

        $root2 = $writer->create($blueprint, [
            'name' => 'Kas Cabang A',
            'account_type' => 'Cash/Bank',
            'auto_code' => true,
        ]);
        $this->assertEquals('1102', $root2->code);

        $root3 = $writer->create($blueprint, [
            'name' => 'Bank Mandiri',
            'account_type' => 'Cash/Bank',
            'auto_code' => true,
        ]);
        $this->assertEquals('1103', $root3->code);

        $updatedRoot2 = $writer->update($blueprint, $root2, [
            'parent_id' => $root1->id,
            'name' => 'Kas Cabang A',
            'account_type' => 'Cash/Bank',
            'auto_code' => true,
        ]);

        $this->assertEquals('110101', $updatedRoot2->code);
        $this->assertEquals('1103', $root3->fresh()->code);

        $childOf2 = $writer->create($blueprint, [
            'parent_id' => $updatedRoot2->id,
            'name' => 'Kasir 1',
            'account_type' => 'Cash/Bank',
            'auto_code' => true,
        ]);
        $this->assertEquals('11010101', $childOf2->code);

        $movedBack = $writer->update($blueprint, $updatedRoot2, [
            'parent_id' => null,
            'name' => 'Kas Cabang A',
            'account_type' => 'Cash/Bank',
            'auto_code' => true,
        ]);
        $this->assertStringStartsWith('11', $movedBack->code);
        $this->assertNotEquals('110101', $movedBack->code);
        $this->assertStringStartsWith($movedBack->code, $childOf2->fresh()->code);
    }
}
