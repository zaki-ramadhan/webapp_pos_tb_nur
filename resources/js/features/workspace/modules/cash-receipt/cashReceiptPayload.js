import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';

export function buildGeneratedCashReceiptNumber() {
    return buildGeneratedDocNumber('CR');
}

function buildCashReceiptTotal(lineItems = []) {
    return lineItems.reduce((sum, item) => sum + parseNumericInput(item.amount), 0);
}

export function buildCashReceiptPayload(values) {
    const lineItems = (values.lineItems ?? []).map((item, index) => ({
        id: item.__lineId ?? undefined,
        account_id: item.__accountId ?? null,
        description: item.accountName?.trim() || null,
        reference_code: item.accountCode?.trim() || null,
        total_amount: parseNumericInput(item.amount),
        sort_order: index,
    }));
    const totalAmount = buildCashReceiptTotal(values.lineItems ?? []);

    return {
        branch_id: values.__branchId ?? null,
        primary_account_id: values.__primaryAccountId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedCashReceiptNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.bankAccounts?.[0] ?? values.numberingType?.trim() ?? null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            cash_bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            check_number: values.checkNumber?.trim() || null,
            payer: values.payer?.trim() || null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            reconcile_date: values.reconcileDate?.trim() || null,
            print_status: values.printStatus?.trim() || null,
        },
        lines: lineItems.filter(
            (item) => item.account_id || item.description || item.reference_code || item.total_amount > 0,
        ),
    };
}
