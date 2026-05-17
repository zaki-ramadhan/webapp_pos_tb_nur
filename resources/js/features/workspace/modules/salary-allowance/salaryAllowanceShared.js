import { buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';

export function buildSalaryAllowanceRow(record) {
    const allowanceType = record.allowance_type ?? '';
    const inactive = record.is_active === false;

    return {
        id: String(record.id),
        __backendRecord: record,
        name: record.name ?? '',
        type: allowanceType,
        inactive,
        inactiveLabel: inactive ? 'Ya' : 'Tidak',
        payDeduct: 'Bulanan',
        expenseAccount: record.account ? buildAccountLookupLabel(record.account) : '',
        expenseAccountId: record.account?.id ?? record.account_id ?? null,
    };
}

export function buildSalaryAllowanceEntry(record, fallbackEntry) {
    if (!record) {
        return {
            ...fallbackEntry,
            expenseAccountId: fallbackEntry.expenseAccountId ?? null,
        };
    }

    return {
        id: record.id,
        name: record.name,
        type: record.type,
        inactive: record.inactive,
        inactiveLabel: record.inactiveLabel,
        payDeduct: record.payDeduct,
        expenseAccount: record.expenseAccount,
        expenseAccountId: record.expenseAccountId ?? null,
    };
}

export function buildSalaryAllowancePayload(values) {
    return {
        name: String(values.name ?? '').trim(),
        allowance_type: String(values.type ?? '').trim(),
        account_id: values.expenseAccountId ?? null,
        notes: null,
        is_active: !Boolean(values.inactive),
    };
}
