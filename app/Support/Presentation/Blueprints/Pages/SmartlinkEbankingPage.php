<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SmartlinkEbankingPage
{
    public static function get(array $navigationPages): array
    {
        $base = $navigationPages['smartlink-bank'] ?? [
            'id' => 'smartlink-bank',
            'label' => 'SmartLink e-Banking',
            'moduleLabel' => 'Kas & Bank',
            'icon' => 'link',
            'tone' => 'purple',
        ];

        return array_replace($base, [
            'smartlink' => [
                'provider' => 'BRI Mobile (BRIMO)',
                'providerCode' => 'BRIMO',
                'title' => 'SmartLink e-Banking BRI Mobile (BRIMO)',
                'description' => 'Hubungkan rekening operasional BRI Toko TB Nur untuk sinkronisasi mutasi rekening koran dan rekonsiliasi kas/bank otomatis.',
                'status' => 'connected',
                'account' => [
                    'bankName' => 'Bank Rakyat Indonesia (BRI)',
                    'appType' => 'BRI Mobile (BRIMO)',
                    'accountNumber' => '0129-01-002847-50-8',
                    'accountName' => 'TB NUR - OPERASIONAL',
                    'loginUserId' => 'brimo_tbnur_ops',
                    'lastSyncAt' => date('d M Y, H:i') . ' WIB',
                    'balance' => 'Rp 181.112.000',
                ],
                'features' => [
                    [
                        'id' => 'statement',
                        'title' => 'Rekening Koran Otomatis',
                        'desc' => 'Membaca seluruh riwayat mutasi debit dan kredit langsung dari data internet banking BRIMO.',
                    ],
                    [
                        'id' => 'reconciliation',
                        'title' => 'Rekonsiliasi Bank Cepat',
                        'desc' => 'Mencocokkan file mutasi/CSV bank dengan catatan transaksi faktur dan pengeluaran aplikasi.',
                    ],
                ],
            ],
        ]);
    }
}
