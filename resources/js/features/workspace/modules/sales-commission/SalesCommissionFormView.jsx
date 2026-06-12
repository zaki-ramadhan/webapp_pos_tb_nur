import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { SalesCommissionCommissionTab, SalesCommissionOtherTab } from './SalesCommissionSections';
import { buildCommissionFormValues } from './salesCommissionShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';

export default function SalesCommissionFormView({
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRow = useMemo(
        () =>
            activeLevel2Tab?.tabType === 'detail'
                ? (config.table.rows ?? []).find((row) => String(row.id) === String(activeLevel2Tab.recordId)) ?? null
                : null,
        [activeLevel2Tab, config.table.rows],
    );
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.formTabs?.[0]?.id ?? 'commission');
    const initialValues = useMemo(() => buildCommissionFormValues(config, detailRow), [config, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [initialValues, values]
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(config.formTabs?.[0]?.id ?? 'commission');
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
        pageId: 'sales-commission',
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama perhitungan komisi wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui komisi.' : 'Sedang menyimpan komisi.',
            successMessage: isDetail ? 'Komisi berhasil diperbarui.' : 'Komisi berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: 1, // Default branch
                    document_number: isDetail ? detailRow.document_number : 'COM-' + Date.now(),
                    entry_date: new Date().toISOString().split('T')[0],
                    is_closed: values.inactive,
                    notes: values.notes || '',
                    metadata: {
                        periodType: values.periodType,
                        name: values.name.trim(),
                        sellerScope: values.sellerScope,
                        orderSelections: values.orderSelections,
                        productScope: values.productScope,
                        supplierScope: values.supplierScope,
                        conditionType: values.conditionType,
                        salesValueFrom: values.salesValueFrom,
                        salesValueTo: values.salesValueTo,
                        quantityFrom: values.quantityFrom,
                        quantityTo: values.quantityTo,
                        quantityUnit: values.quantityUnit,
                        rewardType: values.rewardType,
                        rewardValue: values.rewardValue,
                        rewardBase: values.rewardBase,
                    }
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('sales-commissions', detailRow.id, payload)
                    : await createBackendResource('sales-commissions', payload);

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
        if (!detailRow?.id || saving) {
            return;
        }
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!detailRow?.id) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus komisi.',
            successMessage: 'Komisi berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('sales-commissions', detailRow.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(detailRow.id);
                onOpenContent?.();
            },
        });
    }

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <>
            <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
                <div className="shrink-0 px-1 pt-0.5">
                    <PreferencesTabs
                        tabs={config.formTabs}
                        activeTabId={activeTabId}
                        onSelectTab={setActiveTabId}
                        className="pt-0"
                    />
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-4 rounded-[4px] border border-[#cfd6e2] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)] lg:flex-row lg:items-stretch xl:px-4 xl:py-4 overflow-hidden">
                    <div className="order-2 min-w-0 flex-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 lg:order-1">
                        <CrudStatusMessage status={status} className="mb-4 shrink-0" />
                        <div className="flex-1 min-h-0 flex flex-col">
                            {activeTabId === 'others' ? (
                                <SalesCommissionOtherTab config={config} values={values} setValues={setValues} />
                            ) : (
                                <SalesCommissionCommissionTab config={config} values={values} setValues={setValues} />
                            )}
                        </div>
                    </div>

                    <div className="order-1 flex shrink-0 flex-row justify-end gap-3 lg:order-2 lg:flex-col lg:self-start">
                        {dockActions.map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={action.icon === 'trash' ? <TrashIcon className="h-9 w-9" /> : <SaveIcon className="h-9 w-9" />}
                                loading={saving && (action.id === 'save' || action.id === 'delete')}
                                onClick={() => {
                                    if (action.id === 'save') {
                                        handleSave();
                                    } else if (action.id === 'delete') {
                                        requestDelete();
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Komisi Penjual"
                message="Komisi penjual ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
