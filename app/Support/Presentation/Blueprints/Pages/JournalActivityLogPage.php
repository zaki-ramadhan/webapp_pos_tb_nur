<?php

namespace App\Support\Presentation\Blueprints\Pages;

class JournalActivityLogPage
{
    public static function get(array $navigationPages): array
    {
        $journalRows = array_slice(\App\Support\Presentation\Blueprints\Pages\GeneralJournalPage::get($navigationPages)['generalJournal']['table']['rows'], 0, 20);

        return array_replace($navigationPages['journal-activity-log'], [
            'showViewIndicator' => true,
            'detailTabsOnly' => true,
            'journalActivityLog' => [
                'sectionLabel' => 'Pemeriksaan',
                'labels' => [
                    'date' => 'Tanggal',
                    'transactionType' => 'Tipe Transaksi',
                    'display' => 'Tampilkan',
                    'number' => 'Nomor #',
                    'transactionNumber' => 'No. Trans #',
                    'accountCode' => 'Akun Perkiraan',
                    'accountName' => 'Nama Perkiraan',
                    'debit' => 'Debit',
                    'credit' => 'Kredit',
                ],
                'displayOptions' => ['Semua Perubahan', 'Perubahan Aktif', 'Perubahan Sebelumnya'],
                'table' => [
                    'refreshLabel' => 'Muat ulang',
                    'settingsLabel' => 'Pengaturan log aktivitas',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '632',
                    'menuItems' => [
                        ['id' => 'journal-log-columns', 'label' => 'Atur kolom'],
                        ['id' => 'journal-log-export', 'label' => 'Ekspor log aktivitas'],
                    ],
                    'columns' => [
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'number', 'label' => 'No. Jurnal', 'widthClassName' => 'w-[34%]'],
                        ['id' => 'transactionNumber', 'label' => 'No. Trans #', 'widthClassName' => 'w-[34%]'],
                        ['id' => 'typeLabel', 'label' => 'Tipe Transaksi', 'widthClassName' => 'w-[260px]'],
                    ],
                    'rows' => array_map(
                        fn (array $row) => [
                            'id' => $row['id'],
                            'date' => $row['date'],
                            'number' => $row['documentNumber'],
                            'transactionNumber' => $row['transactionNumber'],
                            'typeLabel' => self::resolveJournalActivityTypeLabel(
                                $row['transactionTypeValue'] ?? '',
                                $row['transactionTypeLabel'] ?? ''
                            ),
                            'amount' => $row['total'] ?? '0',
                        ],
                        $journalRows,
                    ),
                ],
                'detailRecords' => [
                    'JV.2017.02.00015' => [
                        'documentNumber' => 'JV.2017.02.00015',
                        'transactionNumber' => '111.102-01.2017.02.00002',
                        'date' => '24 Feb 2017',
                        'transactionType' => 'Penerimaan Penjualan',
                        'selectedDisplay' => 'Semua Perubahan',
                        'reviewedAt' => 'Per 10 Feb 2017 22:56:52 (Aktif)',
                        'reviewer' => 'Pengguna : Jhonni Haris Limbong',
                        'entries' => [
                            [
                                'id' => 'journal-log-detail-1',
                                'accountCode' => '111.102-01',
                                'accountName' => 'Bank BCA IDR (069-773-3993)',
                                'debit' => '33,600,000',
                                'credit' => '',
                            ],
                            [
                                'id' => 'journal-log-detail-2',
                                'accountCode' => '112.101-01',
                                'accountName' => 'Piutang Usaha - IDR',
                                'debit' => '',
                                'credit' => '33,600,000',
                            ],
                        ],
                        'totalDebit' => '33,600,000',
                        'totalCredit' => '33,600,000',
                    ],
                ],
            ],
        ]);
    }

    public static function resolveJournalActivityTypeLabel(string $transactionTypeValue, string $fallback): string
    {
        return match ($transactionTypeValue) {
            'sales-receipt' => 'Penerimaan Penjualan',
            'purchase-payment' => 'Pembayaran Pembelian',
            'sales-invoice' => 'Faktur Penjualan',
            'tax-payment' => 'Pembayaran',
            'payroll-entry' => 'Pencatatan Gaji',
            'delivery-order' => 'Pengiriman Pesanan',
            'sales-return' => 'Retur Penjualan',
            'purchase-return' => 'Retur Pembelian',
            'period-end' => 'Jurnal Umum',
            default => $fallback ?: 'Jurnal Umum',
        };
    }
}
