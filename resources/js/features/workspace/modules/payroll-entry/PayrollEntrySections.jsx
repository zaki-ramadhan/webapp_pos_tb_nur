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
import TextareaField from '@/components/ui/TextareaField';

export function PayrollHeader({ config, values, setValues }) {
    return (
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-3 w-full lg:max-w-[480px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
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
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.periodMonth} />
                    <div className="grid gap-3 grid-cols-[minmax(0,1fr)_96px]">
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
            </div>

            <div className="flex flex-col gap-y-3 w-full lg:max-w-[480px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.numbering} required htmlFor="numbering-type" />
                    <div className="flex items-center gap-3 w-full">
                        <TransactionSwitch
                            checked={values.autoNumber}
                            onChange={(nextChecked) =>
                                setValues((current) => ({
                                    ...current,
                                    autoNumber: nextChecked,
                                }))
                            }
                        />
                        <SelectField
                            id="numbering-type"
                            value={values.numberingType}
                            onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                            containerClassName="flex-1 min-w-0"
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.numberingOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.entryDate} required />
                    <TransactionDateInput
                        value={values.entryDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                        className="w-full max-w-full"
                    />
                </div>

                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.dueDate} required />
                    <div className="grid gap-3 grid-cols-[minmax(0,1fr)_88px]">
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
        </div>
    );
}

export function PayrollEmployeeSection({ config, values, setValues, onTake }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <TextInput
                        value={values.employeeLookup}
                        onChange={(event) =>
                            setValues?.((current) => ({
                                ...current,
                                employeeLookup: event.target.value,
                            }))
                        }
                        placeholder={config.employeeLookupPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        containerClassName="w-full sm:max-w-[360px]"
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />

                    <TransactionHeaderButton
                        label={config.takeButtonLabel}
                        className="h-[38px] px-4 text-base"
                        onClick={onTake}
                    />
                </div>

                <div className="text-right text-2xl font-normal text-[#1f2436]">
                    {config.employeeSectionTitle} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-1.5 min-h-0 flex-1 overflow-x-auto">
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
