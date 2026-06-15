import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import {
    WarehouseAddressTab,
    WarehouseGeneralTab,
    WarehouseUsersTab,
} from './WarehouseSections';
import { buildFormValues } from './warehouseShared';
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

function renderDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

export default function WarehouseFormView({
    config,
    activeLevel2Tab,
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
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'warehouse-general');
    const initialValues = useMemo(() => buildFormValues(config, detailRow), [config, detailRow]);
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
        setActiveTabId(config.tabs?.[0]?.id ?? 'warehouse-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    useWorkspaceDirtyRegistration({
        pageId: 'warehouse-master',
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Gudang wajib diisi.', {
                setStatus,
                fieldErrors: { name: 'Nama Gudang wajib diisi.' },
            });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui gudang.' : 'Sedang menyimpan gudang.',
            successMessage: isDetail ? 'Gudang berhasil diperbarui.' : 'Gudang berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: detailRow?.branchId ?? 1,
                    code: isDetail ? detailRow.code : 'WH-' + values.name.trim().replace(/\s+/g, '-').toUpperCase() + '-' + Date.now(),
                    name: values.name.trim(),
                    warehouse_type: values.isDamagedWarehouse ? 'damaged' : 'main',
                    is_active: !values.inactive,
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('warehouses', detailRow.id, payload)
                    : await createBackendResource('warehouses', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
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
            loadingMessage: 'Sedang menghapus gudang.',
            successMessage: 'Gudang berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('warehouses', detailRow.id),
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
            <div className="flex h-full min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden">
                <div className="shrink-0">
                    <PreferencesTabs
                        tabs={config.tabs}
                        activeTabId={activeTabId}
                        onSelectTab={setActiveTabId}
                    />
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-5 px-4 py-4 lg:flex-row lg:items-stretch overflow-hidden">
                    <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                        <CrudStatusMessage status={status} className="mb-4 shrink-0" />
                        {activeTabId === 'warehouse-address' ? (
                            <WarehouseAddressTab config={config} values={values} onChange={handleChange} />
                        ) : activeTabId === 'warehouse-users' ? (
                            <WarehouseUsersTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
                        ) : (
                            <WarehouseGeneralTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
                        )}
                    </div>

                    <div className="order-1 flex justify-end lg:order-2 lg:shrink-0 lg:self-start">
                        <div className="flex flex-row gap-3 lg:flex-col">
                            {dockActions.map((action) => (
                                <DockActionButton
                                    key={action.id}
                                    label={action.label}
                                    tone={action.tone}
                                    icon={renderDockIcon(action.icon)}
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
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Gudang"
                message="Gudang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}

