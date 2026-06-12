import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField, AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { CloseIcon, FunnelIcon, SortIcon } from '@/features/workspace/shared/Icons';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionLineItemsSection,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function ExpenseLineItemsSection({ config, values, setValues, handlers = {} }) {
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
                    searchLabel="Cari akun rincian beban"
                    dialogTitle="Pilih Akun Rincian Beban"
                    onSelectAccount={(record) => handlers.onSelectLineAccount?.(record)}
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            onRowClick={handlers.onEditLineItem}
            getRowClassName={
                handlers.onEditLineItem
                    ? () => 'cursor-pointer transition hover:bg-[#eef3fb]'
                    : undefined
            }
            spacerHeaderContent={
                <span className="flex justify-center">
                    <SortIcon className="h-3 w-3 text-white/55" />
                </span>
            }
        />
    );
}

export function ExpenseAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.dueDate} required />
                <TransactionDateInput
                    value={values.dueDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, dueDate: nextValue }))}
                    className="w-full max-w-full"
                />

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField
                    values={values.branches}
                    placeholder={config.branchPlaceholder}
                    onRemove={(value) =>
                        handlers.onRemoveBranch
                            ? handlers.onRemoveBranch(value)
                            : setValues((current) => ({
                                  ...current,
                                  branches: current.branches.filter((item) => item !== value),
                              }))
                    }
                    searchLabel="Cari cabang"
                    onSearch={handlers.onSelectBranch}
                />

                <TransactionFieldLabel label={config.labels.notes} />
                <textarea
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={4}
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                />
            </div>
        </div>
    );
}

export function ExpenseSummarySection({ config, values }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.summaryTitle} icon="document" />

            <div className="mt-4 max-w-[860px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
                <div className="grid grid-cols-[minmax(0,1fr)_220px] border-b border-[#d8dde7] px-4 py-3 text-xs sm:text-sm text-[#1f2436]">
                    <span>{config.summaryRows.paidAmountLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.paidAmount}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_220px] px-4 py-3 text-xs sm:text-sm text-[#1f2436]">
                    <span>{config.summaryRows.statusLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.status}</span>
                </div>
            </div>
        </div>
    );
}

export function ExpenseEntryHeader({ config, values, setValues, showAutoNumberSwitch, handlers = {} }) {
    return (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.liabilityAccount} required />
                <div className="w-full max-w-[420px]">
                    <AccountLookupField
                        values={values.liabilityAccounts}
                        placeholder={config.liabilityAccountPlaceholder}
                        dialogTitle="Pilih Akun Hutang Beban"
                        onRemove={(value) =>
                            handlers.onRemoveLiabilityAccount
                                ? handlers.onRemoveLiabilityAccount(value)
                                : setValues((current) => ({
                                      ...current,
                                      liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                                    }))
                        }
                        searchLabel="Cari akun hutang beban"
                        onSelectAccount={(record) => handlers.onSelectLiabilityAccount?.(record)}
                    />
                </div>

                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="w-full max-w-[150px]"
                />
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center gap-2">
                    <TransactionFieldLabel label={config.labels.documentNumber} required />
                    {showAutoNumberSwitch ? (
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextChecked) =>
                                setValues((current) => ({
                                    ...current,
                                    autoNumber: nextChecked,
                                }))
                            }
                        />
                    ) : null}
                </div>

                {values.autoNumber ? (
                    <SelectField
                        value={values.numberingType}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                numberingType: event.target.value,
                            }))
                        }
                        containerClassName="w-full max-w-[320px]"
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
                        readOnly
                        trailing={<CloseIcon className="h-4 w-4 text-[#1f2436]" />}
                        className="h-[40px] w-full max-w-[320px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        trailingClassName="px-3"
                    />
                )}

                <div />
                <div className="flex gap-2 w-full max-w-[250px]">
                    <TransactionHeaderButton label={config.takeButtonLabel} trailingChevron className="flex-1" />
                    <TransactionHeaderButton label={config.processButtonLabel} trailingChevron className="flex-1" />
                </div>
            </div>
        </div>
    );
}

export function ExpenseTableFilters({ table, filters, setFilters }) {
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
