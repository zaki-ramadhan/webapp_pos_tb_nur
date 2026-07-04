<?php

namespace App\Support\Presentation\Blueprints\Pages;

class GeneralJournalPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['general-journal'], [
            'subtab' => [
                'id' => 'general-journal-create',
                'label' => 'Data Baru',
            ],
            'viewModes' => [
                'form' => 'Form',
                'table' => 'Tabel',
            ],
            'generalJournal' => [
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
                    'transactionNumber' => 'No. Tx #',
                    'transactionType' => 'Tipe Transaksi',
                    'branch' => 'Cabang',
                    'notes' => 'Keterangan',
                ],
                'numberingOptions' => [
                    'Jurnal Umum',
                    'Nomor Bukti Kas/Bank',
                    'Kas & Bank',
                    'Kas Kecil',
                    'Bank',
                ],
                'takeButtonLabel' => 'Ambil',
                'branchPlaceholder' => 'Cari/Pilih...',
                'lineSearchPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'lineSectionTitle' => 'Rincian Jurnal',
                'additionalInfoTitle' => 'Info lainnya',
                'sectionTabs' => [
                    [
                        'id' => 'details',
                        'label' => 'Rincian Jurnal',
                        'icon' => 'document',
                    ],
                    [
                        'id' => 'additional-info',
                        'label' => 'Info lainnya',
                        'icon' => 'info',
                    ],
                ],
                'totalLabels' => [
                    'debit' => 'Total Debit',
                    'credit' => 'Total Credit',
                ],
                'dockActions' => [
                    [
                        'id' => 'save',
                        'label' => 'Simpan',
                        'icon' => 'save',
                        'tone' => 'muted',
                    ],
                    [
                        'id' => 'document',
                        'label' => 'Form lain',
                        'icon' => 'document',
                        'tone' => 'secondary',
                        'items' => [
                            ['id' => 'open-related', 'label' => 'Buka transaksi terkait'],
                            ['id' => 'preview-document', 'label' => 'Preview jurnal'],
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
                            ['id' => 'duplicate', 'label' => 'Duplikasi jurnal'],
                            ['id' => 'audit', 'label' => 'Lihat jejak audit'],
                        ],
                    ],
                    [
                        'id' => 'delete',
                        'label' => 'Hapus',
                        'icon' => 'trash',
                        'tone' => 'danger',
                    ],
                ],
                'defaults' => [
                    'documentNumber' => '',
                    'transactionNumber' => '',
                    'entryDate' => date('d/m/Y'),
                    'autoNumber' => true,
                    'numberingType' => 'Jurnal Umum',
                    'transactionType' => 'Jurnal Umum',
                    'transactionTypeValue' => 'general-journal',
                    'branches' => ['JAKARTA'],
                    '__branchId' => 1,
                    'notes' => '',
                    'lineLookup' => '',
                    'lineItems' => [],
                    'totalDebit' => 'Rp 0',
                    'totalCredit' => 'Rp 0',
                    'saveTone' => 'muted',
                ],
                'records' => [
                    'JV.2017.02.00015' => [
                        'id' => 'JV.2017.02.00015',
                        'documentNumber' => 'JV.2017.02.00015',
                        'transactionNumber' => '111.102-01.2017.02.00002',
                        'entryDate' => '24/02/2017',
                        'autoNumber' => false,
                        'numberingType' => 'Jurnal Umum',
                        'transactionType' => 'Penerimaan Penjualan',
                        'transactionTypeValue' => 'sales-receipt',
                        'branches' => ['JAKARTA'],
                    '__branchId' => 1,
                        'notes' => 'Pembayaran No. Faktur SI.2016.10.00004, SI.2017.02.00005',
                        'lineLookup' => '',
                        'lineItems' => [
                            [
                                'id' => 'JV.2017.02.00015-line-1',
                                'accountCode' => '111.102-01',
                                'accountName' => 'Bank BCA IDR Jakarta (069-773-3993)',
                                'debit' => '33,600,000',
                                'credit' => '0',
                            ],
                            [
                                'id' => 'JV.2017.02.00015-line-2',
                                'accountCode' => '112.101-01',
                                'accountName' => 'Piutang Usaha Jakarta - IDR',
                                'debit' => '0',
                                'credit' => '33,600,000',
                            ],
                        ],
                        'totalDebit' => 'Rp 33,600,000',
                        'totalCredit' => 'Rp 33,600,000',
                        'saveTone' => 'muted',
                    ],
                ],
                'lineTable' => [
                    'columns' => [
                        [
                            'id' => 'accountCode',
                            'label' => 'Kode #',
                            'widthClassName' => 'w-[30%]',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'accountName',
                            'label' => 'Nama Perkiraan',
                            'widthClassName' => 'w-[35%]',
                            'align' => 'left',
                        ],
                        [
                            'id' => 'debit',
                            'label' => 'Debit',
                            'widthClassName' => 'w-[19%]',
                            'align' => 'right',
                        ],
                        [
                            'id' => 'credit',
                            'label' => 'Kredit',
                            'widthClassName' => 'w-[19%]',
                            'align' => 'right',
                        ],
                    ],
                    'emptyLabel' => 'Belum ada data',
                ],
                'table' => [
                    'createLabel' => 'Tambah Jurnal Umum',
                    'refreshLabel' => 'Muat ulang',
                    'downloadLabel' => 'Unduh',
                    'printLabel' => 'Cetak',
                    'settingsLabel' => 'Pengaturan tabel',
                    'filterButtonLabel' => 'Filter lanjutan',
                    'searchPlaceholder' => 'Cari...',
                    'pageValue' => '506',
                    'filters' => [
                        [
                            'id' => 'date',
                            'rowKey' => 'dateFilter',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tanggal: Semua'],
                                ['value' => '2017', 'label' => 'Tanggal: 2017'],
                            ],
                        ],
                        [
                            'id' => 'transactionType',
                            'rowKey' => 'transactionTypeValue',
                            'options' => [
                                ['value' => 'all', 'label' => 'Tipe Transaksi: Semua'],
                                ['value' => 'sales-receipt', 'label' => 'Tipe Transaksi: Penerimaan Penjualan'],
                                ['value' => 'sales-invoice', 'label' => 'Tipe Transaksi: Penjualan'],
                                ['value' => 'purchase-payment', 'label' => 'Tipe Transaksi: Pembayaran Pembelian'],
                                ['value' => 'sales-return', 'label' => 'Tipe Transaksi: Retur Penjualan'],
                                ['value' => 'purchase-return', 'label' => 'Tipe Transaksi: Retur Pembelian'],
                                ['value' => 'period-end', 'label' => 'Tipe Transaksi: Proses Akhir Bulan'],
                            ],
                        ],
                    ],
                    'settingsMenu' => [
                        ['id' => 'arrange-columns', 'label' => 'Atur kolom'],
                        ['id' => 'export-journal', 'label' => 'Ekspor jurnal umum'],
                    ],
                    'columns' => [
                        ['id' => 'documentNumber', 'label' => 'Nomor #', 'widthClassName' => 'w-[20%]', 'align' => 'left'],
                        ['id' => 'transactionNumber', 'label' => 'No. Trans #', 'widthClassName' => 'w-[20%]', 'align' => 'left'],
                        ['id' => 'date', 'label' => 'Tanggal', 'widthClassName' => 'w-[12%]', 'align' => 'left'],
                        ['id' => 'description', 'label' => 'Keterangan', 'widthClassName' => 'w-[30%]', 'align' => 'left'],
                        ['id' => 'total', 'label' => 'Total', 'widthClassName' => 'w-[18%]', 'align' => 'right'],
                    ],
                    'rows' => [
                        ['id' => 'JV.2017.02.00015', 'documentNumber' => 'JV.2017.02.00015', 'transactionNumber' => '111.102-01.2017.02.00002', 'date' => '24/02/2017', 'description' => 'Pembayaran No. Faktur SI.2016.10.00004, SI.2017.02.00005', 'total' => '33,600,000', 'totalCurrency' => 'Rp 33,600,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-receipt', 'transactionTypeLabel' => 'Penerimaan Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00024', 'documentNumber' => 'JV.2017.02.00024', 'transactionNumber' => '111.102-01.2017.02.00003', 'date' => '11/02/2017', 'description' => 'Pembayaran No. Faktur PI.2016.12.00001', 'total' => '88,320,000', 'totalCurrency' => 'Rp 88,320,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'purchase-payment', 'transactionTypeLabel' => 'Pembayaran Pembelian', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00023', 'documentNumber' => 'JV.2017.02.00023', 'transactionNumber' => 'SI.2017.02.00010', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Abadi Phone Center', 'total' => '3,259,165,568.38', 'totalCurrency' => 'Rp 3,259,165,568.38', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00019', 'documentNumber' => 'JV.2017.02.00019', 'transactionNumber' => '111.201-02.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pembayaran Hutang Pajak PPh Ps 21', 'total' => '1,447,298', 'totalCurrency' => 'Rp 1,447,298', 'dateFilter' => '2017', 'transactionTypeValue' => 'tax-payment', 'transactionTypeLabel' => 'Pembayaran Pajak', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00018', 'documentNumber' => 'JV.2017.02.00018', 'transactionNumber' => '111.101-02.2017.02.00002', 'date' => '10/02/2017', 'description' => 'Pembayaran atas hutang Pajak PPh Ps 21', 'total' => '1,897,540', 'totalCurrency' => 'Rp 1,897,540', 'dateFilter' => '2017', 'transactionTypeValue' => 'tax-payment', 'transactionTypeLabel' => 'Pembayaran Pajak', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00016', 'documentNumber' => 'JV.2017.02.00016', 'transactionNumber' => 'EPY.2016.11.00002', 'date' => '10/02/2017', 'description' => 'Pencatatan Gaji SURABAYA Bulan November 2016', 'total' => '40,213,124', 'totalCurrency' => 'Rp 40,213,124', 'dateFilter' => '2017', 'transactionTypeValue' => 'payroll-entry', 'transactionTypeLabel' => 'Pencatatan Gaji', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00014', 'documentNumber' => 'JV.2017.02.00014', 'transactionNumber' => '111.101-02.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pembayaran No. Faktur SI.2017.02.00007', 'total' => '6,600,000', 'totalCurrency' => 'Rp 6,600,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-receipt', 'transactionTypeLabel' => 'Penerimaan Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00013', 'documentNumber' => 'JV.2017.02.00013', 'transactionNumber' => 'SI.2017.02.00007', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Pelanggan Umum - Jakarta', 'total' => '11,540,000', 'totalCurrency' => 'Rp 11,540,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00011', 'documentNumber' => 'JV.2017.02.00011', 'transactionNumber' => 'SI.2017.02.00005', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Pelanggan Umum - Jakarta', 'total' => '55,696,798.01', 'totalCurrency' => 'Rp 55,696,798.01', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00010', 'documentNumber' => 'JV.2017.02.00010', 'transactionNumber' => 'SI.2017.02.00004', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke PT CIRCLE PHONE', 'total' => '255,518,376.31', 'totalCurrency' => 'Rp 255,518,376.31', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00009', 'documentNumber' => 'JV.2017.02.00009', 'transactionNumber' => 'SI.2017.02.00003', 'date' => '10/02/2017', 'description' => 'Faktur Penjualan Ke Abadi Phone Center', 'total' => '3,112,500', 'totalCurrency' => 'Rp 3,112,500', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00008', 'documentNumber' => 'JV.2017.02.00008', 'transactionNumber' => 'DO.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pengiriman Pesanan Ke Abadi Phone Center', 'total' => '1,187,500', 'totalCurrency' => 'Rp 1,187,500', 'dateFilter' => '2017', 'transactionTypeValue' => 'delivery-order', 'transactionTypeLabel' => 'Pengiriman Pesanan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00007', 'documentNumber' => 'JV.2017.02.00007', 'transactionNumber' => 'SI.2017.02.00002', 'date' => '10/02/2017', 'description' => 'Deposit uang muka.', 'total' => '50,000,000', 'totalCurrency' => 'Rp 50,000,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-invoice', 'transactionTypeLabel' => 'Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.02.00004', 'documentNumber' => 'JV.2017.02.00004', 'transactionNumber' => '111.102-01.2017.02.00001', 'date' => '10/02/2017', 'description' => 'Pembayaran No. Faktur PI.2016.10.00008', 'total' => '41,800,000', 'totalCurrency' => 'Rp 41,800,000', 'dateFilter' => '2017', 'transactionTypeValue' => 'purchase-payment', 'transactionTypeLabel' => 'Pembayaran Pembelian', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00056', 'documentNumber' => 'JV.2017.01.00056', 'transactionNumber' => 'SRT.2017.01.00005', 'date' => '31/01/2017', 'description' => 'Retur Penjualan Dari PT Galaxy Phone', 'total' => '114,602,790.13', 'totalCurrency' => 'Rp 114,602,790.13', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-return', 'transactionTypeLabel' => 'Retur Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00022', 'documentNumber' => 'JV.2017.01.00022', 'transactionNumber' => 'Januari 2017', 'date' => '31/01/2017', 'description' => 'Proses Akhir Bulan (Januari, 2017)', 'total' => '75,172,708.33', 'totalCurrency' => 'Rp 75,172,708.33', 'dateFilter' => '2017', 'transactionTypeValue' => 'period-end', 'transactionTypeLabel' => 'Proses Akhir Bulan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00021', 'documentNumber' => 'JV.2017.01.00021', 'transactionNumber' => 'Januari 2017', 'date' => '31/01/2017', 'description' => 'Proses Akhir Bulan (Januari, 2017)', 'total' => '21,592,694,756', 'totalCurrency' => 'Rp 21,592,694,756', 'dateFilter' => '2017', 'transactionTypeValue' => 'period-end', 'transactionTypeLabel' => 'Proses Akhir Bulan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00055', 'documentNumber' => 'JV.2017.01.00055', 'transactionNumber' => 'SRT.2017.01.00004', 'date' => '30/01/2017', 'description' => 'Retur Penjualan Dari PT CIRCLE PHONE', 'total' => '39,510,396.05', 'totalCurrency' => 'Rp 39,510,396.05', 'dateFilter' => '2017', 'transactionTypeValue' => 'sales-return', 'transactionTypeLabel' => 'Retur Penjualan', 'branches' => ['JAKARTA']],
                        ['id' => 'JV.2017.01.00053', 'documentNumber' => 'JV.2017.01.00053', 'transactionNumber' => 'PRT.2017.01.00003', 'date' => '30/01/2017', 'description' => 'Retur Pembelian Ke SAMSANG', 'total' => '19,892,250', 'totalCurrency' => 'Rp 19,892,250', 'dateFilter' => '2017', 'transactionTypeValue' => 'purchase-return', 'transactionTypeLabel' => 'Retur Pembelian', 'branches' => ['JAKARTA']],
                    ],
                ],
            ],
        ]);
    }
}
