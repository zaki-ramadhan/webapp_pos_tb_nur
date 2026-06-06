<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PeriodEndPage
{
    public static function get(): array
    {
        return [
                    'id' => 'period-end',
                    'label' => 'Proses Akhir Bulan',
                    'subtab' => [
                        'id' => 'period-end-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'periodEnd' => [
                        'saveLabel' => 'Simpan',
                        'gridButtonLabel' => 'Tampilan daftar kurs',
                        'labels' => [
                            'month' => 'Bulan',
                            'year' => 'Tahun',
                        ],
                        'monthOptions' => ['[Pilih Bulan]', 'Januari', 'Februari', 'Maret', 'April'],
                        'yearOptions' => ['2026', '2025', '2024'],
                        'defaults' => [
                            'month' => '[Pilih Bulan]',
                            'year' => '2026',
                        ],
                        'deleteLabel' => 'Hapus',
                        'historyTable' => [
                            'createLabel' => 'Tambah Proses Akhir Bulan',
                            'refreshLabel' => 'Muat ulang',
                            'actionsLabel' => 'Pengaturan proses akhir bulan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '5',
                            'filters' => [
                                [
                                    'id' => 'month',
                                    'rowKey' => 'monthValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Bulan: Semua'],
                                        ['value' => 'january-2017', 'label' => 'Bulan: Januari 2017'],
                                        ['value' => 'december-2016', 'label' => 'Bulan: Desember 2016'],
                                        ['value' => 'november-2016', 'label' => 'Bulan: November 2016'],
                                        ['value' => 'october-2016', 'label' => 'Bulan: Oktober 2016'],
                                        ['value' => 'september-2016', 'label' => 'Bulan: September 2016'],
                                    ],
                                ],
                                [
                                    'id' => 'year',
                                    'rowKey' => 'yearValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tahun: Semua'],
                                        ['value' => '2017', 'label' => 'Tahun: 2017'],
                                        ['value' => '2016', 'label' => 'Tahun: 2016'],
                                    ],
                                ],
                            ],
                            'menuItems' => [
                                ['id' => 'column-settings', 'label' => 'Atur kolom'],
                                ['id' => 'export', 'label' => 'Ekspor proses akhir bulan'],
                            ],
                            'columns' => [
                                ['id' => 'name', 'label' => 'Nama', 'widthClassName' => 'w-[200px]'],
                                ['id' => 'inputDate', 'label' => 'Tanggal Input', 'widthClassName' => 'w-[150px]'],
                                ['id' => 'description', 'label' => 'Keterangan'],
                            ],
                            'rows' => [
                                ['id' => 'period-history-2017-01', 'tabLabel' => 'Januari 2017', 'name' => 'Januari 2017', 'inputDate' => '31/01/2017', 'description' => 'Proses Akhir Bulan (Januari, 2017)', 'monthValue' => 'january-2017', 'yearValue' => '2017'],
                                ['id' => 'period-history-2016-12', 'tabLabel' => 'Desember 2016', 'name' => 'Desember 2016', 'inputDate' => '31/12/2016', 'description' => 'Proses Akhir Bulan (Desember, 2016)', 'monthValue' => 'december-2016', 'yearValue' => '2016'],
                                ['id' => 'period-history-2016-11', 'tabLabel' => 'November 2016', 'name' => 'November 2016', 'inputDate' => '30/11/2016', 'description' => 'Proses Akhir Bulan (November, 2016)', 'monthValue' => 'november-2016', 'yearValue' => '2016'],
                                ['id' => 'period-history-2016-10', 'tabLabel' => 'Oktober 2016', 'name' => 'Oktober 2016', 'inputDate' => '31/10/2016', 'description' => 'Proses Akhir Bulan (Oktober, 2016)', 'monthValue' => 'october-2016', 'yearValue' => '2016'],
                                ['id' => 'period-history-2016-09', 'tabLabel' => 'September 2016', 'name' => 'September 2016', 'inputDate' => '30/09/2016', 'description' => 'Proses Akhir Bulan (September, 2016)', 'monthValue' => 'september-2016', 'yearValue' => '2016'],
                            ],
                        ],
                        'detailRecords' => [
                            [
                                'id' => 'period-history-2017-01',
                                'month' => 'Januari',
                                'year' => '2017',
                                'rates' => [
                                    ['id' => 'period-idr-2017-01', 'currencyName' => 'Indonesian Rupiah', 'rate' => '1'],
                                    ['id' => 'period-sgd-2017-01', 'currencyName' => 'Singapore Dollar', 'rate' => '9,543'],
                                    ['id' => 'period-usd-2017-01', 'currencyName' => 'US Dollar', 'rate' => '12,700'],
                                ],
                            ],
                            [
                                'id' => 'period-history-2016-12',
                                'month' => 'Desember',
                                'year' => '2016',
                                'rates' => [
                                    ['id' => 'period-idr-2016-12', 'currencyName' => 'Indonesian Rupiah', 'rate' => '1'],
                                    ['id' => 'period-sgd-2016-12', 'currencyName' => 'Singapore Dollar', 'rate' => '9,410'],
                                    ['id' => 'period-usd-2016-12', 'currencyName' => 'US Dollar', 'rate' => '12,530'],
                                ],
                            ],
                        ],
                        'ratesTable' => [
                            'columns' => [
                                ['id' => 'handle', 'label' => '', 'widthClassName' => 'w-[36px]'],
                                ['id' => 'currencyName', 'label' => 'Nama Mata Uang'],
                                ['id' => 'rate', 'label' => 'Nilai Tukar', 'align' => 'right'],
                            ],
                            'rows' => [
                                ['id' => 'period-idr', 'currencyName' => 'Indonesian Rupiah', 'rate' => '1'],
                                ['id' => 'period-usd', 'currencyName' => 'US Dollar', 'rate' => '12,300'],
                                ['id' => 'period-sgd', 'currencyName' => 'Singapore Dollar', 'rate' => '9,320'],
                            ],
                        ],
                    ],
                ];
    }
}
