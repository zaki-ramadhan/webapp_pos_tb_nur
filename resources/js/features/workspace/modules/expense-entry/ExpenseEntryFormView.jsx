import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout, TransactionTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
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
    promptExpenseLineItem,
    validateExpenseEntryValues,
} from './expenseEntryShared';

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
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const showAutoNumberSwitch = !activeRecordId;
    const sourceRecord = useMemo(() => {
        if (activeRecordId) {
            const row = config.rowMap?.[activeRecordId];

            if (row?.__backendRecord && buildRecord) {
                return buildRecord(row.__backendRecord, config);
            }

            return config.records?.[activeRecordId] ?? config.draft;
        }

        return config.draft;
    }, [activeRecordId, buildRecord, config]);
    const [values, setValues] = useState(() => buildFormState(sourceRecord));
    const isDetail = Boolean(values.__backendRecordId ?? activeRecordId);
    const initialComparable = useMemo(() => buildFormState(sourceRecord), [sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormState(sourceRecord));
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateExpenseEntryValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(() => {
        const baseActions = config.dockActions ?? [];

        return baseActions
            .filter((action) => (isDetail ? true : action.id !== 'delete'))
            .map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        tone: values.saveTone,
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
            });
    }, [config.dockActions, isDetail, saveDisabled, saving, values.saveTone]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function selectLookup(resource, title, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, buildLookupLabel);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    function applyLineItemUpdate(record, currentItem = null) {
        try {
            const nextItem = promptExpenseLineItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            setValues((current) =>
                applyExpenseLineItems(
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
                message: currentItem ? 'Rincian beban diperbarui.' : 'Rincian beban ditambahkan.',
            });
        } catch (error) {
            setStatus({
                tone: 'error',
                message: error?.message ?? 'Rincian beban tidak valid.',
            });
        }
    }

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui pencatatan beban.' : 'Sedang menyimpan pencatatan beban.',
            successMessage: isDetail ? 'Pencatatan beban berhasil diperbarui.' : 'Pencatatan beban berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
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
            loadingMessage: 'Sedang menghapus pencatatan beban.',
            successMessage: 'Pencatatan beban berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('expense-entries', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
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
        }),
        [],
    );

    return (
        <>
            <TransactionFormLayout
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
                onConfirm={handleDelete}
                title="Hapus Pencatatan Beban"
                message="Pencatatan beban ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
