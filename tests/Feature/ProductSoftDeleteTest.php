<?php

namespace Tests\Feature;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Unit;
use App\Domain\Support\Models\OperationDocument;
use App\Domain\Support\Models\OperationDocumentLine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSoftDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_soft_delete_preserves_historical_transactions(): void
    {
        // 1. Setup Master Unit & Product
        $unit = Unit::create(['name' => 'Sak', 'code' => 'SAK']);
        $product = Product::create([
            'name' => 'Semen Gresik 50kg',
            'code' => 'BRG-SMN-01',
            'base_unit_id' => $unit->id,
            'cost_price' => 50000,
            'selling_price' => 65000,
        ]);

        // 2. Simulasi Transaksi Penjualan Barang Tersebut
        $doc = OperationDocument::create([
            'document_type' => 'sales_invoice',
            'document_number' => 'SI.2026.05.00001',
            'transaction_date' => '2026-05-01',
            'total_amount' => 130000,
            'status' => 'Lunas',
        ]);

        $line = OperationDocumentLine::create([
            'operation_document_id' => $doc->id,
            'product_id' => $product->id,
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
    }
}
