import { useRef, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import BackendLookupTextInput from '@/features/workspace/shared/BackendLookupTextInput';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionDualTotalCard,
    TransactionFieldLabel,
    TransactionHeaderButton,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SearchIcon, SortIcon, ChevronDownIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import TextareaField from '@/components/ui/TextareaField';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';

export function PayrollHeader({ config, values, setValues, isDetail, handlers = {} }) {
    const [processOpen, setProcessOpen] = useState(false);
    const processAnchorRef = useRef(null);

    const handleProcessGaji = async () => {
        setProcessOpen(false);
        handlers.onProcessGaji?.(values);
    };
    return (
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-y-2 w-full lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.paymentType} />
                    <SelectField
                        value={values.paymentType}
                        onChange={(event) => setValues((current) => ({ ...current, paymentType: event.target.value }))}
                        disabled={isDetail}
                        className="h-[40px] rounded-[4px] border-ui-border"
                        selectClassName="text-xs sm:text-sm text-brand-dark"
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
                            disabled={isDetail}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
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
                            disabled={isDetail}
                            className="h-[40px] rounded-[4px] border-ui-border"
                            selectClassName="text-xs sm:text-sm text-brand-dark"
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

            <div className="flex flex-col gap-y-2 w-full lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[620px]">
                <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-x-4">
                    <TransactionFieldLabel label={config.labels.numbering} required htmlFor="documentNumber" />
                    <div className="max-w-[320px] w-full">
                        {isDetail ? (
                             <TextInput
                                 id="documentNumber"
                                 value={values.documentNumber}
                                 onChange={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value }))}
                                 onBlur={(event) => setValues((current) => ({ ...current, documentNumber: event.target.value.trim() }))}
                                 maxLength={120}
                                 className="h-[40px] rounded-[4px] border-ui-border w-full"
                                 inputClassName="text-xs sm:text-sm text-brand-dark"
                             />
                        ) : (
                            <SelectField
                                id="documentNumber"
                                value={values.numberingType}
                                onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                className="h-[40px] rounded-[4px] border-ui-border w-full"
                                selectClassName="text-xs sm:text-sm text-brand-dark"
                            >
                                {config.numberingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </SelectField>
                        )}
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
                    <div className="grid gap-3 grid-cols-[minmax(0,1fr)_120px]">
                        <TransactionDateInput
                            value={values.dueDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, dueDate: nextValue }))}
                            className="w-full max-w-full"
                        />
                        <div className="relative flex-1 max-w-[120px]">
                            <button
                                ref={processAnchorRef}
                                type="button"
                                disabled={!values.__backendRecordId}
                                onClick={() => setProcessOpen(prev => !prev)}
                                className="inline-flex h-[40px] w-full items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-3 text-xs sm:text-sm text-brand-blue-accent disabled:opacity-50 disabled:bg-zinc-50 disabled:border-slate-350 disabled:text-tab-inactive-border-l disabled:cursor-not-allowed cursor-pointer transition hover:bg-brand-blue-lightest"
                            >
                                <span>{config.processButtonLabel || 'Proses'}</span>
                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${processOpen ? 'rotate-180' : ''}`.trim()} />
                            </button>
                            <DropdownMenu
                                open={processOpen}
                                onClose={() => setProcessOpen(false)}
                                anchorRef={processAnchorRef}
                                align="start"
                                widthClassName="w-[140px]"
                            >
                                <DropdownMenuItem onClick={handleProcessGaji}>
                                    Gaji
                                </DropdownMenuItem>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PayrollEmployeeSection({ config, values, setValues, onTake, handlers = {} }) {
    return (
        <div className="flex flex-col min-h-0">
            <div className="flex flex-col gap-3 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="w-full sm:max-w-[360px]">
                        <BackendLookupTextInput
                            resource="employees"
                            value={values.employeeLookup}
                            placeholder={config.employeeLookupPlaceholder}
                            searchLabel="Cari karyawan"
                            getOptionLabel={(record) => record?.full_name ?? ''}
                            getOptionSearchText={(record) =>
                                [record?.full_name, record?.employee_code, record?.position]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                            renderOption={(record) => (
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-normal text-brand-dark">
                                        {record?.full_name ?? record?.name ?? ''}
                                    </span>
                                    <span className="mt-1 flex items-center justify-between gap-4 text-xs sm:text-[13px]">
                                        <span className="truncate text-brand-dark font-normal">
                                            {record?.employee_code ?? record?.code ?? String(record?.id ?? '')}
                                        </span>
                                    </span>
                                </div>
                            )}
                            onSelect={handlers.onSelectEmployee}
                            className="h-[40px]"
                        />
                    </div>

                    <TransactionHeaderButton
                        label={config.takeButtonLabel}
                        className="h-[38px] px-4 text-base"
                        onClick={onTake}
                    />
                </div>

                <div className="text-right text-2xl font-normal text-brand-dark">
                    {config.employeeSectionTitle} <span className="text-tab-active-border-t">*</span>
                </div>
            </div>

            <div className="mt-1.5 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.employeeTable.columns}
                    rows={config.employeeTable.rows}
                    emptyLabel={config.employeeTable.emptyLabel}
                    minWidthClassName="min-w-[760px]"
                    onRowClick={handlers.onEditEmployeeRow}
                    getRowClassName={
                        handlers.onEditEmployeeRow
                            ? () => 'cursor-pointer transition hover:bg-workspace-hover-bg'
                            : undefined
                    }
                    renderHeaderCell={(column) =>
                        column.kind === 'spacer' ? (
                            <span className="flex justify-center">
                                <SortIcon className="h-3 w-3 text-white/55" />
                            </span>
                        ) : (
                            column.label
                        )
                    }
                    renderCell={({ row, column }) => formatTableTextValue(row[column.id], column)}
                />
            </div>
        </div>
    );
}

export function PayrollAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.additionalInfoFields.liabilityAccountLabel} required />
                    <AccountLookupField
                        values={values.liabilityAccounts}
                        placeholder={config.additionalInfoFields.liabilityAccountPlaceholder}
                        dialogTitle="Pilih Akun Hutang Beban"
                        onRemove={(value) =>
                            setValues((current) => ({
                                ...current,
                                liabilityAccounts: current.liabilityAccounts.filter((item) => item !== value),
                                __liabilityAccountId: null,
                            }))
                        }
                        searchLabel="Cari akun hutang beban"
                        onSelectAccount={(record, label) =>
                            setValues((current) => ({
                                ...current,
                                liabilityAccounts: label ? [label] : [],
                                __liabilityAccountId: record?.id ?? null,
                            }))
                        }
                        queryParams={{ account_type: 'Other Current Liability' }}
                        showType={true}
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
                        className="border-ui-border"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}
