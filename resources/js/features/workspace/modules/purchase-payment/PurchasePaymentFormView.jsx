import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import PurchasePaymentInvoiceModal from '@/features/workspace/modules/purchase-payment/PurchasePaymentInvoiceModal';
import PurchasePaymentUnpaidInvoicesModal from '@/features/workspace/modules/purchase-payment/PurchasePaymentUnpaidInvoicesModal';
import {
    TransactionDualTotalCard,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    PurchasePaymentAdditionalInfoSection,
    PurchasePaymentDetailsSection,
    PurchasePaymentHeader,
    PurchasePaymentInfoSection,
} from './PurchasePaymentSections';
import {
    applyPurchasePaymentInvoices,
    buildFormState,
    buildGeneratedPurchasePaymentNumber,
    buildLookupLabel,
    buildPurchasePaymentInvoiceFromRecord,
    buildPurchasePaymentPayload,
    validatePurchasePaymentValues,
} from './purchasePaymentShared';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import { handleFormSaveSuccess } from '@/features/workspace/shared/crudFormActions';

export default function PurchasePaymentFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    buildRecord,
}) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'purchase-payments',
        activeRecordId,
        buildRecord,
        config,
    });
    const isDetail = Boolean(activeRecordId);
    const sectionTabs = isDetail ? config.detailSectionTabs : config.sectionTabs;
    const [activeSectionId, setActiveSectionId] = useState(sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues, isDirty, resetForm] = useFormDraftState({
        sourceRecord,
        buildFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
        onSync: useCallback(() => setActiveInvoice(null), []),
    });
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [unpaidInvoicesModalOpen, setUnpaidInvoicesModalOpen] = useState(false);

    useEffect(() => {
        setActiveSectionId((isDetail ? config.detailSectionTabs : config.sectionTabs)?.[0]?.id ?? 'details');
    }, [activeRecordId]);

    const applyInitialValues = useCallback((initVals) => {
        if (!initVals || isDetail) return;
        setValues((current) => {
            let nextInvoices = current.invoices ?? [];
            if (initVals.invoices?.length) {
                const incomingIds = new Set(initVals.invoices.map((i) => String(i.id)));
                nextInvoices = [
                    ...nextInvoices.filter((i) => !incomingIds.has(String(i.id))),
                    ...initVals.invoices,
                ];
            }
            const updated = applyPurchasePaymentInvoices(current, nextInvoices);
            return {
                ...updated,
                __supplierId: initVals.__supplierId ?? updated.__supplierId,
                payee: initVals.payee?.length ? initVals.payee : (initVals.supplier ? [initVals.supplier] : updated.payee),
            };
        });

        if (initVals.invoiceRecordId) {
            getBackendResource('purchase-invoices', initVals.invoiceRecordId).then((res) => {
                const invoiceRecord = res?.data;
                if (invoiceRecord) {
                    const supplierName = invoiceRecord.supplier?.name || invoiceRecord.customer?.name || invoiceRecord.contact?.name || invoiceRecord.supplier_name;
                    const supplierId = invoiceRecord.supplier_id || invoiceRecord.customer_id || invoiceRecord.contact_id;
                    setValues((current) => {
                        const existing = current.invoices ?? [];
                        const withoutCurrent = existing.filter((inv) => String(inv.id) !== String(invoiceRecord.id) && String(inv.__relatedDocumentId) !== String(invoiceRecord.id));
                        const updated = applyPurchasePaymentInvoices(current, [
                            ...withoutCurrent,
                            buildPurchasePaymentInvoiceFromRecord(invoiceRecord),
                        ]);
                        return {
                            ...updated,
                            __supplierId: supplierId ?? updated.__supplierId,
                            payee: supplierName ? [supplierName] : updated.payee,
                        };
                    });
                }
            }).catch(() => null);
        }
    }, [isDetail, setValues]);

    useEffect(() => {
        if (!isDetail && typeof window !== 'undefined' && window.__pendingInitialValues?.['purchase-payment']) {
            const pending = window.__pendingInitialValues['purchase-payment'];
            window.__pendingInitialValues['purchase-payment'] = null;
            applyInitialValues(pending);
        }
    }, [isDetail, applyInitialValues, activeLevel2Tab]);

    useEffect(() => {
        function handleInitialValues(e) {
            if (e.detail?.pageId === 'purchase-payment' && e.detail?.initialValues && !isDetail) {
                applyInitialValues(e.detail.initialValues);
            }
        }
        window.addEventListener('workspace:set-initial-values', handleInitialValues);
        return () => window.removeEventListener('workspace:set-initial-values', handleInitialValues);
    }, [isDetail, applyInitialValues]);

    useEffect(() => {
        function applyInvoiceImport(pendingId) {
            if (!pendingId || isDetail) return;
            getBackendResource('purchase-invoices', pendingId).then((res) => {
                const invoiceRecord = res?.data;
                if (invoiceRecord) {
                    const supplierName = invoiceRecord.supplier?.name || invoiceRecord.customer?.name || invoiceRecord.contact?.name || invoiceRecord.supplier_name;
                    const supplierId = invoiceRecord.supplier_id || invoiceRecord.customer_id || invoiceRecord.contact_id;
                    setValues((current) => {
                        const existingInvoices = current.invoices ?? [];
                        const withoutCurrent = existingInvoices.filter((inv) => String(inv.id) !== String(invoiceRecord.id) && String(inv.__relatedDocumentId) !== String(invoiceRecord.id));
                        const updated = applyPurchasePaymentInvoices(current, [
                            ...withoutCurrent,
                            buildPurchasePaymentInvoiceFromRecord(invoiceRecord),
                        ]);
                        return {
                            ...updated,
                            __supplierId: supplierId ?? updated.__supplierId,
                            payee: supplierName ? [supplierName] : updated.payee,
                        };
                    });
                }
            }).catch(() => null);
        }

        if (!isDetail && typeof window !== 'undefined' && window.__pendingImportPurchaseInvoice) {
            const pending = window.__pendingImportPurchaseInvoice;
            window.__pendingImportPurchaseInvoice = null;
            if (pending?.id) {
                applyInvoiceImport(pending.id);
            }
        }

        function handleImportEvent(e) {
            const pendingId = e.detail?.id;
            if (pendingId) {
                applyInvoiceImport(pendingId);
            }
        }

        window.addEventListener('workspace:import-purchase-invoice', handleImportEvent);
        return () => window.removeEventListener('workspace:import-purchase-invoice', handleImportEvent);
    }, [isDetail, setValues, activeLevel2Tab]);

    const validationMessage = useMemo(() => validatePurchasePaymentValues(values, config), [config, values]);

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
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });



    const dockActions = useMemo(
        () => buildWorkspaceDockActions({
            dockActions: values.dockActions ?? config.draft?.dockActions,
            isDetail,
            saveDisabled,
            saving,
            onSave,
            onDelete: onRequestDelete
        }),
        [values.dockActions, config.draft?.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]
    );

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui pembayaran pembelian.' : 'Sedang menyimpan pembayaran pembelian.',
            successMessage: isDetail ? 'Pembayaran pembelian berhasil diperbarui.' : 'Pembayaran pembelian berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedPurchasePaymentNumber()
                        : values.documentNumber;
                const payload = buildPurchasePaymentPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('purchase-payments', values.__backendRecordId, payload)
                    : await createBackendResource('purchase-payments', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: (params) =>
                handleFormSaveSuccess({
                    ...params,
                    pageId,
                    resourceKey: 'purchase-payments',
                    onRefresh,
                    buildRecord,
                    config,
                    setLocalRecord,
                    resetForm,
                    activeLevel2Tab,
                    isDetail: Boolean(values.__backendRecordId),
                    onOpenDetail,
                }),
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
            loadingMessage: 'Sedang menghapus pembayaran pembelian.',
            successMessage: 'Pembayaran pembelian berhasil dihapus.',
            execute: () => deleteBackendResource('purchase-payments', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    const appendInvoiceRecord = useCallback((record) => {
        setValues((current) =>
            applyPurchasePaymentInvoices(current, [
                ...(current.invoices ?? []),
                buildPurchasePaymentInvoiceFromRecord(record),
            ]),
        );
    }, [setValues]);

    const handlers = useMemo(
        () => ({
            onSelectPayee: () =>
                selectLookup('suppliers', 'pemasok', (record) =>
                    setValues((current) => ({
                        ...current,
                        __supplierId: record.id,
                        payee: [buildLookupLabel(record)],
                    })),
                ),
            onRemovePayee: () =>
                setValues((current) => ({
                    ...current,
                    __supplierId: null,
                    payee: [],
                })),
            onSelectBankAccount: () =>
                selectLookup('accounts', 'bank pembayaran', (record) =>
                    setValues((current) => ({
                        ...current,
                        __bankAccountId: record.id,
                        bankAccounts: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveBankAccount: () =>
                setValues((current) => ({
                    ...current,
                    __bankAccountId: null,
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
            onSelectInvoice: () =>
                selectLookup(
                    'purchase-invoices',
                    'faktur pembelian',
                    appendInvoiceRecord,
                    (record) => buildLookupLabel(record, 'document_number')
                ),
            onSelectInvoiceRecord: appendInvoiceRecord,
            onOpenUnpaidInvoicesModal: () => setUnpaidInvoicesModalOpen(true),
            onConfirmUnpaidInvoices: (selectedRecords) => {
                if (!selectedRecords?.length) return;
                selectedRecords.forEach(appendInvoiceRecord);
            },
        }),
        [selectLookup, appendInvoiceRecord, setValues],
    );

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={<PurchasePaymentHeader config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />}
                sectionTabs={sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={
                    <TransactionDualTotalCard
                        items={[
                            { label: 'Nilai Pembayaran', value: values.footerPaymentValue },
                            { label: 'Faktur Dibayar', value: values.footerInvoiceValue },
                        ]}
                    />
                }
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <PurchasePaymentAdditionalInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />
                ) : activeSectionId === 'payment-info' ? (
                    <PurchasePaymentInfoSection config={config} values={values} />
                ) : (
                    <PurchasePaymentDetailsSection
                        config={config}
                        values={values}
                        isDetail={isDetail}
                        onOpenInvoice={setActiveInvoice}
                        handlers={handlers}
                    />
                )}
            </TransactionFormLayout>

            <PurchasePaymentUnpaidInvoicesModal
                open={unpaidInvoicesModalOpen}
                onClose={() => setUnpaidInvoicesModalOpen(false)}
                onConfirm={handlers.onConfirmUnpaidInvoices}
                supplierId={values.__supplierId}
            />
            <PurchasePaymentInvoiceModal
                open={Boolean(activeInvoice)}
                onClose={() => setActiveInvoice(null)}
                modal={values.modal}
                invoice={activeInvoice}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </>
    );
}
