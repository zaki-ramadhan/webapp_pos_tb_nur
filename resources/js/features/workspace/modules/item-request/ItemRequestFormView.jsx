import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import ImportItemsModal from '@/features/workspace/shared/ImportItemsModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    ItemRequestAdditionalInfoSection,
    ItemRequestDetailsSection,
    ItemRequestFormHeader,
} from './ItemRequestSections';
import { createDeleteDockAction, mapDockActions } from '@/features/workspace/modules/shared/workspaceDockActions';
import {
    applyItemRequestItems,
    buildFormValues,
    buildGeneratedItemRequestNumber,
    buildItemRequestPayload,
    buildLookupLabel,
    promptItemRequestItem,
    validateItemRequestValues,
} from './itemRequestShared';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { mergeImportedItems } from '@/features/workspace/shared/importMergeUtils';


export default function ItemRequestFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
    buildRecord,
}) {
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildRecord?.(config.rowMap?.[activeRecordId] ?? config.table.rows.find((row) => row.id === activeRecordId))
                : config.draft,
        [activeRecordId, buildRecord, config],
    );
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const isDetail = Boolean(activeRecordId);
    const initialComparable = useMemo(() => buildFormValues(sourceRecord), [sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(sourceRecord));
        setImportModalOpen(false);
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateItemRequestValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        selectLookup,
        handleSave,
        requestDelete,
        handleDelete,
    } = useTransactionForm({ validationMessage });

    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(() => {
        const baseActions = [...(values.dockActions ?? [])];

        if (isDetail && !baseActions.some((action) => action.id === 'delete')) {
            baseActions.push(createDeleteDockAction());
        }

        return mapDockActions(
            baseActions.filter((action) => (isDetail ? true : action.id !== 'delete')),
            {
                saving,
                saveDisabled,
                onSave: onSaveClick,
                onDelete: requestDelete,
            }
        );
    }, [isDetail, saveDisabled, saving, values.dockActions]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function applyItemUpdate(record, currentItem = null) {
        try {
            const nextItem = await promptItemRequestItem(record, currentItem, values.requestDate);

            if (!nextItem) {
                return;
            }

            setValues((current) =>
                applyItemRequestItems(
                    current,
                    currentItem
                        ? (current.items ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                        : [...(current.items ?? []), nextItem],
                ),
            );
            showSuccessToast({
                message: currentItem ? 'Rincian permintaan diperbarui.' : 'Rincian permintaan ditambahkan.',
            });
        } catch (error) {
            showErrorToast({ message: error?.message ?? 'Rincian permintaan tidak valid.' });
        }
    }

    async function onSaveClick() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui permintaan barang.' : 'Sedang menyimpan permintaan barang.',
            successMessage: isDetail ? 'Permintaan barang berhasil diperbarui.' : 'Permintaan barang berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedItemRequestNumber()
                        : values.documentNumber;
                const payload = buildItemRequestPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('item-requests', values.__backendRecordId, payload)
                    : await createBackendResource('item-requests', payload);

                return {
                    record: response?.data ?? null,
                    resolvedDocumentNumber,
                };
            },
            onSuccess: async ({ record, resolvedDocumentNumber }) => {
                await onRefresh?.();

                if (!values.__backendRecordId && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                }
            },
        });
    }

    async function onDeleteClick() {
        if (!values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus permintaan barang.',
            successMessage: 'Permintaan barang berhasil dihapus.',
            execute: () => deleteBackendResource('item-requests', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectBranch: () =>
                selectLookup('branches', 'cabang', (record) =>
                    setValues((current) => ({
                        ...current,
                        __branchId: record.id,
                        branches: [buildLookupLabel(record)],
                    })),
                ),
            onRemoveBranch: (value) =>
                setValues((current) => ({
                    ...current,
                    __branchId: null,
                    branches: (current.branches ?? []).filter((item) => item !== value),
                })),
            onSelectItem: () =>
                selectLookup('products', 'barang', (record) => applyItemUpdate(record)),
            onEditItem: (item) => applyItemUpdate(null, item),
            onImportClick: () => setImportModalOpen(true),
            onImportItems: (importedItems) => {
                setValues((current) => {
                    const existingItems = current.items ?? [];
                    const mergedItems = mergeImportedItems(
                        existingItems,
                        importedItems.map((item) => ({
                            ...item,
                            id: item.id || `imported-item-${Date.now()}-${Math.random()}`,
                        }))
                    );
                    return applyItemRequestItems(current, mergedItems);
                });
                showSuccessToast({ message: `${importedItems.length} barang berhasil diimpor.` });
            },
        }),
        [selectLookup, values.requestDate],
    );

    return (
        <>
            <TransactionFormLayout
                header={<ItemRequestFormHeader config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'additional-info' ? (
                    <ItemRequestAdditionalInfoSection config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />
                ) : (
                    <ItemRequestDetailsSection config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />
                )}
            </TransactionFormLayout>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDeleteClick}
                title="Hapus Permintaan Barang"
                message="Permintaan barang ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />

            <ImportItemsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={handlers.onImportItems}
                mode="purchasing"
            />
        </>
    );
}

