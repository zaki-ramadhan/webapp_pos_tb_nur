import { useEffect, useMemo, useRef, useState } from 'react';

import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useTransactionDetailLoader } from '@/features/workspace/shared/hooks/useTransactionDetailLoader';
import { buildWorkspaceDockActions } from '@/features/workspace/shared/hooks/useTransactionForm';
import {
    buildGeneratedDocumentNumber,
    buildOperationDocumentPayload,
    parseNumericInput,
} from '@/features/workspace/backend/operationDocumentBackend';
import SalesDocumentModals from './components/SalesDocumentModals';
import DocumentStamp from '@/components/ui/DocumentStamp';
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
import { showCrudErrorToast } from '@/features/workspace/shared/crudFeedback';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { handleFormSaveSuccess, clearValidationErrors } from '@/features/workspace/shared/crudFormActions';
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
    normalizeDocumentItemRow,
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
    const [returnFetchItemsModalOpen, setReturnFetchItemsModalOpen] = useState(false);
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

    useEffect(() => {
        function applyInitialValues(init) {
            if (!init || isDetail) return;
            setValues((current) => {
                const rawItems = Array.isArray(init.items) && init.items.length ? init.items : (current.items ?? []);
                const nextItems = rawItems.map((item) => {
                    const qty = parseNumericInput(item.quantity);
                    const price = parseNumericInput(item.price);
                    const discount = parseNumericInput(item.discountValue ?? item.discount);
                    const totalVal = item.total != null && item.total !== 0 ? parseNumericInput(item.total) : Math.max(0, qty * price - discount);
                    return {
                        ...item,
                        quantity: qty,
                        price: formatCurrencyValue(price),
                        discount: formatCurrencyValue(discount),
                        discountValue: formatCurrencyValue(discount),
                        total: formatCurrencyValue(totalVal),
                    };
                });
                const supplierName = init.supplier ?? init.customer ?? current.customer;
                const nextSupplier = Array.isArray(supplierName) ? supplierName : (supplierName ? [String(supplierName)] : []);
                const nextPartnerId = init.__partnerId ?? current.__partnerId;
                return applyComputedTotals({
                    ...current,
                    customer: nextSupplier,
                    supplier: nextSupplier,
                    __partnerId: nextPartnerId,
                }, nextItems);
            });
        }

        if (!isDetail && typeof window !== 'undefined' && window.__pendingInitialValues?.[pageId]) {
            applyInitialValues(window.__pendingInitialValues[pageId]);
            delete window.__pendingInitialValues[pageId];
        }

        function handleInitialValuesEvent(e) {
            if (e.detail?.pageId === pageId && e.detail?.initialValues && !isDetail) {
                applyInitialValues(e.detail.initialValues);
                if (typeof window !== 'undefined' && window.__pendingInitialValues) {
                    delete window.__pendingInitialValues[pageId];
                }
            }
        }

        window.addEventListener('workspace:set-initial-values', handleInitialValuesEvent);
        return () => window.removeEventListener('workspace:set-initial-values', handleInitialValuesEvent);
    }, [pageId, isDetail]);

    useEffect(() => {
        clearValidationErrors();
        return () => clearValidationErrors();
    }, [pageId, isDetail]);

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
        if (item?.__isUnavailable || item?.__isProductDeleted) {
            showErrorToast({
                message: `Barang '${item.name}' telah dihapus dari daftar barang sehingga tidak dapat diedit. Silakan hapus baris item ini jika ingin menggantinya.`,
            });
            return;
        }
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
            onSuccess: (params) =>
                handleFormSaveSuccess({
                    ...params,
                    pageId,
                    resourceKey: backendConfig?.resource,
                    onRefresh,
                    buildRecord,
                    config,
                    setLocalRecord,
                    setValues,
                    activeLevel2Tab,
                    isDetail,
                    onOpenDetail,
                }),
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
            onDeleteItem: handleItemDelete,
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
                    return mergedItems.map(normalizeDocumentItemRow);
                });
                showSuccessToast({ message: `${importedItems.length} item berhasil diimpor.` });
            },
            onOpenFetchItemsModal: () => setReturnFetchItemsModalOpen(true),
            onConfirmReturnItems: (selectedItems) => {
                if (!selectedItems?.length) return;
                updateItems((existingItems) => {
                    const mergedItems = mergeImportedItems(
                        existingItems,
                        selectedItems.map((item) => ({
                            ...item,
                            id: item.id || `return-item-${Date.now()}-${Math.random()}`,
                        }))
                    );
                    return mergedItems.map(normalizeDocumentItemRow);
                });
                showSuccessToast({ message: `${selectedItems.length} barang rincian retur berhasil diambil.` });
            },
            onSelectItem: (record) => {
                setEditingProduct(record);
                setEditingItem(null);
                setEditItemOpen(true);
            },
            onSelectAdvancePayment: (record) => {
                const availableAmt = Number(record.outstanding_amount ?? record.deposit_amount ?? record.total_amount ?? record.amount ?? 0);
                const remainingInvoice = Math.max(0, parseNumericInput(values.total) - (values.advancePayments ?? [])
                    .reduce((sum, entry) => sum + parseNumericInput(entry.amount), 0));
                const initialAmt = availableAmt > 0 ? Math.min(availableAmt, remainingInvoice) : remainingInvoice;
                const newAdvance = {
                    id: `advance-item-${Date.now()}-${Math.random()}`,
                    __lineId: null,
                    __depositId: record.id,
                    number: record.document_number || record.number || '',
                    availableAmount: availableAmt > 0 ? availableAmt : null,
                    amount: formatCurrencyValue(initialAmt),
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
                const recordId = formValues.__backendRecordId || formValues.id || activeRecordId;

                if (pageId === 'purchase-invoice') {
                    const supplierName = formValues.customer?.[0] || formValues.supplier?.[0] || formValues.supplierName || '';
                    const supplierId = formValues.__partnerId || formValues.supplier_id || formValues.customer_id || null;
                    const invoiceDocNumber = formValues.documentNumber || formValues.number || '';
                    const invoiceDate = formValues.entryDate || '';
                    const rawTotal = formValues.total || formValues.subtotal || '0';
                    const cleanTotal = String(rawTotal).trim();
                    const totalLabel = cleanTotal.startsWith('Rp') ? cleanTotal : (cleanTotal ? `Rp ${cleanTotal}` : 'Rp 0');

                    const invoiceItem = {
                        id: String(recordId || invoiceDocNumber || 'invoice-1'),
                        __lineId: null,
                        __relatedDocumentId: recordId || null,
                        number: invoiceDocNumber,
                        formNumber: invoiceDocNumber,
                        date: invoiceDate,
                        total: totalLabel,
                        outstanding: totalLabel,
                        pay: totalLabel,
                        discount: 'Rp 0',
                        payment: totalLabel,
                        pphChecked: false,
                        pphLabel: '',
                        pphAmount: 'Rp 0',
                        withholdingProof: '',
                        discountAccount: '',
                        discountValue: '',
                        discountNotes: '',
                        department: '',
                    };

                    const initialValues = {
                        __supplierId: supplierId,
                        payee: supplierName ? [supplierName] : [],
                        invoices: [invoiceItem],
                        invoiceRecordId: recordId || null,
                    };

                    window.dispatchEvent(
                        new CustomEvent('workspace:open-page', {
                            detail: {
                                pageId: 'purchase-payment',
                                targetTabId: 'purchase-payment-create',
                                mode: 'form',
                                openForm: true,
                                initialValues,
                            },
                        })
                    );
                    if (recordId) {
                        window.dispatchEvent(
                            new CustomEvent('workspace:import-purchase-invoice', {
                                detail: { id: recordId },
                            })
                        );
                    }
                } else {
                    if (!recordId) return;
                    window.__pendingImportSalesInvoice = { id: recordId };
                    window.dispatchEvent(
                        new CustomEvent('workspace:open-page', {
                            detail: {
                                pageId: 'sales-receipt',
                                targetTabId: 'sales-receipt-create',
                                openForm: true,
                            },
                        })
                    );
                }
            },
        }),
        [updateItems, setStatus],
    );

    const dockActions = useMemo(
        () =>
            buildWorkspaceDockActions({
                dockActions: values.dockActions ?? config.dockActions,
                isDetail,
                saveDisabled,
                saving,
                onSave,
                onDelete: onRequestDelete,
            }),
        [config.dockActions, isDetail, onRequestDelete, onSave, saveDisabled, saving, values.dockActions],
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
                footer={config.showFooter !== false ? <SalesDocumentFooter values={values} setValues={setValues} isDetail={isDetail} pageId={pageId} /> : null}
                dockActions={dockActions}
            >
                <div className="relative flex-1 flex flex-col min-h-0">
                    {isDetail && (pageId === 'sales-invoice' || pageId === 'purchase-invoice') ? (
                        <DocumentStamp
                            label={(() => {
                                const normStatus = String(values.status ?? values.rawStatus ?? values.processStamp ?? '').replace(/\s+/g, ' ').trim().toUpperCase();
                                const total = parseNumericInput(values.total ?? values.total_amount);
                                const out = values.outstandingAmount !== undefined && values.outstandingAmount !== null
                                    ? parseNumericInput(values.outstandingAmount)
                                    : null;
                                const isPaid = normStatus === 'LUNAS' || (out !== null && out <= 0.01 && total > 0);
                                return isPaid ? 'LUNAS' : 'BELUM LUNAS';
                            })()}
                            className="absolute top-[54%] right-10 sm:right-14 z-30 pointer-events-none w-[140px] h-[140px] opacity-85 select-none -translate-y-1/2"
                        />
                    ) : null}
                    <ActiveSectionComponent
                        {...buildSectionProps(activeSectionId, config, values, setValues, isDetail, handlers)}
                    />
                </div>
            </TransactionFormLayout>

            <SalesDocumentModals
                pageId={pageId}
                values={values}
                setValues={setValues}
                handlers={handlers}
                saving={saving}
                onDelete={onDelete}
                itemModalOpen={itemModalOpen}
                setItemModalOpen={setItemModalOpen}
                editItemOpen={editItemOpen}
                setEditItemOpen={setEditItemOpen}
                editingProduct={editingProduct}
                editingItem={editingItem}
                handleItemEditSubmit={handleItemEditSubmit}
                handleItemDelete={handleItemDelete}
                editCostOpen={editCostOpen}
                setEditCostOpen={setEditCostOpen}
                editingCostItem={editingCostItem}
                setEditingCostItem={setEditingCostItem}
                editAdvanceOpen={editAdvanceOpen}
                setEditAdvanceOpen={setEditAdvanceOpen}
                editingAdvanceItem={editingAdvanceItem}
                returnFetchItemsModalOpen={returnFetchItemsModalOpen}
                setReturnFetchItemsModalOpen={setReturnFetchItemsModalOpen}
                importModalOpen={importModalOpen}
                setImportModalOpen={setImportModalOpen}
                deleteConfirmationOpen={deleteConfirmationOpen}
                setDeleteConfirmationOpen={setDeleteConfirmationOpen}
                stockWarningOpen={stockWarningOpen}
                setStockWarningOpen={setStockWarningOpen}
                stockWarningData={stockWarningData}
                handleContinueSave={handleContinueSave}
            />
        </>
    );
}
