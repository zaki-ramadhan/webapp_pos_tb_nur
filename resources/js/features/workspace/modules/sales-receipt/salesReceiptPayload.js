import { normalizeDisplayDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';
import { buildSalesReceiptTotal } from './salesReceiptCalculations';

export function buildGeneratedSalesReceiptNumber() {
    return buildGeneratedDocNumber('SR');
}

export function buildSalesReceiptPayload(values) {
    const totalAmount = buildSalesReceiptTotal(values.invoices ?? []);
    const lines = (values.invoices ?? []).map((invoice, index) => {
        const discountAmount = parseNumericInput(invoice.modal?.discountAmount ?? 0);
        return {
            id: invoice.__lineId ?? undefined,
            description: invoice.invoiceNumber?.trim() || null,
            reference_code: invoice.invoiceNumber?.trim() || null,
            total_amount: parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal),
            account_id: invoice.modal?.__discountAccountId ?? null,
            discount_amount: discountAmount,
            department_id: invoice.modal?.__departmentId ?? null,
            attributes: {
                invoice_date: invoice.invoiceDate || null,
                outstanding_amount: parseNumericInput(invoice.outstanding ?? invoice.invoiceTotal),
                paid_amount: parseNumericInput(invoice.paid ?? invoice.invoiceTotal),
                discount_notes: invoice.modal?.discountNotes?.trim() || null,
            },
            sort_order: index,
        };
    });

    return {
        customer_id: values.__customerId ?? null,
        primary_account_id: values.__bankAccountId ?? null,
        branch_id: values.__branchId ?? null,
        document_number: values.documentNumber?.trim() || buildGeneratedSalesReceiptNumber(),
        numbering_type: values.numberingType?.trim() || null,
        payment_method: values.paymentMethod?.trim() || null,
        status: values.voided ? 'Void' : 'Draft',
        entry_date: normalizeDisplayDate(values.entryDate) || new Date().toISOString().slice(0, 10),
        check_date: normalizeDisplayDate(values.checkDate) || null,
        notes: values.notes?.trim() || null,
        paid_amount: totalAmount,
        total_amount: totalAmount,
        flags: {
            voided: Boolean(values.voided),
        },
        metadata: {
            bank_label: values.bankAccounts?.[0] ?? null,
            branch_label: values.branches?.[0] ?? null,
            check_number: values.checkNumber?.trim() || null,
            reconcile_status: values.reconcileStatus?.trim() || null,
            print_status: values.printStatus?.trim() || null,
            use_credit: false,
        },
        lines: lines.filter((line) => line.description || line.reference_code || line.total_amount > 0),
    };
}
