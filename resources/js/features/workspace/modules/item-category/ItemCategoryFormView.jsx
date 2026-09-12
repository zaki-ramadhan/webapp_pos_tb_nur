import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SystemErrorModal from '@/components/ui/SystemErrorModal';
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
    const [parentCategoryError, setParentCategoryError] = useState('');
    const [invalidParentModal, setInvalidParentModal] = useState({
        open: false,
        categoryName: '',
    });

    const parentCategoryOptions = useMemo(() => {
        const rows = config.table?.rows ?? [];
        const currentId = detailRow?.id ?? values?.id;
        if (currentId) {
            return rows.filter((row) => String(row.id) !== String(currentId));
        }
        return rows;
    }, [config.table?.rows, detailRow?.id, values?.id]);

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'item-category-general');
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
        setParentCategoryError('');
        setInvalidParentModal({ open: false, categoryName: '' });
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



    function handleParentCategorySelect(item) {
        if (!item) return;
        const productsCount = Number(item.products_count ?? 0);
        if (productsCount > 0) {
            setParentCategoryError('Kategori ini sudah digunakan pada barang, pilih kategori lain.');
            setInvalidParentModal({
                open: true,
                categoryName: item.name ?? 'ini',
            });
            setValues((currentValues) => ({
                ...currentValues,
                parentId: item.id,
                parentName: item.name,
            }));
            return;
        }

        setParentCategoryError('');
        setValues((currentValues) => ({
            ...currentValues,
            parentId: item.id,
            parentName: item.name,
        }));
    }

    function handleParentCategoryClear() {
        setParentCategoryError('');
        setValues((currentValues) => ({
            ...currentValues,
            parentId: '',
            parentName: '',
        }));
    }

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Kategori wajib diisi.', { setStatus });
            return;
        }

        if (values.isSubCategory) {
            if (!values.parentId) {
                rejectCrudFormAction('Kategori Induk wajib dipilih saat Sub Kategori aktif.', { setStatus });
                return;
            }

            const selectedParent = parentCategoryOptions.find((opt) => String(opt.id) === String(values.parentId));
            if (selectedParent && Number(selectedParent.products_count ?? 0) > 0) {
                setParentCategoryError('Kategori ini sudah digunakan pada barang, pilih kategori lain.');
                setInvalidParentModal({
                    open: true,
                    categoryName: selectedParent.name ?? 'ini',
                });
                return;
            }
        }

        if (isDetail && detailRow?.isDefault && !values.isDefault) {
            const hasOtherDefault = config.table?.rows?.some(
                (row) => String(row.id) !== String(detailRow.id) && Boolean(row.isDefault)
            );
            if (!hasOtherDefault) {
                rejectCrudFormAction(
                    'Minimal harus ada satu kategori default. Untuk mengubah kategori default, silakan pilih dan simpan kategori lain sebagai default.',
                    { setStatus }
                );
                return;
            }
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
            saveDisabled={saving || !values.name?.trim() || (values.isSubCategory && (!values.parentId || Boolean(parentCategoryError)))}
            onSave={handleSave}
            actionsSlot={
                isDetail ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : (config.deleteLabel || 'Hapus Kategori')}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={requestDelete}
                    />
                ) : null
            }
        >
            <ItemCategoryGeneralTab
                config={config}
                values={values}
                onChange={handleChange}
                parentCategoryOptions={parentCategoryOptions}
                isDetail={isDetail}
                detailRow={detailRow}
                parentCategoryError={parentCategoryError}
                onParentCategorySelect={handleParentCategorySelect}
                onParentCategoryClear={handleParentCategoryClear}
            />

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

            <SystemErrorModal
                open={invalidParentModal.open}
                onClose={() => setInvalidParentModal((prev) => ({ ...prev, open: false }))}
                onConfirm={() => setInvalidParentModal((prev) => ({ ...prev, open: false }))}
                confirmLabel="Oke"
                maxWidthClassName="max-w-[540px]"
                description=""
                messages={[`Kategori ${invalidParentModal.categoryName} sudah digunakan pada barang, tidak dapat dijadikan sebagai kategori induk.`]}
            />
        </ModuleFormTemplate>
    );
}

