import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validateCashPaymentValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.cashBank, value: values.bankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.lineSectionTitle, value: values.lineItems, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidLine = (values.lineItems ?? []).find(
        (item) =>
            !String(item.accountName ?? item.accountCode ?? '').trim()
            || parseNumericInput(item.amount) <= 0,
    );

    if (invalidLine) {
        return 'Setiap rincian pembayaran wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}
