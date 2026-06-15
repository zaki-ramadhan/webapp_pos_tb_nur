import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    resolveDocumentRequirementValue,
    resolveSaveDisabledState,
} from '@/features/workspace/shared/formValidation';
import { BudgetTransferHeader, TransferDetailsSection, TransferInfoSection } from './BudgetTransferSections';
import { buildInitialValues } from './budgetTransferShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';

export default function BudgetTransferFormView({
    pageId,
    activeLevel2Tab,
    config,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) {
            return null;
        }
        return config.table.rows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, config.table.rows]);

    const isDetail = Boolean(detailRow);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const initialValues = useMemo(() => buildInitialValues(config, detailRow), [config, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const initialComparable = useMemo(() => {
        return {
            year: initialValues.year,
            type: initialValues.type,
            branches: initialValues.branches,
            autoNumber: initialValues.autoNumber,
            numberingType: initialValues.numberingType,
            transferNumber: initialValues.transferNumber,
            date: initialValues.date,
            fromMonth: initialValues.fromMonth,
            fromBudget: initialValues.fromBudget,
            transferAmount: initialValues.transferAmount,
            toMonth: initialValues.toMonth,
            toBudget: initialValues.toBudget,
            notes: initialValues.notes,
        };
    }, [initialValues]);

    const currentComparable = useMemo(
        () => ({
            year: values.year,
            type: values.type,
            branches: values.branches,
            autoNumber: values.autoNumber,
            numberingType: values.numberingType,
            transferNumber: values.transferNumber,
            date: values.date,
            fromMonth: values.fromMonth,
            fromBudget: values.fromBudget,
            transferAmount: values.transferAmount,
            toMonth: values.toMonth,
            toBudget: values.toBudget,
            notes: values.notes,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.year, value: values.year },
                    { label: config.labels.branch, type: 'array', value: values.branches },
                    {
                        label: config.labels.transferNumber,
                        value: resolveDocumentRequirementValue(values.autoNumber, values.numberingType, values.transferNumber),
                    },
                    { label: config.labels.date, value: values.date },
                    { label: `${config.fromTitle} - ${config.labels.month}`, value: values.fromMonth },
                    { label: `${config.fromTitle} - ${config.labels.budget}`, value: values.fromBudget },
                    { label: config.labels.transferAmount, value: values.transferAmount },
                    { label: `${config.toTitle} - ${config.labels.month}`, value: values.toMonth },
                    { label: `${config.toTitle} - ${config.labels.budget}`, value: values.toBudget },
                ],
                initialComparable,
                currentComparable,
            }),
        [
            config.fromTitle,
            config.labels.branch,
            config.labels.budget,
            config.labels.date,
            config.labels.month,
            config.labels.transferAmount,
            config.labels.transferNumber,
            config.labels.year,
            config.toTitle,
            currentComparable,
            initialComparable,
            values.autoNumber,
            values.branches,
            values.date,
            values.fromBudget,
            values.fromMonth,
            values.numberingType,
            values.toBudget,
            values.toMonth,
            values.transferAmount,
            values.transferNumber,
            values.year,
        ],
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.transferAmount) {
            rejectCrudFormAction('Nilai transfer wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui transfer anggaran.' : 'Sedang menyimpan transfer anggaran.',
            successMessage: isDetail ? 'Transfer anggaran berhasil diperbarui.' : 'Transfer anggaran berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: 1,
                    document_number: values.autoNumber
                        ? (isDetail ? detailRow.__backendRecord.document_number : 'TRSF-' + Date.now())
                        : values.transferNumber,
                    entry_date: values.date,
                    notes: values.notes || '',
                    is_closed: false,
                    metadata: {
                        year: values.year,
                        type: values.type,
                        branches: values.branches,
                        autoNumber: values.autoNumber,
                        numberingType: values.numberingType,
                        date: values.date,
                        fromMonth: values.fromMonth,
                        fromBudget: values.fromBudget,
                        remainingBudget: values.remainingBudget,
                        transferAmount: values.transferAmount,
                        toMonth: values.toMonth,
                        toBudget: values.toBudget,
                        notes: values.notes,
                    }
                };

                const response = isDetail && detailRow?.__backendRecord?.id
                    ? await updateBackendResource('budget-transfers', detailRow.__backendRecord.id, payload)
                    : await createBackendResource('budget-transfers', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number,
                        tabLabel: record.document_number,
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!detailRow?.__backendRecord?.id || saving) {
            return;
        }
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!detailRow?.__backendRecord?.id) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus transfer anggaran.',
            successMessage: 'Transfer anggaran berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('budget-transfers', detailRow.__backendRecord.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(detailRow.id);
                onOpenContent?.();
            },
        });
    }

    const dockActions = useMemo(() => {
        const baseActions = (config.dockActions ?? []).map((action) => {
            if (action.id === 'save') {
                return {
                    ...action,
                    disabled: saveDisabled || saving,
                    onClick: handleSave,
                };
            }
            return action;
        });

        if (isDetail) {
            return [
                ...baseActions,
                {
                    id: 'delete',
                    label: 'Hapus',
                    icon: 'trash',
                    tone: 'danger',
                    onClick: requestDelete,
                    disabled: saving,
                }
            ];
        }

        return baseActions;
    }, [config.dockActions, isDetail, saveDisabled, saving]);

    return (
        <>
            <CrudStatusMessage status={status} className="mb-4" />
            <TransactionFormLayout
                header={<BudgetTransferHeader config={config} values={values} setValues={setValues} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <TransferInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <TransferDetailsSection config={config} values={values} setValues={setValues} />
                )}
            </TransactionFormLayout>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Transfer Anggaran"
                message="Transfer anggaran ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
