import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validatePurchasePaymentValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.payee, value: values.payee, type: 'array' },
        { label: config.labels.bank, value: values.bankAccounts, type: 'array' },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.entryDate, value: values.entryDate },
        { label: 'Faktur', value: values.invoices, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    if (parseNumericInput(values.paymentAmountDisplay ?? values.paymentAmount) <= 0) {
        return 'Nilai pembayaran wajib lebih dari 0.';
    }

    const invalidInvoice = (values.invoices ?? []).find((invoice) => parseNumericInput(invoice.payment ?? invoice.pay ?? invoice.total) <= 0);

    if (invalidInvoice) {
        return 'Setiap faktur pembayaran wajib memiliki nilai pembayaran lebih dari 0.';
    }

    return '';
}
