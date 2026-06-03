import { useMemo } from 'react';
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
        <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
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
                className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
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
                            selectClassName="text-[15px] text-[#1f2436]"
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
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </FormFieldRow>
                    ) : values.autoNumber ? (
                        <div className="grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
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
                                selectClassName="text-[15px] text-[#1f2436]"
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
                                inputClassName="text-[15px] text-[#1f2436]"
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
                <div className="min-w-0 flex-1 sm:max-w-[640px]">
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
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <TransactionToolbarIconButton label="Cari barang" onClick={handlers.onSelectItem}>
                        <LinkIcon className="h-4.5 w-4.5" />
                    </TransactionToolbarIconButton>

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
                <div className="flex items-center justify-end gap-3 pb-3">
                    <span className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.itemCountLabel ?? config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                    </span>
                </div>

                <TransactionDataTable
                    columns={config.itemTable.columns}
                    rows={filteredItems}
                    emptyLabel={config.itemTable.emptyLabel}
                    minWidthClassName="min-w-[940px]"
                    emptyLeadingCellContent={
                        <span className="inline-flex items-center justify-center">
                            <TableActionIcon className="h-4 w-4" />
                        </span>
                    }
                    onRowClick={handlers.onEditItem}
                    getRowClassName={() => 'cursor-pointer hover:bg-[#eef3fb]'}
                    renderHeaderCell={(column) =>
                        column.kind === 'spacer' ? (
                            <span className="flex justify-center text-white/55">
                                <TableActionIcon className="h-4 w-4" />
                            </span>
                        ) : (
                            column.label
                        )
                    }
                    renderCell={({ row, column }) =>
                        column.kind === 'spacer' ? (
                            <span className="inline-flex items-center justify-center text-[#a8afbe]">
                                <TableActionIcon className="h-4 w-4" />
                            </span>
                        ) : (
                            formatTableTextValue(row[column.id])
                        )
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

            <div className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
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
                        textareaClassName="min-h-[70px] text-[15px] text-[#1f2436]"
                    />
                </div>

                {isDetail ? (
                    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                        <TransactionFieldLabel label={config.labels.closeRequest} />
                        <label className="inline-flex items-center gap-3 text-[17px] text-[#1f2436]">
                            <input
                                type="checkbox"
                                checked={values.closeRequest}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        closeRequest: event.target.checked,
                                    }))
                                }
                                className="h-[20px] w-[20px] rounded border border-[#cfd6e2]"
                            />
                            <span>Ya (Tidak dapat diproses lagi)</span>
                        </label>
                    </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,560px)] lg:items-start">
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
