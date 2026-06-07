import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { SaveIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { ItemCategoryAccountsTab, ItemCategoryGeneralTab } from './ItemCategorySections';
import { buildFormValues } from './itemCategoryShared';
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

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'item-category-general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config, initialValues]);

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

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [initialValues, values]
    );

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

    const dockActions = isDetail ? config.detailDockActions : config.createDockActions;

    return (
        <>
            <div className="flex min-h-full flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PreferencesTabs tabs={config.tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} className="border-b border-[#d5d9e1] bg-[#f4f4f5] px-2 pt-[6px] sm:px-2" />

                <div className="flex min-h-[642px] flex-col gap-5 px-4 py-4 lg:flex-row lg:items-start">
                    <div className="order-2 min-w-0 flex-1 rounded-[6px] border border-[#d8dde7] bg-white px-4 py-4 lg:order-1">
                        <CrudStatusMessage status={status} className="mb-4" />
                        {activeTabId === 'item-category-accounts' ? (
                            <ItemCategoryAccountsTab config={config} values={values} onAccountChange={handleAccountChange} />
                        ) : (
                            <ItemCategoryGeneralTab config={config} values={values} onChange={handleChange} />
                        )}
                    </div>

                    <div className="order-1 flex justify-end lg:order-2 lg:shrink-0">
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
                title="Hapus Kategori Barang"
                message="Kategori barang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}

