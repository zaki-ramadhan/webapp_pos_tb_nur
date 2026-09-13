<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RealisticDataSeeder;
use App\Domain\Catalog\Models\Product;
use App\Domain\Finance\Models\Account;

class ProductAccountOverrideTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_can_persist_and_load_account_overrides(): void
    {
        $this->seed(RealisticDataSeeder::class);

        $invAcc = Account::where('code', '115.000-00')->first();
        $salesAcc = Account::where('code', '411.000-01')->first();
        $cogsAcc = Account::where('code', '511.000-01')->first();
        $expenseAcc = Account::where('code', '611.001-04')->first();

        $this->assertNotNull($invAcc);
        $this->assertNotNull($salesAcc);
        $this->assertNotNull($cogsAcc);
        $this->assertNotNull($expenseAcc);

        $product = Product::create([
            'code' => 'TEST-PROD-001',
            'name' => 'Semen Gresik 50kg Override',
            'product_type' => 'Persediaan',
            'inventory_account_id' => $invAcc->id,
            'sales_account_id' => $salesAcc->id,
            'cogs_account_id' => $cogsAcc->id,
            'expense_account_id' => $expenseAcc->id,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'inventory_account_id' => $invAcc->id,
            'sales_account_id' => $salesAcc->id,
            'cogs_account_id' => $cogsAcc->id,
            'expense_account_id' => $expenseAcc->id,
        ]);

        $reloaded = Product::with(['inventoryAccount', 'salesAccount', 'cogsAccount', 'expenseAccount'])->find($product->id);
        $this->assertEquals('115.000-00', $reloaded->inventoryAccount->code);
        $this->assertEquals('411.000-01', $reloaded->salesAccount->code);
        $this->assertEquals('511.000-01', $reloaded->cogsAccount->code);
        $this->assertEquals('611.001-04', $reloaded->expenseAccount->code);

        // Test clearing / nullable override
        $reloaded->update([
            'sales_account_id' => null,
        ]);

        $this->assertNull($reloaded->fresh()->sales_account_id);
        $this->assertNull($reloaded->fresh()->salesAccount);
    }
}
