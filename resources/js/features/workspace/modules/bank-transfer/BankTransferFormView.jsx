import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    BankTransferHeader,
    TransferFeeSection,
    TransferInfoSection,
    TransferMoneySection,
    TransferSummaryCards,
} from './BankTransferSections';
import {
    applyBankTransferComputedValues,
    buildBankTransferPayload,
    buildBankTransferSnapshot,
    buildDetailRecordFromRow,
    buildFormState,
    buildGeneratedBankTransferNumber,
    buildLookupLabel,
    promptBankTransferFeeItem,
    validateBankTransferValues,
} from './bankTransferShared';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

export default function BankTransferFormView({
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

        return config.rowMap?.[activeRecordId]
            ? buildDetailRecordFromRow(config.rowMap[activeRecordId], config)
            : config.detailRecords?.[activeRecordId] ?? config.draft;
    }, [activeRecordId, config]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord, config));
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const initialComparable = useMemo(() => buildFormState(sourceRecord, config), [config, sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord, config));
    }, [config, sourceRecord]);

    const validationMessage = useMemo(() => validateBankTransferValues(values, config), [config, values]);
    const isDirty = useMemo(
        () => !areComparableValuesEqual(buildBankTransferSnapshot(initialComparable), buildBankTransferSnapshot(values)),
        [initialComparable, values],
    );

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

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    function updateValues(nextValues) {
        setValues((currentValues) =>
            applyBankTransferComputedValues(
                typeof nextValues === 'function' ? nextValues(currentValues) : nextValues,
            ),
        );
    }

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
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
        [config.dockActions, isDetail, saveDisabled, saving, values.saveTone],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function applyFeeUpdate(record, currentItem = null) {
        try {
            const nextItem = await promptBankTransferFeeItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            updateValues((current) => ({
                ...current,
                feeLookup: '',
                feeRows: currentItem
                    ? (current.feeRows ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                    : [...(current.feeRows ?? []), nextItem],
            }));
            showSuccessToast({
                message: currentItem ? 'Biaya transfer diperbarui.' : 'Biaya transfer ditambahkan.',
            });
        } catch (error) {
            showErrorToast({
                message: error?.message ?? 'Biaya transfer tidak valid.',
            });
        }
    }

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui transfer bank.' : 'Sedang menyimpan transfer bank.',
            successMessage: isDetail ? 'Transfer bank berhasil diperbarui.' : 'Transfer bank berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedBankTransferNumber()
                        : values.documentNumber;
                const payload = buildBankTransferPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = isDetail && values.__backendRecordId
                    ? await updateBackendResource('bank-transfers', values.__backendRecordId, payload)
                    : await createBackendResource('bank-transfers', payload);

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
            loadingMessage: 'Sedang menghapus transfer bank.',
            successMessage: 'Transfer bank berhasil dihapus.',
            execute: () => deleteBackendResource('bank-transfers', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectFromBankAccount: () =>
                selectLookup('accounts', 'kas atau bank asal', (record) =>
                    updateValues((current) => ({
                        ...current,
                        __fromAccountId: record.id,
                        fromBankAccounts: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveFromBankAccount: () =>
                updateValues((current) => ({
                    ...current,
                    __fromAccountId: null,
                    fromBankAccounts: [],
                })),
            onSelectToBankAccount: () =>
                selectLookup('accounts', 'kas atau bank tujuan', (record) =>
                    updateValues((current) => ({
                        ...current,
                        __toAccountId: record.id,
                        toBankAccounts: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveToBankAccount: () =>
                updateValues((current) => ({
                    ...current,
                    __toAccountId: null,
                    toBankAccounts: [],
                })),
            onSelectFromBranch: () =>
                selectLookup('branches', 'cabang asal', (record) =>
                    updateValues((current) => ({
                        ...current,
                        __fromBranchId: record.id,
                        fromBranches: [record.name ?? record.code ?? `Cabang #${record.id}`],
                    })),
                ),
            onRemoveFromBranch: (value) =>
                updateValues((current) => ({
                    ...current,
                    __fromBranchId: null,
                    fromBranches: (current.fromBranches ?? []).filter((item) => item !== value),
                })),
            onSelectToBranch: () =>
                selectLookup('branches', 'cabang tujuan', (record) =>
                    updateValues((current) => ({
                        ...current,
                        __toBranchId: record.id,
                        toBranches: [record.name ?? record.code ?? `Cabang #${record.id}`],
                    })),
                ),
            onRemoveToBranch: (value) =>
                updateValues((current) => ({
                    ...current,
                    __toBranchId: null,
                    toBranches: (current.toBranches ?? []).filter((item) => item !== value),
                })),
            onSelectFeeAccount: () =>
                selectLookup('accounts', 'akun biaya transfer', (record) => applyFeeUpdate(record)),
            onEditFeeItem: (item) => applyFeeUpdate(null, item),
        }),
        [selectLookup],
    );

    return (
        <>
            <TransactionFormLayout
                header={<BankTransferHeader config={config} values={values} setValues={updateValues} activeRecordId={activeRecordId} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={<TransferSummaryCards values={values} />}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'fee' ? (
                    <TransferFeeSection config={config} values={values} handlers={handlers} />
                ) : activeSectionId === 'additional-info' ? (
                    <TransferInfoSection config={config} values={values} setValues={updateValues} isDetail={Boolean(activeRecordId)} />
                ) : (
                    <TransferMoneySection
                        config={config}
                        values={values}
                        setValues={updateValues}
                        handlers={handlers}
                        isDetail={Boolean(activeRecordId)}
                    />
                )}
            </TransactionFormLayout>
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Hapus Transfer Bank"
                message="Transfer bank ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
