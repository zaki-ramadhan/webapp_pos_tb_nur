<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\RealisticDataSeeder;
use App\Domain\Finance\Models\Account;

class ChartOfAccountsSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_realistic_data_seeder_runs_and_populates_141_accurate_accounts(): void
    {
        $this->seed(RealisticDataSeeder::class);

        $totalAccounts = Account::count();
        $this->assertEquals(141, $totalAccounts, "Expected exactly 141 Accurate Online accounts, got {$totalAccounts}");

        $invalidCodeCount = Account::whereNull('code')->orWhere('code', '')->count();
        $this->assertEquals(0, $invalidCodeCount, "All accounts must have a valid code");

        $accounts = Account::all();
        foreach ($accounts as $acc) {
            $this->assertMatchesRegularExpression(
                '/^\d{3}\.\d{3}-\d{2}$/',
                $acc->code,
                "Account {$acc->name} code {$acc->code} must match Accurate format XXX.YYY-ZZ"
            );
        }

        $childrenWithInvalidParent = Account::whereNotNull('parent_id')
            ->whereNotIn('parent_id', Account::pluck('id'))
            ->count();
        $this->assertEquals(0, $childrenWithInvalidParent, "All parent_ids must be valid");

        $kasKecil = Account::where('code', '111.101-01')->first();
        $this->assertNotNull($kasKecil, "Kas Kecil (111.101-01) must exist");
        $this->assertEquals('Kas Kecil Kantor', $kasKecil->name);
        $this->assertEquals('Cash/Bank', $kasKecil->account_type);

        $persediaan = Account::where('code', '115.000-00')->first();
        $this->assertNotNull($persediaan, "Persediaan Barang (115.000-00) must exist");

        $hutang = Account::where('code', '211.101-00')->first();
        $this->assertNotNull($hutang, "Hutang Usaha (211.101-00) must exist");

        $piutang = Account::where('code', '112.101-00')->first();
        $this->assertNotNull($piutang, "Piutang Usaha (112.101-00) must exist");
    }
}
