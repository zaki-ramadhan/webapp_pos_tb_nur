import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

export function PayrollHeader({ config, values, setValues }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.paymentType} />
                <SelectField
                    value={values.paymentType}
                    onChange={(event) => setValues((current) => ({ ...current, paymentType: event.target.value }))}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                >
                    {config.paymentTypeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>

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

                <TransactionFieldLabel label={config.labels.periodMonth} />
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_158px]">
                    <SelectField
                        value={values.month}
                        onChange={(event) => setValues((current) => ({ ...current, month: event.target.value }))}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {config.monthOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>

                    <SelectField
                        value={values.year}
                        onChange={(event) => setValues((current) => ({ ...current, year: event.target.value }))}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#1f2436]"
                    >
                        {config.yearOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </div>
            </div>

            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <div className="flex items-center gap-4">
                    <TransactionFieldLabel label={config.labels.numbering} required />
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
                <SelectField
                    value={values.numberingType}
                    onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                >
                    {config.numberingOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>

                <TransactionFieldLabel label={config.labels.entryDate} required />
                <TransactionDateInput
                    value={values.entryDate}
                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                    className="w-full max-w-full"
                />

                <TransactionFieldLabel label={config.labels.dueDate} required />
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_88px]">
                    <TransactionDateInput
                        value={values.dueDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, dueDate: nextValue }))}
                        className="w-full max-w-full"
                    />
                    <button
                        type="button"
                        disabled
                        className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-[#d3d7df] bg-[#f3f3f4] px-3 text-base text-[#b1b5be]"
                    >
                        {config.processButtonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function PayrollEmployeeSection({ config, values }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <TextInput
                        value={values.employeeLookup}
                        readOnly
                        placeholder={config.employeeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[590px]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />

                    <TransactionHeaderButton label={config.takeButtonLabel} className="h-[38px] px-4 text-base" />
                </div>

                <div className="text-right text-2xl font-normal text-[#1f2436]">
                    {config.employeeSectionTitle} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.employeeTable.columns}
                    rows={config.employeeTable.rows}
                    emptyLabel={config.employeeTable.emptyLabel}
                    minWidthClassName="min-w-[760px]"
                    renderHeaderCell={(column) =>
                        column.kind === 'spacer' ? (
                            <span className="flex justify-center">
                                <SortIcon className="h-3 w-3 text-white/55" />
                            </span>
                        ) : (
                            column.label
                        )
                    }
                    renderCell={({ row, column }) => (column.kind === 'spacer' ? '' : formatTableTextValue(row[column.id]))}
                />
            </div>

            <div className="mt-5 flex justify-end">
                <TransactionDualTotalCard items={config.summaryItems} className="min-w-[360px] sm:min-w-[565px]" />
            </div>
        </div>
    );
}

export function PayrollAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="form" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.additionalInfoFields.liabilityAccountLabel} required />
                <AccountLookupField
                    values={values.liabilityAccounts}
                    placeholder={config.additionalInfoFields.liabilityAccountPlaceholder}
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

                <TransactionFieldLabel label={config.additionalInfoFields.noteLabel} />
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
