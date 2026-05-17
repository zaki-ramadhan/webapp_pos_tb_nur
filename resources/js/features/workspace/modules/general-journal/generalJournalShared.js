import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';

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

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? record?.accountCode ?? '').trim();
    const name = String(record?.name ?? record?.accountName ?? record?.title ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function buildFilterOptions(labelPrefix, rows, rowKey, labelKey = rowKey) {
    const values = [...new Set(rows.map((row) => row[rowKey]).filter(Boolean))];

    return [
        { value: 'all', label: `${labelPrefix}: Semua` },
        ...values.map((value) => ({
            value,
            label: `${labelPrefix}: ${rows.find((row) => row[rowKey] === value)?.[labelKey] ?? value}`,
        })),
    ];
}

function buildJournalTotals(lineItems = []) {
    const debitAmount = lineItems.reduce((sum, item) => sum + parseNumericInput(item.debit), 0);
    const creditAmount = lineItems.reduce((sum, item) => sum + parseNumericInput(item.credit), 0);

    return {
        debitAmount,
        creditAmount,
        totalDebit: formatCurrencyLabel(debitAmount),
        totalCredit: formatCurrencyLabel(creditAmount),
    };
}

export function applyJournalLineItems(values, lineItems) {
    const totals = buildJournalTotals(lineItems);

    return {
        ...values,
        lineItems,
        totalDebit: totals.totalDebit,
        totalCredit: totals.totalCredit,
    };
}

export function buildGeneralJournalFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return {
                ...filter,
                rowKey: 'dateFilter',
                options: buildFilterOptions('Tanggal', rows, 'dateFilter'),
            };
        }

        if (filter.id === 'transactionType') {
            return {
                ...filter,
                rowKey: 'transactionTypeValue',
                options: buildFilterOptions('Tipe Transaksi', rows, 'transactionTypeValue', 'transactionTypeLabel'),
            };
        }

        return filter;
    });
}

export function buildGeneralJournalRow(record) {
    const lines = Array.isArray(record?.lines) ? record.lines : [];
    const debitAmount = lines.reduce((sum, line) => sum + Number(line?.debit_amount ?? 0), 0);
    const creditAmount = lines.reduce((sum, line) => sum + Number(line?.credit_amount ?? 0), 0);
    const totalAmount = Math.max(debitAmount, creditAmount, Number(record?.total_amount ?? 0));
    const metadata = record?.metadata ?? {};
    const transactionTypeLabel = metadata.transaction_type_label ?? 'Jurnal Umum';
    const transactionTypeValue = metadata.transaction_type_value ?? record?.process_type ?? 'general-journal';
    const entryDate = formatIsoDate(record?.entry_date);

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        documentNumber: record?.document_number ?? '',
        transactionNumber: metadata.transaction_number ?? record?.reference_number ?? '',
        date: entryDate,
        description: record?.notes ?? '',
        total: formatCurrencyValue(totalAmount),
        totalCurrency: formatCurrencyLabel(totalAmount),
        dateFilter: entryDate,
        transactionTypeValue,
        transactionTypeLabel,
        branches: record?.branch?.name ? [record.branch.name] : [],
    };
}

export function buildJournalRecordFromBackend(record = {}, config) {
    const lineItems = (record.lines ?? []).map((line, index) => ({
        id: String(line.id ?? `line-${index + 1}`),
        __lineId: line.id ?? null,
        __accountId: line.account_id ?? null,
        accountCode: line.account?.code ?? line.reference_code ?? '',
        accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
        debit: formatCurrencyValue(line.debit_amount ?? 0),
        credit: formatCurrencyValue(line.credit_amount ?? 0),
    }));
    const metadata = record.metadata ?? {};

    return applyJournalLineItems(
        {
            __backendRecordId: record.id ?? null,
            documentNumber: record.document_number ?? '',
            transactionNumber: metadata.transaction_number ?? record.reference_number ?? '',
            entryDate: formatIsoDate(record.entry_date),
            autoNumber: false,
            numberingType: record.numbering_type ?? config.defaults?.numberingType ?? '',
            transactionType: metadata.transaction_type_label ?? config.defaults?.transactionType ?? 'Jurnal Umum',
            transactionTypeValue: metadata.transaction_type_value ?? record.process_type ?? 'general-journal',
            __branchId: record.branch_id ?? null,
            branches: record.branch?.name ? [record.branch.name] : [],
            notes: record.notes ?? '',
            lineLookup: '',
            saveTone: 'muted',
        },
        lineItems,
    );
}

export function buildDerivedJournalLines(source = {}) {
    const amount = source.total ?? source.totalValue ?? '0';
    const linePreset = JOURNAL_LINE_PRESETS[source.transactionTypeValue ?? ''] ?? DEFAULT_JOURNAL_LINE_PRESET;

    return linePreset.map(([accountCode, accountName, side], index) => ({
        id: `${source.id}-line-${index + 1}`,
        accountCode,
        accountName,
        __accountId: null,
        debit: side === 'debit' ? amount : '0',
        credit: side === 'credit' ? amount : '0',
    }));
}

export function buildRecordFromTableRow(row = {}, config) {
    if (row.__backendRecord) {
        return buildJournalRecordFromBackend(row.__backendRecord, config);
    }

    return {
        id: row.id,
        documentNumber: row.documentNumber ?? '',
        transactionNumber: row.transactionNumber ?? '',
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? 'Jurnal Umum',
        transactionType: row.transactionTypeLabel ?? config.defaults?.transactionType ?? 'Jurnal Umum',
        transactionTypeValue: row.transactionTypeValue ?? 'general-journal',
        __branchId: null,
        branches: row.branches ?? [...(config.defaults?.branches ?? ['JAKARTA'])],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: buildDerivedJournalLines(row),
        totalDebit: row.totalCurrency ?? formatCurrencyLabel(row.total ?? '0'),
        totalCredit: row.totalCurrency ?? formatCurrencyLabel(row.total ?? '0'),
        saveTone: 'muted',
    };
}

export function buildFormState(source = {}, config) {
    return applyJournalLineItems(
        {
            __backendRecordId: source.__backendRecordId ?? null,
            documentNumber: source.documentNumber ?? '',
            transactionNumber: source.transactionNumber ?? '',
            entryDate: source.entryDate ?? config.defaults?.entryDate ?? '',
            autoNumber: source.autoNumber ?? config.defaults?.autoNumber ?? true,
            numberingType: source.numberingType ?? config.defaults?.numberingType ?? '',
            transactionType: source.transactionType ?? config.defaults?.transactionType ?? '',
            transactionTypeValue: source.transactionTypeValue ?? 'general-journal',
            __branchId: source.__branchId ?? null,
            branches: [...(source.branches ?? config.defaults?.branches ?? [])],
            notes: source.notes ?? config.defaults?.notes ?? '',
            lineLookup: source.lineLookup ?? '',
            saveTone: source.saveTone ?? 'muted',
        },
        [...(source.lineItems ?? [])],
    );
}

export function buildGeneratedJournalNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `JV.${year}.${month}.${day}.${time}`;
}

export function buildGeneralJournalPayload(values) {
    const lineItems = (values.lineItems ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        account_id: item.__accountId ?? null,
        description: item.accountName?.trim() || null,
        reference_code: item.accountCode?.trim() || null,
        debit_amount: parseNumericInput(item.debit),
        credit_amount: parseNumericInput(item.credit),
        total_amount: Math.max(parseNumericInput(item.debit), parseNumericInput(item.credit)),
        sort_order: index,
    }));
    const totals = buildJournalTotals(values.lineItems ?? []);

    return {
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedJournalNumber(),
        reference_number: values.transactionNumber?.trim() || null,
        numbering_type: values.numberingType?.trim() || null,
        process_type: values.transactionTypeValue?.trim() || 'general-journal',
        status: 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        notes: values.notes?.trim() || null,
        total_amount: Math.max(totals.debitAmount, totals.creditAmount),
        metadata: {
            transaction_number: values.transactionNumber?.trim() || null,
            transaction_type_label: values.transactionType?.trim() || 'Jurnal Umum',
            transaction_type_value: values.transactionTypeValue?.trim() || 'general-journal',
            branch_label: values.branches?.[0] ?? null,
        },
        lines: lineItems.filter(
            (item) =>
                item.account_id
                || item.description
                || item.reference_code
                || item.debit_amount > 0
                || item.credit_amount > 0,
        ),
    };
}

export function validateJournalValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.branch, value: values.branches, type: 'array' },
        { label: config.lineSectionTitle, value: values.lineItems, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidLine = (values.lineItems ?? []).find((item) => {
        const debitAmount = parseNumericInput(item.debit);
        const creditAmount = parseNumericInput(item.credit);

        return (
            !String(item.accountName ?? item.accountCode ?? '').trim()
            || (debitAmount <= 0 && creditAmount <= 0)
            || (debitAmount > 0 && creditAmount > 0)
        );
    });

    if (invalidLine) {
        return 'Setiap baris jurnal wajib memiliki akun dan hanya boleh berisi debit atau kredit yang lebih dari 0.';
    }

    const totals = buildJournalTotals(values.lineItems ?? []);

    if (totals.debitAmount !== totals.creditAmount) {
        return 'Total debit dan kredit harus seimbang.';
    }

    return '';
}

export function promptJournalLineItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const debitValue = window.prompt(`Nilai debit untuk ${label}`, currentItem?.debit ?? '0');

    if (debitValue === null) {
        return null;
    }

    const creditValue = window.prompt(`Nilai kredit untuk ${label}`, currentItem?.credit ?? '0');

    if (creditValue === null) {
        return null;
    }

    const debitAmount = parseNumericInput(debitValue);
    const creditAmount = parseNumericInput(creditValue);

    if (debitAmount <= 0 && creditAmount <= 0) {
        throw new Error('Debit atau kredit harus lebih dari 0.');
    }

    if (debitAmount > 0 && creditAmount > 0) {
        throw new Error('Baris jurnal hanya boleh berisi debit atau kredit, tidak keduanya sekaligus.');
    }

    return {
        id: currentItem?.id ?? `draft-line-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __accountId: record?.id ?? currentItem?.__accountId ?? null,
        accountCode: record?.code ?? currentItem?.accountCode ?? '',
        accountName: record?.name ?? currentItem?.accountName ?? '',
        debit: formatCurrencyValue(debitAmount),
        credit: formatCurrencyValue(creditAmount),
    };
}
