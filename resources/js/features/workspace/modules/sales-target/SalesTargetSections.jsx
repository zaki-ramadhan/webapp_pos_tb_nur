import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';

function FormFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
            <TransactionFieldLabel label={label} required={required} />
            <div>{children}</div>
        </div>
    );
}

export function SalesTargetHeader({ config, values, setValues }) {
    return (
        <div className="grid gap-x-10 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)]">
            <div className="space-y-3">
                <FormFieldRow label={config.labels.name} required>
                    <TextInput
                        value={values.name}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                name: event.target.value,
                            }))
                        }
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </FormFieldRow>

                <FormFieldRow label={config.labels.type}>
                    <SelectField
                        value={values.targetType}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                targetType: event.target.value,
                            }))
                        }
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.targetTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </FormFieldRow>

                <FormFieldRow label={config.labels.branch}>
                    <SelectField
                        value={values.branch}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                branch: event.target.value,
                            }))
                        }
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#1f2436]"
                    >
                        {config.branchOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>
                </FormFieldRow>
            </div>

            <div className="space-y-3">
                <FormFieldRow label={config.labels.startDate}>
                    <TransactionDateInput
                        value={values.startDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, startDate: nextValue }))}
                        className="max-w-[282px]"
                    />
                </FormFieldRow>

                <FormFieldRow label={config.labels.endDate} required>
                    <TransactionDateInput
                        value={values.endDate}
                        onChange={(nextValue) => setValues((current) => ({ ...current, endDate: nextValue }))}
                        className="max-w-[282px]"
                    />
                </FormFieldRow>
            </div>
        </div>
    );
}

export function SalesTargetDetailsSection({ values, setValues, onOpenModal }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.detailSearch}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                detailSearch: event.target.value,
                            }))
                        }
                        placeholder={values.detailSearchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <TransactionToolbarIconButton label={`Cari ${values.detailTitle}`}>
                        <SearchIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.detailTitle}
                        {values.detailTitle ? <span className="text-[#ED3969]"> *</span> : null}
                    </div>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={values.detailColumns}
                    rows={values.detailRows}
                    emptyLabel="Belum ada data"
                    minWidthClassName="min-w-[980px]"
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => row[column.id] ?? ''}
                    onRowClick={values.detailModal ? (row) => onOpenModal(row) : null}
                    getRowClassName={() => (values.detailModal ? 'cursor-pointer transition hover:bg-[#eef3fb]' : '')}
                />
            </div>
        </div>
    );
}

export function SalesTargetAdditionalInfoSection({ config, values, setValues }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
                <TransactionFieldLabel label={config.labels.notes} />
                <TextareaField
                    value={values.notes}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            notes: event.target.value,
                        }))
                    }
                    rows={3}
                    className="rounded-[4px] border-[#cfd6e2]"
                    textareaClassName="min-h-[58px] text-[15px] text-[#1f2436]"
                />

                <TransactionFieldLabel label={config.labels.analyst} />
                <TextInput
                    value={values.analyst}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            analyst: event.target.value,
                        }))
                    }
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                />
            </div>
        </div>
    );
}
