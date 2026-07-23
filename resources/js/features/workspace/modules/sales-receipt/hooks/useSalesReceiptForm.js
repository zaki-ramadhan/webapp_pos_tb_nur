import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    getBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

import {
    applySalesReceiptInvoices,
    buildGeneratedSalesReceiptNumber,
    buildLookupLabel,
    buildSalesReceiptFormState,
    buildSalesReceiptInvoiceFromRecord,
    buildSalesReceiptPayload,
    validateSalesReceiptValues,
} from '@/features/workspace/modules/sales-receipt/salesReceiptViewShared';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import { executeImportPendingAction } from '@/features/workspace/shared/crudFeedback';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';

export default function useSalesReceiptForm({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    buildRecord,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'sales-receipts',
        activeRecordId,
        buildRecord,
        config,
    });

    const [values, setValues, isDirty, resetForm] = useFormDraftState({
        sourceRecord,
        buildFormState: buildSalesReceiptFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
        onSync: useCallback(() => {
            setActiveInvoiceModal(null);
            setStatus({ tone: '', message: '' });
            setDeleteConfirmationOpen(false);
        }, [setStatus]),
    });
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [activeRecordId]);

    async function handleApplySalesDeposit(pendingId) {
        await executeImportPendingAction({
            loadingMessage: 'Sedang mengambil rincian uang muka penjualan...',
            successMessage: 'Berhasil memindahkan data rincian uang muka penjualan.',
            errorMessage: 'Gagal mengambil rincian uang muka penjualan.',
            action: async () => {
                const fullRecord = await getBackendResource('sales-deposits', pendingId);
                if (!fullRecord) throw new Error('Record not found');

                const outstanding = parseFloat(fullRecord.outstanding_amount ?? fullRecord.total_amount ?? 0);

                setValues((current) => {
                    const updatedInvoices = [
                        ...(current.invoices ?? []),
                        buildSalesReceiptInvoiceFromRecord(fullRecord),
                    ];

                    return applySalesReceiptInvoices(
                        {
                            ...current,
                            __customerId: fullRecord.customer_id ?? null,
                            customer: fullRecord.customer ? [buildLookupLabel(fullRecord.customer)] : [],
                            paymentAmount: String(outstanding),
                            paymentAmountDisplay: String(outstanding),
                            paymentAmountForSummary: String(outstanding),
                            invoices: updatedInvoices,
                        },
                        updatedInvoices
                    );
                });
            },
        });
    }

    async function handleApplySalesInvoice(pendingId) {
        await executeImportPendingAction({
            loadingMessage: 'Sedang mengambil rincian faktur penjualan...',
            successMessage: 'Berhasil memindahkan data rincian faktur penjualan.',
            errorMessage: 'Gagal mengambil rincian faktur penjualan.',
            action: async () => {
                const fullRecord = await getBackendResource('sales-invoices', pendingId);
                if (!fullRecord) throw new Error('Record not found');

                const outstanding = parseFloat(fullRecord.outstanding_amount ?? fullRecord.total_amount ?? 0);

                setValues((current) => {
                    const updatedInvoices = [
                        ...(current.invoices ?? []),
                        buildSalesReceiptInvoiceFromRecord(fullRecord),
                    ];

                    return applySalesReceiptInvoices(
                        {
                            ...current,
                            __customerId: fullRecord.customer_id ?? null,
                            customer: fullRecord.customer ? [buildLookupLabel(fullRecord.customer)] : [],
                            paymentAmount: String(outstanding),
                            paymentAmountDisplay: String(outstanding),
                            paymentAmountForSummary: String(outstanding),
                            invoices: updatedInvoices,
                        },
                        updatedInvoices
                    );
                });
            },
        });
    }

    useEffect(() => {
        if (!isDetail) {
            if (window.__pendingImportSalesDeposit) {
                const pending = window.__pendingImportSalesDeposit;
                window.__pendingImportSalesDeposit = null;
                if (pending && pending.id) {
                    handleApplySalesDeposit(pending.id);
                }
            } else if (window.__pendingImportSalesInvoice) {
                const pending = window.__pendingImportSalesInvoice;
                window.__pendingImportSalesInvoice = null;
                if (pending && pending.id) {
                    handleApplySalesInvoice(pending.id);
                }
            }
        }
    }, [isDetail, activeLevel2Tab]);

    const validationMessage = useMemo(() => validateSalesReceiptValues(values, config), [config, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);



    async function selectLookup(resource, title, labelBuilder, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, labelBuilder);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui penerimaan penjualan.' : 'Sedang menyimpan penerimaan penjualan.',
            successMessage: isDetail ? 'Penerimaan penjualan berhasil diperbarui.' : 'Penerimaan penjualan berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedSalesReceiptNumber()
                        : values.documentNumber;
                const payload = buildSalesReceiptPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('sales-receipts', values.__backendRecordId, payload)
                    : await createBackendResource('sales-receipts', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (record) {
                    const parsed = buildRecord ? buildRecord(record, config) : record;
                    setLocalRecord(parsed);
                }

                if (!values.__backendRecordId && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                    resetForm();
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
            loadingMessage: 'Sedang menghapus penerimaan penjualan.',
            successMessage: 'Penerimaan penjualan berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('sales-receipts', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectInvoice: () =>
                selectLookup('sales-invoices', 'faktur penjualan', (record) => buildLookupLabel(record, 'document_number'), (record) =>
                    setValues((current) =>
                        applySalesReceiptInvoices(current, [
                            ...(current.invoices ?? []),
                            buildSalesReceiptInvoiceFromRecord(record),
                        ]),
                    ),
                ),
            onSelectInvoiceRecord: (record) => {
                if (!record) return;
                setValues((current) =>
                    applySalesReceiptInvoices(current, [
                        ...(current.invoices ?? []),
                        buildSalesReceiptInvoiceFromRecord(record),
                    ]),
                );
                setStatus({ tone: '', message: '' });
            },
        }),
        [],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? config.draft?.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: isDetail ? action.tone : 'primary',
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
        [config.draft?.dockActions, isDetail, saveDisabled, saving, values.dockActions, handleSave],
    );

    return {
        activeSectionId,
        setActiveSectionId,
        activeInvoiceModal,
        setActiveInvoiceModal,
        status,
        setStatus,
        saving,
        setSaving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        values,
        setValues,
        isDetail,
        isDirty,
        isLoading,
        saveDisabled,
        dockActions,
        handlers,
        handleSave,
        handleDelete,
        requestDelete,
        validationMessage,
    };
}
