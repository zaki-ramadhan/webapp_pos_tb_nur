import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    formatCurrencyValue,
    buildLookupLabel,
    buildFilterOptions,
    parseNumericInput,
} from '@/features/workspace/shared/transactionFormatters';
import { JOURNAL_LINE_PRESETS, DEFAULT_JOURNAL_LINE_PRESET } from './generalJournalConstants';

function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function buildJournalTotals(lineItems = []) {
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
        notes: line.description && line.description !== line.account?.name ? line.description : '',
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
        notes: '',
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

import { showAccountDetailModal } from '@/components/ui/AccountDetailModal';

export async function promptJournalLineItem(record, currentItem = null) {
    const accountCode = record?.code ?? currentItem?.accountCode ?? '';
    const accountName = record?.name ?? currentItem?.accountName ?? '';

    const isCredit = currentItem ? parseNumericInput(currentItem.credit) > 0 : false;
    const defaultSide = isCredit ? 'credit' : 'debit';
    const defaultAmount = isCredit ? currentItem.credit : (currentItem?.debit ?? '0');
    const defaultNotes = currentItem?.notes ?? '';

    const result = await showAccountDetailModal({
        accountCode,
        accountName,
        defaultSide,
        defaultAmount,
        defaultNotes,
    });

    if (!result) {
        return null;
    }

    const amount = result.amount;

    return {
        id: currentItem?.id ?? `draft-line-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __accountId: record?.id ?? currentItem?.__accountId ?? null,
        accountCode,
        accountName,
        debit: result.side === 'debit' ? formatCurrencyValue(amount) : '0',
        credit: result.side === 'credit' ? formatCurrencyValue(amount) : '0',
        notes: result.notes,
    };
}
