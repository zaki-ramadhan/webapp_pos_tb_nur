import { formatAmountInput, parseAmountInput } from '@/features/workspace/shared/amountFormatting';

export function buildFormState(source = {}) {
    return {
        ...source,
        currency: [...(source.currency ?? [])],
        branch: [...(source.branch ?? [])],
        childAccounts: [...(source.childAccounts ?? [])],
    };
}

export function formatDisplayDate(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        const [year, month, day] = normalizedValue.split('-');
        return `${day}/${month}/${year}`;
    }

    return normalizedValue;
}

export function normalizeDateForPayload(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    const parts = normalizedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!parts) {
        return null;
    }

    const [, day, month, year] = parts;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function normalizeNumericValue(value) {
    return parseAmountInput(value, { emptyValue: null });
}

export function sanitizeNumericInput(value) {
    return formatAmountInput(value);
}

export function formatBalanceLabel(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '';
    }

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numericValue);
}

export function mapAccountRow(record) {
    const openingBalance = Number(record.opening_balance ?? 0);

    return {
        id: String(record.id),
        code: record.code ?? '',
        name: record.name ?? '',
        type: record.account_type ?? '',
        balance: formatBalanceLabel(openingBalance),
        negative: openingBalance < 0,
        level: 0,
        inactiveValue: record.is_active === false ? 'inactive' : 'active',
    };
}

export function openingBalanceLabel(value) {
    const formattedValue = formatBalanceLabel(value);

    return formattedValue ? `Rp ${formattedValue}` : '';
}

export function buildAccountSourceRecord(record, config) {
    const childAccounts = Array.isArray(record.children)
        ? record.children.map((child) => ({
              id: String(child.id),
              code: child.code ?? '',
              name: child.name ?? '',
              level: 1,
          }))
        : [];

    return {
        ...config.createValues,
        id: String(record.id),
        parentId: record.parent_id ?? null,
        currencyId: record.currency_id ?? record.currency?.id ?? null,
        branchIds: Array.isArray(record.branches) ? record.branches.map((branch) => branch.id) : [],
        userIds: Array.isArray(record.users) ? record.users.map((user) => user.id) : [],
        type: record.account_type ?? config.createValues.type,
        isSubAccount: Boolean(record.parent_id),
        code: record.code ?? '',
        name: record.name ?? '',
        currency: record.currency?.name ? [record.currency.name] : [...(config.createValues.currency ?? [])],
        currencyLabel: record.currency?.name ?? config.createValues.currency?.[0] ?? '',
        balanceLabel: openingBalanceLabel(record.opening_balance),
        branch: Array.isArray(record.branches) && record.branches.length
            ? record.branches.map((branch) => branch.name).filter(Boolean)
            : [...(config.createValues.branch ?? [])],
        openingBalanceValue: record.opening_balance ?? '',
        openingBalanceDate: formatDisplayDate(record.opening_balance_date),
        notes: record.notes ?? '',
        cashBankReference: record.cash_bank_reference ?? '',
        allUsers: !Array.isArray(record.users) || record.users.length === 0,
        childAccounts,
    };
}

export function buildComparableFormValues(values) {
    return {
        type: String(values.type ?? '').trim(),
        isSubAccount: Boolean(values.isSubAccount),
        code: String(values.code ?? '').trim(),
        name: String(values.name ?? '').trim(),
        currencyId: values.currencyId ?? null,
        branchIds: Array.isArray(values.branchIds) ? [...values.branchIds].sort() : [],
        openingBalanceValue: normalizeNumericValue(values.openingBalanceValue),
        openingBalanceDate: normalizeDateForPayload(values.openingBalanceDate),
        notes: String(values.notes ?? '').trim(),
        allUsers: Boolean(values.allUsers),
    };
}

export function buildAccountPayload(values) {
    return {
        parent_id: values.isSubAccount ? (values.parentId ?? null) : null,
        currency_id: values.currencyId ?? null,
        code: String(values.code ?? '').trim(),
        name: String(values.name ?? '').trim(),
        account_type: String(values.type ?? '').trim(),
        notes: String(values.notes ?? '').trim() || null,
        opening_balance: normalizeNumericValue(values.openingBalanceValue) ?? 0,
        opening_balance_date: normalizeDateForPayload(values.openingBalanceDate),
        cash_bank_reference: String(values.cashBankReference ?? '').trim() || null,
        is_active: true,
        branch_ids: Array.isArray(values.branchIds) ? values.branchIds : [],
        user_ids: values.allUsers ? [] : (Array.isArray(values.userIds) ? values.userIds : []),
    };
}
