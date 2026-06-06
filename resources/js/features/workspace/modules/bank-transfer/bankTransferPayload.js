import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';

export function buildGeneratedBankTransferNumber() {
    return buildGeneratedDocNumber('BT');
}

function emptyStringToNull(value) {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue === '' ? null : normalizedValue;
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
