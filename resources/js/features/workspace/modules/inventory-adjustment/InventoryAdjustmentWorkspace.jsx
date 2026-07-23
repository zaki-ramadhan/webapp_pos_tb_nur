import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    buildInventoryAdjustmentPayload,
} from '@/features/workspace/backend/inventoryAdjustmentBackend';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import TableListView from '@/features/workspace/modules/TableListView';
import InventoryAdjustmentItemModal from '@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentItemModal';
import {
    TransactionFormLayout,
    TransactionToolbarIconButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { CogIcon, PrintIcon } from '@/features/workspace/shared/Icons';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { mapDockActions } from '@/features/workspace/modules/shared/workspaceDockActions';
import {
    applyInventoryPromptItemUpdate,
    buildFormValues,
    buildInventoryComparableSnapshot,
    buildInventoryDocumentNumber,
    buildLookupLabel,
    resolveInventoryDirtyState,
    validateInventoryAdjustmentValues,
    buildItemFromProduct,
    buildTotals,
} from './inventoryAdjustmentShared';
import {
    InventoryAdjustmentDetailsSection,
    InventoryAdjustmentHeader,
    InventoryAdjustmentInfoSection,
} from './InventoryAdjustmentSections';


export function InventoryAdjustmentFormView({
    pageId,
    config,
    activeLevel2Tab,
    buildRecord,
    backendConfig,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const activeRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const sourceRecord = useMemo(
        () =>
            activeRecordId
                ? buildRecord(config.table.rows.find((row) => row.id === activeRecordId) ?? { id: activeRecordId }, config)
                : config.draft,
        [activeRecordId, buildRecord, config],
    );
    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormValues(sourceRecord));
    const [selectedItem, setSelectedItem] = useState(null);
    const isDetail = Boolean(activeRecordId);
    const initialSnapshot = useMemo(() => buildInventoryComparableSnapshot(buildFormValues(sourceRecord)), [sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(sourceRecord));
        setSelectedItem(null);
    }, [activeLevel2Tab?.id]);

    const validationMessage = useMemo(() => validateInventoryAdjustmentValues(values, config, isDetail), [config, isDetail, values]);
    const isDirty = useMemo(() => resolveInventoryDirtyState(values, initialSnapshot), [initialSnapshot, values]);

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

    async function handleCreateItem() {
        await applyInventoryPromptItemUpdate(null, setValues, setStatus);
    }

    async function handleEditItem(item) {
        await applyInventoryPromptItemUpdate(item, setValues, setStatus);
    }

    function handleSelectItem(product) {
        if (!product) return;
        const nextItem = buildItemFromProduct(product, pageId);
        setValues((current) =>
            buildTotals(current, [...(current.items ?? []), nextItem])
        );
    }

    async function onSaveClick() {
        if (!backendConfig) {
            const errorMessage = 'Konfigurasi backend belum tersedia.';
            setStatus({ tone: 'error', message: errorMessage });
            return;
        }

        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui dokumen.' : 'Sedang menyimpan dokumen.',
            successMessage: isDetail ? 'Dokumen berhasil diperbarui.' : 'Dokumen berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildInventoryDocumentNumber(pageId)
                        : values.documentNumber;
                const payload = buildInventoryAdjustmentPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
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

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? resolvedDocumentNumber,
                        tabLabel: record.document_number ?? resolvedDocumentNumber,
                    });
                    setValues(buildFormValues(config.draft ?? {}));
                    setSelectedItem(null);
                }
            },
        });
    }

    async function onDeleteClick() {
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

    const dockActions = useMemo(
        () =>
            mapDockActions(values.dockActions ?? [], {
                saving,
                saveDisabled,
                onSave: onSaveClick,
                onDelete: requestDelete,
            }),
        [saveDisabled, saving, values.dockActions],
    );

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
        }),
        [selectLookup],
    );

    return (
        <>
            <TransactionFormLayout
                header={<InventoryAdjustmentHeader pageId={pageId} config={config} values={values} setValues={setValues} isDetail={isDetail} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
                footer={
                    <TransactionTotalCard label="Total" value={values.totalValue} />
                }
            >
                <CrudStatusMessage status={status} className="mb-3" />
                {activeSectionId === 'additional-info' ? (
                    <InventoryAdjustmentInfoSection pageId={pageId} config={config} values={values} setValues={setValues} handlers={handlers} />
                ) : (
                    <InventoryAdjustmentDetailsSection
                        pageId={pageId}
                        config={config}
                        values={values}
                        setValues={setValues}
                        isDetail={isDetail}
                        onOpenItem={isDetail ? setSelectedItem : handleEditItem}
                        onCreateItem={handleCreateItem}
                        onSelectItem={isDetail ? undefined : handleSelectItem}
                    />
                )}
            </TransactionFormLayout>

            <InventoryAdjustmentItemModal
                open={Boolean(selectedItem)}
                onClose={() => setSelectedItem(null)}
                modal={{
                    ...(values.itemModal ?? {}),
                    adjustmentTypeOptions: config.adjustmentTypeOptions,
                }}
                item={selectedItem}
            />
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDeleteClick}
                title="Hapus Dokumen"
                message="Dokumen ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}

export function InventoryAdjustmentTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={config.table.createLabel ? {
                label: config.table.createLabel,
                onClick: onCreate,
            } : null}
            rightControls={
                <>
                    <TransactionToolbarIconButton label="Cetak">
                        <PrintIcon className="h-4 w-4" />
                    </TransactionToolbarIconButton>
                    <TransactionToolbarIconButton label="Pengaturan tabel">
                        <CogIcon className="h-4 w-4" />
                    </TransactionToolbarIconButton>
                </>
            }
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.number,
                    tabLabel: row.number,
                })
            }
        />
    );
}
