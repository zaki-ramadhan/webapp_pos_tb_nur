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
                    ? () => 'cursor-pointer transition hover:bg-[#eef3fb]'
                    : undefined
            }
        />
    );
}

export function JournalAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    return (
        <div className="min-h-0">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,570px)] xl:grid-cols-[160px_minmax(0,680px)] 2xl:grid-cols-[160px_minmax(0,800px)] lg:items-start">
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
                    className="border-[#cfd6e2]"
                    textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
                />
            </div>
        </div>
    );
}

export function GeneralJournalHeader({ config, values, setValues, activeRecordId, handlers = {} }) {
    const [openAmbil, setOpenAmbil] = useState(false);
    const ambilButtonRef = useRef(null);

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
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
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
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
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
                                    readOnly={Boolean(activeRecordId)}
                                    trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
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
                            className="h-[40px] rounded-[4px] border-[#96d86d] bg-[#eef9e4]"
                            inputClassName="text-xs sm:text-sm font-medium text-[#53a11f]"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                        <div />
                        <div className="flex justify-end relative">
                            <button
                                ref={ambilButtonRef}
                                type="button"
                                onClick={() => setOpenAmbil((o) => !o)}
                                className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-xs sm:text-sm font-medium text-[#21539b]"
                            >
                                <span>{config.takeButtonLabel || 'Ambil'}</span>
                                <ChevronDownIcon className="h-4 w-4" />
                            </button>
                            <DropdownMenu
                                open={openAmbil}
                                onClose={() => setOpenAmbil(false)}
                                anchorRef={ambilButtonRef}
                                align="end"
                                widthClassName="w-[180px]"
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        setOpenAmbil(false);
                                        handlers.onTakeFavorite?.();
                                    }}
                                >
                                    Favorit
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
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
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
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
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-5 w-5" />
            </button>
        </div>
    );
}
