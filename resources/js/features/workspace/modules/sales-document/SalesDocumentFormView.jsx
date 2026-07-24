import { useEffect, useMemo, useRef, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import ImportItemsModal from '@/features/workspace/shared/ImportItemsModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import {
    buildGeneratedDocumentNumber,
    buildOperationDocumentPayload,
    parseNumericInput,
} from '@/features/workspace/backend/operationDocumentBackend';
import SalesDocumentItemModal from '@/features/workspace/modules/sales-document/SalesDocumentItemModal';
import SalesDocumentItemEditModal from '@/features/workspace/modules/sales-document/SalesDocumentItemEditModal';
import SalesDocumentCostEditModal from '@/features/workspace/modules/sales-document/SalesDocumentCostEditModal';
import SalesDocumentAdvanceEditModal from '@/features/workspace/modules/sales-document/SalesDocumentAdvanceEditModal';
import {
    buildSalesDocumentFormState,
    SalesDocumentAdditionalCostSection,
    SalesDocumentAdditionalInfoSection,
    SalesDocumentAdvancePaymentsSection,
    SalesDocumentFooter,
    SalesDocumentItemsSection,
    SalesDocumentSmartlinkSection,
    SalesDocumentSummarySection,
} from '@/features/workspace/modules/shared/SalesDocumentSections';
import {
    TransactionFormLayout,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    buildSectionProps,
    resolveInitialSectionId,
    resolveSectionComponent,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { showCrudErrorToast } from '@/features/workspace/shared/crudFeedback';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { mergeImportedItems } from '@/features/workspace/shared/importMergeUtils';
import SalesDocumentFormHeader from './SalesDocumentFormHeader';
import {
    applyComputedTotals,
    buildDocumentComparableSnapshot,
    buildLookupLabel,
    resolveSalesDocumentDirty,
    validateSalesDocumentValues,
    validateSalesDocumentFields,
    promptCostEditor,
    formatCurrencyValue,
} from './salesDocumentFormShared';

const sectionComponentMap = {
    'additional-info': SalesDocumentAdditionalInfoSection,
    'additional-costs': SalesDocumentAdditionalCostSection,
    smartlink: SalesDocumentSmartlinkSection,
    'advance-payments': SalesDocumentAdvancePaymentsSection,
    'order-info': SalesDocumentSummarySection,
    details: SalesDocumentItemsSection,
};

export default function SalesDocumentFormView({
    pageId,
    config,
    buildRecord,
    activeLevel2Tab,
    backendConfig,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [editAdvanceOpen, setEditAdvanceOpen] = useState(false);
    const [editingAdvanceItem, setEditingAdvanceItem] = useState(null);
    const [editItemOpen, setEditItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockWarningOpen, setStockWarningOpen] = useState(false);
    const [stockWarningData, setStockWarningData] = useState(null);
    const [editCostOpen, setEditCostOpen] = useState(false);
    const [editingCostItem, setEditingCostItem] = useState(null);
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const [sourceRecord, setLocalRecord, isLoading] = useTransactionDetailLoader({
        resourceName: backendConfig?.resource ?? 'sales-documents',
        activeRecordId,
        buildRecord,
        config,
    });
    const [values, setValues] = useState(() => buildSalesDocumentFormState(sourceRecord));
    const isDetail = Boolean(activeRecordId);
    const [activeSectionId, setActiveSectionId] = useState(() => resolveInitialSectionId(config, isDetail));
    const activeSectionKey = resolveSectionComponent(activeSectionId);
    const ActiveSectionComponent = sectionComponentMap[activeSectionKey] ?? SalesDocumentItemsSection;
    const initialSnapshot = useMemo(
        () => buildDocumentComparableSnapshot(buildSalesDocumentFormState(sourceRecord)),
        [sourceRecord],
    );

    useEffect(() => {
        setActiveSectionId(resolveInitialSectionId(config, isDetail));
    }, [activeRecordId]);

    const resolvedSectionTabs = useMemo(() => {
        let tabs = config.sectionTabs ?? [];
        if (pageId === 'sales-invoice') {
            const hasValidCustomer = Boolean(values.__partnerId);
            if (!hasValidCustomer) {
                tabs = tabs.filter(tab => tab.id !== 'advance-payments');
            }
        }
        return tabs;
    }, [config.sectionTabs, pageId, values.__partnerId]);

    useEffect(() => {
        if (pageId === 'sales-invoice' && !values.__partnerId && activeSectionId === 'advance-payments') {
            setActiveSectionId('details');
        }
    }, [pageId, values.__partnerId, activeSectionId]);

    const lastInitialSnapshotRef = useRef(initialSnapshot);

    useEffect(() => {
        const nextValues = buildSalesDocumentFormState(sourceRecord);
        setValues((current) => {
            const recordId = sourceRecord?.__backendRecordId || sourceRecord?.id;
            const currentRecordId = current?.__backendRecordId || current?.id;
            if (recordId !== currentRecordId) {
                return nextValues;
            }
            const userHasEdited = resolveSalesDocumentDirty(current, lastInitialSnapshotRef.current);
            return userHasEdited ? current : nextValues;
        });
        setItemModalOpen(false);
        setImportModalOpen(false);
        lastInitialSnapshotRef.current = initialSnapshot;
    }, [sourceRecord, initialSnapshot]);

    const validationMessage = useMemo(() => validateSalesDocumentValues(values, config), [config, values]);
    const fieldErrors = useMemo(() => validateSalesDocumentFields(values, config), [config, values]);
    const isDirty = useMemo(() => resolveSalesDocumentDirty(values, initialSnapshot), [initialSnapshot, values]);

    const {
        status,
        setStatus,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        handleSave,
        requestDelete,
        handleDelete,
        saveDisabled,
    } = useTransactionForm({ validationMessage, fieldErrors, isDirty });



    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    function updateItems(updater) {
        setValues((current) => {
            const nextItems = typeof updater === 'function' ? updater(current.items ?? []) : updater;
            return applyComputedTotals(current, nextItems);
        });
    }

    function handleCreateItem() {
        setEditingProduct(null);
        setEditingItem(null);
        setEditItemOpen(true);
    }

    function handleEditItem(item) {
        setEditingProduct(null);
        setEditingItem(item);
        setEditItemOpen(true);
    }

    function handleItemEditSubmit(nextItem) {
        updateItems((items) =>
            editingItem
                ? items.map((entry) => (entry.id === editingItem.id ? nextItem : entry))
                : [...items, nextItem]
        );
        showSuccessToast({ message: editingItem ? 'Item diperbarui.' : 'Item ditambahkan ke dokumen.' });
        setEditItemOpen(false);
    }

    function handleItemDelete(item) {
        updateItems((items) => items.filter((entry) => entry.id !== item.id));
        showSuccessToast({ message: 'Item dihapus.' });
        setEditItemOpen(false);
    }

    async function performSave(shouldIgnoreStock = false) {
        if (!backendConfig) {
            const errorMessage = 'Konfigurasi backend dokumen belum tersedia.';
            setStatus({ tone: 'error', message: errorMessage });
            showCrudErrorToast(errorMessage);
            return;
        }

        const result = await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui dokumen.' : 'Sedang menyimpan dokumen.',
            successMessage: isDetail ? 'Dokumen berhasil diperbarui.' : 'Dokumen berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedDocumentNumber(pageId)
                        : values.documentNumber;
                const payload = buildOperationDocumentPayload(
                    {
                        ...values,
                        documentNumber: resolvedDocumentNumber,
                        ignoreStockWarning: shouldIgnoreStock,
                    },
                    pageId,
                    backendConfig,
                );
                const response =
                    isDetail && values.__backendRecordId
                        ? await updateBackendResource(backendConfig.resource, values.__backendRecordId, payload)
                        : await createBackendResource(backendConfig.resource, payload);

                if (values.sourceDocId && values.sourceDocType === 'item-requests') {
                    try {
                        await updateBackendResource('item-requests', values.sourceDocId, {
                            is_closed: true,
                            status: 'Ditutup',
                        });
                    } catch {
                      // Abaikan jika sudah tertutup

                    }
                }

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

                if (record) {
                    const parsed = buildRecord ? buildRecord(record) : record;
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(record.id)] = parsed;

                    if (isDetail) {
                        const nextValues = buildSalesDocumentFormState(parsed);
                        setValues(nextValues);
                        setLocalRecord(parsed);
                    }
                }

                if (!isDetail && record?.id && onOpenDetail) {
                    onOpenDetail({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                    const emptyDraftValues = buildSalesDocumentFormState(config.draft ?? {});
                    setValues(emptyDraftValues);
                }
            },
        });

        if (result && result.isStockWarning) {
            setStockWarningData(result.warningData);
            setStockWarningOpen(true);
        }
    }

    async function onSave() {
        await performSave(false);
    }

    async function handleContinueSave() {
        setStockWarningOpen(false);
        await performSave(true);
    }

    function onRequestDelete() {
        if (!backendConfig || !values.__backendRecordId) {
            return;
        }
        requestDelete();
    }

    async function onDelete() {
        if (!backendConfig || !values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus dokumen.',
            successMessage: 'Dokumen berhasil dihapus.',
            execute: () => deleteBackendResource(backendConfig.resource, values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            openItemModal: () => setItemModalOpen(true),
            onCreateItem: handleCreateItem,
            onEditItem: handleEditItem,
            onImportClick: () => setImportModalOpen(true),
            onImportItems: (importedItems) => {
                updateItems((existingItems) => {
                    const mergedItems = mergeImportedItems(
                        existingItems,
                        importedItems.map((item) => ({
                            ...item,
                            id: item.id || `imported-item-${Date.now()}-${Math.random()}`,
                        }))
                    );
                    return mergedItems.map((item) => {
                        const qty = parseFloat(item.quantity) || 0;
                        const price = parseFloat(String(item.price).replace(/[^\d.-]/g, '')) || 0;
                        const discount = parseFloat(String(item.discount).replace(/[^\d.-]/g, '')) || 0;
                        const total = Math.max(0, qty * price - discount);
                        return {
                            ...item,
                            total: total.toLocaleString('id-ID'),
                        };
                    });
                });
                showSuccessToast({ message: `${importedItems.length} item berhasil diimpor.` });
            },
            onSelectItem: (record) => {
                setEditingProduct(record);
                setEditingItem(null);
                setEditItemOpen(true);
            },
            onSelectAdvancePayment: (record) => {
                const newAdvance = {
                    id: `advance-item-${Date.now()}-${Math.random()}`,
                    __lineId: null,
                    __depositId: record.id,
                    number: record.document_number || record.number || '',
                    amount: formatCurrencyValue(Number(record.outstanding_amount ?? record.deposit_amount ?? record.total_amount ?? record.amount ?? 0)),
                    notes: record.notes ?? '',
                    tax_id: record.tax_id ?? null,
                    isNew: true,
                };
                setEditingAdvanceItem(newAdvance);
                setEditAdvanceOpen(true);
            },
            onEditAdvancePayment: (advanceItem) => {
                setEditingAdvanceItem(advanceItem);
                setEditAdvanceOpen(true);
            },
            onSelectCostAccount: (record) => {
                const newCost = {
                    id: `cost-item-${Date.now()}-${Math.random()}`,
                    __lineId: null,
                    __accountId: record.id,
                    name: record.name,
                    code: record.code ?? '',
                    amount: '0',
                };
                setEditingCostItem(newCost);
                setEditCostOpen(true);
            },
            onEditCostItem: (costItem) => {
                setEditingCostItem(costItem);
                setEditCostOpen(true);
            },
            onProcessPembayaran: (formValues) => {
                if (!formValues.__backendRecordId) return;
                window.__pendingImportSalesInvoice = { id: formValues.__backendRecordId };
                window.dispatchEvent(
                    new CustomEvent('workspace:open-page', {
                        detail: {
                            pageId: 'sales-receipt',
                            targetTabId: 'sales-receipt-create',
                        },
                    })
                );
            },
        }),
        [updateItems, setStatus],
    );

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: onSave,
                        disabled: action.disabled || saveDisabled,
                    };
                }

                if (action.id === 'delete') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: onRequestDelete,
                    };
                }

                return action;
            }),
        [saveDisabled, saving, values.dockActions],
    );

    return (
        <>
            <TransactionFormLayout
            isLoading={isLoading}
            validationMessage={validationMessage}
                header={
                    <SalesDocumentFormHeader
                        pageId={pageId}
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        backendConfig={backendConfig}
                        handlers={handlers}
                    />
                }
                sectionTabs={resolvedSectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={config.showFooter !== false ? <SalesDocumentFooter values={values} setValues={setValues} /> : null}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                <div className="relative flex-1 flex flex-col min-h-0">
                    <ActiveSectionComponent
                        {...buildSectionProps(activeSectionId, config, values, setValues, isDetail, handlers)}
                    />
                </div>
            </TransactionFormLayout>

            <SalesDocumentItemModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} modal={values.itemModal} />
            <SalesDocumentItemEditModal
                open={editItemOpen}
                onClose={() => setEditItemOpen(false)}
                product={editingProduct}
                item={editingItem}
                onSubmit={handleItemEditSubmit}
                onDelete={handleItemDelete}
            />
            <SalesDocumentCostEditModal
                open={editCostOpen}
                onClose={() => {
                    setEditCostOpen(false);
                    setEditingCostItem(null);
                }}
                item={editingCostItem}
                onSubmit={(nextCost) => {
                    const exists = (values.additionalCosts ?? []).some((entry) => entry.id === editingCostItem?.id);
                    setValues((current) => {
                        const nextCosts = exists
                            ? (current.additionalCosts ?? []).map((entry) =>
                                  entry.id === editingCostItem.id ? nextCost : entry
                              )
                            : [...(current.additionalCosts ?? []), nextCost];
                        const updatedValues = {
                            ...current,
                            additionalCosts: nextCosts,
                        };
                        return applyComputedTotals(updatedValues, updatedValues.items);
                    });
                    showSuccessToast({
                        message: exists
                            ? 'Biaya diperbarui.'
                            : `Biaya [${nextCost.code ?? ''}] ${nextCost.name} ditambahkan.`
                    });
                }}
                onDelete={(target) => {
                    setValues((current) => {
                        const updatedValues = {
                            ...current,
                            additionalCosts: (current.additionalCosts ?? []).filter((entry) =>
                                entry.id !== target.id
                            ),
                        };
                        return applyComputedTotals(updatedValues, updatedValues.items);
                    });
                    showSuccessToast({ message: 'Biaya dihapus.' });
                }}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Konfirmasi"
                message={
                    values.items && values.items.length > 0 ? (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}\n\nDokumen ini memiliki ${values.items.length} baris detail transaksi yang akan ikut terhapus permanen.`
                    ) : (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.documentNumber}`
                    )
                }
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
            <SalesDocumentAdvanceEditModal
                open={editAdvanceOpen}
                onClose={() => setEditAdvanceOpen(false)}
                item={editingAdvanceItem}
                maxAllowed={Math.max(0, parseNumericInput(values.total) - (values.advancePayments ?? [])
                    .filter((entry) => entry.id !== editingAdvanceItem?.id && entry.__depositId !== editingAdvanceItem?.__depositId)
                    .reduce((sum, entry) => sum + parseNumericInput(entry.amount), 0))}
                onSubmit={(nextAdvance) => {
                    const exists = (values.advancePayments ?? []).some((entry) => entry.id === nextAdvance.id || entry.__depositId === nextAdvance.__depositId);
                    setValues((current) => {
                        const list = current.advancePayments ?? [];
                        const nextList = exists
                            ? list.map((entry) => (entry.id === nextAdvance.id || entry.__depositId === nextAdvance.__depositId) ? nextAdvance : entry)
                            : [...list, nextAdvance];
                        return {
                            ...current,
                            advancePayments: nextList,
                        };
                    });
                    showSuccessToast({
                        message: exists
                            ? `Uang muka [${nextAdvance.number}] diperbarui.`
                            : `Uang muka [${nextAdvance.number}] ditambahkan.`
                    });
                }}
                onDelete={(target) => {
                    setValues((current) => ({
                        ...current,
                        advancePayments: (current.advancePayments ?? []).filter((entry) =>
                            entry.id !== target.id && entry.__depositId !== target.__depositId
                        ),
                    }));
                    showSuccessToast({ message: `Rujukan uang muka [${target.number}] dihapus.` });
                }}
            />
            <ImportItemsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={handlers.onImportItems}
                mode={String(pageId || '').toLowerCase().includes('purchase') || String(pageId || '').toLowerCase().includes('receipt') ? 'purchasing' : 'sales'}
            />
            {stockWarningOpen && stockWarningData && (
                <ConfirmationModal
                    open={stockWarningOpen}
                    onClose={() => setStockWarningOpen(false)}
                    title="Faktur Penjualan"
                    message={`Stok barang "${stockWarningData.product_name}" di gudang "${stockWarningData.warehouse_name}" tidak mencukupi.\n\nStok untuk dijual dari barang "${stockWarningData.product_name}" tidak mencukupi.`}
                    confirmLabel="Lanjutkan"
                    cancelLabel="Batal"
                    confirmVariant="success"
                    onConfirm={handleContinueSave}
                />
            )}
        </>
    );
}
