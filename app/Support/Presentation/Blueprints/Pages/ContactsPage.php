<?php

namespace App\Support\Presentation\Blueprints\Pages;

class ContactsPage
{
    public static function get(): array
    {
        return [
                    'id' => 'contacts',
                    'label' => 'Kontak',
                    'showViewIndicator' => true,
                    'table' => [
                        'refreshLabel' => 'Muat ulang',
                        'printLabel' => 'Cetak',
                        'actionsLabel' => 'Aksi kontak',
                        'filterButtonLabel' => 'Filter kontak',
                        'searchPlaceholder' => 'Cari...',
                        'pageValue' => '127',
                        'filters' => [
                            [
                                'id' => 'type',
                                'options' => [
                                    ['value' => 'all', 'label' => 'Tipe: Semua'],
                                    ['value' => 'customer', 'label' => 'Tipe: Pelanggan'],
                                    ['value' => 'supplier', 'label' => 'Tipe: Pemasok'],
                                    ['value' => 'employee', 'label' => 'Tipe: Karyawan'],
                                ],
                            ],
                        ],
                        'menuItems' => [
                            ['id' => 'column-settings', 'label' => 'Atur kolom'],
                            ['id' => 'export-contacts', 'label' => 'Ekspor kontak'],
                        ],
                        'columns' => [
                            ['id' => 'fullName', 'label' => 'Nama Lengkap', 'align' => 'left', 'widthClassName' => 'w-[24%]'],
                            ['id' => 'typeLabel', 'label' => 'Tipe', 'align' => 'left', 'widthClassName' => 'w-[10%]'],
                            ['id' => 'company', 'label' => 'Perusahaan', 'align' => 'left', 'widthClassName' => 'w-[24%]'],
                            ['id' => 'mobilePhone', 'label' => 'Handphone', 'align' => 'left', 'widthClassName' => 'w-[24%]'],
                            ['id' => 'email', 'label' => 'Email', 'align' => 'left', 'widthClassName' => 'w-[18%]'],
                        ],
                        'rows' => [
                            ['id' => 'contact-001', 'fullName' => 'Pelanggan Umum - Surabaya', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Pelanggan Umum - Surabaya', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-002', 'fullName' => 'PT CIRCLE PHONE', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT CIRCLE PHONE', 'mobilePhone' => '', 'email' => 'Purchase@circlephone.com'],
                            ['id' => 'contact-003', 'fullName' => 'Miss Anna', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT.CIRCLE PHONE', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-004', 'fullName' => 'Grow up Phone Cellular', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Grow up Phone Cellular', 'mobilePhone' => '', 'email' => 'buyingmartinus@yahoo.com'],
                            ['id' => 'contact-005', 'fullName' => 'Mr. Martinus', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Grow up Phone Cellular', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-006', 'fullName' => 'SUN Acerssories', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'SUN Acerssories', 'mobilePhone' => '', 'email' => 'sunbuy@yahoo.com'],
                            ['id' => 'contact-007', 'fullName' => 'Mr. Lassarisi', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'SUN Acerssories', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-008', 'fullName' => 'Abadi Phone Center', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Abadi Phone Center', 'mobilePhone' => '', 'email' => 'rikson93@gmail.com'],
                            ['id' => 'contact-009', 'fullName' => 'Rikson', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Abadi Phone Center', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-010', 'fullName' => 'Nasional Phone Jaya', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Nasional Phone Jaya', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-011', 'fullName' => 'Miss. Eventi', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'Nasional Phone Jaya', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-012', 'fullName' => 'National Earth Accessories', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'National Earth Accessories', 'mobilePhone' => '', 'email' => 'prcs@earthaccessories.com'],
                            ['id' => 'contact-013', 'fullName' => 'Miss Lena', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'National Earth Accessories', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-014', 'fullName' => 'PT Global Makmur', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT Global Makmur', 'mobilePhone' => '', 'email' => 'imanlimbong.makmur@gmail.com'],
                            ['id' => 'contact-015', 'fullName' => 'Mr. Iman', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT. Global Makmur', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-016', 'fullName' => 'PT Kapuk Kartika', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT Kapuk Kartika', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-017', 'fullName' => 'Miss Anggreani', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT. Kapuk Kartika', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-018', 'fullName' => 'PT Emas Sentosa', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT Emas Sentosa', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-019', 'fullName' => 'Miss Winny', 'typeValue' => 'customer', 'typeLabel' => 'Pelanggan', 'company' => 'PT. Emas Sentosa', 'mobilePhone' => '', 'email' => ''],
                            ['id' => 'contact-020', 'fullName' => 'CV Surya Teknik', 'typeValue' => 'supplier', 'typeLabel' => 'Pemasok', 'company' => 'CV Surya Teknik', 'mobilePhone' => '0812-1111-2233', 'email' => 'procurement@suryateknik.id'],
                            ['id' => 'contact-021', 'fullName' => 'Budi Santoso', 'typeValue' => 'employee', 'typeLabel' => 'Karyawan', 'company' => 'TB Nur Pusat', 'mobilePhone' => '0813-8899-1122', 'email' => 'budi.santoso@tbnur.com'],
                        ],
                    ],
                ];
    }
}
