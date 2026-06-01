<?php

namespace Tests\Unit;

use App\Support\Analytics\AnalyticsService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AnalyticsServiceTest extends TestCase
{
    public function test_it_returns_empty_results_when_no_sales_data_exists(): void
    {
        // Mock DB facade methods including DB::raw
        DB::shouldReceive('table')
            ->andReturnSelf();
        
        DB::shouldReceive('join')
            ->andReturnSelf();

        DB::shouldReceive('leftJoin')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->andReturnSelf();

        DB::shouldReceive('select')
            ->andReturnSelf();

        DB::shouldReceive('groupBy')
            ->andReturnSelf();

        DB::shouldReceive('orderByDesc')
            ->andReturnSelf();

        DB::shouldReceive('raw')
            ->andReturnUsing(function ($value) {
                return new \Illuminate\Database\Query\Expression($value);
            });

        DB::shouldReceive('get')
            ->andReturn(collect([]));

        $service = new AnalyticsService();
        $abc = $service->getAbcAnalysis();

        $this->assertEmpty($abc['topItems']);
        $this->assertSame('Belum ada transaksi penjualan yang terdaftar.', $abc['insight']);
    }
}
