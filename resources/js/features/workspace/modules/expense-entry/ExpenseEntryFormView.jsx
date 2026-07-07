import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ExpenseEntryLineItemModal from './ExpenseEntryLineItemModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
    getBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';
import { TransactionFormLayout, TransactionTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    ExpenseAdditionalInfoSection,
    ExpenseEntryHeader,
    ExpenseLineItemsSection,
    ExpenseSummarySection,
} from './ExpenseEntrySections';
import {
    applyExpenseLineItems,
    buildExpenseEntryPayload,
    buildFormState,
    buildGeneratedExpenseEntryNumber,
    buildLookupLabel,
    validateExpenseEntryValues,
    formatCurrencyValue,
    parseNumericInput,
} from './expenseEntryShared';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';

export default function ExpenseEntryFormView({
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
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const showAutoNumberSwitch = !activeRecordId;
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: 'expense-entries',
        activeRecordId,
        buildRecord,
        config,
    });
    const [values, setValues, isDirty] = useFormDraftState({
        sourceRecord,
        buildFormState,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
    });
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);

    const [lineModalOpen, setLineModalOpen] = useState(false);
    const [lineModalRecord, setLineModalRecord] = useState(null);
    const [lineModalCurrentItem, setLineModalCurrentItem] = useState(null);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [config.sectionTabs]);

    const validationMessage = useMemo(() => validateExpenseEntryValues(values, config), [config, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        handleSave,
        requestDelete,
        handleDelete,
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });



    function openLineModal(record, currentItem = null) {
        setLineModalRecord(record);
        setLineModalCurrentItem(currentItem);
        setLineModalOpen(true);
    }

    function handleSaveLineItem(modalValues) {
        const nextItem = {
            id: lineModalCurrentItem?.id ?? `draft-line-${Date.now()}`,
            __lineId: lineModalCurrentItem?.__lineId ?? null,
            __accountId: lineModalRecord?.id ?? lineModalCurrentItem?.__accountId ?? null,
            account: lineModalRecord?.code ?? lineModalCurrentItem?.account ?? '',
            accountName: modalValues.accountName,
            amount: formatCurrencyValue(modalValues.amount),
            notes: modalValues.notes,
        };

        setValues((current) =>
            applyExpenseLineItems(
                {
                    ...current,
                    lineLookup: '',
                },
                lineModalCurrentItem
                    ? (current.lineItems ?? []).map((item) => (item.id === lineModalCurrentItem.id ? nextItem : item))
                    : [...(current.lineItems ?? []), nextItem],
            ),
        );
    }

    function handleDeleteLineItem() {
        if (!lineModalCurrentItem) return;

        setValues((current) =>
            applyExpenseLineItems(
                {
                    ...current,
                    lineLookup: '',
                },
                (current.lineItems ?? []).filter((item) => item.id !== lineModalCurrentItem.id),
            ),
        );
    }

    const onSave = useCallback(async () => {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui pencatatan beban.' : 'Sedang menyimpan pencatatan beban.',
            successMessage: isDetail ? 'Pencatatan beban berhasil diperbarui.' : 'Pencatatan beban berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedExpenseEntryNumber()
                        : values.documentNumber;
                const payload = buildExpenseEntryPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('expense-entries', values.__backendRecordId, payload)
                    : await createBackendResource('expense-entries', payload);

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
                    const parsed = buildRecord ? buildRecord(record, config) : record;
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(record.id)] = parsed;
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
    }, [isDetail, values, buildRecord, config, onRefresh, activeLevel2Tab, pageId, onOpenDetail, handleSave]);

    const onRequestDelete = useCallback(() => {
        if (!values.__backendRecordId) {
            return;
        }
        requestDelete();
    }, [values.__backendRecordId, requestDelete]);

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

    async function onDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus pencatatan beban.',
            successMessage: 'Pencatatan beban berhasil dihapus.',
            execute: () => deleteBackendResource('expense-entries', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    const handlers = {
        onSelectLiabilityAccount: (record) =>
            setValues((current) => ({
                ...current,
                __liabilityAccountId: record.id,
                liabilityAccounts: [buildLookupLabel(record)],
            })),
        onRemoveLiabilityAccount: () =>
            setValues((current) => ({
                ...current,
                __liabilityAccountId: null,
                liabilityAccounts: [],
            })),
        onSelectLineAccount: (record) => {
            if (!values.__liabilityAccountId || !values.liabilityAccounts?.length) {
                showSystemErrorModal({
                    title: 'Terjadi Permasalahan pada Pemrosesan',
                    description: 'Silakan perbaiki permasalahan berikut ini:',
                    message: 'Hutang beban harus diisi',
                });
                return;
            }
            openLineModal(record, null);
        },
        onEditLineItem: (item) => {
            if (!values.__liabilityAccountId || !values.liabilityAccounts?.length) {
                showSystemErrorModal({
                    title: 'Terjadi Permasalahan pada Pemrosesan',
                    description: 'Silakan perbaiki permasalahan berikut ini:',
                    message: 'Hutang beban harus diisi',
                });
                return;
            }
            openLineModal(null, item);
        },
        onProcessPembayaran: (formValues) => {
            if (!formValues.__backendRecordId) return;

            window.__pendingImportExpenseEntry = { id: formValues.__backendRecordId };

            window.dispatchEvent(
                new CustomEvent('workspace:open-page', {
                    detail: {
                        pageId: 'cash-payment',
                        targetTabId: 'cash-payment-create',
                    },
                })
            );
        },
    };

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={
                    <ExpenseEntryHeader
                        config={config}
                        values={values}
                        setValues={setValues}
                        showAutoNumberSwitch={showAutoNumberSwitch}
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
                    <ExpenseAdditionalInfoSection config={config} values={values} setValues={setValues} handlers={handlers} />
                ) : activeSectionId === 'summary' ? (
                    <ExpenseSummarySection config={config} values={values} />
                ) : (
                    <ExpenseLineItemsSection config={config} values={values} setValues={setValues} handlers={handlers} />
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
            <ExpenseEntryLineItemModal
                open={lineModalOpen}
                onClose={() => setLineModalOpen(false)}
                lineModalRecord={lineModalRecord}
                lineModalCurrentItem={lineModalCurrentItem}
                onSave={handleSaveLineItem}
                onDelete={handleDeleteLineItem}
            />
        </>
    );
}
