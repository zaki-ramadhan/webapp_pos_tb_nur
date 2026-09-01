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
            'subtab' => [
                'id' => 'smartlink-bank-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'table' => [
                'createLabel' => 'Tambah Akun e-Banking',
                'refreshLabel' => 'Muat ulang',
                'searchPlaceholder' => 'Ketik dan [Enter]',
                'columns' => [
                    [
                        'id' => 'accountNumber',
                        'label' => 'No. Rekening Bank',
                        'align' => 'left',
                        'widthClassName' => 'w-[30%]',
                    ],
                    [
                        'id' => 'accountRelation',
                        'label' => 'Relasi Akun...',
                        'align' => 'left',
                        'widthClassName' => 'w-[35%]',
                    ],
                    [
                        'id' => 'serviceType',
                        'label' => 'Jenis Internet Banking',
                        'align' => 'left',
                        'widthClassName' => 'w-[35%]',
                    ],
                ],
                'rows' => [
                    [
                        'id' => '1',
                        'accountNumber' => '0129-01-002847-50-8',
                        'accountRelation' => '[110102] Bank BRI',
                        'serviceType' => 'BRI Mobile (BRIMO)',
                        'accountId' => '110102',
                        'accountName' => 'TB NUR - OPERASIONAL',
                        'tabLabel' => '0129-01-002847-50-8',
                    ],
                ],
            ],
            'form' => [
                'tabs' => [
                    ['id' => 'general', 'label' => 'Internet Banking'],
                ],
                'saveLabel' => 'Simpan',
            ],
        ]);
    }
}
