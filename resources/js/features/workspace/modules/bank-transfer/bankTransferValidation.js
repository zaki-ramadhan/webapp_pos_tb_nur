import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validateBankTransferValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.fromBank, value: values.fromBankAccounts, type: 'array' },
        { label: config.labels.toBank, value: values.toBankAccounts, type: 'array' },
        { label: config.labels.entryDate, value: values.entryDate },
        ...(values.autoNumber
            ? [{ label: 'Tipe penomoran', value: values.numberingType }]
            : [{ label: config.labels.documentNumber, value: values.documentNumber }]),
        { label: config.labels.transferValue, value: parseNumericInput(values.transferValue) > 0 ? values.transferValue : '' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    if (values.__fromAccountId && values.__toAccountId && values.__fromAccountId === values.__toAccountId) {
        return 'Kas/Bank asal dan tujuan tidak boleh sama.';
    }

    const invalidFee = (values.feeRows ?? []).find(
        (row) => (!String(row.accountName ?? row.accountCode ?? '').trim()) || parseNumericInput(row.amount) <= 0,
    );

    if (invalidFee) {
        return 'Setiap biaya transfer wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}
