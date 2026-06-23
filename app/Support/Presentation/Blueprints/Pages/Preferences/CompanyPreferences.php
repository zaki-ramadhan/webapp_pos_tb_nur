<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class CompanyPreferences
{
    public static function info(): array
    {
        return [
            ['id' => 'company-name', 'label' => 'Nama', 'type' => 'text', 'value' => 'UD. TB Nur', 'clearable' => true],
            ['id' => 'phone', 'label' => 'Telepon', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
            ['id' => 'fax', 'label' => 'Faksimili', 'type' => 'text', 'value' => '021-56693463', 'clearable' => true],
            ['id' => 'email', 'label' => 'Email', 'type' => 'text', 'value' => 'admin@tbnur.com', 'clearable' => true],
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
