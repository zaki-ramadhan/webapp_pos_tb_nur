import { formatCurrencyValue, parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function formatCurrencyLabel(value) {
    return `Rp ${formatCurrencyValue(value)}`;
}

export function buildPaymentTotalAmount(lineItems = []) {
    return lineItems.reduce((sum, item) => sum + parseNumericInput(item.amount), 0);
}

export function applyCashPaymentLineItems(values, lineItems) {
    const totalAmount = buildPaymentTotalAmount(lineItems);

    return {
        ...values,
        lineItems,
        totalValue: formatCurrencyLabel(totalAmount),
    };
}
