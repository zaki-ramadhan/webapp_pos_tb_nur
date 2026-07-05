import { useState } from 'react';
import { lookupRecordByDocumentNumber } from '@/features/workspace/backend/workspaceBackendApi';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import TextareaField from '@/components/ui/TextareaField';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function JournalLinesSection({ config, values, setValues, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    const isManual = values.transactionTypeValue === 'general-journal';

    return (
        <TransactionLineItemsSection
            searchValue={values.lineLookup}
            onSearchChange={(event) =>
                setValues((current) => ({
                    ...current,
                    lineLookup: event.target.value,
                }))
            }
            searchPlaceholder={config.lineSearchPlaceholder}
            searchInput={
                isManual ? (
                    <AccountLookupTextInput
                        value={values.lineLookup}
                        placeholder={config.lineSearchPlaceholder}
                        searchLabel="Cari akun jurnal"
                        dialogTitle="Pilih Akun Jurnal"
                        onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                        showType={true}
                    />
                ) : null
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            minWidthClassName="min-w-[820px]"
            onRowClick={isManual ? handlers.onEditLineItem : undefined}
            getRowClassName={
                isManual && handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                    : undefined
            }
        />
    );
}

export function JournalAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    const isManual = values.transactionTypeValue === 'general-journal';

    return (
        <div className="min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.notes} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        readOnly={!isManual}
                        rows={4}
                        className="border-ui-border"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}

const PROCESS_PAGE_MAP = {
    'expense-entry': 'expense-entry',
    'payroll-entry': 'payroll-entry',
    'cash-payment': 'cash-payment',
    'cash-receipt': 'cash-receipt',
    'bank-transfer': 'bank-transfer',
    'purchase-invoice': 'purchase-invoice',
    'sales-invoice': 'sales-invoice',
    'inventory-adjustment': 'inventory-adjustment',
};

const RESOURCE_LOOKUP_MAP = {
    'expense-entry': 'expense-entries',
    'payroll-entry': 'payroll-entries',
    'cash-payment': 'cash-payments',
    'cash-receipt': 'cash-receipts',
    'bank-transfer': 'bank-transfers',
    'purchase-invoice': 'purchase-invoices',
    'sales-invoice': 'sales-invoices',
    'inventory-adjustment': 'inventory-adjustments',
};

export function GeneralJournalHeader({ config, values, setValues, activeRecordId, handlers = {} }) {
    const [lookupLoading, setLookupLoading] = useState(false);

    async function openSourceTransaction() {
        const pageId = PROCESS_PAGE_MAP[values.transactionTypeValue] || values.transactionTypeValue;
        const resourceKey = RESOURCE_LOOKUP_MAP[values.transactionTypeValue];
        const docNumber = values.transactionNumber || values.documentNumber;

        // Navigasi ke halaman tujuan dulu
        window.dispatchEvent(new CustomEvent('workspace:open-page', { detail: { pageId } }));

        if (!resourceKey || !docNumber) return;

        setLookupLoading(true);
        try {
            const record = await lookupRecordByDocumentNumber(resourceKey, docNumber);
            if (record?.id) {
                window.dispatchEvent(
                    new CustomEvent('workspace:open-page', {
                        detail: {
                            pageId,
                            recordId: String(record.id),
                            label: docNumber,
                            tabLabel: docNumber,
                        },
                    })
                );
            }
        } finally {
            setLookupLoading(false);
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                        className="w-full max-w-full"
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.transactionType} />
                    <TextInput
                        value={values.transactionType}
                        readOnly
                        className="h-[40px] rounded-[4px] border-ui-border"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.documentNumber} required />

                    <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 min-w-0">
                            {values.autoNumber ? (
                                <SelectField
                                    value={values.numberingType}
                                    onChange={(event) =>
                                        setValues((current) => ({
                                            ...current,
                                            numberingType: event.target.value,
                                        }))
                                    }
                                    className="h-[40px] rounded-[4px] border-ui-border"
                                    selectClassName="text-xs sm:text-sm text-brand-dark"
                                >
                                    {config.numberingOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </SelectField>
                            ) : (
                                <TextInput
                                    value={values.documentNumber}
                                    onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                    onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                    maxLength={120}
                                    trailing={<CloseIcon className="h-4 w-4 text-brand-dark" />}
                                    className="h-[40px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                    trailingClassName="px-3"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {values.transactionTypeValue && values.transactionTypeValue !== 'general-journal' && (
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label="No. Trans" />
                        <button
                            type="button"
                            onClick={openSourceTransaction}
                            disabled={lookupLoading}
                            title="Klik untuk membuka transaksi asal"
                            className={`flex items-center px-3 py-2 border rounded-[4px] w-full text-left transition duration-150 ease-in-out text-xs sm:text-sm font-normal h-[40px] ${
                                lookupLoading
                                    ? 'cursor-wait opacity-70 bg-emerald-50 border-emerald-400 text-emerald-600'
                                    : 'cursor-pointer bg-emerald-50 border-emerald-600 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-700'
                            }`}
                        >
                            <span className="truncate">{values.transactionNumber || values.documentNumber}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function JournalTableFilters({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[118px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}
        </div>
    );
}
