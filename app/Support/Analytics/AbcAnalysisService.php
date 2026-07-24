<?php

namespace App\Support\Analytics;

use Illuminate\Support\Facades\DB;

class AbcAnalysisService
{
    /**
     * Jalankan Analisis ABC.
     *
     * @return array
     */
    public function calculate(): array
    {
      // Query total penjualan per produk

        $salesData = DB::table('operation_document_lines')
            ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
            ->join('products', 'operation_document_lines.product_id', '=', 'products.id')
            ->leftJoin('units', 'products.base_unit_id', '=', 'units.id')
            ->where('operation_documents.document_type', 'sales_invoice')
            ->whereIn('operation_documents.status', ['Posted', 'Lunas', 'Belum Lunas'])
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.code as product_code',
                DB::raw('SUM(operation_document_lines.quantity) as units_sold'),
                DB::raw('SUM(operation_document_lines.total_amount) as revenue'),
                'units.name as unit_name'
            )
            ->groupBy('products.id', 'products.name', 'products.code', 'units.name')
            ->orderByDesc('revenue')
            ->get();

        $totalRevenue = $salesData->sum('revenue');

        if ($totalRevenue <= 0) {
            return [
                'metrics' => [
                    ['label' => 'Item A', 'value' => '0', 'helper' => '0% kontribusi omzet', 'tone' => 'blue'],
                    ['label' => 'Item B', 'value' => '0', 'helper' => '0% kontribusi omzet', 'tone' => 'green'],
                    ['label' => 'Item C', 'value' => '0', 'helper' => '0% kontribusi omzet', 'tone' => 'amber'],
                    ['label' => 'Nilai Analisis', 'value' => 'Rp 0', 'helper' => 'Tidak ada transaksi', 'tone' => 'rose'],
                ],
                'distribution' => [],
                'topItems' => [],
                'insight' => 'Belum ada transaksi penjualan yang terdaftar.',
            ];
        }

        $cumulativeRevenue = 0;
        $itemsA = 0;
        $itemsB = 0;
        $itemsC = 0;
        
        $revenueA = 0;
        $revenueB = 0;
        $revenueC = 0;

        $topItems = [];

        foreach ($salesData as $row) {
            $revenue = (float) $row->revenue;
            $cumulativeRevenue += $revenue;
            $cumulativeShare = ($cumulativeRevenue / $totalRevenue) * 100;

          // Klasifikasi ABC

            if ($cumulativeShare <= 80 || $itemsA === 0) {
                $category = 'A';
                $color = '#2d77d1';
                $itemsA++;
                $revenueA += $revenue;
            } elseif ($cumulativeShare <= 95) {
                $category = 'B';
                $color = '#4caf50';
                $itemsB++;
                $revenueB += $revenue;
            } else {
                $category = 'C';
                $color = '#f4a62a';
                $itemsC++;
                $revenueC += $revenue;
            }

          // Daftar item teratas

            if (count($topItems) < 5) {
                $topItems[] = [
                    'name' => $row->product_name,
                    'code' => $row->product_code,
                    'unitsSold' => number_format($row->units_sold, 0, ',', '.') . ' ' . ($row->unit_name ?? 'pcs'),
                    'revenue' => 'Rp ' . number_format($revenue, 0, ',', '.') . ',00',
                    'share' => number_format(($revenue / $totalRevenue) * 100, 1, ',', '.') . '%',
                    'category' => $category,
                    'categoryColor' => $color,
                ];
            }
        }

        $pctA = $totalRevenue > 0 ? ($revenueA / $totalRevenue) * 100 : 0;
        $pctB = $totalRevenue > 0 ? ($revenueB / $totalRevenue) * 100 : 0;
        $pctC = $totalRevenue > 0 ? ($revenueC / $totalRevenue) * 100 : 0;

        $metrics = [
            [
                'label' => 'Item A',
                'value' => (string) $itemsA,
                'helper' => number_format($pctA, 0) . '% kontribusi omzet',
                'tone' => 'blue',
            ],
            [
                'label' => 'Item B',
                'value' => (string) $itemsB,
                'helper' => number_format($pctB, 0) . '% kontribusi omzet',
                'tone' => 'green',
            ],
            [
                'label' => 'Item C',
                'value' => (string) $itemsC,
                'helper' => number_format($pctC, 0) . '% kontribusi omzet',
                'tone' => 'amber',
            ],
            [
                'label' => 'Nilai Analisis',
                'value' => \App\Support\Presentation\PosBlueprint::formatCurrencyShort($totalRevenue),
                'helper' => 'Berdasarkan penjualan material dan perlengkapan bangunan',
                'tone' => 'rose',
            ],
        ];

        $distribution = [
            [
                'label' => 'A',
                'title' => 'Bahan bangunan utama dan kebutuhan renovasi',
                'share' => number_format($pctA, 0) . '%',
                'itemCount' => $itemsA . ' item',
                'barWidth' => number_format($pctA, 0) . '%',
                'color' => '#2d77d1',
            ],
            [
                'label' => 'B',
                'title' => 'Pelengkap bangunan yang tetap rutin bergerak',
                'share' => number_format($pctB, 0) . '%',
                'itemCount' => $itemsB . ' item',
                'barWidth' => number_format($pctB, 0) . '%',
                'color' => '#4caf50',
            ],
            [
                'label' => 'C',
                'title' => 'Aksesoris dan item lambat gerak',
                'share' => number_format($pctC, 0) . '%',
                'itemCount' => $itemsC . ' item',
                'barWidth' => number_format($pctC, 0) . '%',
                'color' => '#f4a62a',
            ],
        ];

        $primaryProduct = $salesData->first();
        $insight = $primaryProduct 
            ? "Stok {$primaryProduct->product_name} sebaiknya lebih diprioritaskan. Barang ini memberi porsi omzet paling besar."
            : "Stok semen, besi, dan cat sebaiknya lebih diprioritaskan.";

        return [
            'metrics' => $metrics,
            'distribution' => $distribution,
            'topItems' => $topItems,
            'insight' => $insight,
        ];
    }
}
