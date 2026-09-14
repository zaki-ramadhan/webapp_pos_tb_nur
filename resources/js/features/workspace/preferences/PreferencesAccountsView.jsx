import React, { useState } from 'react';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { buildAccountLookupLabel, translateAccountType } from '@/features/workspace/shared/AccountLookupControls';
import { HighlightText } from '@/features/workspace/shared/LookupPrimitives';

export const DEFAULT_ACCOUNTS_PREFERENCES = {
    // Barang & Jasa
    'accounts-items-inventory': [
        '[115.000-00] Persediaan Barang Dagang',
    ],
    'accounts-items-sales': [
        '[411.000-01] Penjualan Barang Dagang',
    ],
    'accounts-items-sales-return': [
        '[431.000-01] Retur Penjualan Barang',
    ],
    'accounts-items-sales-discount': [
        '[421.000-01] Potongan Penjualan Barang',
    ],
    'accounts-items-cogs': [
        '[511.000-01] Beban Pokok Penjualan Barang Dagang',
    ],
    'accounts-items-purchase-return': [
        '[115.000-00] Persediaan Barang Dagang',
    ],
    'accounts-items-expense': [
        '[611.001-04] Beban Angkut Pembelian',
    ],

    // Penjualan/Pembelian
    'accounts-sales-purchase-discount': [
        '[421.000-01] Potongan Penjualan Barang',
    ],

    // Persediaan
    'accounts-inventory-adjustment': [
        '[711.000-98] Biaya Selisih Penyesuaian Persediaan',
    ],
};

const PREFERENCE_ACCOUNT_FILTERS = {
    'accounts-items-inventory': { account_type: 'Inventory' },
    'accounts-items-sales': { account_type: ['Other Current Asset', 'Other Current Liability', 'Long Term Liability', 'Revenue', 'Other Revenue'] },
    'accounts-items-sales-return': { account_type: ['Other Current Asset', 'Other Current Liability', 'Revenue', 'Other Revenue'] },
    'accounts-items-sales-discount': { account_type: ['Other Current Asset', 'Other Current Liability', 'Revenue', 'Other Revenue'] },
    'accounts-items-cogs': { account_type: 'Cost of Sales' },
    'accounts-items-purchase-return': { account_type: ['Other Current Asset', 'Inventory', 'Other Current Liability', 'Cost of Sales', 'Expense', 'Other Expense'] },
    'accounts-items-expense': { account_type: ['Other Current Asset', 'Inventory', 'Other Asset', 'Other Current Liability', 'Revenue', 'Cost of Sales', 'Expense', 'Other Expense'] },
    'accounts-sales-purchase-discount': { account_type: ['Other Current Asset', 'Other Current Liability', 'Cost of Sales', 'Expense', 'Other Expense'] },
    'accounts-inventory-adjustment': { account_type: ['Equity', 'Expense', 'Other Expense'] },
};

const ACCOUNT_SUB_TABS = [
    { id: 'items-services', label: 'Barang' },
    { id: 'sales-purchase', label: 'Penjualan/Pembelian' },
    { id: 'inventory', label: 'Persediaan' },
];

function AccountFieldRow({
    label,
    fieldId,
    values,
    onChange,
    multi = true,
    placeholder = 'Cari/Pilih...',
    disabled = false,
    note = null,
    queryParams = null,
}) {
    const effectiveQueryParams = queryParams || PREFERENCE_ACCOUNT_FILTERS[fieldId] || {};
    const rawValue = values[fieldId] !== undefined ? values[fieldId] : DEFAULT_ACCOUNTS_PREFERENCES[fieldId];
    const currentList = multi
        ? (Array.isArray(rawValue) ? rawValue : (rawValue ? [rawValue] : []))
        : undefined;
    const currentSingle = !multi
        ? (typeof rawValue === 'string' ? rawValue : (Array.isArray(rawValue) && rawValue.length > 0 ? rawValue[0] : ''))
        : undefined;

    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
            <div className="pt-2 text-xs sm:text-sm text-text-contrast">
                <span>{label}</span>
            </div>
            <div className="w-full max-w-[430px]">
                <BackendLookupField
                    resource="accounts"
                    multi={multi}
                    value={currentSingle}
                    values={currentList}
                    placeholder={placeholder}
                    searchLabel={`Cari ${label}`}
                    queryParams={effectiveQueryParams}
                    getOptionLabel={buildAccountLookupLabel}
                    getOptionSearchText={(account) => {
                        if (typeof account === 'string') return account;
                        const type = translateAccountType(account?.account_type);
                        return `${account?.name ?? ''} ${account?.code ?? ''} ${type}`.trim();
                    }}
                    renderOption={(account, query) => {
                        const name = account?.name ?? (typeof account === 'string' ? account.replace(/^\[[^\]]+\]\s*/, '') : '');
                        const code = account?.code ?? (typeof account === 'string' ? (account.match(/^\[([^\]]+)\]/)?.[1] ?? '') : '');
                        const typeLabel = translateAccountType(account?.account_type);
                        const prefix = account?.hierarchicalPrefix ?? '';

                        return (
                            <div
                                className="flex w-full min-w-0 flex-col gap-0.5 select-none"
                                style={{ paddingLeft: (account?.level ?? 0) > 0 ? `${account.level * 14}px` : undefined }}
                            >
                                <div className="truncate text-xs sm:text-sm font-normal text-text-workspace-dark">
                                    <HighlightText text={`${prefix}${name}`} search={query} />
                                </div>
                                <div className={`w-full text-xs sm:text-[13px] text-text-workspace-dark ${typeLabel ? 'flex items-center justify-between gap-4' : 'block'}`}>
                                    <span className={`${typeLabel ? 'truncate min-w-0' : 'break-words whitespace-normal'} font-normal not-italic`}>
                                        <HighlightText text={code} search={query} />
                                    </span>
                                    {typeLabel ? (
                                        <span className="shrink-0 italic font-normal">
                                            {typeLabel}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        );
                    }}
                    disabled={disabled}
                    onSelect={(account) => {
                        const optLabel = buildAccountLookupLabel(account);
                        if (multi) {
                            const existing = currentList || [];
                            if (!existing.includes(optLabel)) {
                                onChange(fieldId, [...existing, optLabel]);
                            }
                        } else {
                            onChange(fieldId, optLabel);
                        }
                    }}
                    onRemove={(removed) => {
                        const optLabel = typeof removed === 'string' ? removed : buildAccountLookupLabel(removed);
                        if (multi) {
                            const existing = currentList || [];
                            onChange(fieldId, existing.filter((item) => item !== optLabel));
                        } else {
                            onChange(fieldId, '');
                        }
                    }}
                    onClear={() => {
                        onChange(fieldId, multi ? [] : '');
                    }}
                />
                {note ? (
                    <p className="mt-1.5 text-xs italic text-red-500 leading-relaxed">
                        {note}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

export default function PreferencesAccountsView({ values = {}, onChange, readOnly = false }) {
    const [activeTabId, setActiveTabId] = useState('items-services');

    return (
        <PreferencesTabPanel
            tabs={ACCOUNT_SUB_TABS}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            panelClassName="max-w-[760px] space-y-6"
            activeTabClassName="font-medium text-tab-active-text"
        >
            {activeTabId === 'items-services' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="inventory" title="Barang" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Persediaan" fieldId="accounts-items-inventory" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Penjualan" fieldId="accounts-items-sales" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Retur Penjualan" fieldId="accounts-items-sales-return" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Diskon Penjualan" fieldId="accounts-items-sales-discount" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Beban Pokok Penjualan" fieldId="accounts-items-cogs" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Retur Pembelian" fieldId="accounts-items-purchase-return" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Beban" fieldId="accounts-items-expense" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>
                </div>
            )}

            {activeTabId === 'sales-purchase' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="payment" title="Penerimaan/Pembayaran" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Akun Diskon" fieldId="accounts-sales-purchase-discount" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>
                </div>
            )}

            {activeTabId === 'inventory' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="stock" title="Penyesuaian Persediaan" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Akun Penyesuaian" fieldId="accounts-inventory-adjustment" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>
                </div>
            )}
        </PreferencesTabPanel>
    );
}
