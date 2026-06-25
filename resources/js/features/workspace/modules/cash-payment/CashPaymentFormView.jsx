import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
    getBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import CashPaymentAttachmentModal from './CashPaymentAttachmentModal';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import {
    TransactionFormLayout,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
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
    promptCashPaymentLineItem,
    validateCashPaymentValues,
    buildCashPaymentRecord,
} from './cashPaymentShared';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

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
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
    }, [activeRecordId]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        if (!activeRecordId) {
            return config.draft;
        }

        return config.rowMap?.[activeRecordId]
            ? buildDetailRecordFromRow(config.rowMap[activeRecordId], config)
            : config.detailRecords?.[activeRecordId] ?? config.draft;
    }, [activeRecordId, config, localRecord]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const initialComparable = useMemo(() => buildFormState(sourceRecord, config), [config, sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateCashPaymentValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);

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

    const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: 'primary',
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

                    if (action.id === 'print') {
                        return {
                            ...action,
                            onClick: () => window.print(),
                            items: action.items?.map((item) => ({
                                ...item,
                                onClick: () => window.print(),
                            })),
                        };
                    }

                    if (action.id === 'attachment') {
                        return {
                            ...action,
                            onClick: () => setAttachmentModalOpen(true),
                            items: action.items?.map((item) => ({
                                ...item,
                                onClick: () => setAttachmentModalOpen(true),
                            })),
                        };
                    }

                    return action;
                }),
        [config.dockActions, isDetail, saveDisabled, saving, values.saveTone],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function applyLineItemUpdate(record, currentItem = null) {
        try {
            const nextItem = await promptCashPaymentLineItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            if (nextItem.action === 'delete') {
                if (currentItem) {
                    setValues((current) =>
                        applyCashPaymentLineItems(
                            {
                                ...current,
                                lineLookup: '',
                            },
                            (current.lineItems ?? []).filter((item) => item.id !== currentItem.id),
                        ),
                    );
                    showSuccessToast({
                        message: 'Rincian pembayaran dihapus.',
                    });
                }
                return;
            }

            setValues((current) =>
                applyCashPaymentLineItems(
                    {
                        ...current,
                        lineLookup: '',
                    },
                    currentItem
                        ? (current.lineItems ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                        : [...(current.lineItems ?? []), nextItem],
                ),
            );
            showSuccessToast({
                message: currentItem ? 'Rincian pembayaran diperbarui.' : 'Rincian pembayaran ditambahkan.',
            });
        } catch (error) {
            showErrorToast({
                message: error?.message ?? 'Rincian pembayaran tidak valid.',
            });
        }
    }

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
            onSelectLineAccount: (record) => applyLineItemUpdate(record),
            onEditLineItem: (item) => applyLineItemUpdate(null, item),
            onTakeExpenseEntry: () =>
                selectLookup('expense-entries', 'Pencatatan Beban', async (record) => {
                    try {
                        const fullRecord = await getBackendResource('expense-entries', record.id);
                        if (!fullRecord) return;
                        const importedLines = (fullRecord.lines ?? []).map((line, index) => ({
                            id: `imported-expense-line-${index + 1}-${Date.now()}`,
                            __lineId: null,
                            __accountId: line.account_id ?? null,
                            accountCode: line.account?.code ?? line.reference_code ?? '',
                            accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Beban ${index + 1}`,
                            amount: formatCurrencyValue(line.total_amount ?? 0),
                        }));
                        setValues((current) =>
                            applyCashPaymentLineItems(
                                {
                                    ...current,
                                    lineItems: [...(current.lineItems ?? []), ...importedLines],
                                    notes: current.notes?.trim() ? `${current.notes}\n${fullRecord.notes ?? ''}`.trim() : (fullRecord.notes ?? ''),
                                },
                                [...(current.lineItems ?? []), ...importedLines],
                            ),
                        );
                        setStatus({
                            tone: 'success',
                            message: `Berhasil mengambil rincian dari ${fullRecord.document_number}.`,
                        });
                    } catch (err) {
                        setStatus({
                            tone: 'error',
                            message: 'Gagal mengambil rincian pencatatan beban.',
                        });
                    }
                }),
            onTakePayrollEntry: () =>
                selectLookup('payroll-entries', 'Pencatatan Gaji', async (record) => {
                    try {
                        const fullRecord = await getBackendResource('payroll-entries', record.id);
                        if (!fullRecord) return;
                        const importedLines = (fullRecord.lines ?? []).map((line, index) => ({
                            id: `imported-payroll-line-${index + 1}-${Date.now()}`,
                            __lineId: null,
                            __accountId: line.account_id ?? null,
                            accountCode: line.account?.code ?? line.reference_code ?? '',
                            accountName: line.account?.name ?? line.description ?? line.reference_code ?? `Gaji ${index + 1}`,
                            amount: formatCurrencyValue(line.total_amount ?? 0),
                        }));
                        setValues((current) =>
                            applyCashPaymentLineItems(
                                {
                                    ...current,
                                    lineItems: [...(current.lineItems ?? []), ...importedLines],
                                    notes: current.notes?.trim() ? `${current.notes}\n${fullRecord.notes ?? ''}`.trim() : (fullRecord.notes ?? ''),
                                },
                                [...(current.lineItems ?? []), ...importedLines],
                            ),
                        );
                        setStatus({
                            tone: 'success',
                            message: `Berhasil mengambil rincian dari ${fullRecord.document_number}.`,
                        });
                    } catch (err) {
                        setStatus({
                            tone: 'error',
                            message: 'Gagal mengambil rincian pencatatan gaji.',
                        });
                    }
                }),
        }),
        [selectLookup, setStatus],
    );

    return (
        <>
            <TransactionFormLayout
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
                    <PaymentInfoSection config={config} values={values} isDetail={Boolean(activeRecordId)} handlers={handlers} />
                ) : (
                    <PaymentLineItemsSection config={config} values={values} setValues={setValues} handlers={handlers} />
                )}
            </TransactionFormLayout>
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Hapus Pembayaran Kas"
                message="Pembayaran kas ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
            <CashPaymentAttachmentModal
                open={attachmentModalOpen}
                onClose={() => setAttachmentModalOpen(false)}
                values={values}
                setValues={setValues}
                setStatus={setStatus}
            />
        </>
    );
}
