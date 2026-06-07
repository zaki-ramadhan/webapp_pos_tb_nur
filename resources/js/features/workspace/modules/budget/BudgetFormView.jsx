import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { resolveSaveDisabledState } from '@/features/workspace/shared/formValidation';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { BudgetHeader, BudgetInfoSection, BudgetLinesSection } from './BudgetSections';
import { buildBudgetFormValues } from './budgetShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';

export default function BudgetFormView({
    page,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const config = page.budgetPage;
    
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) {
            return null;
        }
        return config.table.rows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, config.table.rows]);

    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.sectionTabs?.[0]?.id ?? 'budget-lines');
    const initialValues = useMemo(() => buildBudgetFormValues(config, detailRow), [config, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    useEffect(() => {
        setActiveTabId(config.sectionTabs?.[0]?.id ?? 'budget-lines');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config, initialValues]);

    const initialComparable = useMemo(() => {
        return {
            month: initialValues.month,
            year: initialValues.year,
            type: initialValues.type,
            branches: initialValues.branches,
            keyword: initialValues.keyword,
            notes: initialValues.notes,
            analyzer: initialValues.analyzer,
        };
    }, [initialValues]);

    const currentComparable = useMemo(
        () => ({
            month: values.month,
            year: values.year,
            type: values.type,
            branches: values.branches,
            keyword: values.keyword,
            notes: values.notes,
            analyzer: values.analyzer,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.month, value: values.month },
                    { label: config.labels.branch, value: values.branches[0] ?? '' },
                ],
                initialComparable,
                currentComparable,
            }),
        [config.labels.branch, config.labels.month, currentComparable, initialComparable, values.branches, values.month],
    );

    useWorkspaceDirtyRegistration({
        pageId: page.id,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.month) {
            rejectCrudFormAction('Bulan anggaran wajib dipilih.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui anggaran.' : 'Sedang menyimpan anggaran.',
            successMessage: isDetail ? 'Anggaran berhasil diperbarui.' : 'Anggaran berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: 1, // Default branch
                    document_number: isDetail ? detailRow.__backendRecord.document_number : 'BDG-' + Date.now(),
                    entry_date: new Date().toISOString().split('T')[0],
                    is_closed: false,
                    notes: values.notes || '',
                    metadata: {
                        month: values.month,
                        year: values.year,
                        type: values.type,
                        branches: values.branches,
                        analyzer: values.analyzer,
                    }
                };

                const response = isDetail && detailRow?.__backendRecord?.id
                    ? await updateBackendResource('budgets', detailRow.__backendRecord.id, payload)
                    : await createBackendResource('budgets', payload);

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
            loadingMessage: 'Sedang menghapus anggaran.',
            successMessage: 'Anggaran berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('budgets', detailRow.__backendRecord.id),
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
                    tone: 'muted',
                    disabled: saveDisabled || saving,
                    onClick: handleSave,
                };
            }
            return {
                ...action,
                tone: action.tone === 'green' ? 'success' : action.tone,
            };
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
                header={<BudgetHeader config={config} values={values} setValues={setValues} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeTabId}
                onSectionChange={setActiveTabId}
                dockActions={dockActions}
            >
                {activeTabId === 'budget-info' ? (
                    <BudgetInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <BudgetLinesSection config={config} values={values} setValues={setValues} />
                )}
            </TransactionFormLayout>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Anggaran"
                message="Anggaran ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
