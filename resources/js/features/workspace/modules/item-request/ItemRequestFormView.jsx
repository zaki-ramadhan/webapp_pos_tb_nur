import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useFormDraftState } from '@/features/workspace/shared/hooks/useFormDraftState';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import ImportItemsModal from '@/features/workspace/shared/ImportItemsModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    ItemRequestAdditionalInfoSection,
    ItemRequestDetailsSection,
    ItemRequestFormHeader,
} from './ItemRequestSections';
import { useTransactionForm, buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import { mergeImportedItems } from '@/features/workspace/shared/importMergeUtils';
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
    const [importModalOpen, setImportModalOpen] = useState(false);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildRecord?.(config.rowMap?.[activeRecordId] ?? config.table.rows.find((row) => row.id === activeRecordId))
                : config.draft,
        [activeRecordId, buildRecord, config],
    );
    const [values, setValues, isDirty] = useFormDraftState({
        sourceRecord,
        buildFormState: buildFormValues,
        config,
        pageId,
        activeTabId: activeLevel2Tab?.id,
        onSync: useCallback(() => setImportModalOpen(false), []),
    });
    const isDetail = Boolean(activeRecordId);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [activeRecordId]);

    const validationMessage = useMemo(() => validateItemRequestValues(values, config), [config, values]);

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
        saveDisabled,
    } = useTransactionForm({ validationMessage, isDirty });



    const dockActions = useMemo(
        () => buildWorkspaceDockActions({
            dockActions: values.dockActions,
            isDetail,
            saveDisabled,
            saving,
            onSave,
            onDelete: onRequestDelete
        }),
        [values.dockActions, isDetail, saveDisabled, saving, onSave, onRequestDelete]
    );

    function onRequestDelete() {
        if (!values.__backendRecordId) {
            return;
        }
        requestDelete();
    }

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

    async function onSave() {
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
                if (isDetail && record && activeLevel2Tab?.id) {
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
            onSelectItemSuggestion: (record) => applyItemUpdate(record),
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
            validationMessage={validationMessage}
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
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
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

