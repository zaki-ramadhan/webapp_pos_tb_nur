<?php

namespace App\Support\Presentation\Blueprints\Pages;

class BudgetTransferPage
{
    public static function get(): array
    {
        return [
                    'id' => 'budget-transfer',
                    'label' => 'Transfer Anggaran',
                    'subtab' => [
                        'id' => 'budget-transfer-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'budgetTransfer' => [
                        'labels' => [
                            'year' => 'Tahun',
                            'type' => 'Tipe',
                            'branch' => 'Cabang',
                            'transferNumber' => 'No Transfer #',
                            'date' => 'Tanggal',
                            'month' => 'Bulan',
                            'budget' => 'Anggaran',
                            'remainingBudget' => 'Sisa Anggaran',
                            'transferAmount' => 'Nilai Transfer',
                            'notes' => 'Catatan',
                        ],
                        'yearOptions' => ['2026', '2025', '2024'],
                        'typeOptions' => ['Umum', 'Departemen'],
                        'numberingOptions' => ['Transfer Anggaran'],
                        'monthOptions' => [
                            'Januari',
                            'Februari',
                            'Maret',
                            'April',
                            'Mei',
                            'Juni',
                            'Juli',
                            'Agustus',
                            'September',
                            'Oktober',
                            'November',
                            'Desember',
                        ],
                        'defaults' => [
                            'year' => '2026',
                            'type' => 'Umum',
                            'branches' => ['JAKARTA'],
                    '__branchId' => 1,
                            'autoNumber' => true,
                            'numberingType' => 'Transfer Anggaran',
                            'transferNumber' => '',
                            'date' => '25/04/2026',
                            'fromMonth' => 'Januari',
                            'fromBudget' => '',
                            'remainingBudget' => '-',
                            'transferAmount' => '',
                            'toMonth' => 'Januari',
                            'toBudget' => '',
                            'notes' => '',
                        ],
                        'branchPlaceholder' => 'Cari/Pilih...',
                        'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                        'currencyPrefix' => 'Rp',
                        'fromTitle' => 'Transfer Dari Anggaran',
                        'toTitle' => 'Ke Anggaran',
                        'infoTitle' => 'Info lainnya',
                        'sectionTabs' => [
                            ['id' => 'details', 'label' => 'Rincian Transfer', 'icon' => 'document'],
                            ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
                        ],
                        'dockActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'blue',
                            ],
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Transfer Anggaran',
                            'refreshLabel' => 'Muat ulang',
                            'settingsLabel' => 'Pengaturan transfer anggaran',
                            'filterButtonLabel' => 'Filter lanjutan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '0',
                            'emptyLabel' => 'Belum ada data',
                            'filters' => [
                                [
                                    'id' => 'date',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                        ['value' => 'today', 'label' => 'Tanggal: Hari ini'],
                                        ['value' => 'month', 'label' => 'Tanggal: Bulan ini'],
                                    ],
                                ],
                            ],
                            'columns' => [
                                ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[24%]'],
                                ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[14%]'],
                                ['id' => 'fromAccount', 'label' => 'Dari Akun', 'widthClassName' => 'w-[23%]'],
                                ['id' => 'toAccount', 'label' => 'Ke Akun', 'widthClassName' => 'w-[23%]'],
                                ['id' => 'transferValue', 'label' => 'Nilai Transfer', 'widthClassName' => 'w-[16%]', 'align' => 'right'],
                            ],
                            'rows' => [],
                        ],
                    ],
                ];
    }
}
