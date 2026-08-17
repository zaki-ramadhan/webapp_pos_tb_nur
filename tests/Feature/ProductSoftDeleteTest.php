<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use App\Support\Analytics\AbcAnalysisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSoftDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_soft_delete_preserves_historical_transactions_and_analytics(): void
    {
        // 1. Setup Master Unit & Product
        $unit = Unit::create(['name' => 'Sak', 'code' => 'SAK']);
        $product = Product::create([
            'code' => 'BRG-SMN-01',
            'name' => 'Semen Gresik 50kg',
            'base_unit_id' => $unit->id,
            'default_sale_price' => 65000,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'code' => 'BRG-SMN-01',
            'deleted_at' => null,
        ]);

        // 2. Simulasi Transaksi Masa Lalu (Faktur Penjualan)
        $invoice = OperationDocument::create([
            'document_type' => 'sales_invoice',
            'document_number' => 'INV/2026/001',
            'status' => 'Posted',
            'entry_date' => now()->toDateString(),
            'total_amount' => 130000,
        ]);

        $line = OperationDocumentLine::create([
            'operation_document_id' => $invoice->id,
            'line_type' => 'product',
            'product_id' => $product->id,
            'unit_id' => $unit->id,
            'quantity' => 2,
            'unit_price' => 65000,
            'total_amount' => 130000,
        ]);

        // 3. User Menghapus Barang dari Aplikasi
        $product->delete();

        // 4. Verifikasi Status Barang
        $this->assertTrue($product->trashed());
        $this->assertSoftDeleted('products', ['id' => $product->id]);

        // Pastikan barang TIDAK muncul lagi di query transaksi baru
        $this->assertNull(Product::where('code', 'BRG-SMN-01')->first());

        // 5. Verifikasi Integritas Transaksi Masa Lalu (TIDAK HILANG / TIDAK JADI NULL)
        $refreshedLine = $line->fresh();
        $this->assertNotNull($refreshedLine->product_id, 'product_id pada baris faktur lama tidak boleh menjadi NULL!');
        $this->assertEquals('Semen Gresik 50kg', $refreshedLine->product->name, 'Nama barang pada faktur lama harus tetap terbaca utuh!');

        // 6. Verifikasi Analisis ABC Tetap Menghitung Penjualan Historis Barang Tersebut
        $abcService = app(AbcAnalysisService::class);
        $abcResult = $abcService->calculate(3);

        $this->assertNotEmpty($abcResult['topItems']);
        $this->assertEquals('Semen Gresik 50kg', $abcResult['topItems'][0]['name']);
    }
}
