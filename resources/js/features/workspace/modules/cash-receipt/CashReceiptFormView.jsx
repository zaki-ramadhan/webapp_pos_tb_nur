import { useEffect, useMemo, useState, useCallback } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import MoneyMovementLineItemModal from '@/features/workspace/shared/MoneyMovementLineItemModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    buildCashReceiptDetailRecordFromRow,
    buildCashReceiptFormState,
    buildCashReceiptPayload,
    buildGeneratedCashReceiptNumber,
    buildLookupLabel,
    applyCashReceiptLineItems,
    validateCashReceiptValues,
    buildCashReceiptRecord,
} from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';
import {
    TransactionFormLayout,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    ReceiptInfoSection,
    ReceiptLineItemsSection,
    CashReceiptHeader,
} from '@/features/workspace/modules/cash-receipt/components/CashReceiptFormSections';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { useFormLineItems } from '@/features/workspace/shared/hooks/useFormLineItems';

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
    const buildRecord = useCallback((data, cfg) => {
        return buildCashReceiptRecord(data, cfg);
    }, []);
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'cash-receipts',
        activeRecordId,
        buildRecord,
        config,
    });

    const [values, setValues, isDirty] = useFormDraftState({
        sourceRecord,
        buildFormState: buildCashReceiptFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
    });

    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
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
        applyLineItems: applyCashReceiptLineItems,
        setValues,
        onSuccessMessage: 'Rincian penerimaan diperbarui.',
        onDeleteMessage: 'Rincian penerimaan dihapus.',
    });



    const dockActions = useMemo(
        () => buildWorkspaceDockActions({
            dockActions: config.dockActions,
            isDetail,
            saveDisabled,
            saving,
            onSave,
            onDelete: onRequestDelete
        }),
        [config.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]
    );


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
                    const parsed = buildCashReceiptRecord(record, config);
                    setLocalRecord(parsed);
                }

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
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
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
        }),
        [selectLookup, values.__primaryAccountId, values.bankAccounts],
    );

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={
                    <CashReceiptHeader
                        config={config}
                        values={values}
                        setValues={setValues}
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
                    <ReceiptInfoSection
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={Boolean(activeRecordId)}
                        handlers={handlers}
                    />
                ) : (
                    <ReceiptLineItemsSection config={config} values={values} setValues={setValues} handlers={handlers} />
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
                type="receipt"
            />
        </>
    );
}
