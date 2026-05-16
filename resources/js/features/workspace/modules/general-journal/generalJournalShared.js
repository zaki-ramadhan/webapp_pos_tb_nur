import { buildCurrencyValue } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

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

export function buildDerivedJournalLines(source = {}) {
    const amount = source.total ?? source.totalValue ?? '0';
    const linePreset = JOURNAL_LINE_PRESETS[source.transactionTypeValue ?? ''] ?? DEFAULT_JOURNAL_LINE_PRESET;

    return linePreset.map(([accountCode, accountName, side], index) => ({
        id: `${source.id}-line-${index + 1}`,
        accountCode,
        accountName,
        debit: side === 'debit' ? amount : '0',
        credit: side === 'credit' ? amount : '0',
    }));
}

export function buildRecordFromTableRow(row = {}, config) {
    return {
        id: row.id,
        documentNumber: row.documentNumber ?? '',
        transactionNumber: row.transactionNumber ?? '',
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? 'Jurnal Umum',
        transactionType: row.transactionTypeLabel ?? config.defaults?.transactionType ?? 'Jurnal Umum',
        transactionTypeValue: row.transactionTypeValue ?? 'general-journal',
        branches: row.branches ?? [...(config.defaults?.branches ?? ['JAKARTA'])],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: buildDerivedJournalLines(row),
        totalDebit: row.totalCurrency ?? buildCurrencyValue(row.total ?? '0'),
        totalCredit: row.totalCurrency ?? buildCurrencyValue(row.total ?? '0'),
        saveTone: 'muted',
    };
}

export function buildFormState(source = {}, config) {
    return {
        documentNumber: source.documentNumber ?? '',
        transactionNumber: source.transactionNumber ?? '',
        entryDate: source.entryDate ?? config.defaults?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.defaults?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.defaults?.numberingType ?? '',
        transactionType: source.transactionType ?? config.defaults?.transactionType ?? '',
        transactionTypeValue: source.transactionTypeValue ?? 'general-journal',
        branches: [...(source.branches ?? config.defaults?.branches ?? [])],
        notes: source.notes ?? config.defaults?.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? [])],
        totalDebit: source.totalDebit ?? config.defaults?.totalDebit ?? 'Rp 0',
        totalCredit: source.totalCredit ?? config.defaults?.totalCredit ?? 'Rp 0',
        saveTone: source.saveTone ?? 'muted',
    };
}
