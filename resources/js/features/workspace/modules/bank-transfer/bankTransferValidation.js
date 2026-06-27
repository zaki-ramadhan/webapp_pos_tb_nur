import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';

export function validateBankTransferValues(values, config) {
    if (!Array.isArray(values.fromBankAccounts) || values.fromBankAccounts.length < 1) {
        return `${config.labels.fromBank} wajib diisi.`;
    }

    if (!Array.isArray(values.toBankAccounts) || values.toBankAccounts.length < 1) {
        return `${config.labels.toBank} wajib diisi.`;
    }

    if (!String(values.entryDate ?? '').trim()) {
        return `${config.labels.entryDate} wajib diisi.`;
    }

    if (!String(values.numberingType ?? '').trim() && !String(values.documentNumber ?? '').trim()) {
        return `${config.labels.documentNumber} wajib diisi.`;
    }

    if (values.__fromAccountId && values.__toAccountId && values.__fromAccountId === values.__toAccountId) {
        return 'Kas/Bank asal dan tujuan tidak boleh sama.';
    }

    if (parseNumericInput(values.transferValue) <= 0) {
        return `${config.labels.transferValue} wajib lebih dari 0.`;
    }

    const invalidFee = (values.feeRows ?? []).find(
        (row) => (!String(row.accountName ?? row.accountCode ?? '').trim()) || parseNumericInput(row.amount) <= 0,
    );

    if (invalidFee) {
        return 'Setiap biaya transfer wajib memiliki akun dan nilai lebih dari 0.';
    }

    return '';
}
