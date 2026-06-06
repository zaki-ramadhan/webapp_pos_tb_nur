<?php

namespace App\Support\Presentation\Blueprints\Pages;

class SalesCommissionPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['sales-commission'], [
            'subtab' => [
                'id' => 'sales-commission-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'salesCommission' => [
                'topActions' => [
                    [
                        'id' => 'tips',
                        'label' => 'Petunjuk',
                        'icon' => 'idea',
                        'tone' => 'warning',
                    ],
                ],
                'formTabs' => [
                    ['id' => 'commission', 'label' => 'Komisi Penjual'],
                    ['id' => 'others', 'label' => 'Lain-lain'],
                ],
                'labels' => [
                    'period' => 'Komisi Berlaku',
                    'name' => 'Nama perhitungan komisi',
                    'salespeople' => 'Berlaku ke Tenaga Penjual',
                    'order' => 'Diberikan pada penjual urutan (Urutan input penjual di faktur)',
                    'productScope' => 'Komisi berlaku untuk barang',
                    'supplierScope' => 'Dari pemasok utama',
                    'condition' => 'Dengan syarat perhitungan',
                    'reward' => 'Akan mendapat komisi',
                    'notes' => 'Catatan',
                    'inactive' => 'Non Aktif',
                ],
                'periodOptions' => [
                    ['id' => 'forever', 'label' => 'Selamanya'],
                    ['id' => 'period', 'label' => 'Periode Tertentu'],
                ],
                'salespeopleOptions' => [
                    ['id' => 'all', 'label' => 'Semua'],
                    ['id' => 'specific', 'label' => 'Tertentu'],
                ],
                'orderOptions' => [
                    ['id' => 'first', 'label' => 'Pertama'],
                    ['id' => 'second', 'label' => 'Kedua'],
                    ['id' => 'third', 'label' => 'Ketiga'],
                    ['id' => 'fourth', 'label' => 'Keempat'],
                    ['id' => 'fifth', 'label' => 'Kelima'],
                ],
                'productScopeOptions' => ['Semua Barang'],
                'supplierScopeOptions' => ['Semua Pemasok'],
                'conditionOptions' => [
                    'none' => 'Tanpa batasan dan syarat',
                    'salesRange' => 'Nilai Penjualan antara',
                    'quantityRange' => 'Kuantitas penjualan antara',
                    'quantityUnit' => 'Kuantitas terjual per',
                ],
                'conditionUnitLabel' => 'Unit (Berlaku kelipatan)',
                'rewardTypeOptions' => ['Persentase'],
                'rewardMiddleLabel' => '% dari',
                'rewardBaseOptions' => ['Nilai Penjualan'],
                'inactiveLabel' => 'Ya',
                'createDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                ],
                'detailDockActions' => [
                    ['id' => 'save', 'label' => 'Simpan', 'icon' => 'save', 'tone' => 'muted'],
                    ['id' => 'delete', 'label' => 'Hapus', 'icon' => 'trash', 'tone' => 'danger'],
                ],
                'draft' => [
                    'periodType' => 'forever',
                    'name' => '',
                    'sellerScope' => 'all',
                    'orderSelections' => ['first'],
                    'productScope' => 'Semua Barang',
                    'supplierScope' => 'Semua Pemasok',
                    'conditionType' => 'none',
                    'salesValueFrom' => '',
                    'salesValueTo' => '',
                    'quantityFrom' => '',
                    'quantityTo' => '',
                    'quantityUnit' => '',
                    'rewardType' => 'Persentase',
                    'rewardValue' => '',
                    'rewardBase' => 'Nilai Penjualan',
                    'notes' => '',
                    'inactive' => false,
                ],
                'table' => [
                    'createLabel' => 'Tambah Komisi Penjual',
                    'refreshLabel' => 'Muat ulang',
                    'settingsLabel' => 'Pengaturan tabel',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '1',
                    'columns' => [
                        ['id' => 'notes', 'label' => 'Catatan', 'widthClassName' => 'w-[42%]'],
                        ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'periodLabel', 'label' => 'Periode Berlaku', 'widthClassName' => 'w-[40%]'],
                    ],
                    'rows' => [
                        [
                            'id' => 'sales-commission-komisi-team',
                            'name' => 'Komisi Team',
                            'periodLabel' => 'Selamanya',
                            'notes' => '',
                            'periodType' => 'forever',
                            'sellerScope' => 'all',
                            'orderSelections' => ['first', 'second', 'third', 'fourth', 'fifth'],
                            'productScope' => 'Semua Barang',
                            'supplierScope' => 'Semua Pemasok',
                            'conditionType' => 'none',
                            'salesValueFrom' => '',
                            'salesValueTo' => '',
                            'quantityFrom' => '',
                            'quantityTo' => '',
                            'quantityUnit' => '',
                            'rewardType' => 'Persentase',
                            'rewardValue' => '7',
                            'rewardBase' => 'Nilai Penjualan',
                            'inactive' => false,
                        ],
                    ],
                ],
            ],
        ]);
    }
}
