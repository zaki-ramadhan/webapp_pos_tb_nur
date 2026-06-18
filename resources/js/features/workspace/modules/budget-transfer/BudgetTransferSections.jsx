import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import {
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { TableActionIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import TextareaField from '@/components/ui/TextareaField';

function TransferAmountInput({ value, onChange, prefix }) {
    return (
        <FormattedAmountInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            trailing={<TableActionIcon className="h-[18px] w-[18px] text-[#1f2436]" />}
            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
            prefixClassName="min-w-[46px] justify-center border-r-[#d8dde7] bg-[#fbfcfe] px-2 text-xs sm:text-sm text-[#9097aa]"
            inputClassName="text-xs sm:text-sm text-[#1f2436]"
            trailingClassName="px-2.5"
        />
    );
}

function TransferBudgetPanel({ title, children }) {
    return (
        <section className="min-w-0">
            <div className="border-b border-[#d8dde7] pb-3">
                <h3 className="text-2xl font-normal text-[#1564d7]">{title}</h3>
            </div>
            <div className="pt-4">{children}</div>
        </section>
    );
}

export function BudgetTransferHeader({ config, values, setValues }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-2">
            {/* Left side: Year and Type */}
            <div className="grid gap-y-3 sm:grid-cols-2 sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.year} required />
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

                <TransactionFieldLabel label={config.labels.type} />
                <SelectField
                    value={values.type}
                    onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="text-xs sm:text-sm text-[#1f2436]"
                >
                    {config.typeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </SelectField>
            </div>

            {/* Right side: Transfer Number and Date */}
            <div className="grid gap-y-3 sm:grid-cols-2 sm:items-center sm:gap-x-4">
                <div className="flex items-center justify-start gap-4 sm:justify-end">
                    <TransactionFieldLabel label={config.labels.transferNumber} required className="sm:text-right" />
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
                        value={values.transferNumber}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                transferNumber: event.target.value,
                            }))
                        }
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                )}

                <TransactionFieldLabel label={config.labels.date} required className="sm:text-right" />
                <TransactionDateInput
                    value={values.date}
                    onChange={(nextValue) => setValues((current) => ({ ...current, date: nextValue }))}
                    className="w-full max-w-full"
                />
            </div>
        </div>
    );
}

export function TransferDetailsSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <div className="grid gap-8 xl:grid-cols-2">
                <TransferBudgetPanel title={config.fromTitle}>
                    <div className="grid gap-y-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.month} required />
                        <SelectField
                            value={values.fromMonth}
                            onChange={(event) => setValues((current) => ({ ...current, fromMonth: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.monthOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>

                        <TransactionFieldLabel label={config.labels.budget} required />
                        <AccountLookupTextInput
                            value={values.fromBudget}
                            placeholder={config.accountPlaceholder}
                            dialogTitle="Pilih Anggaran Asal"
                            searchLabel="Cari akun anggaran asal"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    fromBudget: label,
                                }))
                            }
                        />

                        <TransactionFieldLabel label={config.labels.remainingBudget} />
                        <div className="text-xs sm:text-sm text-[#1f2436]">{formatTableTextValue(values.remainingBudget)}</div>

                        <TransactionFieldLabel label={config.labels.transferAmount} required />
                        <div className="max-w-[348px]">
                            <TransferAmountInput
                                value={values.transferAmount}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, transferAmount: event.target.value }))
                                }
                                prefix={config.currencyPrefix}
                            />
                        </div>
                    </div>
                </TransferBudgetPanel>

                <TransferBudgetPanel title={config.toTitle}>
                    <div className="grid gap-y-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.month} required />
                        <SelectField
                            value={values.toMonth}
                            onChange={(event) => setValues((current) => ({ ...current, toMonth: event.target.value }))}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.monthOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>

                        <TransactionFieldLabel label={config.labels.budget} required />
                        <AccountLookupTextInput
                            value={values.toBudget}
                            placeholder={config.accountPlaceholder}
                            dialogTitle="Pilih Anggaran Tujuan"
                            searchLabel="Cari akun anggaran tujuan"
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    toBudget: label,
                                }))
                            }
                        />
                    </div>
                </TransferBudgetPanel>
            </div>
        </div>
    );
}

export function TransferInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="document" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.notes} />
                <TextareaField
                    value={values.notes}
                    onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                    rows={4}
                    className="border-[#cfd6e2]"
                    textareaClassName="min-h-[60px] text-xs sm:text-sm text-[#1f2436]"
                />
            </div>
        </div>
    );
}
