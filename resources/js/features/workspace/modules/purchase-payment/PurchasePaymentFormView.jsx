import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import PurchasePaymentInvoiceModal from '@/features/workspace/modules/purchase-payment/PurchasePaymentInvoiceModal';
import {
    TransactionDualTotalCard,
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
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
    const sourceRecord = useMemo(() => {
        if (!activeRecordId) {
            return config.draft;
        }

        const row = config.rowMap?.[activeRecordId];

        if (row?.__backendRecord && buildRecord) {
            return buildRecord(row.__backendRecord, config);
        }

        return config.detailRecords?.[activeRecordId] ?? config.draft;
    }, [activeRecordId, buildRecord, config]);
    const isDetail = Boolean(activeRecordId);
    const sectionTabs = isDetail ? config.detailSectionTabs : config.sectionTabs;
    const [activeSectionId, setActiveSectionId] = useState(sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const initialComparable = useMemo(() => buildFormState(sourceRecord, config), [config, sourceRecord]);

    useEffect(() => {
        setActiveSectionId((isDetail ? config.detailSectionTabs : config.sectionTabs)?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
        setActiveInvoice(null);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config, isDetail, sourceRecord]);

    const validationMessage = useMemo(() => validatePurchasePaymentValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

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
        [config.draft?.dockActions, isDetail, saveDisabled, saving, values.dockActions],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

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
            loadingMessage: isDetail ? 'Sedang memperbarui pembayaran pembelian.' : 'Sedang menyimpan pembayaran pembelian.',
            successMessage: isDetail ? 'Pembayaran pembelian berhasil diperbarui.' : 'Pembayaran pembelian berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
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
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (!values.__backendRecordId && record?.id) {
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
            loadingMessage: 'Sedang menghapus pembayaran pembelian.',
            successMessage: 'Pembayaran pembelian berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('purchase-payments', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectPayee: () =>
                selectLookup('suppliers', 'pemasok', (record) => buildLookupLabel(record), (record) =>
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
                selectLookup('accounts', 'bank pembayaran', (record) => buildLookupLabel(record), (record) =>
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
                selectLookup('branches', 'cabang', (record) => buildLookupLabel(record), (record) =>
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
                selectLookup('purchase-invoices', 'faktur pembelian', (record) => buildLookupLabel(record, 'document_number'), (record) =>
                    setValues((current) =>
                        applyPurchasePaymentInvoices(current, [
                            ...(current.invoices ?? []),
                            buildPurchasePaymentInvoiceFromRecord(record),
                        ]),
                    ),
                ),
        }),
        [],
    );

    return (
        <>
            <TransactionFormLayout
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
                    <PurchasePaymentAdditionalInfoSection config={config} values={values} isDetail={isDetail} handlers={handlers} />
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

            <PurchasePaymentInvoiceModal
                open={Boolean(activeInvoice)}
                onClose={() => setActiveInvoice(null)}
                modal={values.modal}
                invoice={activeInvoice}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Pembayaran Pembelian"
                message="Pembayaran pembelian ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
