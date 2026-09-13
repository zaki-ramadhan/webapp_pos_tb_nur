import { usePage } from '@inertiajs/react';
import { AccountLookupField, buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';
import {
    FormRow,
    SectionHeading,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import { DEFAULT_ACCOUNTS_PREFERENCES } from '@/features/workspace/preferences/PreferencesAccountsView';

function isRecordInAllowedList(record, allowedList) {
    if (!Array.isArray(allowedList) || allowedList.length === 0) {
        return false;
    }
    const label = buildAccountLookupLabel(record, 'accounts');
    const code = String(record?.code ?? '').trim();
    return allowedList.some((allowed) => {
        if (typeof allowed === 'string') {
            const trimmed = allowed.trim();
            if (trimmed === label) return true;
            if (code && (trimmed.startsWith(`[${code}]`) || trimmed === code)) return true;
            return false;
        }
        if (allowed && typeof allowed === 'object') {
            if (record.id && allowed.id && String(record.id) === String(allowed.id)) return true;
            if (code && allowed.code && code === String(allowed.code).trim()) return true;
        }
        return false;
    });
}

export default function ItemAccountsTab({ config, values, onChange }) {
    const inertiaProps = usePage()?.props ?? {};
    const preferences = config?.preferences ?? inertiaProps.dashboard?.preferences ?? inertiaProps.workspace?.preferences ?? {};

    const isNonInventory = values.kind === 'Non Persediaan';

    const allFields = [
        { key: 'inventory', idKey: 'inventoryAccountId', label: 'Persediaan', prefKey: 'accounts-items-inventory' },
        { key: 'costOfGoodsSold', idKey: 'cogsAccountId', label: 'Beban Pokok Penjualan', prefKey: 'accounts-items-cogs' },
        { key: 'expense', idKey: 'expenseAccountId', label: 'Beban', prefKey: 'accounts-items-expense' },
        { key: 'sales', idKey: 'salesAccountId', label: 'Penjualan', prefKey: 'accounts-items-sales' },
        { key: 'salesReturn', idKey: 'salesReturnAccountId', label: 'Retur Penjualan', prefKey: 'accounts-items-sales-return' },
        { key: 'salesDiscount', idKey: 'salesDiscountAccountId', label: 'Diskon Penjualan', prefKey: 'accounts-items-sales-discount' },
        { key: 'purchaseReturn', idKey: 'purchaseReturnAccountId', label: 'Retur Pembelian', prefKey: 'accounts-items-purchase-return' },
    ];

    const fields = allFields.filter(({ key }) => {
        if (isNonInventory) {
            return key !== 'inventory';
        }
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="lg:max-w-[50%] w-full">
                <SectionHeading title={config.labels.accounts} />

                <div className="mt-4 space-y-2">
                    {fields.map(({ key, idKey, label, prefKey }) => {
                        const prefRaw = preferences[prefKey];
                        const allowedList = (Array.isArray(prefRaw) && prefRaw.length > 0)
                            ? prefRaw
                            : (typeof prefRaw === 'string' && prefRaw.trim()
                                ? [prefRaw.trim()]
                                : (DEFAULT_ACCOUNTS_PREFERENCES[prefKey] ?? []));

                        const currentValues = Array.isArray(values?.accounts?.[key])
                            ? values.accounts[key]
                            : [];

                        return (
                            <FormRow key={key} label={label}>
                                <AccountLookupField
                                    values={currentValues}
                                    placeholder="Cari/Pilih..."
                                    searchLabel={`Cari akun ${label}`}
                                    dialogTitle={`Pilih akun ${label}`}
                                    filterRows={(record) => isRecordInAllowedList(record, allowedList)}
                                    onRemove={(item) => {
                                        onChange(idKey, null);
                                        onChange('accounts', {
                                            ...values.accounts,
                                            [key]: currentValues.filter((value) => value !== item),
                                        });
                                    }}
                                    onSelectAccount={(record, accountLabel) => {
                                        onChange(idKey, record?.id ?? null);
                                        onChange('accounts', {
                                            ...values.accounts,
                                            [key]: accountLabel ? [accountLabel] : [],
                                        });
                                    }}
                                />
                            </FormRow>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-start gap-3 pt-2 lg:max-w-[50%] w-full">
                <span className="mt-1 h-6 w-[3px] shrink-0 rounded-full bg-tab-active-border-t" />
                <p className="text-xs sm:text-sm italic leading-6 text-red-550">
                    {config.accountNote}
                </p>
            </div>
        </div>
    );
}
