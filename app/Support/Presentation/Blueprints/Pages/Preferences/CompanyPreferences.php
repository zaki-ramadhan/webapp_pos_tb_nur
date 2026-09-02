<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class CompanyPreferences
{
    public static function info(): array
    {
        return [
            ['id' => 'company-name', 'label' => 'Nama', 'type' => 'text', 'value' => 'TB Nur', 'clearable' => true],
            ['id' => 'phone', 'label' => 'Telepon', 'type' => 'text', 'value' => '0812-8273-6188', 'clearable' => true],
            ['id' => 'email', 'label' => 'Email', 'type' => 'text', 'value' => 'tb.nur.utama@gmail.com', 'clearable' => true],
        ];
    }

    public static function address(): array
    {
        return [
            'label' => 'Alamat',
            'street' => [
                'id' => 'street',
                'label' => 'Jalan',
                'value' => 'Jl. Tomang Raya No. 35',
            ],
            'tokens' => [],
            'fields' => [
                ['id' => 'city', 'label' => 'Kota', 'value' => 'Jakarta Barat', 'clearable' => true],
                ['id' => 'province', 'label' => 'Provinsi', 'value' => 'DKI Jakarta', 'clearable' => true],
                ['id' => 'postal-code', 'label' => 'K.Pos', 'value' => '11440', 'clearable' => true],
                ['id' => 'country', 'label' => 'Negara', 'value' => 'Indonesia', 'clearable' => true],
            ],
        ];
    }
}
