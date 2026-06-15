<?php

namespace App\Support\Presentation\Blueprints\Pages;

class BankTransferPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['bank-transfer'], [
            'subtab' => [
                'id' => 'bank-transfer-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'bankTransfer' => [
                'topActions' => [
                    [
                        'id' => 'settings',
                        'label' => 'Pengaturan',
                        'icon' => 'settings',
                        'tone' => 'outline',
                    ],
                ],
                'labels' => [
                    'entryDate' => 'Tanggal',
                    'documentNumber' => 'Nomor #',
                    'fromBank' => 'Dari Kas/Bank',
                    'fromBranch' => 'Cabang',
                    'exchangeRate' => 'Kurs',
                    'transferValue' => 'Nilai Transfer',
                    'toBank' => 'Ke Kas/Bank',
                    'toBranch' => 'Ke Cabang',
                    'resultValue' => 'Hasil Transfer',
                    'notes' => 'Catatan',
                    'reconcileStatus' => 'Terekonsiliasi',
                ],
                'bankPlaceholder' => 'Cari/Pilih...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'feeLookupPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'numberingOptions' => ['Transfer Bank'],
                'transferTitle' => 'Transfer Uang',
                'feeTitle' => 'Biaya Transfer',
                'infoTitle' => 'Info lainnya',
                'sectionTabs' => [
                    ['id' => 'details', 'label' => 'Transfer Uang', 'icon' => 'document'],
                    ['id' => 'fee', 'label' => 'Biaya Transfer', 'icon' => 'payment'],
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
                    'entryDate' => date('d/m/Y'),
                    'autoNumber' => true,
                    'numberingType' => 'Transfer Bank',
                    'documentNumber' => '',
                    'fromBankAccounts' => [],
                    'fromBranches' => ['JAKARTA'],
                    'exchangeRate' => '',
                    'exchangeRateLabel' => '',
                    'transferValue' => '',
                    'transferPrefix' => '',
                    'transferWords' => '',
                    'toBankAccounts' => [],
                    'toBranches' => ['JAKARTA'],
                    'resultValue' => '',
                    'resultPrefix' => '',
                    'resultWords' => '',
                    'notes' => '',
                    'feeRows' => [],
                    'fromTotalLabel' => 'Total',
                    'fromTotalValue' => '0',
                    'toTotalLabel' => 'Total',
                    'toTotalValue' => '0',
                    'saveTone' => 'primary',
                    'reconciliations' => [],
                ],
                'feeTable' => [
                    'columns' => [
                        ['id' => 'accountCode', 'label' => 'Akun', 'widthClassName' => 'w-[25%]'],
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'widthClassName' => 'w-[25%]'],
                        ['id' => 'amount', 'label' => 'Nilai', 'widthClassName' => 'w-[25%]', 'align' => 'right'],
                        ['id' => 'chargedTo', 'label' => 'Dibebankan ke', 'widthClassName' => 'w-[25%]'],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Transfer Bank',
                    'refreshLabel' => 'Sinkron transfer bank',
                    'downloadLabel' => 'Unduh data transfer bank',
                    'printLabel' => 'Cetak transfer bank',
                    'settingsLabel' => 'Pengaturan tabel transfer bank',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '6',
                    'downloadItems' => [
                        ['id' => 'download-excel', 'label' => 'Unduh Excel'],
                        ['id' => 'download-pdf', 'label' => 'Unduh PDF'],
                    ],
                    'settingsItems' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-transfer', 'label' => 'Ekspor transfer bank'],
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
                            'id' => 'from-bank',
                            'rowKey' => 'fromBankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Dari Kas/Bank: Semua'],
                                ['value' => 'cash', 'label' => 'Dari Kas/Bank: Kas'],
                                ['value' => 'bank-bca', 'label' => 'Dari Kas/Bank: Bank BCA'],
                            ],
                        ],
                        [
                            'id' => 'to-bank',
                            'rowKey' => 'toBankFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Ke Kas/Bank: Semua'],
                                ['value' => 'cash', 'label' => 'Ke Kas/Bank: Kas'],
                                ['value' => 'bank-bca', 'label' => 'Ke Kas/Bank: Bank BCA'],
                            ],
                        ],
                    ],
                    'columns' => [
                        ['id' => 'number', 'label' => 'No. Transfer', 'widthClassName' => 'w-[190px]'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[120px]'],
                        ['id' => 'fromBank', 'label' => 'Bank (Keluar)', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'toBank', 'label' => 'Bank (Masuk)', 'widthClassName' => 'w-[150px]'],
                        ['id' => 'description', 'label' => 'Keterangan', 'widthClassName' => 'w-[32%]'],
                        ['id' => 'transferTotal', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                        ['id' => 'purchasePayment', 'label' => 'Pembayaran Pembelian', 'widthClassName' => 'w-[220px]'],
                        ['id' => 'feeTotal', 'label' => 'Total', 'widthClassName' => 'w-[150px]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => 'BT.2016.12.00006', 'number' => 'BT.2016.12.00006', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA USD S...', 'fromBankFull' => 'Bank BCA USD Surabaya (247-878-6241)', 'toBank' => 'Bank BCA IDR Su...', 'toBankFull' => 'Bank BCA IDR Surabaya (388-308-3993)', 'description' => '', 'transferTotal' => '29,491,200', 'purchasePayment' => '', 'feeTotal' => '2,304', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'bank-bca', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA', 'exchangeRateLabel' => '1 USD=XXX IDR', 'exchangeRate' => '12,800', 'transferValue' => '2,304', 'transferPrefix' => 'USD', 'transferWords' => '# Dua ribu tiga ratus empat #', 'resultValue' => '29,491,200', 'resultPrefix' => 'IDR', 'resultWords' => '# Dua puluh sembilan juta empat ratus sembilan puluh satu ribu dua ratus #', 'fromTotalLabel' => 'Total Bank BCA USD Surabaya (24...', 'fromTotalValue' => '$ 2,304', 'toTotalLabel' => 'Total Bank BCA IDR Surabaya (388...', 'toTotalValue' => 'Rp 29,491,200', 'reconciliations' => [['id' => 'recon-a', 'bank' => 'Bank BCA USD Surabaya (247-878-6241)', 'status' => 'Belum', 'date' => ''], ['id' => 'recon-b', 'bank' => 'Bank BCA IDR Surabaya (388-308-3993)', 'status' => 'Ya', 'date' => '(11/02/2017)']]],
                        ['id' => 'BT.2016.12.00005', 'number' => 'BT.2016.12.00005', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA USD J...', 'fromBankFull' => 'Bank BCA USD Jakarta', 'toBank' => 'Bank BCA IDR Ja...', 'toBankFull' => 'Bank BCA IDR Jakarta', 'description' => '', 'transferTotal' => '71,120,000', 'purchasePayment' => '', 'feeTotal' => '5,600', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'bank-bca', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00004', 'number' => 'BT.2016.12.00004', 'date' => '16/12/2016', 'fromBank' => 'Kas Besar Kantor...', 'fromBankFull' => 'Kas Besar Kantor Jakarta', 'toBank' => 'Kas Kecil Kantor ...', 'toBankFull' => 'Kas Kecil Kantor Jakarta', 'description' => '', 'transferTotal' => '8,750,000', 'purchasePayment' => '', 'feeTotal' => '8,750,000', 'dateFilter' => '2016', 'fromBankFilter' => 'cash', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00003', 'number' => 'BT.2016.12.00003', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA IDR Su...', 'fromBankFull' => 'Bank BCA IDR Surabaya', 'toBank' => 'Kas Besar Kantor...', 'toBankFull' => 'Kas Besar Kantor Surabaya', 'description' => '', 'transferTotal' => '11,200,000', 'purchasePayment' => '', 'feeTotal' => '11,200,000', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00002', 'number' => 'BT.2016.12.00002', 'date' => '16/12/2016', 'fromBank' => 'Kas Besar Kantor...', 'fromBankFull' => 'Kas Besar Kantor Jakarta', 'toBank' => 'Kas Kecil Kantor ...', 'toBankFull' => 'Kas Kecil Kantor Jakarta', 'description' => 'Transfer Uang', 'transferTotal' => '12,700,000', 'purchasePayment' => '', 'feeTotal' => '12,700,000', 'dateFilter' => '2016', 'fromBankFilter' => 'cash', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                        ['id' => 'BT.2016.12.00001', 'number' => 'BT.2016.12.00001', 'date' => '16/12/2016', 'fromBank' => 'Bank BCA IDR Ja...', 'fromBankFull' => 'Bank BCA IDR Jakarta', 'toBank' => 'Kas Besar Kantor...', 'toBankFull' => 'Kas Besar Kantor Surabaya', 'description' => 'Transfer Untuk Gaji Nov 2016', 'transferTotal' => '127,500,000', 'purchasePayment' => '', 'feeTotal' => '127,500,000', 'dateFilter' => '2016', 'fromBankFilter' => 'bank-bca', 'toBankFilter' => 'cash', 'fromBranch' => 'JAKARTA', 'toBranch' => 'JAKARTA'],
                    ],
                ],
                'detailRecords' => [
                    'BT.2016.12.00006' => [
                        'entryDate' => '16/12/2016',
                        'autoNumber' => false,
                        'numberingType' => 'Transfer Bank',
                        'documentNumber' => 'BT.2016.12.00006',
                        'fromBankAccounts' => ['Bank BCA USD Surabaya (247-878-6241)'],
                        'fromBranches' => ['JAKARTA'],
                        'exchangeRateLabel' => '1 USD=XXX IDR',
                        'exchangeRate' => '12,800',
                        'transferValue' => '2,304',
                        'transferPrefix' => 'USD',
                        'transferWords' => '# Dua ribu tiga ratus empat #',
                        'toBankAccounts' => ['Bank BCA IDR Surabaya (388-308-3993)'],
                        'toBranches' => ['JAKARTA'],
                        'resultValue' => '29,491,200',
                        'resultPrefix' => 'IDR',
                        'resultWords' => '# Dua puluh sembilan juta empat ratus sembilan puluh satu ribu dua ratus #',
                        'notes' => '',
                        'feeRows' => [],
                        'fromTotalLabel' => 'Total Bank BCA USD Surabaya (24...',
                        'fromTotalValue' => '$ 2,304',
                        'toTotalLabel' => 'Total Bank BCA IDR Surabaya (388...',
                        'toTotalValue' => 'Rp 29,491,200',
                        'saveTone' => 'muted',
                        'reconciliations' => [
                            ['id' => 'transfer-recon-a', 'bank' => 'Bank BCA USD Surabaya (247-878-6241)', 'status' => 'Belum', 'date' => ''],
                            ['id' => 'transfer-recon-b', 'bank' => 'Bank BCA IDR Surabaya (388-308-3993)', 'status' => 'Ya', 'date' => '(11/02/2017)'],
                        ],
                    ],
                ],
            ],
        ]);
    }
}
