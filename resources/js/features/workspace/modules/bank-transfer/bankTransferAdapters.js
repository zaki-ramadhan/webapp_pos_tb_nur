import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import {
    formatCurrencyValue,
    buildLookupLabel,
    buildFilterOptions,
    parseNumericInput,
} from '@/features/workspace/shared/transactionFormatters';
import {
    deriveTransferAmounts,
    buildTotals,
    applyBankTransferComputedValues,
    truncateText,
} from './bankTransferCalculations';

export function buildBankTransferRow(record) {
    const metadata = record.metadata ?? {};
    const primaryAccountLabel = metadata.from_bank_label ?? buildLookupLabel(record.primary_account ?? {});
    const secondaryAccountLabel = metadata.to_bank_label ?? buildLookupLabel(record.secondary_account ?? {});
    const { transferAmount, feeAmount } = deriveTransferAmounts(record);
    const entryDate = formatIsoDate(record.entry_date);
    const fromBranchLabel = metadata.from_branch_label ?? record.branch?.name ?? '';
    const toBranchLabel = metadata.to_branch_label ?? metadata.counterpart_branch_label ?? '';

    return {
        id: String(record.id),
        __backendRecord: record,
        number: record.document_number ?? '',
        date: entryDate,
        fromBank: truncateText(primaryAccountLabel),
        fromBankFull: primaryAccountLabel,
        toBank: truncateText(secondaryAccountLabel),
        toBankFull: secondaryAccountLabel,
        description: record.notes ?? '',
        transferTotal: formatCurrencyValue(transferAmount),
        purchasePayment: record.reference_number ?? '',
        feeTotal: formatCurrencyValue(feeAmount),
        dateFilter: entryDate,
        fromBankFilter: primaryAccountLabel,
        toBankFilter: secondaryAccountLabel,
        fromBankLabel: primaryAccountLabel,
        toBankLabel: secondaryAccountLabel,
        fromBranch: fromBranchLabel,
        toBranch: toBranchLabel,
        tabLabel: record.document_number ?? `Transfer #${record.id}`,
    };
}

export function buildBankTransferFilters(baseFilters = [], rows = []) {
    return baseFilters.map((filter) => {
        if (filter.id === 'date') {
            return {
                ...filter,
                rowKey: 'dateFilter',
                options: buildFilterOptions('Tanggal', rows, 'dateFilter'),
            };
        }

        if (filter.id === 'from-bank') {
            return {
                ...filter,
                rowKey: 'fromBankFilter',
                options: buildFilterOptions('Dari Kas/Bank', rows, 'fromBankFilter', 'fromBankLabel'),
            };
        }

        if (filter.id === 'to-bank') {
            return {
                ...filter,
                rowKey: 'toBankFilter',
                options: buildFilterOptions('Ke Kas/Bank', rows, 'toBankFilter', 'toBankLabel'),
            };
        }

        return filter;
    });
}

export function buildBankTransferRecord(record = {}, config) {
    const metadata = record.metadata ?? {};
    const { feeLines, transferAmount } = deriveTransferAmounts(record);
    const fromBankLabel = metadata.from_bank_label ?? buildLookupLabel(record.primary_account ?? {});
    const toBankLabel = metadata.to_bank_label ?? buildLookupLabel(record.secondary_account ?? {});
    const feeRows = feeLines.map((line, index) => ({
        id: String(line.id ?? `fee-${index + 1}`),
        __lineId: line.id ?? null,
        __accountId: line.account_id ?? null,
        accountCode: line.account?.code ?? line.reference_code ?? '',
        accountName: line.account?.name ?? line.description ?? `Biaya ${index + 1}`,
        amount: formatCurrencyValue(line.total_amount ?? 0),
        chargedTo: line.attributes?.charged_to ?? 'Dari Kas/Bank',
    }));
    const values = {
        __backendRecordId: record.id ?? null,
        __fromAccountId: record.primary_account_id ?? null,
        __toAccountId: record.secondary_account_id ?? null,
        __fromBranchId: metadata.from_branch_id ?? record.branch_id ?? null,
        __toBranchId: metadata.to_branch_id ?? null,
        entryDate: formatIsoDate(record.entry_date),
        autoNumber: false,
        numberingType: record.numbering_type ?? config.numberingOptions?.[0] ?? 'Transfer Bank',
        documentNumber: record.document_number ?? '',
        fromBankAccounts: fromBankLabel ? [fromBankLabel] : [],
        fromBranches: metadata.from_branch_label ? [metadata.from_branch_label] : (record.branch?.name ? [record.branch.name] : []),
        exchangeRate: metadata.exchange_rate ? formatCurrencyValue(metadata.exchange_rate) : '',
        exchangeRateLabel: metadata.exchange_rate_label ?? '',
        transferValue: formatCurrencyValue(transferAmount),
        transferPrefix: metadata.transfer_prefix ?? 'Rp',
        transferWords: metadata.transfer_words ?? '',
        toBankAccounts: toBankLabel ? [toBankLabel] : [],
        toBranches: metadata.to_branch_label ? [metadata.to_branch_label] : [],
        resultValue: formatCurrencyValue(metadata.result_amount ?? transferAmount),
        resultPrefix: metadata.result_prefix ?? 'Rp',
        resultWords: metadata.result_words ?? '',
        notes: record.notes ?? '',
        feeLookup: '',
        feeRows,
        saveTone: 'muted',
        reconciliations: metadata.reconciliations ?? [],
    };

    return {
        ...applyBankTransferComputedValues(values),
        fromTotalLabel: metadata.from_total_label ?? buildTotals(values).fromTotalLabel,
        fromTotalValue: metadata.from_total_value ?? buildTotals(values).fromTotalValue,
        toTotalLabel: metadata.to_total_label ?? buildTotals(values).toTotalLabel,
        toTotalValue: metadata.to_total_value ?? buildTotals(values).toTotalValue,
    };
}

export function buildDetailRecordFromRow(row = {}, config) {
    if (row.__backendRecord) {
        return buildBankTransferRecord(row.__backendRecord, config);
    }

    return applyBankTransferComputedValues({
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? 'Transfer Bank',
        documentNumber: row.number ?? '',
        fromBankAccounts: row.fromBankFull ? [row.fromBankFull] : [],
        fromBranches: row.fromBranch ? [row.fromBranch] : ['JAKARTA'],
        exchangeRate: row.exchangeRate ?? '',
        exchangeRateLabel: row.exchangeRateLabel ?? '',
        transferValue: row.transferTotal ?? row.transferValue ?? '',
        transferPrefix: row.transferPrefix ?? 'Rp',
        transferWords: row.transferWords ?? '',
        toBankAccounts: row.toBankFull ? [row.toBankFull] : [],
        toBranches: row.toBranch ? [row.toBranch] : ['JAKARTA'],
        resultValue: row.resultValue ?? row.transferTotal ?? '',
        resultPrefix: row.resultPrefix ?? 'Rp',
        resultWords: row.resultWords ?? '',
        notes: row.description ?? '',
        feeLookup: '',
        feeRows: row.feeRows ?? [],
        saveTone: 'muted',
        reconciliations: row.reconciliations ?? [],
    });
}

export function buildFormState(source = {}, config) {
    return applyBankTransferComputedValues({
        __backendRecordId: source.__backendRecordId ?? null,
        __fromAccountId: source.__fromAccountId ?? null,
        __toAccountId: source.__toAccountId ?? null,
        __fromBranchId: source.__fromBranchId ?? null,
        __toBranchId: source.__toBranchId ?? null,
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        fromBankAccounts: [...(source.fromBankAccounts ?? config.draft?.fromBankAccounts ?? [])],
        fromBranches: [...(source.fromBranches ?? config.draft?.fromBranches ?? [])],
        exchangeRate: source.exchangeRate ?? config.draft?.exchangeRate ?? '',
        exchangeRateLabel: source.exchangeRateLabel ?? config.draft?.exchangeRateLabel ?? '',
        transferValue: source.transferValue ?? config.draft?.transferValue ?? '',
        transferPrefix: source.transferPrefix ?? config.draft?.transferPrefix ?? 'Rp',
        transferWords: source.transferWords ?? config.draft?.transferWords ?? '',
        toBankAccounts: [...(source.toBankAccounts ?? config.draft?.toBankAccounts ?? [])],
        toBranches: [...(source.toBranches ?? config.draft?.toBranches ?? [])],
        resultValue: source.resultValue ?? config.draft?.resultValue ?? '',
        resultPrefix: source.resultPrefix ?? config.draft?.resultPrefix ?? 'Rp',
        resultWords: source.resultWords ?? config.draft?.resultWords ?? '',
        notes: source.notes ?? config.draft?.notes ?? '',
        feeLookup: source.feeLookup ?? '',
        feeRows: [...(source.feeRows ?? config.draft?.feeRows ?? [])],
        saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
        reconciliations: [...(source.reconciliations ?? config.draft?.reconciliations ?? [])],
    });
}

export function buildBankTransferSnapshot(values) {
    return {
        __fromAccountId: values.__fromAccountId ?? null,
        __toAccountId: values.__toAccountId ?? null,
        __fromBranchId: values.__fromBranchId ?? null,
        __toBranchId: values.__toBranchId ?? null,
        entryDate: values.entryDate ?? '',
        autoNumber: Boolean(values.autoNumber),
        numberingType: values.numberingType ?? '',
        documentNumber: values.documentNumber ?? '',
        fromBankAccounts: values.fromBankAccounts ?? [],
        fromBranches: values.fromBranches ?? [],
        exchangeRate: values.exchangeRate ?? '',
        transferValue: values.transferValue ?? '',
        toBankAccounts: values.toBankAccounts ?? [],
        toBranches: values.toBranches ?? [],
        notes: values.notes ?? '',
        feeRows: values.feeRows ?? [],
    };
}

import { showPromptModal } from '@/components/ui/promptModal';

export async function promptBankTransferFeeItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const result = await showPromptModal(`Input Biaya Transfer - ${label}`, [
        {
            name: 'amount',
            label: 'Nilai Biaya Transfer',
            type: 'number',
            defaultValue: currentItem?.amount ?? '0',
            required: true,
        },
        {
            name: 'chargedTo',
            label: 'Dibebankan ke',
            type: 'text',
            defaultValue: currentItem?.chargedTo ?? 'Dari Kas/Bank',
            required: true,
        },
    ], Boolean(currentItem));

    if (!result) {
        return null;
    }

    if (result.__action === 'delete') {
        return { action: 'delete' };
    }

    const amount = parseNumericInput(result.amount);

    if (amount <= 0) {
        throw new Error('Nilai biaya transfer harus lebih dari 0.');
    }

    return {
        id: currentItem?.id ?? `draft-fee-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __accountId: record?.id ?? currentItem?.__accountId ?? null,
        accountCode: record?.code ?? currentItem?.accountCode ?? '',
        accountName: record?.name ?? currentItem?.accountName ?? '',
        amount: formatCurrencyValue(amount),
        chargedTo: result.chargedTo.trim() || 'Dari Kas/Bank',
    };
}
