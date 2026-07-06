import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validateSalesReceiptValues(values, config) {
    const requiredChecks = [
        { label: config.labels.customer, value: values.customer, type: 'array' },
        { label: config.labels.bank, value: values.bankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: 'Faktur', value: values.invoices, type: 'array' },
    ];

    for (const check of requiredChecks) {
        if (check.type === 'array') {
            if (!Array.isArray(check.value) || check.value.length < 1) {
                return `${check.label} wajib diisi.`;
            }
        } else if (!String(check.value ?? '').trim()) {
            return `${check.label} wajib diisi.`;
        }
    }

    const invalidInvoice = (values.invoices ?? []).find((invoice) => parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal) <= 0);

    if (invalidInvoice) {
        return 'Setiap faktur penerimaan wajib memiliki nilai pembayaran lebih dari 0.';
    }

    const headerPayment = parseNumericInput(values.paymentAmount);
    const totalInvoicesAmount = (values.invoices ?? []).reduce(
        (sum, invoice) => sum + parseNumericInput(invoice.payment ?? invoice.paid ?? invoice.invoiceTotal),
        0
    );

    if (headerPayment !== totalInvoicesAmount) {
        return 'Nilai Pembayaran wajib sama dengan total rincian faktur yang dibayar.';
    }

    return '';
}
