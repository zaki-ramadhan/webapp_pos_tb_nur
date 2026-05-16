import { buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import { currencyReferenceOptions } from '@/features/workspace/shared/referenceLookupData';
import { validateRequiredChecks } from '@/features/workspace/shared/formValidation';

export const currencyReferenceIndex = new Map(
    currencyReferenceOptions.map((option) => [
        option.currencyCode,
        option,
    ]),
);

export const DEFAULT_ACCOUNT_FIELD_MAP = {
    accountsPayable: {
        idKey: 'accounts_payable_account_id',
        relationKey: 'accounts_payable_account',
        fallbackKey: 'accountsPayable',
    },
    accountsReceivable: {
        idKey: 'accounts_receivable_account_id',
        relationKey: 'accounts_receivable_account',
        fallbackKey: 'accountsReceivable',
    },
    purchaseAdvance: {
        idKey: 'purchase_advance_account_id',
        relationKey: 'purchase_advance_account',
        fallbackKey: 'purchaseAdvance',
    },
    salesAdvance: {
        idKey: 'sales_advance_account_id',
        relationKey: 'sales_advance_account',
        fallbackKey: 'salesAdvance',
    },
    salesDiscount: {
        idKey: 'sales_discount_account_id',
        relationKey: 'sales_discount_account',
        fallbackKey: 'salesDiscount',
    },
    realizedGainLoss: {
        idKey: 'realized_gain_loss_account_id',
        relationKey: 'realized_gain_loss_account',
        fallbackKey: 'realizedGainLoss',
    },
    unrealizedGainLoss: {
        idKey: 'unrealized_gain_loss_account_id',
        relationKey: 'unrealized_gain_loss_account',
        fallbackKey: 'unrealizedGainLoss',
    },
};

export function buildCurrencyValuesFromRecord(record = null, config = null) {
    if (!record) {
        return {
            countryName: config?.createDefaults?.countryName ?? '',
            code: '',
            symbol: '',
            countryCode: '',
            defaultAccounts: {},
            defaultAccountIds: {},
            __backendRecordId: null,
        };
    }

    const referenceMatch = currencyReferenceIndex.get(String(record.code ?? '').toUpperCase());
    const fallbackRecord = (config?.records ?? []).find(
        (item) => String(item.code ?? '').toUpperCase() === String(record.code ?? '').toUpperCase(),
    );
    const defaultAccounts = {};
    const defaultAccountIds = {};

    for (const [fieldId, mapping] of Object.entries(DEFAULT_ACCOUNT_FIELD_MAP)) {
        const relatedRecord = record[mapping.relationKey];
        const fallbackLabel = fallbackRecord?.defaultAccounts?.[mapping.fallbackKey] ?? '';

        defaultAccounts[fieldId] = relatedRecord ? buildAccountLookupLabel(relatedRecord) : fallbackLabel;
        defaultAccountIds[fieldId] = record[mapping.idKey] ?? relatedRecord?.id ?? null;
    }

    return {
        countryName: record.name ?? '',
        code: record.code ?? '',
        symbol: record.symbol ?? '',
        countryCode: referenceMatch?.countryCode ?? '',
        defaultAccounts,
        defaultAccountIds,
        __backendRecordId: record.id ?? null,
    };
}

export function buildCurrencySnapshot(values) {
    return {
        countryName: values.countryName,
        code: String(values.code ?? '').toUpperCase(),
        symbol: values.symbol,
        defaultAccountIds: values.defaultAccountIds,
    };
}

export function validateCurrencyValues(values, config) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.countryName, value: values.countryName, type: 'lookup' },
        { label: config.labels.code, value: values.code },
        { label: config.labels.symbol, value: values.symbol },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    if (String(values.code ?? '').trim().length !== 3) {
        return 'Kode mata uang harus terdiri dari 3 karakter.';
    }

    return '';
}

export function mapCurrencyRow(record) {
    const referenceMatch = currencyReferenceIndex.get(String(record.code ?? '').toUpperCase());

    return {
        ...record,
        id: String(record.id),
        name: record.name ?? '',
        symbol: record.symbol ?? '',
        code: record.code ?? '',
        countryName: record.name ?? '',
        countryCode: referenceMatch?.countryCode ?? '',
        tabLabel: record.name ?? record.code ?? String(record.id),
    };
}

export function findCurrencyDetailRow(tableRows, activeLevel2Tab) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    if (!recordId) {
        return null;
    }

    return (tableRows ?? []).find((row) => String(row.id) === String(recordId)) ?? null;
}
