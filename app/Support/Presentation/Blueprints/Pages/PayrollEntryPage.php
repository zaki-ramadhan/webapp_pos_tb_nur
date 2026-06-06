<?php

namespace App\Support\Presentation\Blueprints\Pages;

class PayrollEntryPage
{
    public static function get(): array
    {
        return [
                    'id' => 'payroll-entry',
                    'label' => 'Pencatatan Gaji',
                    'subtab' => [
                        'id' => 'payroll-entry-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'payrollEntry' => [
                        'topActions' => [
                            [
                                'id' => 'settings',
                                'label' => 'Pengaturan',
                                'icon' => 'settings',
                                'tone' => 'outline',
                            ],
                        ],
                        'labels' => [
                            'paymentType' => 'Tipe Pembayaran',
                            'branch' => 'Cabang',
                            'periodMonth' => 'Bulan',
                            'numbering' => 'Nomor #',
                            'entryDate' => 'Tanggal',
                            'dueDate' => 'Jatuh Tempo',
                        ],
                        'paymentTypeOptions' => ['Bulanan'],
                        'branchPlaceholder' => 'Cari/Pilih...',
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
                        'yearOptions' => ['2026', '2025', '2024'],
                        'numberingOptions' => ['Pencatatan Gaji'],
                        'processButtonLabel' => 'Proses',
                        'takeButtonLabel' => 'Ambil',
                        'employeeLookupPlaceholder' => 'Cari/Pilih...',
                        'employeeSectionTitle' => 'Rincian Karyawan',
                        'additionalInfoTitle' => 'Info lainnya',
                        'sectionTabs' => [
                            [
                                'id' => 'employees',
                                'label' => 'Rincian Karyawan',
                                'icon' => 'form',
                            ],
                            [
                                'id' => 'additional-info',
                                'label' => 'Info lainnya',
                                'icon' => 'info',
                            ],
                        ],
                        'dockActions' => [
                            [
                                'id' => 'save',
                                'label' => 'Simpan',
                                'icon' => 'save',
                                'tone' => 'primary',
                                'items' => [
                                    ['id' => 'save-now', 'label' => 'Simpan'],
                                    ['id' => 'save-new', 'label' => 'Simpan dan buat baru'],
                                ],
                            ],
                            [
                                'id' => 'document',
                                'label' => 'Form lain',
                                'icon' => 'document',
                                'tone' => 'secondary',
                                'items' => [
                                    ['id' => 'detail-view', 'label' => 'Lihat detail'],
                                    ['id' => 'print-preview', 'label' => 'Preview dokumen'],
                                ],
                            ],
                            [
                                'id' => 'attachment',
                                'label' => 'Lampiran',
                                'icon' => 'paperclip',
                                'tone' => 'secondary',
                                'items' => [
                                    ['id' => 'add-attachment', 'label' => 'Tambah lampiran'],
                                    ['id' => 'manage-attachment', 'label' => 'Kelola lampiran'],
                                ],
                            ],
                        ],
                        'defaults' => [
                            'paymentType' => 'Bulanan',
                            'branches' => ['JAKARTA'],
                            'month' => 'April',
                            'year' => '2026',
                            'autoNumber' => true,
                            'numberingType' => 'Pencatatan Gaji',
                            'entryDate' => '25/04/2026',
                            'dueDate' => '25/04/2026',
                            'employeeLookup' => '',
                            'liabilityAccounts' => ['[214.100-01] BYMD - Gaji Jakarta'],
                            'notes' => '',
                        ],
                        'employeeTable' => [
                            'columns' => [
                                [
                                    'id' => 'spacer',
                                    'label' => '',
                                    'kind' => 'spacer',
                                    'widthClassName' => 'w-[36px]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'employeeName',
                                    'label' => 'Nama Karyawan',
                                    'widthClassName' => 'w-[48%]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'grossIncome',
                                    'label' => 'Pendapatan Bruto',
                                    'widthClassName' => 'w-[12%]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'incomeTax',
                                    'label' => 'Pajak Penghasilan',
                                    'widthClassName' => 'w-[12%]',
                                    'align' => 'center',
                                ],
                                [
                                    'id' => 'paidSalary',
                                    'label' => 'Gaji dibayarkan',
                                    'widthClassName' => 'w-[12%]',
                                    'align' => 'center',
                                ],
                            ],
                            'rows' => [],
                            'emptyLabel' => 'Belum ada data',
                        ],
                        'summaryItems' => [
                            [
                                'id' => 'gross-income',
                                'label' => 'Pendapatan Bruto',
                                'value' => 'Rp 0',
                            ],
                            [
                                'id' => 'paid-salary',
                                'label' => 'Gaji dibayarkan',
                                'value' => 'Rp 0',
                            ],
                        ],
                        'additionalInfoFields' => [
                            'liabilityAccountLabel' => 'Hutang Beban',
                            'liabilityAccountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                            'noteLabel' => 'Catatan',
                        ],
                        'table' => [
                            'createLabel' => 'Tambah Pencatatan Gaji',
                            'refreshLabel' => 'Muat ulang',
                            'printLabel' => 'Cetak',
                            'settingsLabel' => 'Pengaturan tabel',
                            'filterButtonLabel' => 'Filter lanjutan',
                            'searchPlaceholder' => 'Cari...',
                            'pageValue' => '8',
                            'filters' => [
                                [
                                    'id' => 'date',
                                    'rowKey' => 'dateFilter',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                        ['value' => '2017', 'label' => 'Tanggal: 2017'],
                                        ['value' => '2016', 'label' => 'Tanggal: 2016'],
                                    ],
                                ],
                                [
                                    'id' => 'status',
                                    'rowKey' => 'statusValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Status: Semua'],
                                        ['value' => 'paid', 'label' => 'Status: Terbayar'],
                                        ['value' => 'partial', 'label' => 'Status: Sebagian dibayar'],
                                    ],
                                ],
                                [
                                    'id' => 'month',
                                    'rowKey' => 'monthValue',
                                    'options' => [
                                        ['value' => 'all', 'label' => 'Bulan: Semua'],
                                        ['value' => 'january', 'label' => 'Bulan: Januari'],
                                        ['value' => 'november', 'label' => 'Bulan: November'],
                                        ['value' => 'december', 'label' => 'Bulan: Desember'],
                                        ['value' => 'october', 'label' => 'Bulan: Oktober'],
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
                            'columns' => [
                                ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[210px]'],
                                ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                                ['id' => 'dueDate', 'label' => 'Jatuh Tempo', 'widthClassName' => 'w-[120px]'],
                                ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                                ['id' => 'paymentType', 'label' => 'Tipe Pembayaran', 'widthClassName' => 'w-[160px]'],
                                ['id' => 'status', 'label' => 'Status', 'widthClassName' => 'w-[150px]'],
                                ['id' => 'period', 'label' => 'Periode', 'widthClassName' => 'w-[140px]'],
                                ['id' => 'description', 'label' => 'Keterangan'],
                            ],
                            'rows' => [
                                ['id' => 'payroll-2017-02', 'number' => 'EPY.2016.11.00002', 'date' => '10/02/2017', 'dueDate' => '10/02/2017', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'November 2016', 'description' => '', 'dateFilter' => '2017', 'monthValue' => 'november', 'yearValue' => '2017'],
                                ['id' => 'payroll-2017-01-b', 'number' => 'EPY.2017.01.00002', 'date' => '23/01/2017', 'dueDate' => '26/01/2017', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Sebagian dibayar', 'statusValue' => 'partial', 'period' => 'Januari 2017', 'description' => '', 'dateFilter' => '2017', 'monthValue' => 'january', 'yearValue' => '2017'],
                                ['id' => 'payroll-2017-01-a', 'number' => 'EPY.2017.01.00001', 'date' => '20/01/2017', 'dueDate' => '26/01/2017', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Sebagian dibayar', 'statusValue' => 'partial', 'period' => 'Januari 2017', 'description' => '', 'dateFilter' => '2017', 'monthValue' => 'january', 'yearValue' => '2017'],
                                ['id' => 'payroll-2016-12-b', 'number' => 'EPY.2016.12.00002', 'date' => '22/12/2016', 'dueDate' => '26/12/2016', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Desember 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'december', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-12-a', 'number' => 'EPY.2016.12.00001', 'date' => '22/12/2016', 'dueDate' => '26/12/2016', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Desember 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'december', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-11-a', 'number' => 'EPY.2016.11.00001', 'date' => '22/11/2016', 'dueDate' => '25/11/2016', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'November 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'november', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-10-b', 'number' => 'EPY.2016.10.00002', 'date' => '22/10/2016', 'dueDate' => '26/10/2016', 'total' => '40,213,124', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Oktober 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'october', 'yearValue' => '2016'],
                                ['id' => 'payroll-2016-10-a', 'number' => 'EPY.2016.10.00001', 'date' => '22/10/2016', 'dueDate' => '26/10/2016', 'total' => '56,018,296', 'paymentType' => 'Bulanan', 'status' => 'Terbayar', 'statusValue' => 'paid', 'period' => 'Oktober 2016', 'description' => '', 'dateFilter' => '2016', 'monthValue' => 'october', 'yearValue' => '2016'],
                            ],
                        ],
                    ],
                ];
    }
}
