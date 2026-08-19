import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import { buildCurrencyValue } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { formatAmountInput } from '@/features/workspace/shared/amountFormatting';

export function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    const isNegative = numericValue < 0;
    const absValue = Math.abs(numericValue);

    const formatted = absValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function buildSalesReceiptTotal(invoices = []) {
    return invoices.reduce((sum, invoice) => sum + parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal), 0);
}

export function buildSalesReceiptTotalOutstanding(invoices = []) {
    return invoices.reduce((sum, invoice) => sum + parseNumericInput(invoice.outstanding ?? invoice.invoiceTotal), 0);
}

export function distributePaymentToInvoices(invoices = [], targetAmount = 0) {
    let remaining = Number(targetAmount);
    return invoices.map((inv) => {
        const outstanding = parseNumericInput(inv.outstanding ?? inv.invoiceTotal);
        const allocated = Math.min(Math.max(0, remaining), outstanding);
        remaining = Math.max(0, remaining - allocated);
        const formattedAllocated = formatCurrencyLabel(allocated);
        return {
            ...inv,
            paid: formattedAllocated,
            payment: formattedAllocated,
            modal: {
                ...inv.modal,
                id: inv.id,
                payment: formatCurrencyValue(allocated),
            },
        };
    });
}

export function applySalesReceiptInvoices(values, invoices) {
    const totalAmount = buildSalesReceiptTotal(invoices);

    return {
        ...values,
        invoices,
        paymentAmount: formatCurrencyValue(totalAmount),
    };
}

export function buildSalesReceiptSummaryValue(value = '0') {
    if (value === '' || value == null || String(value) === '0') {
        return '0';
    }

    return buildCurrencyValue(value);
}

export function buildInvoiceSectionTitle(label, count = 0) {
    if (!count) {
        return label;
    }

    return `${label} (${formatAmountInput(count)})`;
}
