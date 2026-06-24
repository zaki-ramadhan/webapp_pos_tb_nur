import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';
import { buildPurchasePaymentTotal } from './purchasePaymentCalculations';

export function buildGeneratedPurchasePaymentNumber() {
    return buildGeneratedDocNumber('PP');
}

export function buildPurchasePaymentPayload(values) {
    const invoiceTotalAmount = buildPurchasePaymentTotal(values.invoices ?? []);
    const rawPaymentAmount = values.paymentAmountDisplay ?? values.paymentAmount ?? '';
    const paymentAmount = parseNumericInput(rawPaymentAmount);
    const totalAmount = String(rawPaymentAmount).trim() === '' ? invoiceTotalAmount : paymentAmount;
    const lines = (values.invoices ?? []).map((invoice, index) => ({
        id: invoice.__lineId ?? undefined,
        description: invoice.formNumber?.trim() || invoice.number?.trim() || null,
        reference_code: invoice.number?.trim() || invoice.formNumber?.trim() || null,
        total_amount: parseNumericInput(invoice.payment ?? invoice.pay ?? invoice.total),
        sort_order: index,
    }));

    return {
        supplier_id: values.__supplierId ?? null,
        primary_account_id: values.__bankAccountId ?? null,
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedPurchasePaymentNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.paymentMethod?.trim() || null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        check_date: normalizeDisplayDate(values.dueDatePph) || null,
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            supplier_label: values.payee?.[0] ?? null,
            bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            print_status: values.printStatus?.trim() || null,
            paid_with: values.paidWith?.trim() || null,
            paid_at: values.paidAt?.trim() || null,
        },
        lines: lines.filter((line) => line.description || line.reference_code || line.total_amount > 0),
    };
}
