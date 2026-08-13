import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import { useWorkspaceFormDraftState } from '@/features/workspace/shared/hooks/useWorkspaceFormDraftState';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
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
    const {
        values,
        setValues,
        isDirty,
        markClean,
    } = useWorkspaceFormDraftState({
        initialValues,
        recordId: detailRow?.id ?? null,
        pageId: page?.id ?? 'item-category',
        tabId: activeLevel2Tab?.id,
    });
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const parentCategoryOptions = useMemo(() => {
        const rows = config.table?.rows ?? [];
        if (isDetail && detailRow) {
            return rows.filter((row) => String(row.id) !== String(detailRow.id));
        }
        return rows;
    }, [config.table?.rows, isDetail, detailRow]);

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'item-category-general');
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId, detailRow?.id]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    function handleAccountChange(field, nextValue, recordId = '') {
        setValues((currentValues) => ({
            ...currentValues,
            accounts: {
                ...currentValues.accounts,
                [field]: nextValue,
            },
            accountIds: {
                ...currentValues.accountIds,
                [field]: recordId,
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
                    parent_id: values.isSubCategory ? (values.parentId || null) : null,
                    is_default: values.isDefault,
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
                markClean();
                if (isDetail && record && activeLevel2Tab?.id) {
                    window.dispatchEvent(
                        new CustomEvent('workspace:update-tab-label', {
                            detail: {
                                pageId: page?.id ?? 'item-category',
                                tabId: activeLevel2Tab.id,
                                label: record?.name ?? record?.full_name ?? record?.countryName ?? record?.country_name ?? record?.number ?? values?.name ?? values?.fullName ?? values?.groupName ?? '',
                            },
                        })
                    );
                }

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
                    });
                    if (activeLevel2Tab?.id) {
                        window.dispatchEvent(
                            new CustomEvent('workspace:close-tab', {
                                detail: { tabId: activeLevel2Tab.id },
                            })
                        );
                    }
                    setValues(buildFormValues(config, null));
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
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
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
            saveDisabled={saving || !values.name?.trim() || (isDetail && !isDirty)}
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
            <ItemCategoryGeneralTab config={config} values={values} onChange={handleChange} parentCategoryOptions={parentCategoryOptions} />

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name || values.code || 'kategori ini'}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}

