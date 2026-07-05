import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
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

function entryToFormValues(entry) {
    return {
        name: entry.name ?? '',
        description: entry.description ?? '',
        responsiblePerson: entry.responsiblePerson ?? '',
        isDamagedWarehouse: Boolean(entry.isDamagedWarehouse),
        inactive: Boolean(entry.inactive),
        allUsers: entry.allUsers ?? true,
        street: entry.street ?? '',
        city: entry.city ?? '',
        postalCode: entry.postalCode ?? '',
        province: entry.province ?? '',
        country: entry.country ?? '',
        groupBranch: Array.isArray(entry.groupBranch) ? [...entry.groupBranch] : [],
        users: Array.isArray(entry.users) ? [...entry.users] : [],
    };
}

/**
 * Form view gudang.
 * Menerima `entry` lengkap dari WarehouseView (pola SalaryAllowance).
 * Sync via useEffect([entry]) – tidak ada race condition async fetch.
 */
export default function WarehouseFormView({
    config,
    entry,
    isDetailMode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    onPersist,
}) {
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'warehouse-general');
    const [values, setValues] = useState(() => entryToFormValues(entry));
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const serializedEntry = JSON.stringify(entry);
    useEffect(() => {
        setValues(entryToFormValues(entry));
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serializedEntry]);

    const activeTabInstanceId = activeLevel2Tab?.id;
    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'warehouse-general');
    }, [activeTabInstanceId, config.tabs]);

    const initialValues = useMemo(() => entryToFormValues(entry), [serializedEntry]);

    const [hasSaved, setHasSaved] = useState(false);

    const isDirty = useMemo(
        () => !hasSaved && JSON.stringify(values) !== JSON.stringify(initialValues),
        [values, initialValues, hasSaved],
    );

    useWorkspaceDirtyRegistration({
        pageId: 'warehouse-master',
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    function handleChange(field, nextValue) {
        setHasSaved(false);
        setValues((cur) => ({ ...cur, [field]: nextValue }));
    }

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Gudang wajib diisi.', {
                setStatus,
                fieldErrors: { name: 'Nama Gudang wajib diisi.' },
            });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetailMode ? 'Sedang memperbarui gudang.' : 'Sedang menyimpan gudang.',
            successMessage: isDetailMode ? 'Gudang berhasil diperbarui.' : 'Gudang berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: entry.branchId ?? 1,
                    code: isDetailMode
                        ? entry.code
                        : 'WH-' + values.name.trim().replace(/\s+/g, '-').toUpperCase() + '-' + Date.now(),
                    name: values.name.trim(),
                    description: values.description ?? '',
                    responsible_person: values.responsiblePerson ?? '',
                    warehouse_type: values.isDamagedWarehouse ? 'damaged' : 'main',
                    is_active: !values.inactive,
                    street: values.street ?? '',
                    city: values.city ?? '',
                    postal_code: values.postalCode ?? '',
                    province: values.province ?? '',
                    country: values.country ?? '',
                    all_users: values.allUsers,
                };

                const response = isDetailMode && entry.id
                    ? await updateBackendResource('warehouses', entry.id, payload)
                    : await createBackendResource('warehouses', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                setHasSaved(true);
                if (isDetailMode && record && activeLevel2Tab?.id) {
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
                await onRefresh?.();
                if (record) {
                    onPersist?.(record);
                }
                if (!isDetailMode && record?.id) {
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
        if (!entry.id || saving) return;
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!entry.id) return;
        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus gudang.',
            successMessage: 'Gudang berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('warehouses', entry.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(entry.id);
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
                isDetailMode && config.deleteLabel ? (
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
                <WarehouseUsersTab config={config} values={values} onChange={handleChange} isDetail={isDetailMode} />
            ) : (
                <WarehouseGeneralTab config={config} values={values} onChange={handleChange} isDetail={isDetailMode} />
            )}

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}
