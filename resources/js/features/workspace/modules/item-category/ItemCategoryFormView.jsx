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
import { ItemCategoryAccountsTab, ItemCategoryGeneralTab } from './ItemCategorySections';
import { buildFormValues } from './itemCategoryShared';

export default function ItemCategoryFormView({
    page,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const config = page.itemCategory;
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
        if (!recordId) {
            return null;
        }
        return config.table.rows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, config.table.rows]);
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'item-category-general');
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
        setActiveTabId(config.tabs?.[0]?.id ?? 'item-category-general');
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

    function handleAccountChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            accounts: {
                ...currentValues.accounts,
                [field]: nextValue,
            },
        }));
    }

    useWorkspaceDirtyRegistration({
        pageId: 'item-category',
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Kategori wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui kategori.' : 'Sedang menyimpan kategori.',
            successMessage: isDetail ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    name: values.name.trim(),
                    code: isDetail ? detailRow.code : 'CAT-' + values.name.trim().replace(/\s+/g, '-').toUpperCase() + '-' + Date.now(),
                    parent_id: null,
                    is_active: true,
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('product-categories', detailRow.id, payload)
                    : await createBackendResource('product-categories', payload);

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
            loadingMessage: 'Sedang menghapus kategori.',
            successMessage: 'Kategori berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('product-categories', detailRow.id),
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
            {activeTabId === 'item-category-accounts' ? (
                <ItemCategoryAccountsTab config={config} values={values} onAccountChange={handleAccountChange} />
            ) : (
                <ItemCategoryGeneralTab config={config} values={values} onChange={handleChange} />
            )}

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Kategori Barang"
                message="Kategori barang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}

