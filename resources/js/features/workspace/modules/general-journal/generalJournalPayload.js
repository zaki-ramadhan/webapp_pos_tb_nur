import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';
import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { buildJournalTotals } from './generalJournalAdapters';

export function buildGeneratedJournalNumber() {
    return buildGeneratedDocNumber('JV');
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
