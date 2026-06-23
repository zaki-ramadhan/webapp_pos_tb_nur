import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import {
    WarehouseAddressTab,
    WarehouseGeneralTab,
    WarehouseUsersTab,
} from './WarehouseSections';
import { buildFormValues } from './warehouseShared';

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

    useFormValuesSync({
        initialValues,
        recordId: detailRow?.id ?? null,
        isDirty,
        setValues,
    });

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

    return (
        <ModuleFormTemplate
            form={{
                tabs: config.tabs,
                saveLabel: config.saveLabel,
            }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saving || !isDirty}
            onSave={handleSave}
            actionsSlot={
                isDetail && config.deleteLabel ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : config.deleteLabel}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={requestDelete}
                    />
                ) : null
            }
        >
            {activeTabId === 'warehouse-address' ? (
                <WarehouseAddressTab config={config} values={values} onChange={handleChange} />
            ) : activeTabId === 'warehouse-users' ? (
                <WarehouseUsersTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
            ) : (
                <WarehouseGeneralTab config={config} values={values} onChange={handleChange} isDetail={isDetail} />
            )}

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
        </ModuleFormTemplate>
    );
}

