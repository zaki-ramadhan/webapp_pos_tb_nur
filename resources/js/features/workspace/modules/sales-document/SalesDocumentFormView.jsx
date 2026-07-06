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
} from '@/features/workspace/backend/operationDocumentBackend';
import SalesDocumentItemModal from '@/features/workspace/modules/sales-document/SalesDocumentItemModal';
import {
    buildSalesDocumentFormState,
    DocumentStamp,
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
    applyPromptItemUpdate,
    buildDocumentComparableSnapshot,
    buildLookupLabel,
    resolveSalesDocumentDirty,
    validateSalesDocumentValues,
    validateSalesDocumentFields,
    formatCurrencyValue,
    promptCostEditor,
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
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const [sourceRecord,, isLoading] = useTransactionDetailLoader({
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
    } = useTransactionForm({ validationMessage, fieldErrors });

    const saveDisabled = saving || !isDirty || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih') || validationMessage.includes('wajib diisi minimal 1')));

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

    async function handleCreateItem() {
        await applyPromptItemUpdate(null, updateItems, setStatus);
    }

    async function handleEditItem(item) {
        await applyPromptItemUpdate(item, updateItems, setStatus);
    }

    async function onSave() {
        if (!backendConfig) {
            const errorMessage = 'Konfigurasi backend dokumen belum tersedia.';
            setStatus({ tone: 'error', message: errorMessage });
            showCrudErrorToast(errorMessage);
            return;
        }

        await handleSave({
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
                    },
                    pageId,
                    backendConfig,
                );
                const response =
                    isDetail && values.__backendRecordId
                        ? await updateBackendResource(backendConfig.resource, values.__backendRecordId, payload)
                        : await createBackendResource(backendConfig.resource, payload);

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
                    setLocalRecord(parsed);
                    window.__savedRecordsCache = window.__savedRecordsCache || {};
                    window.__savedRecordsCache[String(record.id)] = parsed;
                }

                if (!isDetail && record?.id && onOpenDetail) {
                    onOpenDetail({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                }
            },
        });
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
                onCloseDetail?.(values.__backendRecordId);
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
                const unitPriceAmount = Number(record.default_sale_price ?? 0);
                const totalAmount = 1 * unitPriceAmount;
                const newItem = {
                    id: `product-item-${Date.now()}-${Math.random()}`,
                    __lineId: null,
                    __productId: record.id,
                    name: record.name,
                    code: record.code ?? '',
                    quantity: '1',
                    unit: record.sales_unit?.name ?? record.base_unit?.name ?? 'PCS',
                    price: formatCurrencyValue(unitPriceAmount),
                    discount: '0',
                    discountValue: '0',
                    total: formatCurrencyValue(totalAmount),
                };
                updateItems((existingItems) => [...existingItems, newItem]);
                showSuccessToast({ message: `Barang [${record.code ?? ''}] ${record.name} ditambahkan.` });
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
                setValues((current) => {
                    const updatedValues = {
                        ...current,
                        additionalCosts: [...(current.additionalCosts ?? []), newCost],
                    };
                    return applyComputedTotals(updatedValues, updatedValues.items);
                });
                showSuccessToast({ message: `Biaya [${record.code ?? ''}] ${record.name} ditambahkan.` });
            },
            onEditCostItem: async (costItem) => {
                try {
                    const nextCost = await promptCostEditor(costItem);
                    if (!nextCost) return;

                    setValues((current) => {
                        const updatedValues = {
                            ...current,
                            additionalCosts: current.additionalCosts.map((entry) =>
                                entry.id === costItem.id ? nextCost : entry
                            ),
                        };
                        return applyComputedTotals(updatedValues, updatedValues.items);
                    });
                    showSuccessToast({ message: 'Biaya diperbarui.' });
                } catch (error) {
                    showErrorToast({ message: error.message });
                }
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
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                footer={config.showFooter !== false ? <SalesDocumentFooter values={values} setValues={setValues} /> : null}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                <div className="relative flex-1 flex flex-col min-h-0">
                    {isDetail && values.approvalStamp ? <DocumentStamp label={values.approvalStamp} tone="blue" className="right-[12%] top-[-6px]" /> : null}
                    {isDetail && values.processStamp ? (
                        <DocumentStamp
                            label={values.processStamp}
                            tone={values.processStampTone ?? 'green'}
                            className={
                                activeSectionId === 'additional-info'
                                    ? 'left-[49%] top-[34%]'
                                    : activeSectionId === 'advance-payments'
                                      ? 'left-[49%] top-[36%]'
                                      : 'left-[50%] top-[40%]'
                            }
                        />
                    ) : null}

                    <ActiveSectionComponent
                        {...buildSectionProps(activeSectionId, config, values, setValues, isDetail, handlers)}
                    />
                </div>
            </TransactionFormLayout>

            <SalesDocumentItemModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} modal={values.itemModal} />
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
            <ImportItemsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={handlers.onImportItems}
                mode={String(pageId || '').toLowerCase().includes('purchase') || String(pageId || '').toLowerCase().includes('receipt') ? 'purchasing' : 'sales'}
            />
        </>
    );
}
