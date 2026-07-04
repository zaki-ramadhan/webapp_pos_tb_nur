<?php

namespace App\Support\Presentation\Blueprints\Pages\Preferences;

class TaxPreferences
{
    public static function tabs(): array
    {
        return [
            [
                'id' => 'tax-info-company',
                'label' => 'Info Toko',
                'contentClassName' => 'max-w-[760px]',
                'rows' => [
                    [
                        'id' => 'tax-company-name-row',
                        'type' => 'field',
                        'label' => 'Nama Toko',
                        'controls' => [
                            [
                                'id' => 'tax-company-name',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-pkp-date-row',
                        'type' => 'field',
                        'label' => 'Tgl Pengukuhan PKP',
                        'controls' => [
                            [
                                'id' => 'tax-pkp-date',
                                'type' => 'date',
                                'value' => '31/05/2016',
                                'wrapperClassName' => 'w-full max-w-[236px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-pkp-number-row',
                        'type' => 'field',
                        'label' => 'No Pengukuhan PKP',
                        'controls' => [
                            [
                                'id' => 'tax-pkp-number',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-business-type-row',
                        'type' => 'field',
                        'label' => 'Tipe Usaha',
                        'controls' => [
                            [
                                'id' => 'tax-business-type',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-npwp-row',
                        'type' => 'field',
                        'label' => 'NPWP Toko',
                        'controls' => [
                            [
                                'id' => 'tax-company-npwp',
                                'type' => 'text',
                                'value' => '',
                                'placeholder' => '________________',
                                'inputClassName' => 'tracking-[0.16em]',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-klu-row',
                        'type' => 'field',
                        'label' => 'KLU',
                        'controls' => [
                            [
                                'id' => 'tax-klu',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-nitku-row',
                        'type' => 'field',
                        'label' => 'NITKU',
                        'controls' => [
                            [
                                'id' => 'tax-nitku',
                                'type' => 'text',
                                'value' => '',
                                'wrapperClassName' => 'w-full max-w-[420px]',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'tax-address',
                'label' => 'Alamat',
                'contentClassName' => 'max-w-[760px]',
                'rows' => [
                    [
                        'id' => 'tax-address-street-row',
                        'type' => 'field',
                        'label' => 'Alamat',
                        'controls' => [
                            [
                                'id' => 'tax-address-street',
                                'type' => 'textarea',
                                'prefix' => 'Jalan',
                                'rows' => 3,
                                'value' => "Jl. Raya Sunan Gunung Jati No. 45",
                                'wrapperClassName' => 'w-full max-w-[548px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-address-city-row',
                        'type' => 'field',
                        'label' => '',
                        'controlsClassName' => 'w-full gap-2.5 sm:flex-nowrap',
                        'controls' => [
                            [
                                'id' => 'tax-address-city',
                                'type' => 'text',
                                'prefix' => 'Kota',
                                'value' => 'Cirebon',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[316px]',
                            ],
                            [
                                'id' => 'tax-address-postal-code',
                                'type' => 'text',
                                'prefix' => 'K.Pos',
                                'value' => '45151',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[222px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-address-province-row',
                        'type' => 'field',
                        'label' => '',
                        'controls' => [
                            [
                                'id' => 'tax-address-province',
                                'type' => 'text',
                                'prefix' => 'Provinsi',
                                'value' => 'Jawa Barat',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[548px]',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-address-country-row',
                        'type' => 'field',
                        'label' => '',
                        'controls' => [
                            [
                                'id' => 'tax-address-country',
                                'type' => 'text',
                                'prefix' => 'Negara',
                                'value' => 'Indonesia',
                                'clearable' => true,
                                'wrapperClassName' => 'w-full max-w-[548px]',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'tax-others',
                'label' => 'Lainnya',
                'contentClassName' => 'max-w-[860px]',
                'rows' => [
                    [
                        'id' => 'tax-address-source-row',
                        'type' => 'radio',
                        'label' => "Menggunakan\nalamat",
                        'value' => 'sales-invoice',
                        'optionsClassName' => 'sm:gap-x-12',
                        'options' => [
                            [
                                'value' => 'customer-tax',
                                'label' => 'Pajak Pelanggan',
                            ],
                            [
                                'value' => 'sales-invoice',
                                'label' => 'Faktur Penjualan',
                            ],
                        ],
                    ],
                    [
                        'id' => 'tax-default-quantity-price-row',
                        'type' => 'single-checkbox',
                        'label' => "Tampilkan Kuantitas\ndan Harga secara\nDefault pada Item\nBarang/Jasa",
                        'showInfo' => true,
                        'option' => [
                            'id' => 'tax-default-quantity-price',
                            'label' => 'Ya',
                            'checked' => false,
                        ],
                    ],
                    [
                        'id' => 'tax-default-dpp-row',
                        'type' => 'single-checkbox',
                        'label' => 'Default DPP 11/12',
                        'showInfo' => true,
                        'option' => [
                            'id' => 'tax-default-dpp',
                            'label' => 'Ya',
                            'checked' => false,
                        ],
                    ],
                ],
            ],
        ];
    }
}
