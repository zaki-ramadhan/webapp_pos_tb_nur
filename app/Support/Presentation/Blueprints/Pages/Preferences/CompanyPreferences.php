<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class CompanyPreferences
{
    public static function info(): array
    {
        return [
            ['id' => 'company-name', 'label' => 'Nama', 'type' => 'text', 'value' => 'TB Nur', 'clearable' => true],
            ['id' => 'phone', 'label' => 'Telepon', 'type' => 'text', 'value' => '0877-2498-5885', 'clearable' => true],
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
                'value' => 'Jl. P. Anggabaya No.22, Guwa Kidul, Kec. Kaliwedi',
            ],
            'tokens' => [],
            'fields' => [
                ['id' => 'city', 'label' => 'Kota', 'value' => 'Kabupaten Cirebon', 'clearable' => true],
                ['id' => 'province', 'label' => 'Provinsi', 'value' => 'Jawa Barat', 'clearable' => true],
                ['id' => 'postal-code', 'label' => 'K.Pos', 'value' => '45165', 'clearable' => true],
                ['id' => 'country', 'label' => 'Negara', 'value' => 'Indonesia', 'clearable' => true],
            ],
        ];
    }
}
