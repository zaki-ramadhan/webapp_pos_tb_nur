import { buildCurrencyValue } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function buildDetailRecordFromRow(row = {}, config) {
    const amount = row.amount ?? '0';
    const bank = row.cashBankFull ?? row.cashBank ?? '';
    const branch = row.branch ?? 'JAKARTA';

    return {
        bankAccounts: bank ? [bank] : [],
        entryDate: row.date ?? '',
        autoNumber: false,
        numberingType: config.numberingOptions?.[0] ?? '',
        documentNumber: row.number ?? '',
        checkNumber: row.checkNumber ?? '',
        recipient: row.recipient ?? '',
        voided: row.voided ?? false,
        branches: branch ? [branch] : [],
        notes: row.description ?? '',
        lineLookup: '',
        lineItems: row.lineItems ?? [
            {
                id: `${row.id}-line-1`,
                accountCode: row.accountCode ?? '215.000-02',
                accountName: row.accountName ?? row.description ?? '',
                amount,
            },
        ],
        totalValue: buildCurrencyValue(amount),
        saveTone: 'muted',
        kapNumber: row.kapNumber ?? '',
        kjsNumber: row.kjsNumber ?? '',
        ntpn: row.ntpn ?? '',
        reconcileStatus: row.reconcileStatus ?? 'Belum',
        printStatus: row.printStatus ?? 'Belum cetak/email',
    };
}

export function buildFormState(source = {}, config) {
    return {
        bankAccounts: [...(source.bankAccounts ?? config.draft?.bankAccounts ?? [])],
        entryDate: source.entryDate ?? config.draft?.entryDate ?? '',
        autoNumber: source.autoNumber ?? config.draft?.autoNumber ?? true,
        numberingType: source.numberingType ?? config.draft?.numberingType ?? '',
        documentNumber: source.documentNumber ?? config.draft?.documentNumber ?? '',
        checkNumber: source.checkNumber ?? config.draft?.checkNumber ?? '',
        recipient: source.recipient ?? config.draft?.recipient ?? '',
        voided: source.voided ?? config.draft?.voided ?? false,
        branches: [...(source.branches ?? config.draft?.branches ?? [])],
        notes: source.notes ?? config.draft?.notes ?? '',
        lineLookup: source.lineLookup ?? '',
        lineItems: [...(source.lineItems ?? config.draft?.lineItems ?? [])],
        totalValue: source.totalValue ?? config.draft?.totalValue ?? '0',
        saveTone: source.saveTone ?? config.draft?.saveTone ?? 'primary',
        kapNumber: source.kapNumber ?? config.draft?.kapNumber ?? '',
        kjsNumber: source.kjsNumber ?? config.draft?.kjsNumber ?? '',
        ntpn: source.ntpn ?? config.draft?.ntpn ?? '',
        reconcileStatus: source.reconcileStatus ?? config.draft?.reconcileStatus ?? '',
        printStatus: source.printStatus ?? config.draft?.printStatus ?? '',
    };
}
