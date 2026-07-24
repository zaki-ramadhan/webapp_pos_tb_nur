import { useEffect, useMemo, useState, useCallback } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { showSuccessToast, showErrorToast, showLoadingToast, updateToastToSuccess, updateToastToError } from '@/components/feedback/toast';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
    getBackendResource,
    listBackendResource,
    extractBackendRows,
} from '@/features/workspace/backend/workspaceBackendApi';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import CashPaymentAttachmentModal from './CashPaymentAttachmentModal';
import TakeExpenseEntryModal from './components/TakeExpenseEntryModal';
import TakePayrollEntryModal from './components/TakePayrollEntryModal';
import { processExpenseEntriesImport, processPayrollEntriesImport } from './cashPaymentFormUtils';
import {
    TransactionFormLayout,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import {
    CashPaymentHeader,
    PaymentInfoSection,
    PaymentLineItemsSection,
} from './CashPaymentSections';
import {
    applyCashPaymentLineItems,
    buildCashPaymentPayload,
    buildDetailRecordFromRow,
    buildFormState,
    buildGeneratedCashPaymentNumber,
    buildLookupLabel,
    validateCashPaymentValues,
    buildCashPaymentRecord,
} from './cashPaymentShared';
import MoneyMovementLineItemModal from '@/features/workspace/shared/MoneyMovementLineItemModal';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { useFormLineItems } from '@/features/workspace/shared/hooks/useFormLineItems';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';

export default function CashPaymentFormView({
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
    const buildRecord = useCallback((data, cfg) => {
        return buildCashPaymentRecord(data, cfg);
    }, []);
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'cash-payments',
        activeRecordId,
        buildRecord,
        config,
    });

    const [values, setValues, isDirty, resetForm] = useFormDraftState({
        sourceRecord,
        buildFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
    });

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateCashPaymentValues(values, config), [config, values]);

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

    const {
        lineItemModalOpen,
        setLineItemModalOpen,
        modalRecord,
        setModalRecord,
        modalCurrentItem,
        setModalCurrentItem,
        applyLineItemUpdate,
        handleSaveLineItem,
    } = useFormLineItems({
        applyLineItems: applyCashPaymentLineItems,
        setValues,
        onSuccessMessage: 'Rincian pembayaran diperbarui.',
        onDeleteMessage: 'Rincian pembayaran dihapus.',
    });

    const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
    const [takeExpenseOpen, setTakeExpenseOpen] = useState(false);
    const [takePayrollOpen, setTakePayrollOpen] = useState(false);





    const dockActions = useMemo(
        () => buildWorkspaceDockActions({
            dockActions: config.dockActions,
            isDetail,
            saveDisabled,
            saving,
            onSave,
            onDelete: onRequestDelete,
            additionalMaps: {
                print: (action) => ({
                    ...action,
                    onClick: () => window.print(),
                    items: action.items?.map((item) => ({ ...item, onClick: () => window.print() })),
                }),
                attachment: (action) => ({
                    ...action,
                    onClick: () => setAttachmentModalOpen(true),
                    items: action.items?.map((item) => ({ ...item, onClick: () => setAttachmentModalOpen(true) })),
                })
            }
        }),
        [config.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]
    );


    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui pembayaran kas.' : 'Sedang menyimpan pembayaran kas.',
            successMessage: isDetail ? 'Pembayaran kas berhasil diperbarui.' : 'Pembayaran kas berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedCashPaymentNumber()
                        : values.documentNumber;
                const payload = buildCashPaymentPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('cash-payments', values.__backendRecordId, payload)
                    : await createBackendResource('cash-payments', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();
                if (isDetail && record && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: pageId ?? (typeof page !== 'undefined' ? page?.id : null),
                                tabId: activeLevel2Tab.id,
                                label: record?.name ?? record?.full_name ?? record?.countryName ?? record?.country_name ?? record?.number ?? values?.name ?? values?.fullName ?? values?.groupName ?? '',
                            },
                        })
                    );
                }

                if (record) {
                    const parsed = buildCashPaymentRecord(record, config);
                    setLocalRecord(parsed);
                }

                if (!isDetail && record?.id) {
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
            loadingMessage: 'Sedang menghapus pembayaran kas.',
            successMessage: 'Pembayaran kas berhasil dihapus.',
            execute: () => deleteBackendResource('cash-payments', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }


    async function handleApplyExpenseEntries(selectedRecords) {
        await processExpenseEntriesImport(selectedRecords, setValues, setStatus);
    }

    useEffect(() => {
        if (!isDetail && window.__pendingImportExpenseEntry) {
            const pending = window.__pendingImportExpenseEntry;
            window.__pendingImportExpenseEntry = null;
            handleApplyExpenseEntries([pending]);
        }
        if (!isDetail && window.__pendingImportPayrollEntry) {
            const pending = window.__pendingImportPayrollEntry;
            window.__pendingImportPayrollEntry = null;
            handleApplyPayrollEntries([pending]);
        }
    }, [isDetail, activeLevel2Tab]);

    async function handleApplyPayrollEntries(selectedRecords) {
        await processPayrollEntriesImport(selectedRecords, setValues, setStatus);
    }

    const handlers = useMemo(
        () => ({
            onSelectBankAccount: () =>
                selectLookup(
                    'accounts',
                    'kas atau bank',
                    (record) =>
                        setValues((current) => ({
                            ...current,
                            __primaryAccountId: record.id,
                            bankAccounts: [buildLookupLabel(record)],
                        })),
                    buildLookupLabel,
                    { account_type: 'Cash/Bank' }
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
            onSelectLineAccount: (record) => {
                if (!values.__primaryAccountId || !values.bankAccounts?.length) {
                    window.dispatchEvent(new CustomEvent('form-validation-error', {
                        detail: { cashBank: 'Akun Kas/Bank harus diisi.' }
                    }));
                    showSystemErrorModal({
                        title: 'Terjadi Permasalahan pada Pemrosesan',
                        description: 'Silakan perbaiki permasalahan berikut ini:',
                        message: 'Akun Kas/Bank harus diisi.',
                        confirmLabel: 'OK',
                    });
                    return;
                }
                applyLineItemUpdate(record);
            },
            onEditLineItem: (item) => {
                if (!values.__primaryAccountId || !values.bankAccounts?.length) {
                    window.dispatchEvent(new CustomEvent('form-validation-error', {
                        detail: { cashBank: 'Akun Kas/Bank harus diisi.' }
                    }));
                    showSystemErrorModal({
                        title: 'Terjadi Permasalahan pada Pemrosesan',
                        description: 'Silakan perbaiki permasalahan berikut ini:',
                        message: 'Akun Kas/Bank harus diisi.',
                        confirmLabel: 'OK',
                    });
                    return;
                }
                applyLineItemUpdate(null, item);
            },
            onTakeExpenseEntry: () => {
                if (!values.__primaryAccountId) {
                    window.dispatchEvent(new CustomEvent('form-validation-error', {
                        detail: { cashBank: 'Akun Kas/Bank harus diisi.' }
                    }));
                    showSystemErrorModal({
                        title: 'Terjadi Permasalahan pada Pemrosesan',
                        description: 'Silakan perbaiki permasalahan berikut ini:',
                        message: 'Akun Kas/Bank harus diisi.',
                        confirmLabel: 'OK',
                    });
                    return;
                }
                setTakeExpenseOpen(true);
            },
            onTakePayrollEntry: () => {
                if (!values.__primaryAccountId) {
                    window.dispatchEvent(new CustomEvent('form-validation-error', {
                        detail: { cashBank: 'Akun Kas/Bank harus diisi.' }
                    }));
                    showSystemErrorModal({
                        title: 'Terjadi Permasalahan pada Pemrosesan',
                        description: 'Silakan perbaiki permasalahan berikut ini:',
                        message: 'Akun Kas/Bank harus diisi.',
                        confirmLabel: 'OK',
                    });
                    return;
                }
                setTakePayrollOpen(true);
            },
        }),
        [selectLookup, setStatus, values.__primaryAccountId],
    );

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={
                    <CashPaymentHeader
                        config={config}
                        values={values}
                        setValues={setValues}
                        activeRecordId={activeRecordId}
                        handlers={handlers}
                    />
                }
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<TransactionTotalCard label={config.totalCardLabel} value={values.totalValue} />}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'additional-info' ? (
                    <PaymentInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={Boolean(activeRecordId)}
                        handlers={handlers}
                    />
                ) : (
                    <PaymentLineItemsSection config={config} values={values} setValues={setValues} handlers={handlers} />
                )}
            </TransactionFormLayout>
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
            <CashPaymentAttachmentModal
                open={attachmentModalOpen}
                onClose={() => setAttachmentModalOpen(false)}
                values={values}
                setValues={setValues}
                setStatus={setStatus}
            />
            <MoneyMovementLineItemModal
                open={lineItemModalOpen}
                onClose={() => {
                    setLineItemModalOpen(false);
                    setModalRecord(null);
                    setModalCurrentItem(null);
                }}
                record={modalRecord}
                currentItem={modalCurrentItem}
                onSave={handleSaveLineItem}
                type="payment"
            />
            <TakeExpenseEntryModal
                open={takeExpenseOpen}
                onClose={() => setTakeExpenseOpen(false)}
                onApply={handleApplyExpenseEntries}
            />
            <TakePayrollEntryModal
                open={takePayrollOpen}
                onClose={() => setTakePayrollOpen(false)}
                onApply={handleApplyPayrollEntries}
            />
        </>
    );
}
