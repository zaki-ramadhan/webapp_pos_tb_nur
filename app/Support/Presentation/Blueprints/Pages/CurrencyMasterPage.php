<?php

namespace App\Support\Presentation\Blueprints\Pages;

class CurrencyMasterPage
{
    public static function get(): array
    {
        return [
                    'id' => 'currency-master',
                    'label' => 'Mata Uang',
                    'subtab' => [
                        'id' => 'currency-master-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'currency' => [
                        'saveLabel' => 'Simpan',
                        'deleteLabel' => 'Hapus',
                        'lookupPlaceholder' => 'Cari/Pilih...',
                        'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                        'createTabs' => [
                            ['id' => 'currency-general', 'label' => 'Mata Uang'],
                        ],
                        'detailTabs' => [
                            ['id' => 'currency-general', 'label' => 'Mata Uang'],
                            ['id' => 'currency-default-accounts', 'label' => 'Default Akun'],
                        ],
                        'labels' => [
                            'countryName' => 'Negara/Nama',
                            'code' => 'Kode',
                            'symbol' => 'Simbol',
                            'flag' => 'Bendera',
                        ],
                        'createDefaults' => [
                            'countryName' => '',
                        ],
                        'accountFields' => [
                            ['id' => 'accountsPayable', 'label' => 'Akun Utang Usaha'],
                            ['id' => 'accountsReceivable', 'label' => 'Akun Piutang Usaha'],
                            ['id' => 'purchaseAdvance', 'label' => 'Akun Uang Muka Pembelian'],
                            ['id' => 'salesAdvance', 'label' => 'Akun Uang Muka Penjualan'],
                            ['id' => 'salesDiscount', 'label' => 'Akun Diskon Penjualan'],
                            ['id' => 'realizedGainLoss', 'label' => 'Akun Laba/Rugi Terealisasi'],
                            ['id' => 'unrealizedGainLoss', 'label' => 'Akun Laba/Rugi Belum Terealisasi'],
                        ],
                        'records' => [
                            [
                                'id' => 'currency-idr',
                                'tabLabel' => 'Indonesian Rupiah',
                                'countryName' => 'Indonesian Rupiah',
                                'code' => 'IDR',
                                'symbol' => 'Rp',
                                'countryCode' => 'ID',
                                'defaultAccounts' => [
                                    'accountsPayable' => '[211.101-01] Hutang Usaha Jakarta - IDR',
                                    'accountsReceivable' => '[112.101-01] Piutang Usaha Jakarta - IDR',
                                    'purchaseAdvance' => '[113.101-01] Uang Muka Pembelian Barang Jakarta - IDR',
                                    'salesAdvance' => '[212.101-01] Uang Muka Penjualan Barang Jakarta - IDR',
                                    'salesDiscount' => '[422.000-01] Potongan Penjualan IDR',
                                    'realizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                    'unrealizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                ],
                            ],
                            [
                                'id' => 'currency-usd',
                                'tabLabel' => 'US Dollar',
                                'countryName' => 'US Dollar',
                                'code' => 'USD',
                                'symbol' => '$',
                                'countryCode' => 'US',
                                'defaultAccounts' => [
                                    'accountsPayable' => '[211.102-01] Hutang Usaha Jakarta - USD',
                                    'accountsReceivable' => '[112.102-01] Piutang Usaha Jakarta - USD',
                                    'purchaseAdvance' => '[113.102-01] Uang Muka Pembelian Barang Jakarta - USD',
                                    'salesAdvance' => '[212.102-01] Uang Muka Penjualan Barang Jakarta - USD',
                                    'salesDiscount' => '[422.000-02] Potongan Penjualan USD',
                                    'realizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                    'unrealizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                ],
                            ],
                            [
                                'id' => 'currency-sgd',
                                'tabLabel' => 'Singapore Dollar',
                                'countryName' => 'Singapore Dollar',
                                'code' => 'SGD',
                                'symbol' => '$',
                                'countryCode' => 'SG',
                                'defaultAccounts' => [
                                    'accountsPayable' => '[211.103-01] Hutang Usaha Jakarta - SGD',
                                    'accountsReceivable' => '[112.103-01] Piutang Usaha Jakarta - SGD',
                                    'purchaseAdvance' => '[113.103-01] Uang Muka Pembelian Barang Jakarta - SGD',
                                    'salesAdvance' => '[212.103-01] Uang Muka Penjualan Barang Jakarta - SGD',
                                    'salesDiscount' => '[422.000-03] Potongan Penjualan SGD',
                                    'realizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                    'unrealizedGainLoss' => '[611.002-99] Beban Umum & Admin Lainnya',
                                ],
                            ],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Mata Uang',
                            'refreshLabel' => 'Muat ulang',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '3',
                            'columns' => [
                                ['id' => 'symbol', 'label' => 'Simbol', 'widthClassName' => 'w-[100px]'],
                                ['id' => 'code', 'label' => 'Kode', 'widthClassName' => 'w-[120px]'],
                                ['id' => 'countryName', 'label' => 'Negara/Nama'],
                                ['id' => 'exchange_rate', 'label' => 'Kurs (ke IDR)', 'widthClassName' => 'w-[180px]', 'align' => 'right'],
                            ],
                            'rows' => [
                                ['id' => 'currency-idr', 'symbol' => 'Rp', 'code' => 'IDR', 'countryName' => 'Indonesian Rupiah', 'exchange_rate' => '1.0000'],
                                ['id' => 'currency-usd', 'symbol' => '$', 'code' => 'USD', 'countryName' => 'US Dollar', 'exchange_rate' => '16350.0000'],
                                ['id' => 'currency-sgd', 'symbol' => '$', 'code' => 'SGD', 'countryName' => 'Singapore Dollar', 'exchange_rate' => '12111.0000'],
                            ],
                        ],
                    ],
                ];
    }
}
