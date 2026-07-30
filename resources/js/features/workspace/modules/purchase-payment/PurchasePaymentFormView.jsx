import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import PurchasePaymentInvoiceModal from '@/features/workspace/modules/purchase-payment/PurchasePaymentInvoiceModal';
import PurchasePaymentUnpaidInvoicesModal from '@/features/workspace/modules/purchase-payment/PurchasePaymentUnpaidInvoicesModal';
import {
    TransactionDualTotalCard,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
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
                <CrudStatusMessage status={status} className="mb-4" />
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
