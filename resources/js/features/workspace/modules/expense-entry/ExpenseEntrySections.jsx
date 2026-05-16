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

export function ExpenseLineItemsSection({ config, values, setValues }) {
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
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            lineLookup: label,
                        }))
                    }
                />
            }
            title={detailTitle}
            columns={config.lineTable.columns}
            rows={values.lineItems}
            emptyLabel={config.lineTable.emptyLabel}
            spacerHeaderContent={
                <span className="flex justify-center">
                    <SortIcon className="h-3 w-3 text-white/55" />
                </span>
            }
        />
    );
}

export function ExpenseAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[250px_minmax(0,570px)] lg:items-start">
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
                        setValues((current) => ({
                            ...current,
                            branches: current.branches.filter((item) => item !== value),
                        }))
                    }
                    searchLabel="Cari cabang"
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
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
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
                <div className="grid grid-cols-[minmax(0,1fr)_220px] border-b border-[#d8dde7] px-4 py-3 text-[17px] text-[#1f2436]">
                    <span>{config.summaryRows.paidAmountLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.paidAmount}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_220px] px-4 py-3 text-[17px] text-[#1f2436]">
                    <span>{config.summaryRows.statusLabel}</span>
                    <span className="text-right font-semibold text-[#111827]">{values.status}</span>
                </div>
            </div>
        </div>
    );
}

export function ExpenseEntryHeader({ config, values, setValues, showAutoNumberSwitch }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[250px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.liabilityAccount} required />
                <AccountLookupField
                    values={values.liabilityAccounts}
                    placeholder={config.liabilityAccountPlaceholder}
                    dialogTitle="Pilih Akun Hutang Beban"
                    onRemove={(value) =>
                        setValues((current) => ({
                            ...current,
                            liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                        }))
                    }
                    searchLabel="Cari akun hutang beban"
                    onSelectAccount={(_, label) =>
                        setValues((current) => ({
                            ...current,
                            liabilityAccounts: label ? [label] : [],
                        }))
                    }
                />

                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="w-full max-w-full"
                />
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center gap-4">
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
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
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
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailingClassName="px-3"
                    />
                )}

                <div />
                <div className="flex flex-wrap justify-end gap-2">
                    <TransactionHeaderButton label={config.takeButtonLabel} />
                    <TransactionHeaderButton label={config.processButtonLabel} trailingChevron />
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
                    selectClassName="px-3 text-[15px] text-[#394157]"
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
