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
    const documentType = record?.document_type ?? 'general_journal';
    const lines = Array.isArray(record?.lines) ? record.lines : [];
    
    let transactionTypeValue = record?.metadata?.transaction_type_value ?? record?.process_type ?? documentType;
    transactionTypeValue = String(transactionTypeValue).replace(/_/g, '-');
    if (transactionTypeValue === 'general-journals') transactionTypeValue = 'general-journal';
    if (transactionTypeValue === 'expense-entries') transactionTypeValue = 'expense-entry';
    if (transactionTypeValue === 'payroll-entries') transactionTypeValue = 'payroll-entry';

    const TYPE_LABEL_MAP = {
        'general-journal': 'Jurnal Umum',
        'expense-entry': 'Pencatatan Beban',
        'payroll-entry': 'Pencatatan Gaji',
        'cash-payment': 'Pembayaran Kas',
        'cash-receipt': 'Penerimaan Kas',
        'bank-transfer': 'Transfer Bank',
        'period-end': 'Proses Akhir Bulan',
        'purchase-invoice': 'Pembelian',
        'sales-invoice': 'Penjualan',
    };

    const transactionTypeLabel = record?.metadata?.transaction_type_label ?? TYPE_LABEL_MAP[transactionTypeValue] ?? 'Jurnal Umum';
    const entryDate = formatIsoDate(record?.entry_date);

    let debitAmount = 0;
    let creditAmount = 0;

    if (documentType === 'general_journal') {
        debitAmount = lines.reduce((sum, line) => sum + Number(line?.debit_amount ?? 0), 0);
        creditAmount = lines.reduce((sum, line) => sum + Number(line?.credit_amount ?? 0), 0);
    } else {
        const totalVal = Number(record?.total_amount ?? 0);
        debitAmount = totalVal;
        creditAmount = totalVal;
    }

    const totalAmount = Math.max(debitAmount, creditAmount, Number(record?.total_amount ?? 0));

    let docNum = record?.document_number ?? '';
    if (documentType !== 'general_journal' && docNum && !docNum.startsWith('JV')) {
        docNum = `JV.${docNum}`;
    }

    return {
        id: String(record?.id ?? ''),
        __backendRecord: record,
        documentNumber: docNum,
        transactionNumber: transactionTypeValue === 'general-journal'
            ? (record?.reference_number || '-')
            : (record?.metadata?.transaction_number || record?.reference_number || record?.document_number || String(record?.id || '')),
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
    const documentType = record.document_type || 'general_journal';
    let lineItems = [];

    if (documentType === 'general_journal') {
        lineItems = (record.lines ?? []).map((line, index) => ({
            id: String(line.id ?? `line-${index + 1}`),
            __lineId: line.id ?? null,
            __accountId: line.account_id ?? null,
            accountCode: line.account?.code ?? line.reference_code ?? '',
            accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Baris ${index + 1}`,
            debit: formatCurrencyValue(line.debit_amount ?? 0),
            credit: formatCurrencyValue(line.credit_amount ?? 0),
            notes: line.description && line.description !== line.account?.name ? line.description : '',
        }));
    } else {
        const rawLines = record.lines ?? [];
        const isExpense = documentType === 'expense_entry';
        const isPayroll = documentType === 'payroll_entry';

        const primaryAcc = record.primary_account;
        const secondaryAcc = record.secondary_account;
        const balancingAcc = isPayroll ? (secondaryAcc || primaryAcc) : (primaryAcc || secondaryAcc);

        let totalSum = 0;
        rawLines.forEach((line, index) => {
            const amount = Number(line.total_amount ?? 0);
            totalSum += amount;

            const fallbackCode = isPayroll ? '610101' : '';
            const fallbackName = isPayroll ? `Beban Gaji - ${line.description}` : `Rincian ${index + 1}`;

            lineItems.push({
                id: String(line.id ?? `line-${index + 1}`),
                __lineId: line.id ?? null,
                __accountId: line.account_id ?? null,
                accountCode: line.account?.code ?? fallbackCode ?? line.reference_code ?? '',
                accountName: line.account?.name ?? fallbackName ?? line.description ?? line.reference_code ?? `Rincian ${index + 1}`,
                debit: isExpense || isPayroll ? formatCurrencyValue(amount) : '0',
                credit: isExpense || isPayroll ? '0' : formatCurrencyValue(amount),
                notes: line.description || '',
            });
        });

        const balancingCode = balancingAcc?.code ?? (isPayroll ? '210201' : '');
        const balancingName = balancingAcc?.name ?? (isPayroll ? 'Utang Beban Gaji Karyawan' : 'Akun Penyeimbang');
        const balancingId = balancingAcc?.id ?? null;

        if (balancingAcc || isPayroll) {
            lineItems.push({
                id: `balancing-${record.id}`,
                __lineId: null,
                __accountId: balancingId,
                accountCode: balancingCode,
                accountName: balancingName,
                debit: isExpense || isPayroll ? '0' : formatCurrencyValue(totalSum),
                credit: isExpense || isPayroll ? formatCurrencyValue(totalSum) : '0',
                notes: 'Penyeimbang Transaksi Otomatis',
            });
        }
    }
    const metadata = record.metadata ?? {};
    let transactionTypeValue = metadata.transaction_type_value ?? record.process_type ?? documentType;
    transactionTypeValue = String(transactionTypeValue).replace(/_/g, '-');
    if (transactionTypeValue === 'general-journals') transactionTypeValue = 'general-journal';
    if (transactionTypeValue === 'expense-entries') transactionTypeValue = 'expense-entry';
    if (transactionTypeValue === 'payroll-entries') transactionTypeValue = 'payroll-entry';

    const TYPE_LABEL_MAP = {
        'general-journal': 'Jurnal Umum',
        'expense-entry': 'Pencatatan Beban',
        'payroll-entry': 'Pencatatan Gaji',
        'cash-payment': 'Pembayaran Kas',
        'cash-receipt': 'Penerimaan Kas',
        'bank-transfer': 'Transfer Bank',
        'period-end': 'Proses Akhir Bulan',
        'purchase-invoice': 'Pembelian',
        'sales-invoice': 'Penjualan',
    };

    const transactionTypeLabel = metadata.transaction_type_label ?? TYPE_LABEL_MAP[transactionTypeValue] ?? 'Jurnal Umum';

    let docNum = record.document_number ?? '';
    if (documentType !== 'general_journal' && docNum && !docNum.startsWith('JV')) {
        docNum = `JV.${docNum}`;
    }

    return applyJournalLineItems(
        {
            __backendRecordId: record.id ?? null,
            documentNumber: docNum,
            transactionNumber: transactionTypeValue === 'general-journal'
                ? (record.reference_number || '')
                : (metadata.transaction_number || record.reference_number || record.document_number || String(record.id || '')),
            entryDate: formatIsoDate(record.entry_date),
            autoNumber: false,
            numberingType: record.numbering_type ?? config.defaults?.numberingType ?? '',
            transactionType: transactionTypeLabel,
            transactionTypeValue: transactionTypeValue,
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
        transactionNumber: row.transactionNumber || row.documentNumber || '',
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
        isEdit: Boolean(currentItem),
    });

    if (!result) {
        return null;
    }

    if (result.action === 'delete') {
        return { action: 'delete' };
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
