<?php

namespace App\Support\Presentation\Blueprints\Pages;

use App\Support\Presentation\Blueprints\Pages\Preferences\CompanyPreferences;
use App\Support\Presentation\Blueprints\Pages\Preferences\FeaturePreferences;
use App\Support\Presentation\Blueprints\Pages\Preferences\SalesPurchasePreferences;
use App\Support\Presentation\Blueprints\Pages\Preferences\TaxPreferences;
use App\Support\Presentation\Blueprints\Pages\Preferences\WorkflowPreferences;

class PreferencesPage
{
    public static function get(): array
    {
        $attachmentsNotice = [
            'parts' => [
                ['text' => 'Silahkan pilih Menu Transaksi yang '],
                ['text' => 'MEWAJIBKAN', 'emphasis' => true],
                ['text' => ' pengguna menyertakan lampiran saat menyimpan transaksi.'],
            ],
        ];

        return [
            'id' => 'preferences',
            'label' => 'Preferensi',
            'openLoading' => [
                'title' => 'Membuka Preferensi',
                'description' => 'Menyiapkan pengaturan toko dan preferensi database.',
                'durationMs' => 700,
            ],
            'workspace' => [
                'topTab' => 'Toko',
                'defaultSidebarItemId' => 'features',
                'companyTabs' => [
                    ['id' => 'company-info', 'label' => 'Info Toko'],
                    ['id' => 'company-address', 'label' => 'Alamat'],
                ],
                'featureTabs' => FeaturePreferences::tabs(),
                'attachmentsTabs' => WorkflowPreferences::attachmentsTabs($attachmentsNotice),
                'sidebarItems' => [
                    ['id' => 'features', 'label' => 'Fitur'],
                ],
                'actions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'primary',
                        'showLabel' => true,
                    ],
                ],
                'companyInfo' => CompanyPreferences::info(),
                'companyAddress' => CompanyPreferences::address(),
            ],
        ];
    }
}
