export const JOURNAL_LINE_PRESETS = {
    'sales-receipt': [
        ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'debit'],
        ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'credit'],
    ],
    'sales-invoice': [
        ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'debit'],
        ['411.100-01', 'Penjualan Produk', 'credit'],
    ],
    'sales-return': [
        ['511.100-01', 'Retur Penjualan', 'debit'],
        ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'credit'],
    ],
    'purchase-payment': [
        ['211.100-01', 'Hutang Usaha Jakarta - IDR', 'debit'],
        ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'credit'],
    ],
    'tax-payment': [
        ['213.100-21', 'Hutang Pajak PPh Ps 21', 'debit'],
        ['111.101-02', 'Bank Mandiri Jakarta - IDR', 'credit'],
    ],
    'payroll-entry': [
        ['611.002-01', 'Beban Gaji Umum & Admin', 'debit'],
        ['214.100-01', 'BYMD - Gaji Jakarta', 'credit'],
    ],
    'period-end': [
        ['399.999-01', 'Ikhtisar Laba Rugi', 'debit'],
        ['310.100-01', 'Laba Tahun Berjalan', 'credit'],
    ],
    'purchase-return': [
        ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'debit'],
        ['511.200-01', 'Retur Pembelian', 'credit'],
    ],
};

export const DEFAULT_JOURNAL_LINE_PRESET = [
    ['111.102-01', 'Bank BCA IDR Jakarta (069-773-3993)', 'debit'],
    ['112.101-01', 'Piutang Usaha Jakarta - IDR', 'credit'],
];
