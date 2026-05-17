import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
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
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    buildCashReceiptDetailRecordFromRow,
    buildCashReceiptFormState,
    buildCashReceiptPayload,
    buildGeneratedCashReceiptNumber,
    buildLookupLabel,
    applyCashReceiptLineItems,
    promptCashReceiptLineItem,
    validateCashReceiptValues,
    CashReceiptEmptyLineRow,
    CashReceiptSortHeader,
} from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionHeading,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { SearchIcon } from '@/features/workspace/shared/Icons';

function ReceiptLineItemsSection({ config, values, handlers = {} }) {
    const detailTitle = values.lineItems.length
        ? `${values.lineItems.length} ${config.lineSectionTitle}`
        : config.lineSectionTitle;

    return (
        <div className="flex min-h-[540px] flex-col">
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={values.lineLookup}
                        readOnly
                        placeholder={config.lineSearchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        onClick={handlers.onSelectLineAccount}
                    />
                </div>

                <div className="text-right text-[24px] font-normal text-[#1f2436]">
                    {detailTitle} <span className="text-[#ED3969]">*</span>
                </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-x-auto">
                <div className="min-w-[760px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {config.lineTable.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${
                                            column.align === 'right'
                                                ? 'text-right'
                                                : column.align === 'left'
                                                  ? 'text-left'
                                                  : 'text-center'
                                        }`.trim()}
                                    >
                                        {column.label}
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {values.lineItems.length ? (
                                values.lineItems.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${handlers.onEditLineItem ? 'cursor-pointer' : ''}`.trim()}
                                        onClick={handlers.onEditLineItem ? () => handlers.onEditLineItem(row) : undefined}
                                    >
                                        {config.lineTable.columns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`${column.align === 'right' ? 'text-right' : 'text-left'} px-3 text-[15px] text-[#131a28]`.trim()}
                                            >
                                                {formatTableTextValue(row[column.id])}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <CashReceiptEmptyLineRow
                                    colSpan={config.lineTable.columns.length}
                                    emptyLabel={config.lineTable.emptyLabel}
                                />
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}

function ReceiptInfoSection({ config, values, isDetail, handlers = {} }) {
    return (
        <div className="min-h-[540px]">
            <TransactionSectionHeading title={config.infoTitle} icon="document" />

            <div className="mt-4 grid gap-y-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-start sm:gap-x-4">
                <TransactionFieldLabel label={config.labels.checkNumber} />
                <div className="max-w-[276px]">
                    <TextInput
                        value={values.checkNumber}
                        readOnly
                        className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <TransactionFieldLabel label={config.labels.payer} />
                <textarea
                    value={values.payer}
                    readOnly
                    rows={3}
                    className="min-h-[56px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.voided} />
                        <label className="inline-flex h-[34px] items-center gap-2 text-[17px] text-[#1f2436]">
                            <input
                                type="checkbox"
                                checked={values.voided}
                                readOnly
                                className="h-[24px] w-[24px] rounded-[4px] border border-[#cfd6e2]"
                            />
                            <span>Ya</span>
                        </label>
                    </>
                ) : null}

                <TransactionFieldLabel label={config.labels.branch} required />
                <ChipLookupField
                    values={values.branches}
                    placeholder={config.branchPlaceholder}
                    onRemove={(value) => handlers.onRemoveBranch?.(value)}
                    searchLabel="Cari cabang"
                    onSearch={handlers.onSelectBranch}
                />

                <TransactionFieldLabel label={config.labels.notes} />
                <textarea
                    value={values.notes}
                    readOnly
                    rows={4}
                    className="min-h-[70px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none"
                />

                {isDetail ? (
                    <>
                        <TransactionFieldLabel label={config.labels.reconcileStatus} />
                        <div className="pt-1 text-[17px] text-[#1f2436]">
                            <span className="italic">{values.reconcileStatus}</span>
                            <span className="ml-8">{values.reconcileDate}</span>
                        </div>

                        <TransactionFieldLabel label={config.labels.printStatus} />
                        <TextInput
                            value={values.printStatus}
                            readOnly
                            className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                            inputClassName="text-[15px] text-[#5f6779]"
                        />
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default function CashReceiptFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        return config.detailRecords?.[activeRecordId] ?? buildCashReceiptDetailRecordFromRow(config.rowMap?.[activeRecordId], config);
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildCashReceiptFormState(sourceRecord, config));
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const initialComparable = useMemo(() => buildCashReceiptFormState(sourceRecord, config), [config, sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildCashReceiptFormState(sourceRecord, config));
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateCashReceiptValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (activeRecordId ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: values.saveTone,
                            disabled: saveDisabled,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: handleSave,
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
        [activeRecordId, config.dockActions, saveDisabled, saving, values.saveTone],
    );

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

    function applyLineItemUpdate(record, currentItem = null) {
        try {
            const nextItem = promptCashReceiptLineItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            setValues((current) =>
                applyCashReceiptLineItems(
                    {
                        ...current,
                        lineLookup: '',
                    },
                    currentItem
                        ? (current.lineItems ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                        : [...(current.lineItems ?? []), nextItem],
                ),
            );
            setStatus({
                tone: 'success',
                message: currentItem ? 'Rincian penerimaan diperbarui.' : 'Rincian penerimaan ditambahkan.',
            });
        } catch (error) {
            setStatus({
                tone: 'error',
                message: error?.message ?? 'Rincian penerimaan tidak valid.',
            });
        }
    }

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui penerimaan kas.' : 'Sedang menyimpan penerimaan kas.',
            successMessage: isDetail ? 'Penerimaan kas berhasil diperbarui.' : 'Penerimaan kas berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedCashReceiptNumber()
                        : values.documentNumber;
                const payload = buildCashReceiptPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('cash-receipts', values.__backendRecordId, payload)
                    : await createBackendResource('cash-receipts', payload);

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
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus penerimaan kas.',
            successMessage: 'Penerimaan kas berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('cash-receipts', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectBankAccount: () =>
                selectLookup('accounts', 'kas atau bank', (record) =>
                    setValues((current) => ({
                        ...current,
                        __primaryAccountId: record.id,
                        bankAccounts: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveBankAccount: () =>
                setValues((current) => ({
                    ...current,
                    __primaryAccountId: null,
                    bankAccounts: [],
                })),
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) =>
                    setValues((current) => ({
                        ...current,
                        __branchId: record.id,
                        branches: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveBranch: (value) =>
                setValues((current) => ({
                    ...current,
                    __branchId: null,
                    branches: (current.branches ?? []).filter((item) => item !== value),
                })),
            onSelectLineAccount: () =>
                selectLookup('accounts', 'akun penerimaan', (record) => applyLineItemUpdate(record)),
            onEditLineItem: (item) => applyLineItemUpdate(null, item),
        }),
        [],
    );

    return (
        <>
            <div className="flex min-h-full flex-col gap-3">
                <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                    <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-[#d8dde7] px-4 py-4">
                        <div className="grid gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                            <div className="grid gap-y-3 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <TransactionFieldLabel label={config.labels.cashBank} required />
                                <ChipLookupField
                                    values={values.bankAccounts}
                                    placeholder={config.cashBankPlaceholder}
                                    onRemove={handlers.onRemoveBankAccount}
                                    searchLabel="Cari kas atau bank"
                                    onSearch={handlers.onSelectBankAccount}
                                />

                                <TransactionFieldLabel label={config.labels.entryDate} required />
                                <TransactionDateInput
                                    value={values.entryDate}
                                    onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                                />
                            </div>

                            <div className="grid gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-x-4">
                                <div className="flex items-center justify-start gap-4 sm:justify-end">
                                    <TransactionFieldLabel label={config.labels.documentNumber} required className="sm:text-right" />
                                    {!activeRecordId ? (
                                        <TransactionSwitch
                                            checked={values.autoNumber}
                                            onChange={(nextChecked) => setValues((current) => ({ ...current, autoNumber: nextChecked }))}
                                        />
                                    ) : null}
                                </div>

                                {values.autoNumber ? (
                                    <SelectField
                                        value={values.numberingType}
                                        onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        selectClassName="text-[15px] text-[#1f2436]"
                                    >
                                        {config.numberingOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </SelectField>
                                ) : (
                                    <TextInput
                                        value={values.documentNumber}
                                        readOnly
                                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                        inputClassName="text-[15px] text-[#1f2436]"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <CrudStatusMessage status={status} className="mx-3 mt-3" />

                    <div className="flex min-h-[620px] gap-3 px-2 py-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {activeSectionId === 'additional-info' ? (
                                <ReceiptInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} handlers={handlers} />
                            ) : (
                                <ReceiptLineItemsSection config={config} values={values} handlers={handlers} />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end px-3 pb-3">
                        <TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />
                    </div>
                    </div>

                    <div className="shrink-0 lg:w-[104px]">
                        <TransactionDock actions={dockActions} />
                    </div>
                </div>
            </div>
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Penerimaan Kas"
                message="Penerimaan kas ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
