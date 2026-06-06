<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PaymentTermsPage
{
    public static function get(): array
    {
        return [
                    'id' => 'payment-terms',
                    'label' => 'Syarat Pembayaran',
                    'subtab' => [
                        'id' => 'payment-terms-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'paymentTerms' => [
                        'sectionLabel' => 'Syarat Pembayaran',
                        'saveLabel' => 'Simpan',
                        'deleteLabel' => 'Hapus',
                        'createLabels' => [
                            'discountDays' => 'Jika membayar antara',
                            'discountPercent' => 'Akan mendapat diskon',
                            'dueDays' => 'Masa Jatuh Tempo',
                            'description' => 'Keterangan',
                            'default' => 'Default Syarat Pembayaran',
                            'yesLabel' => 'Ya',
                        ],
                        'detailLabels' => [
                            'name' => 'Nama',
                            'default' => 'Default Syarat Pembayaran',
                            'inactive' => 'Non Aktif',
                        ],
                        'createDefaults' => [
                            'discountDays' => '',
                            'discountPercent' => '',
                            'dueDays' => '',
                            'description' => '',
                            'isDefault' => false,
                        ],
                        'records' => [
                            ['id' => 'payment-1-21-30', 'name' => '1/21 n/30', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-cod', 'name' => 'C.O.D', 'isDefault' => true, 'isInactive' => false],
                            ['id' => 'payment-cicilan', 'name' => 'Cicilan', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-set-manual', 'name' => 'Set Manual', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-net-21', 'name' => 'net 21', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-net-30', 'name' => 'net 30', 'isDefault' => false, 'isInactive' => false],
                            ['id' => 'payment-net-45', 'name' => 'net 45', 'isDefault' => false, 'isInactive' => false],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Syarat Pembayaran',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak',
                            'actionsLabel' => 'Pengaturan syarat pembayaran',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '7',
                            'filterOptions' => [
                                ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                            ],
                            'menuItems' => [
                                ['id' => 'column-settings', 'label' => 'Atur kolom'],
                                ['id' => 'export', 'label' => 'Ekspor syarat pembayaran'],
                            ],
                            'columns' => [
                                ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[160px]'],
                                ['id' => 'discountPercent', 'label' => 'Diskon (%)', 'widthClassName' => 'w-[160px]', 'align' => 'right'],
                                ['id' => 'discountDays', 'label' => 'Masa Diskon (hari)', 'widthClassName' => 'w-[190px]', 'align' => 'right'],
                                ['id' => 'dueDays', 'label' => 'Masa Jatuh Tempo (hari)', 'widthClassName' => 'w-[210px]', 'align' => 'right'],
                                ['id' => 'description', 'label' => 'Keterangan'],
                                ['id' => 'inactiveLabel', 'label' => 'Non Aktif', 'widthClassName' => 'w-[160px]'],
                                ['id' => 'defaultLabel', 'label' => 'Default', 'widthClassName' => 'w-[160px]'],
                            ],
                            'rows' => [
                                ['id' => 'payment-1-21-30', 'tabLabel' => '1/21 n/30', 'name' => '1/21 n/30', 'discountPercent' => '1', 'discountDays' => '21', 'dueDays' => '30', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-cod', 'tabLabel' => 'C.O.D', 'name' => 'C.O.D', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '0', 'description' => 'C.O.D', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Ya'],
                                ['id' => 'payment-cicilan', 'tabLabel' => 'Cicilan', 'name' => 'Cicilan', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '0', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-set-manual', 'tabLabel' => 'Set Manual', 'name' => 'Set Manual', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '0', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-net-21', 'tabLabel' => 'net 21', 'name' => 'net 21', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '21', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-net-30', 'tabLabel' => 'net 30', 'name' => 'net 30', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '30', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                                ['id' => 'payment-net-45', 'tabLabel' => 'net 45', 'name' => 'net 45', 'discountPercent' => '0', 'discountDays' => '0', 'dueDays' => '45', 'description' => '', 'inactiveLabel' => 'Tidak', 'inactiveValue' => 'no', 'defaultLabel' => 'Tidak'],
                            ],
                        ],
                    ],
                ];
    }
}
