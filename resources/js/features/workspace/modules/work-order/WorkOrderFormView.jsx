import { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import SelectField from '@/components/ui/SelectField';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import WorkOrderItemModal from '@/features/workspace/modules/shared/WorkOrderItemModal';
import {
    AccountLookupField,
    AccountLookupTextInput,
} from '@/features/workspace/shared/AccountLookupControls';
import {
    TransactionDataTable,
    TransactionDateInput,
    TransactionFieldLabel,
    TransactionFormLayout,
    TransactionSectionHeading,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    buildWorkOrderFormValues,
    resolveWorkOrderCellAlignClassName,
} from '@/features/workspace/modules/work-order/workOrderViewShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ChevronDownIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';
import { buildWorkOrderRecord } from '@/features/workspace/modules/work-order/workOrderConfig';

function WorkOrderHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                        <TransactionFieldLabel label={config.labels.date} required />
                        <TransactionDateInput
                            value={values.date}
                            onChange={(nextValue) => setValues((current) => ({ ...current, date: nextValue }))}
                            className="max-w-[330px]"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                            <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
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
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            className="inline-flex h-[38px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            {config.favoriteButtonLabel}
                        </button>
                        <button
                            type="button"
                            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            <span>{config.processButtonLabel}</span>
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WorkOrderSectionHeader({ searchValue, onSearchChange, placeholder, title, actionButton }) {
    const isAccountLookup = placeholder === 'Cari/Pilih Akun Perkiraan...';

    return (
        <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[720px]">
                <div className="min-w-0 flex-1">
                    {isAccountLookup ? (
                        <AccountLookupTextInput
                            value={searchValue}
                            placeholder={placeholder}
                            searchLabel={`Cari ${title}`}
                            dialogTitle={`Pilih ${title}`}
                            onSelectAccount={(_, label) => onSearchChange({ target: { value: label } })}
                        />
                    ) : (
                        <TextInput
                            value={searchValue}
                            onChange={onSearchChange}
                            placeholder={placeholder}
                            trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                            className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    )}
                </div>

                {actionButton}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
                <TransactionToolbarIconButton label={`Cari ${title}`}>
                    <SearchIcon className="h-4.5 w-4.5" />
                </TransactionToolbarIconButton>
                <div className="text-right text-[22px] font-normal text-[#1f2436]">
                    {title} <span className="text-[#ED3969]">*</span>
                </div>
            </div>
        </div>
    );
}

function WorkOrderSectionTable({ columns, rows, emptyLabel, onRowClick, clickable = false }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <TransactionDataTable
                columns={columns}
                rows={rows}
                emptyLabel={emptyLabel}
                minWidthClassName="min-w-[980px]"
                onRowClick={clickable ? onRowClick : null}
                getRowClassName={() => (clickable ? 'cursor-pointer hover:bg-[#eef3fb]' : '')}
                renderCell={({ row, column }) => <span className="block truncate">{formatTableTextValue(row[column.id])}</span>}
            />
        </div>
    );
}

function WorkOrderItemsSection({ config, values, setValues, isDetail, onOpenItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <WorkOrderSectionHeader
                searchValue={values.itemSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        itemSearch: event.target.value,
                    }))
                }
                placeholder={config.itemSearchPlaceholder}
                title={values.itemCountLabel ?? config.itemSectionTitle}
                actionButton={
                    isDetail ? (
                        <TransactionToolbarSplitButton
                            label="Aksi rincian barang"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={[{ id: 'copy-items', label: 'Salin rincian barang' }]}
                        />
                    ) : null
                }
            />

            <WorkOrderSectionTable
                columns={config.itemTable.columns}
                rows={values.items}
                emptyLabel={config.itemTable.emptyLabel}
                onRowClick={onOpenItem}
                clickable={isDetail}
            />
        </div>
    );
}

function WorkOrderChargesSection({ config, values, setValues }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <WorkOrderSectionHeader
                searchValue={values.chargeSearch}
                onSearchChange={(event) =>
                    setValues((current) => ({
                        ...current,
                        chargeSearch: event.target.value,
                    }))
                }
                placeholder={config.chargeSearchPlaceholder}
                title={config.chargeSectionTitle}
            />

            <WorkOrderSectionTable
                columns={config.chargeTable.columns}
                rows={values.additionalCosts}
                emptyLabel={config.chargeTable.emptyLabel}
            />
        </div>
    );
}

function WorkOrderAdditionalInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.customerReference} />
                    <TextInput
                        value={values.customerReference}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                customerReference: event.target.value,
                            }))
                        }
                        readOnly={isDetail}
                        placeholder="Cari/Pilih Pelanggan..."
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.expenseAccount} />
                    {isDetail ? (
                        <TextInput
                            value={values.expenseAccountText}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#5f6980]"
                        />
                    ) : (
                        <AccountLookupField
                            values={values.expenseAccounts}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari akun biaya"
                            dialogTitle="Pilih Akun Biaya"
                            onRemove={(accountValue) =>
                                setValues((current) => ({
                                    ...current,
                                    expenseAccounts: current.expenseAccounts.filter((item) => item !== accountValue),
                                }))
                            }
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    expenseAccounts: label ? [label] : [],
                                    expenseAccountText: label,
                                }))
                            }
                            heightClassName="h-[36px]"
                        />
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.varianceAccount} />
                    {isDetail ? (
                        <TextInput
                            value={values.varianceAccountText}
                            readOnly
                            className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#5f6980]"
                        />
                    ) : (
                        <AccountLookupField
                            values={values.varianceAccounts}
                            placeholder="Cari/Pilih..."
                            searchLabel="Cari akun selisih biaya"
                            dialogTitle="Pilih Akun Selisih Biaya"
                            onRemove={(accountValue) =>
                                setValues((current) => ({
                                    ...current,
                                    varianceAccounts: current.varianceAccounts.filter((item) => item !== accountValue),
                                }))
                            }
                            onSelectAccount={(_, label) =>
                                setValues((current) => ({
                                    ...current,
                                    varianceAccounts: label ? [label] : [],
                                    varianceAccountText: label,
                                }))
                            }
                            heightClassName="h-[36px]"
                        />
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                    <TransactionFieldLabel label={config.labels.branch} required />
                    <ChipLookupField
                        values={values.branches}
                        placeholder="Cari/Pilih..."
                        searchLabel="Cari cabang"
                        onRemove={(branchValue) =>
                            setValues((current) => ({
                                ...current,
                                branches: current.branches.filter((item) => item !== branchValue),
                            }))
                        }
                        heightClassName="h-[36px]"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
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
                    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
                        <TransactionFieldLabel label={config.labels.closeJob} />
                        <label className="inline-flex items-center gap-3 text-[17px] text-[#1f2436]">
                            <input
                                type="checkbox"
                                checked={values.closeJob}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        closeJob: event.target.checked,
                                    }))
                                }
                                className="h-5 w-5 rounded border border-[#cfd6e2]"
                            />
                            <span>Ya</span>
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#7aa2d5] text-[13px] text-[#21539b]">
                                i
                            </span>
                        </label>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function WorkOrderInfoCardRow({ label, value, valueClassName = '' }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,220px)] border-b border-[#dde2ea] last:border-b-0">
            <div className="px-4 py-2 text-[17px] text-[#1f2436]">{label}</div>
            <div className={`px-4 py-2 text-right text-[17px] text-[#1f2436] ${valueClassName}`.trim()}>{value}</div>
        </div>
    );
}

function WorkOrderStatusBadge({ value }) {
    return (
        <span className="inline-flex min-w-[72px] items-center justify-center rounded-[5px] border border-[#f6c98e] bg-[#fff1df] px-3 py-1 text-[16px] text-[#ff8a00]">
            {value}
        </span>
    );
}

function WorkOrderSummarySection({ config, values }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.workInfoTitle} icon="box" />

            <div className="mt-4 max-w-[860px] overflow-hidden rounded-[6px] border border-[#cfd6e2] bg-white">
                <WorkOrderInfoCardRow label="Tambahan Barang" value={values.workInformation.addedItems} />
                <WorkOrderInfoCardRow label="Tambahan Biaya" value={values.workInformation.addedCosts} />
                <WorkOrderInfoCardRow label="Nilai Total" value={values.workInformation.totalValue} />
                <WorkOrderInfoCardRow
                    label="Penyelesaian Pesanan"
                    value={values.workInformation.completionNumber || '-'}
                    valueClassName="font-medium text-[#1564d7]"
                />
                <WorkOrderInfoCardRow
                    label="Tgl Penyelesaian"
                    value={values.workInformation.completionDate || '-'}
                    valueClassName="font-medium text-[#1564d7]"
                />
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                    <div className="px-4 py-2 text-[17px] text-[#1f2436]">Status</div>
                    <div className="flex justify-end px-4 py-2">
                        {values.workInformation.status ? <WorkOrderStatusBadge value={values.workInformation.status} /> : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}

function WorkOrderTotalsBar({ values }) {
    return (
        <div className="flex justify-end">
            <div className="grid min-w-[620px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:grid-cols-3">
                <div className="border-b border-[#d2d8e3] px-4 py-3 sm:border-b-0 sm:border-r">
                    <div className="text-[17px] text-[#1f2436]">Total Barang</div>
                    <div className="mt-2 text-right text-[18px] font-semibold text-[#111827]">{values.totalItemsAmount}</div>
                </div>
                <div className="border-b border-[#d2d8e3] px-4 py-3 sm:border-b-0 sm:border-r">
                    <div className="text-[17px] text-[#1f2436]">Total Biaya</div>
                    <div className="mt-2 text-right text-[18px] font-semibold text-[#111827]">{values.totalCostAmount}</div>
                </div>
                <div className="px-4 py-3">
                    <div className="text-[17px] text-[#1f2436]">Total</div>
                    <div className="mt-2 text-right text-[18px] font-semibold text-[#111827]">{values.grandTotal}</div>
                </div>
            </div>
        </div>
    );
}

export default function WorkOrderFormView({ pageId, config, activeLevel2Tab }) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildWorkOrderRecord(
                      config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId },
                      config,
                  )
                : config.draft,
        [activeRecordId, config],
    );
    const [values, setValues] = useState(() => buildWorkOrderFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildWorkOrderFormValues(sourceRecord));
        setSelectedItem(null);
    }, [config.sectionTabs, sourceRecord]);

    const initialComparable = useMemo(
        () => ({
            date: sourceRecord.date ?? '',
            autoNumber: sourceRecord.autoNumber ?? true,
            numberingType: sourceRecord.numberingType ?? '',
            documentNumber: sourceRecord.documentNumber ?? '',
            items: sourceRecord.items ?? [],
            customerReference: sourceRecord.customerReference ?? '',
            expenseAccounts: sourceRecord.expenseAccounts ?? [],
            varianceAccounts: sourceRecord.varianceAccounts ?? [],
            branches: sourceRecord.branches ?? [],
            notes: sourceRecord.notes ?? '',
        }),
        [sourceRecord],
    );

    const currentComparable = useMemo(
        () => ({
            date: values.date,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            documentNumber: values.documentNumber,
            items: values.items,
            customerReference: values.customerReference,
            expenseAccounts: values.expenseAccounts,
            varianceAccounts: values.varianceAccounts,
            branches: values.branches,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.date, value: values.date },
                    {
                        label: config.labels.documentNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.documentNumber),
                    },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.labels.branch,
            config.labels.date,
            config.labels.documentNumber,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.date,
            values.documentNumber,
            values.numberingType,
        ],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                      }
                    : action,
            ),
        [saveDisabled, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    return (
        <>
            <TransactionFormLayout
                header={<WorkOrderHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={values.showTotals ? <WorkOrderTotalsBar values={values} /> : null}
                dockActions={dockActions}
            >
                {activeSectionId === 'charges' ? (
                    <WorkOrderChargesSection config={config} values={values} setValues={setValues} />
                ) : activeSectionId === 'additional-info' ? (
                    <WorkOrderAdditionalInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                    />
                ) : activeSectionId === 'work-info' ? (
                    <WorkOrderSummarySection config={config} values={values} />
                ) : (
                    <WorkOrderItemsSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={setSelectedItem}
                    />
                )}
            </TransactionFormLayout>

            <WorkOrderItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={values.itemModal}
                item={selectedItem}
            />
        </>
    );
}
