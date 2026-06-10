import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
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
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import {
    ItemRequestAdditionalInfoSection,
    ItemRequestDetailsSection,
    ItemRequestFormHeader,
} from './ItemRequestSections';
import { createDeleteDockAction } from '@/features/workspace/modules/shared/workspaceDockActions';
import {
    applyItemRequestItems,
    buildFormValues,
    buildGeneratedItemRequestNumber,
    buildItemRequestPayload,
    buildLookupLabel,
    promptItemRequestItem,
    validateItemRequestValues,
} from './itemRequestShared';

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
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
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
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
        setImportModalOpen(false);
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateItemRequestValues(values, config), [config, values]);
    const isDirty = useMemo(() => !areComparableValuesEqual(initialComparable, values), [initialComparable, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    const dockActions = useMemo(() => {
        const baseActions = [...(values.dockActions ?? [])];

        if (isDetail && !baseActions.some((action) => action.id === 'delete')) {
            baseActions.push(createDeleteDockAction());
        }

        return baseActions
            .filter((action) => (isDetail ? true : action.id !== 'delete'))
            .map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                          label: saving ? 'Memproses...' : action.label,
                          onClick: handleSave,
                      }
                    : action.id === 'delete'
                      ? {
                            ...action,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: requestDelete,
                        }
                      : action,
            );
    }, [isDetail, saveDisabled, saving, values.dockActions]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function selectLookup(resource, title, labelBuilder, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, labelBuilder);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    function applyItemUpdate(record, currentItem = null) {
        try {
            const nextItem = promptItemRequestItem(record, currentItem, values.requestDate);

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
            setStatus({
                tone: 'success',
                message: currentItem ? 'Rincian permintaan diperbarui.' : 'Rincian permintaan ditambahkan.',
            });
        } catch (error) {
            setStatus({ tone: 'error', message: error?.message ?? 'Rincian permintaan tidak valid.' });
        }
    }

    async function handleSave() {
        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui permintaan barang.' : 'Sedang menyimpan permintaan barang.',
            successMessage: isDetail ? 'Permintaan barang berhasil diperbarui.' : 'Permintaan barang berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
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

    function requestDelete() {
        if (!values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus permintaan barang.',
            successMessage: 'Permintaan barang berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
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
                selectLookup('branches', 'cabang', (record) => buildLookupLabel(record), (record) =>
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
                selectLookup('products', 'barang', (record) => buildLookupLabel(record), (record) => applyItemUpdate(record)),
            onEditItem: (item) => applyItemUpdate(null, item),
            onImportClick: () => setImportModalOpen(true),
            onImportItems: (importedItems) => {
                setValues((current) => {
                    const existingItems = current.items ?? [];
                    const mergedItems = [...existingItems];
                    importedItems.forEach((imported) => {
                        const duplicateIdx = mergedItems.findIndex(
                            (item) => String(item.code).toLowerCase() === String(imported.code).toLowerCase()
                        );
                        if (duplicateIdx !== -1) {
                            const existingQty = parseFloat(mergedItems[duplicateIdx].quantity) || 0;
                            const importedQty = parseFloat(imported.quantity) || 0;
                            mergedItems[duplicateIdx].quantity = String(existingQty + importedQty);
                        } else {
                            mergedItems.push({
                                ...imported,
                                id: `imported-item-${Date.now()}-${Math.random()}`,
                            });
                        }
                    });
                    return applyItemRequestItems(current, mergedItems);
                });
                setStatus({ tone: 'success', message: `${importedItems.length} barang berhasil diimpor.` });
            },
        }),
        [values.requestDate],
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
                onConfirm={handleDelete}
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
