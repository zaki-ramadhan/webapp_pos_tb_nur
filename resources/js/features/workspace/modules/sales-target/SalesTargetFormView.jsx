import { useEffect, useMemo, useState } from 'react';

import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import TargetDetailEntryModal from '@/features/workspace/modules/sales-target/TargetDetailEntryModal';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { resolveSaveDisabledState } from '@/features/workspace/shared/formValidation';
import { SalesTargetAdditionalInfoSection, SalesTargetDetailsSection, SalesTargetHeader } from './SalesTargetSections';
import { buildTargetState, findTargetRecord } from './salesTargetShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';

export default function SalesTargetFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRecord = useMemo(() => findTargetRecord(config, activeLevel2Tab), [activeLevel2Tab, config]);
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildTargetState(detailRecord ?? config.draft, config));
    const [activeModalRow, setActiveModalRow] = useState(null);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetail = Boolean(detailRecord);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildTargetState(detailRecord ?? config.draft, config));
        setActiveModalRow(null);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config, detailRecord]);

    const initialComparable = useMemo(
        () => ({
            name: (detailRecord ?? config.draft)?.name ?? '',
            targetType: (detailRecord ?? config.draft)?.targetType ?? '',
            branch: (detailRecord ?? config.draft)?.branch ?? '',
            startDate: (detailRecord ?? config.draft)?.startDate ?? '',
            endDate: (detailRecord ?? config.draft)?.endDate ?? '',
            notes: (detailRecord ?? config.draft)?.notes ?? '',
            analyst: (detailRecord ?? config.draft)?.analyst ?? '',
            detailRows: (detailRecord ?? config.draft)?.detailConfig?.rows ?? [],
        }),
        [config.draft, detailRecord],
    );

    const currentComparable = useMemo(
        () => ({
            name: values.name,
            targetType: values.targetType,
            branch: values.branch,
            startDate: values.startDate,
            endDate: values.endDate,
            notes: values.notes,
            analyst: values.analyst,
            detailRows: values.detailRows,
        }),
        [values],
    );

    const { isDirty, saveDisabled } = useMemo(
        () =>
            resolveSaveDisabledState({
                checks: [
                    { label: config.labels.name, value: values.name },
                    { label: config.labels.endDate, value: values.endDate },
                ],
                initialComparable,
                currentComparable,
            }),
        [config.labels.endDate, config.labels.name, currentComparable, initialComparable, values.endDate, values.name],
    );

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Target wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui target.' : 'Sedang menyimpan target.',
            successMessage: isDetail ? 'Target berhasil diperbarui.' : 'Target berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: 1,
                    document_number: isDetail ? detailRecord.document_number : 'TRG-' + Date.now(),
                    entry_date: new Date().toISOString().split('T')[0],
                    notes: values.notes || '',
                    is_closed: false,
                    metadata: {
                        name: values.name.trim(),
                        targetType: values.targetType,
                        branch: values.branch,
                        startDate: values.startDate,
                        endDate: values.endDate,
                        notes: values.notes,
                        analyst: values.analyst,
                        detailConfig: {
                            title: values.detailTitle,
                            searchPlaceholder: values.detailSearchPlaceholder,
                            columns: values.detailColumns,
                            rows: values.detailRows,
                            modal: values.detailModal,
                        }
                    }
                };

                const response = isDetail && detailRecord?.id
                    ? await updateBackendResource('sales-targets', detailRecord.id, payload)
                    : await createBackendResource('sales-targets', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.metadata?.name ?? record.document_number ?? values.name.trim(),
                        tabLabel: record.metadata?.name ?? record.document_number ?? values.name.trim(),
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!detailRecord?.id || saving) {
            return;
        }
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!detailRecord?.id) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus target.',
            successMessage: 'Target berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('sales-targets', detailRecord.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(detailRecord.id);
                onOpenContent?.();
            },
        });
    }

    const dockActions = useMemo(() => {
        const baseActions = isDetail ? config.detailDockActions : config.createDockActions;

        return (baseActions ?? []).map((action) => {
            if (action.id === 'save') {
                return {
                    ...action,
                    disabled: saveDisabled || saving,
                    onClick: handleSave,
                };
            }
            if (action.id === 'delete') {
                return {
                    ...action,
                    disabled: saving,
                    onClick: requestDelete,
                };
            }
            return action;
        });
    }, [config.createDockActions, config.detailDockActions, isDetail, saveDisabled, saving]);

    return (
        <>
            <CrudStatusMessage status={status} className="mb-4" />
            <TransactionFormLayout
                header={<SalesTargetHeader config={config} values={values} setValues={setValues} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                {activeSectionId === 'additional-info' ? (
                    <SalesTargetAdditionalInfoSection config={config} values={values} setValues={setValues} />
                ) : (
                    <SalesTargetDetailsSection values={values} setValues={setValues} onOpenModal={setActiveModalRow} />
                )}
            </TransactionFormLayout>
            <TargetDetailEntryModal
                open={Boolean(activeModalRow)}
                modal={values.detailModal}
                row={activeModalRow}
                onClose={() => setActiveModalRow(null)}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Target Penjualan"
                message="Target penjualan ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
