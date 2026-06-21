<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class CompanyPreferences
{
    public static function info(): array
    {
        return [
            ['id' => 'company-name', 'label' => 'Nama', 'type' => 'text', 'value' => 'UD. TB Nur', 'clearable' => true],
            ['id' => 'business-category', 'label' => 'Kategori Usaha', 'type' => 'chip-search', 'value' => 'GROSIR / WHOLESALER'],
            ['id' => 'business-field', 'label' => 'Bidang Usaha', 'type' => 'search', 'placeholder' => 'Cari Bidang Usaha..'],
            ['id' => 'phone', 'label' => 'Telepon', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
            ['id' => 'fax', 'label' => 'Faksimili', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
            ['id' => 'email', 'label' => 'Email', 'type' => 'text', 'value' => 'admin@tbnur.com', 'clearable' => true],
            ['id' => 'start-date', 'label' => 'Tgl Mulai Data', 'type' => 'date', 'value' => '01/06/2025'],
            ['id' => 'accounting-period', 'label' => 'Periode Akuntansi', 'type' => 'select', 'value' => 'Januari - Desember', 'options' => [
                'Januari - Desember',
                'Februari - Januari',
                'Maret - Februari',
                'April - Maret',
                'Mei - April',
                'Juni - Mei',
                'Juli - Juni',
                'Agustus - Juli',
                'September - Agustus',
                'Oktober - September',
                'November - Oktober',
                'Desember - November'
            ]],
            ['id' => 'currency', 'label' => 'Mata Uang', 'type' => 'readonly-edit', 'value' => 'Indonesian Rupiah'],
        ];
    }

    public static function address(): array
    {
        return [
            'label' => 'Alamat',
            'street' => [
                'id' => 'street',
                'label' => 'Jalan',
                'value' => 'Jl. Tomang raya nomor. 35',
            ],
            'tokens' => [],
            'fields' => [
                ['id' => 'city', 'label' => 'Kota', 'value' => 'Kota Denpasar', 'clearable' => true],
                ['id' => 'province', 'label' => 'Provinsi', 'value' => 'Bali', 'clearable' => true],
                ['id' => 'postal-code', 'label' => 'K.Pos', 'value' => '12345', 'clearable' => true],
                ['id' => 'country', 'label' => 'Negara', 'value' => 'Indonesia', 'clearable' => true],
            ],
        ];
    }
}
