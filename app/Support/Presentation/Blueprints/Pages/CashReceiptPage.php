<?php

namespace App\Support\Presentation\Blueprints\Pages;

class CashReceiptPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['cash-receipt'], [
            'subtab' => [
                'id' => 'cash-receipt-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'cashReceipt' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'cashBank' => 'Kas/Bank',
                    'documentNumber' => 'No Bukti #',
                    'entryDate' => 'Tanggal',
                    'checkNumber' => 'No Cek #',
                    'payer' => 'Pemberi',
                    'voided' => 'V O I D',
                    'branch' => 'Cabang',
                    'notes' => 'Catatan',
                    'reconcileStatus' => 'Terekonsiliasi',
                    'printStatus' => 'Dicetak/email',
                ],
                'cashBankPlaceholder' => 'Cari/Pilih...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'numberingOptions' => [
                    'Bank BCA IDR Jakarta (069-773-3993)',
                    'Bank Mandiri IDR Surabaya (276-129-4178)',
                    'Bank BCA IDR Surabaya (388-308-3993)',
                ],
                'lineSearchPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'lineSectionTitle' => 'Rincian Penerimaan',
                'infoTitle' => 'Info lainnya',
                'totalCardLabel' => 'Nilai',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Rincian Penerimaan', 'icon' => 'document'],
                    ['id' => 'additional-info', 'label' => 'Info lainnya', 'icon' => 'info'],
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
                            ['id' => 'open-document', 'label' => 'Buka dokumen terkait'],
                            ['id' => 'preview-document', 'label' => 'Preview dokumen'],
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
                    [
                        'id' => 'more',
                        'label' => 'Lainnya',
                        'icon' => 'kebab',
                        'tone' => 'success',
                        'items' => [
                            ['id' => 'duplicate-transaction', 'label' => 'Duplikasi transaksi'],
                            ['id' => 'mark-review', 'label' => 'Tandai untuk review'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'draft' => [
                    'bankAccounts' => [],
                    'entryDate' => '25/04/2026',
                    'autoNumber' => true,
                    'numberingType' => 'Bank BCA IDR Jakarta (069-773-3993)',
                    'documentNumber' => '',
                    'checkNumber' => '',
                    'payer' => '',
                    'voided' => false,
                    'branches' => ['JAKARTA'],
                    '__branchId' => 1,
                    'notes' => '',
                    'lineItems' => [],
                    'totalValue' => '0',
                    'saveTone' => 'primary',
                    'reconcileStatus' => '',
                    'reconcileDate' => '',
                    'printStatus' => '',
                ],
                'lineTable' => [
                    'columns' => [
                        ['id' => 'accountCode', 'label' => 'Akun', 'widthClassName' => 'w-[130px]', 'align' => 'left'],
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'align' => 'left'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Penerimaan',
                    'refreshLabel' => 'Sinkron penerimaan',
                    'downloadLabel' => 'Unduh data penerimaan',
                    'printLabel' => 'Cetak penerimaan',
                    'settingsLabel' => 'Pengaturan tabel penerimaan',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'settingsItems' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-receipt', 'label' => 'Ekspor penerimaan'],
                    ],
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2016', 'label' => 'Tanggal: 2016'],
                            ],
                        ],
                        [
                            'id' => 'bank',
                            'rowKey' => 'bankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Kas/Bank: Semua'],
                                ['value' => 'bank-bca', 'label' => 'Kas/Bank: Bank BCA'],
                                ['value' => 'bank-mandiri', 'label' => 'Kas/Bank: Bank Mandiri'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'Nomor #', 'widthClassName' => 'w-[210px]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                        ['id' => 'cashBank', 'label' => 'Kas/Bank', 'widthClassName' => 'w-[200px]'],
                        ['id' => 'checkNumber', 'label' => 'No Cek #', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'description', 'label' => 'Keterangan'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[160px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => '111.202-04.2016.12.00001', 'number' => '111.202-04.2016.12.00001', 'date' => '31/12/2016', 'cashBank' => 'Bank Mandiri IDR Surab...', 'cashBankFull' => 'Bank Mandiri IDR Surabaya (276-129-4178)', 'checkNumber' => '', 'description' => '', 'amount' => '4,346,346', 'dateFilter' => '2016', 'bankFilter' => 'bank-mandiri', 'branch' => 'JAKARTA', 'accountCode' => '811.000-01', 'accountName' => 'Pendapatan Bunga Bank', 'reconcileStatus' => 'Ya', 'reconcileDate' => '(11/02/2017)', 'printStatus' => 'Belum cetak/email'],
                        ['id' => '111.202-02.2016.12.00002', 'number' => '111.202-02.2016.12.00002', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA USD Surabay...', 'cashBankFull' => 'Bank BCA USD Surabaya (247-878-6241)', 'checkNumber' => '', 'description' => '', 'amount' => '307', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-02.2016.12.00004', 'number' => '111.102-02.2016.12.00004', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA USD Jakarta (...', 'cashBankFull' => 'Bank BCA USD Jakarta (247-878-6241)', 'checkNumber' => '', 'description' => '', 'amount' => '1,023', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.202-01.2016.12.00003', 'number' => '111.202-01.2016.12.00003', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA IDR Surabaya...', 'cashBankFull' => 'Bank BCA IDR Surabaya (388-308-3993)', 'checkNumber' => '', 'description' => '', 'amount' => '8,765,000', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-01.2016.12.00003', 'number' => '111.102-01.2016.12.00003', 'date' => '16/12/2016', 'cashBank' => 'Bank BCA IDR Jakarta (0...', 'cashBankFull' => 'Bank BCA IDR Jakarta (069-773-3993)', 'checkNumber' => '', 'description' => '', 'amount' => '10,340,000', 'dateFilter' => '2016', 'bankFilter' => 'bank-bca', 'branch' => 'JAKARTA'],
                        ['id' => '111.102-04.2016.11.00001', 'number' => '111.102-04.2016.11.00001', 'date' => '30/11/2016', 'cashBank' => 'Bank Mandiri IDR Jakart...', 'cashBankFull' => 'Bank Mandiri IDR Jakarta', 'checkNumber' => '', 'description' => '', 'amount' => '6,004,500', 'dateFilter' => '2016', 'bankFilter' => 'bank-mandiri', 'branch' => 'JAKARTA'],
                    ],
                ],
                'detailRecords' => [
                    '111.202-04.2016.12.00001' => [
                        'bankAccounts' => ['Bank Mandiri IDR Surabaya (276-129-4178)'],
                        'entryDate' => '31/12/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Bank BCA IDR Jakarta (069-773-3993)',
                        'documentNumber' => '111.202-04.2016.12.00001',
                        'checkNumber' => '',
                        'payer' => '',
                        'voided' => false,
                        'branches' => ['JAKARTA'],
                    '__branchId' => 1,
                        'notes' => '',
                        'lineItems' => [
                            [
                                'id' => 'cash-receipt-line-1',
                                'accountCode' => '811.000-01',
                                'accountName' => 'Pendapatan Bunga Bank',
                                'amount' => '4,346,346',
                            ],
                        ],
                        'totalValue' => 'Rp 4,346,346',
                        'saveTone' => 'muted',
                        'reconcileStatus' => 'Ya',
                        'reconcileDate' => '(11/02/2017)',
                        'printStatus' => 'Belum cetak/email',
                    ],
                ],
            ],
        ]);
    }
}
