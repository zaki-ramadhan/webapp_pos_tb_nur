<?php

namespace App\Support\Presentation\Blueprints\Pages;

class EmployeesPage
{
    public static function get(): array
    {
        return [
                    'id' => 'employees',
                    'label' => 'Karyawan',
                    'subtab' => [
                        'id' => 'employees-create',
                        'label' => 'Data Baru',
                    ],
                    'viewModes' => [
                        'form' => 'Form',
                        'table' => 'Tabel',
                    ],
                    'table' => [
                        'createLabel' => 'Tambah Karyawan',
                        'refreshLabel' => 'Muat ulang',
                        'downloadLabel' => 'Unduh',
                        'shareLabel' => 'Bagikan',
                        'printLabel' => 'Cetak',
                        'actionsLabel' => 'Aksi karyawan',
                        'filterButtonLabel' => 'Filter lanjutan',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '11',
                        'filters' => [
                            [
                                'id' => 'inactive',
                                'rowKey' => 'inactiveValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Non Aktif: Semua'],
                                    ['value' => 'no', 'label' => 'Non Aktif: Tidak'],
                                    ['value' => 'yes', 'label' => 'Non Aktif: Ya'],
                                ],
                            ],
                            [
                                'id' => 'employment-status',
                                'rowKey' => 'employmentStatusValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Status Pekerja: Semua'],
                                    ['value' => 'permanent', 'label' => 'Status Pekerja: Pegawai Tetap'],
                                ],
                            ],
                            [
                                'id' => 'department',
                                'rowKey' => 'departmentValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Departemen: Semua'],
                                    ['value' => 'consulting', 'label' => 'Departemen: Consulting'],
                                    ['value' => 'accounting', 'label' => 'Departemen: Accounting'],
                                    ['value' => 'management', 'label' => 'Departemen: Management'],
                                ],
                            ],
                            [
                                'id' => 'seller',
                                'rowKey' => 'sellerValue',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Penjual: Semua'],
                                    ['value' => 'yes', 'label' => 'Penjual: Ya'],
                                    ['value' => 'no', 'label' => 'Penjual: Tidak'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'export-employees', 'label' => 'Ekspor daftar karyawan'],
                        ],
                        'columns' => [
                            [
                                'id' => 'name',
                                'label' => 'Nama',
                                'widthClassName' => 'w-[190px]',
                            ],
                            [
                                'id' => 'position',
                                'label' => 'Posisi Jabatan',
                                'widthClassName' => 'w-[310px]',
                            ],
                            [
                                'id' => 'email',
                                'label' => 'Email',
                                'widthClassName' => 'w-[310px]',
                            ],
                            [
                                'id' => 'mobilePhone',
                                'label' => 'Handphone',
                                'widthClassName' => 'w-[210px]',
                            ],
                            [
                                'id' => 'employeeId',
                                'label' => 'ID Karyawan',
                                'widthClassName' => 'w-[150px]',
                            ],
                            [
                                'id' => 'taxStatus',
                                'label' => 'Status PTKP',
                                'widthClassName' => 'w-[130px]',
                            ],
                            [
                                'id' => 'employmentStatus',
                                'label' => 'Status Pekerja',
                                'widthClassName' => 'w-[220px]',
                            ],
                            [
                                'id' => 'payable',
                                'label' => 'Utang',
                                'widthClassName' => 'w-[120px]',
                                'align' => 'right',
                            ],
                        ],
                        'rows' => EmployeesTable::rows(),
                    ],
                    'form' => [
                        'saveLabel' => 'Simpan',
                        'attachmentLabel' => 'Lampiran',
                        'tabs' => [
                            [
                                'id' => 'employee-general',
                                'label' => 'Karyawan',
                            ],
                            [
                                'id' => 'employee-address',
                                'label' => 'Alamat',
                            ],
                            [
                                'id' => 'employee-tax',
                                'label' => 'Pajak Penghasilan',
                            ],
                            [
                                'id' => 'employee-bank',
                                'label' => 'Rekening Gaji',
                            ],
                        ],
                        'salutationOptions' => [
                            'Bapak',
                            'Ibu',
                        ],
                        'nationalityOptions' => [
                            'Indonesia',
                            'WNA',
                        ],
                        'employeeIdTypeOptions' => [
                            'Karyawan',
                            'Kontrak',
                            'Magang',
                        ],
                        'branchOptions' => [
                            'JAKARTA',
                            'SURABAYA',
                        ],
                        'departmentOptions' => [
                            'Accounting',
                            'Gudang',
                            'Keuangan',
                            'Penjualan',
                        ],
                        'bankOptions' => [
                            'Bank BCA',
                            'Bank BNI',
                            'Bank BRI',
                            'Bank Mandiri',
                        ],
                        'employmentStatusOptions' => [
                            'Pegawai Tetap',
                            'Pegawai Kontrak',
                        ],
                        'taxAllowanceStatusOptions' => [
                            'Tidak Kawin (Tidak ada tanggungan)',
                            'Kawin (Tidak ada tanggungan)',
                            'Kawin (1 tanggungan)',
                        ],
                        'taxStartMonthOptions' => [
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
                        'taxStartYearOptions' => [
                            '2026',
                            '2025',
                        ],
                        'taxCalculationNote' => 'Penghasilan dan PPh sebelumnya HANYA PERLU diisikan jika PPh sudah dihitung dan dibayarkan dari januari, namun Pencatatan gaji di TB Nur POS hanya di isi mulai bulan April 2026',
                        'defaults' => [
                            'salutation' => 'Bapak',
                            'fullName' => '',
                            'position' => '',
                            'email' => '',
                            'mobilePhone' => '',
                            'officePhone' => '',
                            'homePhone' => '',
                            'whatsApp' => '',
                            'website' => '',
                            'nationality' => 'Indonesia',
                            'autoEmployeeId' => true,
                            'employeeIdType' => 'Karyawan',
                            'joinDate' => '24/04/2026',
                            'identityNumber' => '',
                            'branch' => 'JAKARTA',
                            'department' => '',
                            'isSalesperson' => false,
                            'note' => '',
                            'street' => '',
                            'city' => '',
                            'postalCode' => '',
                            'province' => '',
                            'country' => '',
                            'subjectToIncomeTax' => true,
                            'taxNumber' => '',
                            'employmentStatus' => 'Pegawai Tetap',
                            'taxAllowanceApplies' => 'Ya',
                            'taxAllowanceStatus' => 'Tidak Kawin (Tidak ada tanggungan)',
                            'taxStartMonth' => 'April',
                            'taxStartYear' => '2026',
                            'previousIncome' => '',
                            'previousTax' => '',
                            'bankName' => '',
                            'bankAccountNumber' => '',
                            'bankAccountHolder' => '',
                        ],
                    ],
                ];
    }
}
