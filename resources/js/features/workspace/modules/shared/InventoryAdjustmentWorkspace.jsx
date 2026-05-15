import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import {
    AccountLookupField,
    buildAccountLookupLabel,
} from '@/features/workspace/shared/AccountLookupControls';
import {
    buildInventoryAdjustmentPayload,
} from '@/features/workspace/backend/inventoryAdjustmentBackend';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import TableListView from '@/features/workspace/modules/TableListView';
import InventoryAdjustmentItemModal from '@/features/workspace/modules/shared/InventoryAdjustmentItemModal';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { showCrudErrorToast } from '@/features/workspace/shared/crudFeedback';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';
import { areComparableValuesEqual, validateRequiredChecks } from '@/features/workspace/shared/formValidation';
import { CogIcon, PrintIcon, SearchIcon, TableActionIcon } from '@/features/workspace/shared/Icons';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';

const buildLookupLabel = buildAccountLookupLabel;

function formatCurrencyValue(value) {
    const numericValue = Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return '0';
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function parseNumericInput(value) {
    return parseAmountInput(value, { emptyValue: 0 }) ?? 0;
}

function buildTotals(values, items) {
    const totalAmount = items.reduce((sum, item) => sum + parseNumericInput(item.totalCost), 0);

    return {
        ...values,
        items,
        itemCountLabel: items.length ? `${items.length} Barang` : 'Rincian Barang',
        totalValue: `Rp ${formatCurrencyValue(totalAmount)}`,
    };
}

function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneItems(items = []) {
    return items.map((item) => ({
        ...item,
        unitLookup: cloneList(item.unitLookup),
        warehouse: cloneList(item.warehouse),
        department: cloneList(item.department),
    }));
}

function buildFormValues(source = {}) {
    return {
        ...source,
        adjustmentAccount: cloneList(source.adjustmentAccount),
        branches: cloneList(source.branches),
        items: cloneItems(source.items),
    };
}

function buildInventoryComparableSnapshot(values) {
    return {
        date: values.date,
        documentNumber: values.documentNumber,
        autoNumber: values.autoNumber,
        numberingType: values.numberingType,
        branches: values.branches,
        branchId: values.__branchId,
        adjustmentAccount: values.adjustmentAccount,
        adjustmentAccountId: values.__adjustmentAccountId,
        notes: values.notes,
        items: (values.items ?? []).map((item) => ({
            name: item.name,
            code: item.code,
            adjustmentType: item.adjustmentType,
            quantity: item.quantity,
            unit: item.unit,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
        })),
    };
}

function validateInventoryAdjustmentValues(values, config, isDetail) {
    const requiredMessage = validateRequiredChecks([
        { label: config.labels.date, value: values.date },
        ...(isDetail ? [{ label: config.labels.documentNumber, value: values.documentNumber }] : [{ label: 'Tipe penomoran', value: values.numberingType }]),
        { label: config.labels.branch, value: values.__branchId, type: 'lookup' },
        { label: config.itemSectionTitle, value: values.items, type: 'array' },
    ]);

    if (requiredMessage) {
        return requiredMessage;
    }

    const invalidItem = (values.items ?? []).find(
        (item) =>
            !String(item?.name ?? '').trim()
            || Number.parseFloat(String(item?.quantity ?? '0').replace(',', '.')) <= 0
            || !String(item?.unit ?? '').trim(),
    );

    if (invalidItem) {
        return 'Setiap item wajib memiliki nama, kuantitas lebih dari 0, dan satuan.';
    }

    return '';
}

function buildInventoryDocumentNumber(pageId) {
    const prefix = pageId === 'price-adjustment' ? 'PA' : 'IA';
    const dateLabel = new Date().toISOString().slice(0, 10).replaceAll('-', '.');

    return `${prefix}.${dateLabel}.${Date.now()}`;
}

function promptInventoryAdjustmentItemEditor(item = null) {
    const name = window.prompt('Nama barang', item?.name ?? '');

    if (name === null) {
        return null;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error('Nama barang wajib diisi.');
    }

    const code = window.prompt('Kode barang', item?.code ?? '') ?? '';
    const adjustmentType = window.prompt('Tipe penyesuaian', item?.adjustmentType ?? 'Penambahan') ?? item?.adjustmentType ?? 'Penambahan';
    const quantity = window.prompt('Kuantitas', item?.quantity ?? '1');

    if (quantity === null) {
        return null;
    }

    const unit = window.prompt('Satuan', item?.unit ?? 'PCS');

    if (unit === null) {
        return null;
    }

    const unitCost = window.prompt('Harga satuan', item?.unitCost ?? '0');

    if (unitCost === null) {
        return null;
    }

    const quantityAmount = parseNumericInput(quantity);
    const unitCostAmount = parseNumericInput(unitCost);
    const resolvedUnit = unit.trim() || 'PCS';

    return {
        ...item,
        id: item?.id ?? `draft-item-${Date.now()}`,
        name: trimmedName,
        code: code.trim(),
        adjustmentType: adjustmentType.trim() || 'Penambahan',
        quantity: String(quantityAmount || 0),
        unit: resolvedUnit,
        unitLookup: [resolvedUnit],
        unitCost: formatCurrencyValue(unitCostAmount),
        totalCost: formatCurrencyValue(quantityAmount * unitCostAmount),
        warehouse: item?.warehouse ?? [],
        department: item?.department ?? [],
        notes: item?.notes ?? '',
    };
}

function applyInventoryPromptItemUpdate(item, setValues, setStatus) {
    try {
        const nextItem = promptInventoryAdjustmentItemEditor(item);

        if (!nextItem) {
            return;
        }

        setValues((current) =>
            buildTotals(
                current,
                item
                    ? (current.items ?? []).map((entry) => (entry.id === item.id ? nextItem : entry))
                    : [...(current.items ?? []), nextItem],
            ),
        );
        setStatus({
            tone: 'success',
            message: item ? 'Item diperbarui.' : 'Item ditambahkan.',
        });
    } catch (error) {
        setStatus({ tone: 'error', message: error.message });
    }
}

function resolveCellAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

function InventoryAdjustmentFieldRow({ label, required = false, labelClassName = '', children }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
            <TransactionFieldLabel label={label} required={required} className={labelClassName} />
            <div>{children}</div>
        </div>
    );
}

function InventoryAdjustmentHeader({ config, values, setValues, isDetail }) {
    return (
        <div className="border-b border-[#d8dde7] px-4 py-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
                <div className="space-y-3">
                    <InventoryAdjustmentFieldRow label={config.labels.date} required>
                        <TransactionDateInput
                            value={values.date}
                            onChange={(nextDisplayValue) =>
                                setValues((current) => ({
                                    ...current,
                                    date: nextDisplayValue,
                                }))
                            }
                            className="max-w-[282px]"
                        />
                    </InventoryAdjustmentFieldRow>
                </div>

                <div className="space-y-3">
                    {isDetail ? (
                        <InventoryAdjustmentFieldRow
                            label={config.labels.documentNumber}
                            required
                            labelClassName="sm:text-right"
                        >
                            <TextInput
                                value={values.documentNumber}
                                readOnly
                                trailing={<span className="text-[22px] font-semibold text-[#1f2436]">×</span>}
                                className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                inputClassName="text-[15px] text-[#1f2436]"
                                trailingClassName="px-3"
                            />
                        </InventoryAdjustmentFieldRow>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
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

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            {config.takeButtonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InventoryAdjustmentTableSection({ columns, items, emptyLabel, isDetail, onOpenItem, minWidthClassName }) {
    return (
        <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
            <div className={minWidthClassName}>
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 py-2 text-[16px] font-medium text-white ${resolveCellAlignClassName(column.align)}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {items.length ? (
                            items.map((item, index) => (
                                <DataTableRow
                                    key={item.id}
                                    className={`border-[#dde1e8] transition ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${isDetail ? 'cursor-pointer hover:bg-[#eef3fb]' : ''}`.trim()}
                                    onClick={isDetail ? () => onOpenItem(item) : undefined}
                                >
                                    {columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-[15px] text-[#131a28] ${resolveCellAlignClassName(column.align)}`.trim()}
                                        >
                                            {item[column.id] ?? ''}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-[#dde1e8] bg-white">
                                <DataTableCell colSpan={columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

function InventoryAdjustmentDetailsSection({ config, values, setValues, isDetail, onOpenItem, onCreateItem }) {
    return (
        <div className="flex min-h-[520px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-[820px] sm:flex-row sm:items-center">
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
                            inputClassName="text-[15px] text-[#1f2436]"
                        />
                    </div>

                    <SelectField
                        value={values.detailMode}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                detailMode: event.target.value,
                            }))
                        }
                        className="h-[34px] min-w-[82px] rounded-[4px] border-[#7aa2d5]"
                        selectClassName="text-[15px] text-[#21539b]"
                        containerClassName="w-auto shrink-0"
                    >
                        {config.detailModeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </SelectField>

                    {isDetail ? (
                        <TransactionToolbarSplitButton
                            label="Opsi rincian barang"
                            icon={<TableActionIcon className="h-4.5 w-4.5" />}
                            items={values.copyItems ?? []}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={onCreateItem}
                            className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b]"
                        >
                            Tambah Item
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <TransactionToolbarIconButton label={`Cari ${config.itemSectionTitle}`}>
                        <SearchIcon className="h-5 w-5 text-[#1f2436]" />
                    </TransactionToolbarIconButton>
                    <div className="text-right text-[22px] font-normal text-[#1f2436]">
                        {values.itemCountLabel ?? config.itemSectionTitle} <span className="text-[#ED3969]">*</span>
                    </div>
                </div>
            </div>

            <InventoryAdjustmentTableSection
                columns={config.itemTable.columns}
                items={values.items}
                emptyLabel={config.itemTable.emptyLabel}
                isDetail={isDetail}
                onOpenItem={onOpenItem}
                minWidthClassName={config.itemTable.minWidthClassName}
            />
        </div>
    );
}

function InventoryAdjustmentInfoSection({ config, values, setValues, handlers }) {
    return (
        <div className="min-h-[520px]">
            <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,560px)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.adjustmentAccount} />
                <AccountLookupField
                    values={values.adjustmentAccount}
                    placeholder="Cari/Pilih..."
                    searchLabel="Cari akun penyesuaian"
                    dialogTitle="Pilih Akun Penyesuaian"
                    onRemove={(accountValue) =>
                        setValues((current) => ({
                            ...current,
                            adjustmentAccount: current.adjustmentAccount.filter((item) => item !== accountValue),
                            __adjustmentAccountId: current.adjustmentAccount.filter((item) => item !== accountValue).length
                                ? current.__adjustmentAccountId
                                : null,
                        }))
                    }
                    onSelectAccount={(record, label) =>
                        setValues((current) => ({
                            ...current,
                            adjustmentAccount: label ? [label] : [],
                            __adjustmentAccountId: record?.id ?? null,
                        }))
                    }
                    heightClassName="h-[34px]"
                />

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
                    textareaClassName="min-h-[72px] text-[15px] text-[#1f2436]"
                />

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField
                    values={values.branches}
                    placeholder="Cari/Pilih..."
                    searchLabel="Cari cabang"
                    onRemove={(branchValue) =>
                        setValues((current) => ({
                            ...current,
                            branches: current.branches.filter((item) => item !== branchValue),
                            __branchId: current.branches.filter((item) => item !== branchValue).length
                                ? current.__branchId
                                : null,
                        }))
                    }
                    onSearch={handlers?.onSelectBranch}
                    heightClassName="h-[34px]"
                />
            </div>
        </div>
    );
}

export function InventoryAdjustmentFormView({
    pageId,
    config,
    activeLevel2Tab,
    buildRecord,
    backendConfig,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildRecord(config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId }, config)
                : config.draft,
        [activeRecordId, buildRecord, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetail = Boolean(activeRecordId);
    const initialSnapshot = useMemo(() => buildInventoryComparableSnapshot(buildFormValues(sourceRecord)), [sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(sourceRecord));
        setSelectedItem(null);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateInventoryAdjustmentValues(values, config, isDetail), [config, isDetail, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildInventoryComparableSnapshot(values), initialSnapshot),
        [initialSnapshot, values],
    );
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function selectLookup(resource, title, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, buildLookupLabel);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    function handleCreateItem() {
        applyInventoryPromptItemUpdate(null, setValues, setStatus);
    }

    function handleEditItem(item) {
        applyInventoryPromptItemUpdate(item, setValues, setStatus);
    }

    async function handleSave() {
        if (!backendConfig) {
            const errorMessage = 'Konfigurasi backend belum tersedia.';
            setStatus({ tone: 'error', message: errorMessage });
            showCrudErrorToast(errorMessage);
            return;
        }

        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui dokumen.' : 'Sedang menyimpan dokumen.',
            successMessage: isDetail ? 'Dokumen berhasil diperbarui.' : 'Dokumen berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildInventoryDocumentNumber(pageId)
                        : values.documentNumber;
                const payload = buildInventoryAdjustmentPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response =
                    isDetail && values.__backendRecordId
                        ? await updateBackendResource(backendConfig.resource, values.__backendRecordId, payload)
                        : await createBackendResource(backendConfig.resource, payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!backendConfig || !values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!backendConfig || !values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus dokumen.',
            successMessage: 'Dokumen berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource(backendConfig.resource, values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: handleSave,
                        disabled: action.disabled || saveDisabled,
                    };
                }

                if (action.id === 'delete') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: requestDelete,
                    };
                }

                return action;
            }),
        [handleDelete, handleSave, saveDisabled, saving, values.dockActions],
    );

    const handlers = useMemo(
        () => ({
            onSelectAdjustmentAccount: () =>
                selectLookup('accounts', 'akun penyesuaian', (record) =>
                    setValues((current) => ({
                        ...current,
                        __adjustmentAccountId: record.id,
                        adjustmentAccount: [buildLookupLabel(record)],
                    })),
                ),
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) =>
                    setValues((current) => ({
                        ...current,
                        __branchId: record.id,
                        branches: [buildLookupLabel(record)],
                    })),
                ),
        }),
        [],
    );

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <InventoryAdjustmentHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />
                    <CrudStatusMessage status={status} className="mx-4 mt-3" />

                    <div className="flex min-h-0 flex-col gap-4 px-4 py-4 lg:flex-row">
                        <TransactionSectionRail
                            tabs={config.sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={setActiveSectionId}
                        />

                        <div className="min-w-0 flex-1">
                            {activeSectionId === 'additional-info' ? (
                                <InventoryAdjustmentInfoSection config={config} values={values} setValues={setValues} handlers={handlers} />
                            ) : (
                                <InventoryAdjustmentDetailsSection
                                    config={config}
                                    values={values}
                                    setValues={setValues}
                                    isDetail={isDetail}
                                    onOpenItem={isDetail ? setSelectedItem : handleEditItem}
                                    onCreateItem={handleCreateItem}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <TransactionDock actions={dockActions} />
            </div>

            <div className="flex justify-end">
                <TransactionTotalCard label="Total" value={values.totalValue} />
            </div>

            <InventoryAdjustmentItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={{
                    ...(values.itemModal ?? {}),
                    adjustmentTypeOptions: config.adjustmentTypeOptions,
                }}
                item={selectedItem}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Dokumen"
                message="Dokumen ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}

export function InventoryAdjustmentTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
            rightControls={
                <>
                    <TransactionToolbarIconButton label="Cetak">
                        <PrintIcon className="h-4 w-4" />
                    </TransactionToolbarIconButton>
                    <TransactionToolbarIconButton label="Pengaturan tabel">
                        <CogIcon className="h-4 w-4" />
                    </TransactionToolbarIconButton>
                </>
            }
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.number,
                    tabLabel: row.number,
                })
            }
        />
    );
}
