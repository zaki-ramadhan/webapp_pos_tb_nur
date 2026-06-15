import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
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
} from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';
import {
    TransactionDateInput,
    TransactionDock,
    TransactionFieldLabel,
    TransactionSectionRail,
    TransactionSwitch,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    ReceiptInfoSection,
    ReceiptLineItemsSection,
} from '@/features/workspace/modules/cash-receipt/components/CashReceiptFormSections';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

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
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateCashReceiptValues(values, config), [config, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        selectLookup,
        handleSave,
        requestDelete,
        handleDelete,
    } = useTransactionForm({ validationMessage });

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
                            onClick: onSave,
                        };
                    }

                    if (action.id === 'delete') {
                        return {
                            ...action,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: onRequestDelete,
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

    async function applyLineItemUpdate(record, currentItem = null) {
        try {
            const nextItem = await promptCashReceiptLineItem(record, currentItem);

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

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui penerimaan kas.' : 'Sedang menyimpan penerimaan kas.',
            successMessage: isDetail ? 'Penerimaan kas berhasil diperbarui.' : 'Penerimaan kas berhasil dibuat.',
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

    function onRequestDelete() {
        if (!values.__backendRecordId) {
            return;
        }
        requestDelete();
    }

    async function onDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus penerimaan kas.',
            successMessage: 'Penerimaan kas berhasil dihapus.',
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
        [selectLookup],
    );

    return (
        <>
            <div className="flex min-h-full flex-col gap-3">
                <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                    <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                        <div className="border-b border-[#d8dde7] px-4 py-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-y-4 gap-x-8">
                                <div className="flex flex-col gap-y-3 w-full md:max-w-[480px]">
                                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                                        <TransactionFieldLabel label={config.labels.cashBank} required htmlFor="cashBank" />
                                        <div className="max-w-[320px] w-full">
                                            <ChipLookupField
                                                id="cashBank"
                                                values={values.bankAccounts}
                                                placeholder={config.cashBankPlaceholder}
                                                onRemove={handlers.onRemoveBankAccount}
                                                searchLabel="Cari kas atau bank"
                                                onSearch={handlers.onSelectBankAccount}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                                        <TransactionFieldLabel label={config.labels.entryDate} required htmlFor="entryDate" />
                                        <TransactionDateInput
                                            id="entryDate"
                                            value={values.entryDate}
                                            onChange={(nextValue) => setValues((current) => ({ ...current, entryDate: nextValue }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-y-3 w-full md:max-w-[480px]">
                                    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 w-full">
                                        <div className="flex items-center justify-start gap-4">
                                            <TransactionFieldLabel label={config.labels.documentNumber} required htmlFor="documentNumber" />
                                            {!activeRecordId ? (
                                                <TransactionSwitch
                                                    checked={values.autoNumber}
                                                    onChange={(nextChecked) => setValues((current) => ({ ...current, autoNumber: nextChecked }))}
                                                />
                                            ) : null}
                                        </div>

                                        <div className="max-w-[240px] w-full">
                                            {values.autoNumber ? (
                                                <SelectField
                                                    id="documentNumber"
                                                    value={values.numberingType}
                                                    onChange={(event) => setValues((current) => ({ ...current, numberingType: event.target.value }))}
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
                                                    id="documentNumber"
                                                    value={values.documentNumber}
                                                    readOnly
                                                    className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                                                    inputClassName="text-xs sm:text-sm text-[#1f2436]"
                                                />
                                            )}
                                        </div>
                                    </div>
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

                    <div className="shrink-0 lg:w-[96px]">
                        <TransactionDock actions={dockActions} />
                    </div>
                </div>
            </div>
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
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
