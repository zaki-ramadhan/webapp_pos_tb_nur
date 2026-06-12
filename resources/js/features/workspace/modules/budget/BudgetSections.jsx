import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { ChevronDownIcon, SortIcon } from '@/features/workspace/shared/Icons';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDataTable,
    TransactionFieldLabel,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export function BudgetHeader({ config, values, setValues }) {
    return (
        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="grid gap-y-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.month} required />
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_154px]">
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

            <div className="grid gap-y-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.branch} required className="sm:text-right" />
                <ChipLookupField
                    value={values.branches[0] ?? ''}
                    searchLabel="Cari cabang anggaran"
                    className="w-full"
                />
            </div>
        </div>
    );
}

export function BudgetInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[540px]">
            <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,570px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.notes} />
                <TextareaField
                    value={values.notes}
                    onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                    rows={4}
                    className="border-[#cfd6e2]"
                    textareaClassName="min-h-[60px] text-xs sm:text-sm text-[#1f2436]"
                />

                <TransactionFieldLabel label={config.labels.analyzer} />
                <TextInput
                    value={values.analyzer}
                    onChange={(event) => setValues((current) => ({ ...current, analyzer: event.target.value }))}
                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                />
            </div>
        </div>
    );
}

export function BudgetLinesSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <AccountLookupTextInput
                        value={values.keyword}
                        placeholder={config.accountPlaceholder}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2] sm:max-w-[590px]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        dialogTitle="Pilih Akun Anggaran"
                        searchLabel="Cari akun anggaran"
                        onSelectAccount={(_, label) =>
                            setValues((current) => ({
                                ...current,
                                keyword: label,
                            }))
                        }
                    />

                    <button
                        type="button"
                        className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
                    >
                        {config.takeButtonLabel}
                        <ChevronDownIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="text-right text-2xl font-normal text-[#1f2436]">
                    {config.gridTitle} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.grid.columns}
                    rows={[]}
                    emptyLabel={config.grid.emptyLabel}
                    minWidthClassName="min-w-[760px]"
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-center'}`.trim()}>
                            <SortIcon className="h-3 w-3 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                />
            </div>
        </div>
    );
}
