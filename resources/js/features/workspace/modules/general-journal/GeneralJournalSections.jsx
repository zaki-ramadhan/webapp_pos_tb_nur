import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, FunnelIcon, SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
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
                <AccountLookupTextInput
                    value={values.lineLookup}
                    placeholder={config.lineSearchPlaceholder}
                    searchLabel="Cari akun jurnal"
                    dialogTitle="Pilih Akun Jurnal"
                    onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            minWidthClassName="min-w-[820px]"
            showTitleSearchButton
            onRowClick={handlers.onEditLineItem}
            getRowClassName={
                handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                    : undefined
            }
        />
    );
}

export function JournalAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    return (
        <div className="min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.notes} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="border-ui-border"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}

export function GeneralJournalHeader({ config, values, setValues, activeRecordId, handlers = {} }) {


    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
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

            <div className="flex flex-col gap-y-3 w-full md:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.documentNumber} required />

                    <div className="flex items-center gap-2 w-full">
                        {!activeRecordId ? (
                            <div className="shrink-0">
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextChecked) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextChecked,
                                        }))
                                    }
                                />
                            </div>
                        ) : null}
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
                                    readOnly={Boolean(activeRecordId)}
                                    trailing={<CloseIcon className="h-4 w-4 text-brand-dark" />}
                                    className="h-[40px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                    trailingClassName="px-3"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {values.transactionNumber ? (
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <TransactionFieldLabel label={config.labels.transactionNumber} />
                        <TextInput
                            value={values.transactionNumber}
                            readOnly
                            className="h-[40px] rounded-[4px] border-green-96d86d bg-green-eef9e4"
                            inputClassName="text-xs sm:text-sm font-medium text-green-4d9b1f"
                        />
                    </div>
                ) : null}
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

            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-action-btn-active-bg text-brand-blue"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-5 w-5" />
            </button>
        </div>
    );
}
