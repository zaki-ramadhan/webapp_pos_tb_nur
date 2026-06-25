import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { showSuccessToast, showErrorToast } from '@/components/feedback/toast';
import ImportItemsModal from '@/features/workspace/shared/ImportItemsModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
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
    TransactionDock,
    TransactionSectionRail,
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
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        setLocalRecord(null);
    }, [activeRecordId]);

    const sourceRecord = useMemo(() => {
        if (localRecord) {
            return localRecord;
        }

        return activeRecordId
            ? buildRecord(config.table.rows.find((row) => row.id === activeRecordId))
            : config.draft;
    }, [activeRecordId, buildRecord, config.draft, config.table.rows, localRecord]);
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
        setValues(buildSalesDocumentFormState(sourceRecord));
        setItemModalOpen(false);
        setImportModalOpen(false);
    }, [config, isDetail, sourceRecord]);

    const validationMessage = useMemo(() => validateSalesDocumentValues(values, config), [config, values]);
    const isDirty = useMemo(() => resolveSalesDocumentDirty(values, initialSnapshot), [initialSnapshot, values]);

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

                if (record) {
                    const parsed = buildRecord ? buildRecord(record) : record;
                    setLocalRecord(parsed);
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
        }),
        [selectLookup, updateItems, setStatus],
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
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 flex flex-col gap-3">
                    <div className="bg-white border border-ui-border rounded-[6px] shadow-card-light px-4 py-4">
                        <SalesDocumentFormHeader
                            pageId={pageId}
                            config={config}
                            values={values}
                            setValues={setValues}
                            isDetail={isDetail}
                            backendConfig={backendConfig}
                            handlers={handlers}
                            onSelectCustomer={() =>
                                selectLookup(
                                    backendConfig?.partnerResource ?? 'customers',
                                    String(config.labels.customer).toLowerCase(),
                                    (record) =>
                                        setValues((current) => ({
                                            ...current,
                                            __partnerId: record.id,
                                            customer: [buildLookupLabel(record)],
                                            address: record.shipping_address ?? record.billing_address ?? current.address,
                                        })),
                                )
                            }
                        />
                    </div>

                    <CrudStatusMessage status={status} className="mx-3" />

                    <div className="flex gap-0 px-2 sm:px-3">
                        <TransactionSectionRail tabs={config.sectionTabs} activeTabId={activeSectionId} onSelectTab={setActiveSectionId} />

                        <div className="relative min-w-0 flex-1 rounded-[6px] border border-ui-border bg-white px-3 py-3 shadow-card-light">
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
                    </div>

                    {config.showFooter !== false ? (
                        <div className="px-3">
                            <SalesDocumentFooter values={values} />
                        </div>
                    ) : null}
                </div>

                <div className="shrink-0 lg:w-[96px] lg:pt-4">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>

            <SalesDocumentItemModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} modal={values.itemModal} />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Hapus Dokumen"
                message={
                    values.items && values.items.length > 0 ? (
                        <div>
                            <p className="mb-2">
                                Dokumen ini memiliki {values.items.length} baris detail transaksi yang akan ikut terhapus permanen:
                            </p>
                            <ul className="mb-3 list-disc pl-5 text-sm text-slate-500 max-h-[150px] overflow-y-auto">
                                {values.items.map((item, idx) => (
                                    <li key={item.id ?? idx}>
                                        {item.itemCode || item.code} - {item.itemName || item.name} (Qty: {item.quantity})
                                    </li>
                                ))}
                            </ul>
                            <p>Apakah Anda yakin ingin melanjutkan penghapusan permanen?</p>
                        </div>
                    ) : (
                        "Dokumen ini akan dihapus permanen. Lanjutkan?"
                    )
                }
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
            <ImportItemsModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={handlers.onImportItems}
                mode={String(pageId || '').toLowerCase().includes('purchase') || String(pageId || '').toLowerCase().includes('receipt') ? 'purchasing' : 'sales'}
            />
        </div>
    );
}
