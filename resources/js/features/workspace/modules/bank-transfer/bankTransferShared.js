import { formatIsoDate, normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

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

function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

function emptyStringToNull(value) {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue === '' ? null : normalizedValue;
}

function truncateText(value, limit = 22) {
    const normalizedValue = String(value ?? '').trim();

    if (normalizedValue.length <= limit) {
        return normalizedValue;
    }

    return `${normalizedValue.slice(0, limit - 3)}...`;
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

export function buildLookupLabel(record, codeKey = 'code') {
    const code = String(record?.[codeKey] ?? '').trim();
    const name = String(record?.name ?? record?.accountName ?? '').trim();

    if (code && name) {
        return `[${code}] ${name}`;
    }

    return name || code;
}

function deriveTransferAmounts(record) {
    const transferLine = (record.lines ?? []).find((line) => line.attributes?.kind === 'transfer') ?? record.lines?.[0] ?? null;
    const feeLines = (record.lines ?? []).filter((line) => line.attributes?.kind === 'fee');
    const transferAmount = Number(
        record.metadata?.transfer_amount
        ?? transferLine?.total_amount
        ?? record.total_amount
        ?? record.paid_amount
        ?? 0,
    );
    const feeAmount = Number(
        record.metadata?.fee_total
        ?? feeLines.reduce((sum, line) => sum + Number(line.total_amount ?? 0), 0),
    );

    return {
        transferLine,
        feeLines,
        transferAmount,
        feeAmount,
    };
}

function buildTotals(values) {
    const transferAmount = parseNumericInput(values.transferValue);
    const feeAmount = (values.feeRows ?? []).reduce((sum, row) => sum + parseNumericInput(row.amount), 0);
    const resultAmount = parseNumericInput(values.resultValue || values.transferValue);
    const fromAccountLabel = values.fromBankAccounts?.[0] ?? 'Kas/Bank Asal';
    const toAccountLabel = values.toBankAccounts?.[0] ?? 'Kas/Bank Tujuan';

    return {
        fromTotalLabel: `Total ${truncateText(fromAccountLabel, 28)}`,
        fromTotalValue: `Rp ${formatCurrencyValue(transferAmount + feeAmount)}`,
        toTotalLabel: `Total ${truncateText(toAccountLabel, 28)}`,
        toTotalValue: `Rp ${formatCurrencyValue(resultAmount)}`,
    };
}

export function applyBankTransferComputedValues(values) {
    const transferAmount = parseNumericInput(values.transferValue);
    const exchangeRate = parseNumericInput(values.exchangeRate);
    const resultAmount = exchangeRate > 0 ? transferAmount * exchangeRate : transferAmount;
    const baseValues = {
        ...values,
        transferPrefix: values.transferPrefix || 'Rp',
        resultPrefix: values.resultPrefix || 'Rp',
        resultValue: formatCurrencyValue(resultAmount),
    };

    return {
        ...baseValues,
        ...buildTotals(baseValues),
    };
}

export function buildBankTransferRow(record) {
    const metadata = record.metadata ?? {};
    const primaryAccountLabel = metadata.from_bank_label ?? buildLookupLabel(record.primaryAccount ?? {});
    const secondaryAccountLabel = metadata.to_bank_label ?? buildLookupLabel(record.secondaryAccount ?? {});
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
    const fromBankLabel = metadata.from_bank_label ?? buildLookupLabel(record.primaryAccount ?? {});
    const toBankLabel = metadata.to_bank_label ?? buildLookupLabel(record.secondaryAccount ?? {});
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

export function buildGeneratedBankTransferNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return `BT.${year}.${month}.${day}.${time}`;
}

export function validateBankTransferValues(values, config) {
    if (!Array.isArray(values.fromBankAccounts) || values.fromBankAccounts.length < 1) {
        return `${config.labels.fromBank} wajib diisi.`;
    }

    if (!Array.isArray(values.toBankAccounts) || values.toBankAccounts.length < 1) {
        return `${config.labels.toBank} wajib diisi.`;
    }

    if (!Array.isArray(values.fromBranches) || values.fromBranches.length < 1) {
        return `${config.labels.fromBranch} wajib diisi.`;
    }

    if (!Array.isArray(values.toBranches) || values.toBranches.length < 1) {
        return `${config.labels.toBranch} wajib diisi.`;
    }

    if (!String(values.entryDate ?? '').trim()) {
        return `${config.labels.entryDate} wajib diisi.`;
    }

    if (!String(values.numberingType ?? '').trim() && !String(values.documentNumber ?? '').trim()) {
        return `${config.labels.documentNumber} wajib diisi.`;
    }

    if (values.__fromAccountId && values.__toAccountId && values.__fromAccountId === values.__toAccountId) {
        return 'Kas/Bank asal dan tujuan tidak boleh sama.';
    }

    if (parseNumericInput(values.transferValue) <= 0) {
        return `${config.labels.transferValue} wajib lebih dari 0.`;
    }

    const invalidFee = (values.feeRows ?? []).find(
        (row) => (!String(row.accountName ?? row.accountCode ?? '').trim()) || parseNumericInput(row.amount) <= 0,
    );

    if (invalidFee) {
        return 'Setiap biaya transfer wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}

export function buildBankTransferPayload(values) {
    const transferAmount = parseNumericInput(values.transferValue);
    const resultAmount = parseNumericInput(values.resultValue || values.transferValue);
    const feeAmount = (values.feeRows ?? []).reduce((sum, row) => sum + parseNumericInput(row.amount), 0);
    const fromBranchLabel = values.fromBranches?.[0] ?? null;
    const toBranchLabel = values.toBranches?.[0] ?? null;
    const fromBankLabel = values.fromBankAccounts?.[0] ?? null;
    const toBankLabel = values.toBankAccounts?.[0] ?? null;
    const transferLine = {
        description: `Transfer ke ${toBankLabel ?? 'kas/bank tujuan'}`,
        account_id: values.__toAccountId ?? null,
        total_amount: transferAmount,
        sort_order: 0,
        attributes: {
            kind: 'transfer',
        },
    };
    const feeLines = (values.feeRows ?? []).map((row, index) => ({
        id: row.__lineId ?? undefined,
        account_id: row.__accountId ?? null,
        description: row.accountName?.trim() || null,
        reference_code: row.accountCode?.trim() || null,
        total_amount: parseNumericInput(row.amount),
        sort_order: index + 1,
        attributes: {
            kind: 'fee',
            charged_to: row.chargedTo ?? 'Dari Kas/Bank',
        },
    }));

    return {
        branch_id: values.__fromBranchId ?? null,
        primary_account_id: values.__fromAccountId ?? null,
        secondary_account_id: values.__toAccountId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedBankTransferNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: 'Transfer Bank',
        status: 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        notes: emptyStringToNull(values.notes),
        paid_amount: transferAmount,
        total_amount: transferAmount,
        metadata: {
            from_bank_label: fromBankLabel,
            to_bank_label: toBankLabel,
            from_branch_id: values.__fromBranchId ?? null,
            from_branch_label: fromBranchLabel,
            to_branch_id: values.__toBranchId ?? null,
            to_branch_label: toBranchLabel,
            exchange_rate: parseNumericInput(values.exchangeRate) || null,
            exchange_rate_label: emptyStringToNull(values.exchangeRateLabel),
            transfer_prefix: values.transferPrefix ?? 'Rp',
            transfer_words: emptyStringToNull(values.transferWords),
            transfer_amount: transferAmount,
            result_prefix: values.resultPrefix ?? 'Rp',
            result_words: emptyStringToNull(values.resultWords),
            result_amount: resultAmount,
            fee_total: feeAmount,
            from_total_label: values.fromTotalLabel ?? null,
            from_total_value: values.fromTotalValue ?? null,
            to_total_label: values.toTotalLabel ?? null,
            to_total_value: values.toTotalValue ?? null,
            reconciliations: values.reconciliations ?? [],
        },
        lines: [transferLine, ...feeLines].filter(
            (item) => item.account_id || item.description || Number(item.total_amount ?? 0) > 0,
        ),
    };
}

export function promptBankTransferFeeItem(record, currentItem = null) {
    const label = buildLookupLabel(record ?? currentItem ?? {});
    const amountValue = window.prompt(`Nilai biaya transfer untuk ${label}`, currentItem?.amount ?? '0');

    if (amountValue === null) {
        return null;
    }

    const amount = parseNumericInput(amountValue);

    if (amount <= 0) {
        throw new Error('Nilai biaya transfer harus lebih dari 0.');
    }

    const chargedTo = window.prompt('Dibebankan ke', currentItem?.chargedTo ?? 'Dari Kas/Bank');

    if (chargedTo === null) {
        return null;
    }

    return {
        id: currentItem?.id ?? `draft-fee-${Date.now()}`,
        __lineId: currentItem?.__lineId ?? null,
        __accountId: record?.id ?? currentItem?.__accountId ?? null,
        accountCode: record?.code ?? currentItem?.accountCode ?? '',
        accountName: record?.name ?? currentItem?.accountName ?? '',
        amount: formatCurrencyValue(amount),
        chargedTo: chargedTo.trim() || 'Dari Kas/Bank',
    };
}
