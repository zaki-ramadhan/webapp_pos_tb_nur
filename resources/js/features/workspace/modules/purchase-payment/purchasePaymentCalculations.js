import { formatCurrencyValue, parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function buildPurchasePaymentTotal(invoices = []) {
    return invoices.reduce((sum, invoice) => sum + parseNumericInput(invoice.payment ?? invoice.pay ?? invoice.total), 0);
}

export function applyPurchasePaymentInvoices(values, invoices) {
    const totalAmount = buildPurchasePaymentTotal(invoices);
    const totalLabel = formatCurrencyLabel(totalAmount);

    return {
        ...values,
        invoices,
        invoiceTitle: invoices.length ? `Faktur (${invoices.length})` : 'Faktur',
        paymentAmount: formatCurrencyValue(totalAmount),
        paymentAmountPrefix: totalAmount > 0 ? 'Rp' : '',
        paymentAmountDisplay: formatCurrencyValue(totalAmount),
        footerPaymentValue: totalLabel,
        footerInvoiceValue: totalLabel,
    };
}
