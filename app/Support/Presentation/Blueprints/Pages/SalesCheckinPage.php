<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesCheckinPage
{
    public static function get(array $navigationPages): array
    {
        if (!isset($navigationPages['sales-checkin'])) {
            return [];
        }

        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $todayLabel = date('d/m/Y');
        $yesterdayLabel = date('d/m/Y', strtotime('-1 day'));
        $prefix = date('Y.m');

        return array_replace($navigationPages['sales-checkin'], [
            'table' => [
                'refreshLabel' => 'Muat ulang',
                'settingsLabel' => 'Pengaturan tabel',
                'filterButtonLabel' => 'Filter lanjutan',
                'searchPlaceholder' => 'Cari...',
                'searchWidthClassName' => 'sm:w-[342px]',
                'pageValue' => '6',
                'tableClassName' => 'min-w-[1320px]',
                'searchKeys' => ['dateLabel', 'number', 'customerName', 'salesName', 'transactionName'],
                'filters' => [
                    [
                        'id' => 'date',
                        'rowKey' => 'dateFilter',
                        'options' => [
                            ['value' => 'all', 'label' => 'Tanggal: Semua'],
                            ['value' => $today, 'label' => 'Tanggal: ' . $todayLabel],
                            ['value' => $yesterday, 'label' => 'Tanggal: ' . $yesterdayLabel],
                        ],
                    ],
                    [
                        'id' => 'sales',
                        'rowKey' => 'salesFilter',
                        'options' => [
                            ['value' => 'all', 'label' => 'Sales: Semua'],
                            ['value' => 'adam-pratama', 'label' => 'Sales: Adam Pratama'],
                            ['value' => 'jhonni-haris', 'label' => 'Sales: Jhonni Haris'],
                            ['value' => 'nur-aulia', 'label' => 'Sales: Nur Aulia'],
                        ],
                    ],
                ],
                'columns' => [
                    ['id' => 'dateLabel', 'label' => 'Tanggal', 'widthClassName' => 'w-[18%]'],
                    ['id' => 'number', 'label' => 'No. Checkin', 'widthClassName' => 'w-[30%]'],
                    ['id' => 'customerName', 'label' => 'Nama Pelanggan (Saat Check-in)', 'widthClassName' => 'w-[26%]'],
                    ['id' => 'salesName', 'label' => 'Sales', 'widthClassName' => 'w-[12%]'],
                    ['id' => 'transactionName', 'label' => 'Transaksi', 'widthClassName' => 'w-[14%]'],
                ],
                'rows' => [
                    [
                        'id' => 'sales-checkin-1',
                        'dateLabel' => $todayLabel . ' 09:10',
                        'number' => 'CI.' . $prefix . '.00018',
                        'customerName' => 'PT Sumber Retail Nusantara',
                        'salesName' => 'Adam Pratama',
                        'transactionName' => 'Pesanan Penjualan',
                        'dateFilter' => $today,
                        'salesFilter' => 'adam-pratama',
                    ],
                    [
                        'id' => 'sales-checkin-2',
                        'dateLabel' => $todayLabel . ' 10:24',
                        'number' => 'CI.' . $prefix . '.00019',
                        'customerName' => 'CV Mitra Karya Abadi',
                        'salesName' => 'Jhonni Haris',
                        'transactionName' => 'Faktur Penjualan',
                        'dateFilter' => $today,
                        'salesFilter' => 'jhonni-haris',
                    ],
                    [
                        'id' => 'sales-checkin-3',
                        'dateLabel' => $todayLabel . ' 13:42',
                        'number' => 'CI.' . $prefix . '.00020',
                        'customerName' => 'Toko Sentosa Elektronik',
                        'salesName' => 'Nur Aulia',
                        'transactionName' => 'Penawaran Penjualan',
                        'dateFilter' => $today,
                        'salesFilter' => 'nur-aulia',
                    ],
                    [
                        'id' => 'sales-checkin-4',
                        'dateLabel' => $yesterdayLabel . ' 16:08',
                        'number' => 'CI.' . $prefix . '.00017',
                        'customerName' => 'PT Arta Boga Sejahtera',
                        'salesName' => 'Adam Pratama',
                        'transactionName' => 'Pesanan Penjualan',
                        'dateFilter' => $yesterday,
                        'salesFilter' => 'adam-pratama',
                    ],
                    [
                        'id' => 'sales-checkin-5',
                        'dateLabel' => $yesterdayLabel . ' 11:55',
                        'number' => 'CI.' . $prefix . '.00016',
                        'customerName' => 'UD Makmur Jaya',
                        'salesName' => 'Jhonni Haris',
                        'transactionName' => 'Retur Penjualan',
                        'dateFilter' => $yesterday,
                        'salesFilter' => 'jhonni-haris',
                    ],
                    [
                        'id' => 'sales-checkin-6',
                        'dateLabel' => $yesterdayLabel . ' 09:18',
                        'number' => 'CI.' . $prefix . '.00015',
                        'customerName' => 'PT Graha Niaga Mandiri',
                        'salesName' => 'Nur Aulia',
                        'transactionName' => 'Penerimaan Penjualan',
                        'dateFilter' => $yesterday,
                        'salesFilter' => 'nur-aulia',
                    ],
                ],
                'emptyLabel' => 'Tidak ada data',
            ],
        ]);
    }
}
