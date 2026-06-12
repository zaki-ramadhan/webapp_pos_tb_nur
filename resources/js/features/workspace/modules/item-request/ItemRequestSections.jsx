import { useMemo } from 'react';
import CheckboxField from '@/components/ui/CheckboxField';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    LinkIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

function FormFieldRow({ label, required = false, children, labelClassName = '' }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

function ItemRequestHeaderActions({ config }) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <button
                type="button"
                className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
            >
                {config.takeButtonLabel}
            </button>
        </div>
    );
}

export function ItemRequestFormHeader({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <FormFieldRow label={config.labels.requestDate} required>
                        <TransactionDateInput
                            value={values.requestDate}
                            onChange={(nextValue) => setValues((current) => ({ ...current, requestDate: nextValue }))}
                            className="max-w-[280px]"
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.requestType}>
                        <SelectField
                            value={values.requestType}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    requestType: event.target.value,
                                }))
                            }
                            className="h-[40px] max-w-[280px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#1f2436]"
                        >
                            {config.requestTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    </FormFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <FormFieldRow label={config.labels.documentNumber} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-2xl font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </FormFieldRow>
                    ) : values.autoNumber ? (
                        <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <div className="flex items-center justify-start gap-4 sm:justify-end">
                                <TransactionFieldLabel label={config.labels.documentNumber} required />
                                <TransactionSwitch
                                    checked={values.autoNumber}
                                    onChange={(nextValue) =>
                                        setValues((current) => ({
                                            ...current,
                                            autoNumber: nextValue,
                                        }))
                                    }
                                />
                            </div>

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
                        </div>
                    ) : (
                        <FormFieldRow label={config.labels.documentNumber} required labelClassName="sm:text-right">
                            <TextInput
                                value={values.documentNumber}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        documentNumber: event.target.value,
                                    }))
                                }
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-xs sm:text-sm text-[#1f2436]"
                            />
                        </FormFieldRow>
                    )}

                    <div className="flex justify-end">
                        <ItemRequestHeaderActions config={config} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ItemRequestDetailsSection({ config, values, setValues, isDetail, handlers = {} }) {
    const filteredItems = useMemo(() => {
        const keyword = (values.itemSearch ?? '').trim().toLowerCase();

        if (!keyword) {
            return values.items ?? [];
        }

        return (values.items ?? []).filter((item) =>
            [item.code, item.name, item.quantity, item.unit, item.notes]
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [values.itemSearch, values.items]);

    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-2xl font-normal text-[#1f2436] shrink-0">
                    {values.itemCountLabel ?? config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[640px] justify-end">
                    <div className="min-w-0 flex-1">
                        <TextInput
                            value={values.itemSearch}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    itemSearch: event.target.value,
                                }))
                            }
                            placeholder={config.detailSearchPlaceholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-xs sm:text-sm text-[#1f2436]"
                        />
                    </div>

                    {!isDetail ? (
                        <button
                            type="button"
                            onClick={handlers.onImportClick}
                            className="inline-flex h-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b] hover:bg-[#f3f7fc] transition shrink-0 cursor-pointer"
                        >
                            Impor Excel/CSV
                        </button>
                    ) : null}

                    {isDetail ? (
                        <TransactionToolbarSplitButton
                            label="Opsi rincian barang"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={config.itemTable.copyItems}
                        />
                    ) : null}
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <TransactionDataTable
                    columns={config.itemTable.columns}
                    rows={filteredItems}
                    emptyLabel={config.itemTable.emptyLabel}
                    minWidthClassName="min-w-[940px]"
                    emptyLeadingCellContent={null}
                    onRowClick={handlers.onEditItem}
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) =>
                        column.kind === 'spacer' ? null : column.label
                    }
                    renderCell={({ row, column }) =>
                        column.kind === 'spacer' ? null : formatTableTextValue(row[column.id])
                    }
                />
            </div>
        </div>
    );
}

export function ItemRequestAdditionalInfoSection({ config, values, setValues, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-3">
                <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,560px)] lg:items-start">
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
                        className="rounded-[4px] border-[#cfd6e2]"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                {isDetail ? (
                    <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                        <TransactionFieldLabel label={config.labels.closeRequest} />
                        <CheckboxField
                            id="closeRequest"
                            label="Ya (Tidak dapat diproses lagi)"
                            checked={values.closeRequest}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    closeRequest: event.target.checked,
                                }))
                            }
                            inputClassName="h-[20px] w-[20px] rounded"
                            containerClassName="w-auto inline-flex items-center"
                        />
                    </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,560px)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField
                        values={values.branches}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari cabang"
                        onRemove={(branchValue) => handlers.onRemoveBranch?.(branchValue)}
                        onSearch={handlers.onSelectBranch}
                    />
                </div>
            </div>
        </div>
    );
}
