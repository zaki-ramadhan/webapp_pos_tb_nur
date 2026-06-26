import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validateCashReceiptValues(values, config) {
    const requiredMessage = [
        { label: config.labels.cashBank, value: values.bankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.lineSectionTitle, value: values.lineItems, type: 'array' },
    ];

    for (const check of requiredMessage) {
        if (check.type === 'array') {
            if (!Array.isArray(check.value) || check.value.length < 1) {
                return `${check.label} wajib diisi.`;
            }
        } else if (!String(check.value ?? '').trim()) {
            return `${check.label} wajib diisi.`;
        }
    }

    const invalidLine = (values.lineItems ?? []).find(
        (item) =>
            !String(item.accountName ?? item.accountCode ?? '').trim()
            || parseNumericInput(item.amount) <= 0,
    );

    if (invalidLine) {
        return 'Setiap rincian penerimaan wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}
