import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    buildInventoryAdjustmentPayload,
} from '@/features/workspace/backend/inventoryAdjustmentBackend';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import TableListView from '@/features/workspace/modules/TableListView';
import InventoryAdjustmentItemModal from '@/features/workspace/modules/inventory-adjustment/InventoryAdjustmentItemModal';
import {
    TransactionDock,
    TransactionSectionRail,
    TransactionToolbarIconButton,
    TransactionTotalCard,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { showCrudErrorToast } from '@/features/workspace/shared/crudFeedback';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { CogIcon, PrintIcon } from '@/features/workspace/shared/Icons';
import { promptSelectBackendRecord } from '@/features/workspace/shared/promptLookupSelection';
import {
    applyInventoryPromptItemUpdate,
    buildFormValues,
    buildInventoryComparableSnapshot,
    buildInventoryDocumentNumber,
    buildLookupLabel,
    resolveInventoryDirtyState,
    validateInventoryAdjustmentValues,
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
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const isDetail = Boolean(activeRecordId);
    const initialSnapshot = useMemo(() => buildInventoryComparableSnapshot(buildFormValues(sourceRecord)), [sourceRecord]);

    useEffect(() => {
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
        setValues(buildFormValues(sourceRecord));
        setSelectedItem(null);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateInventoryAdjustmentValues(values, config, isDetail), [config, isDetail, values]);
    const isDirty = useMemo(() => resolveInventoryDirtyState(values, initialSnapshot), [initialSnapshot, values]);
    const saveDisabled = saving || !isDirty || Boolean(validationMessage);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function selectLookup(resource, title, onApply) {
        try {
            const record = await promptSelectBackendRecord(resource, title, buildLookupLabel);

            if (!record) {
                return;
            }

            onApply(record);
            setStatus({ tone: '', message: '' });
        } catch (error) {
            setStatus({ tone: 'error', message: getBackendErrorMessage(error, error.message) });
        }
    }

    function handleCreateItem() {
        applyInventoryPromptItemUpdate(null, setValues, setStatus);
    }

    function handleEditItem(item) {
        applyInventoryPromptItemUpdate(item, setValues, setStatus);
    }

    async function handleSave() {
        if (!backendConfig) {
            const errorMessage = 'Konfigurasi backend belum tersedia.';
            setStatus({ tone: 'error', message: errorMessage });
            showCrudErrorToast(errorMessage);
            return;
        }

        if (validationMessage) {
            rejectCrudFormAction(validationMessage, { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui dokumen.' : 'Sedang menyimpan dokumen.',
            successMessage: isDetail ? 'Dokumen berhasil diperbarui.' : 'Dokumen berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
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
                }
            },
        });
    }

    function requestDelete() {
        if (!backendConfig || !values.__backendRecordId || saving) {
            return;
        }

        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!backendConfig || !values.__backendRecordId) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus dokumen.',
            successMessage: 'Dokumen berhasil dihapus.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource(backendConfig.resource, values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const dockActions = useMemo(
        () =>
            (values.dockActions ?? []).map((action) => {
                if (action.id === 'save') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: handleSave,
                        disabled: action.disabled || saveDisabled,
                    };
                }

                if (action.id === 'delete') {
                    return {
                        ...action,
                        label: saving ? 'Memproses...' : action.label,
                        onClick: requestDelete,
                    };
                }

                return action;
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
        [],
    );

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <InventoryAdjustmentHeader config={config} values={values} setValues={setValues} isDetail={isDetail} />
                    <CrudStatusMessage status={status} className="mx-4 mt-3" />

                    <div className="flex min-h-0 flex-col gap-4 px-4 py-4 lg:flex-row">
                        <TransactionSectionRail
                            tabs={config.sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={setActiveSectionId}
                        />
                        <div className="min-w-0 flex-1">
                            {activeSectionId === 'additional-info' ? (
                                <InventoryAdjustmentInfoSection config={config} values={values} setValues={setValues} handlers={handlers} />
                            ) : (
                                <InventoryAdjustmentDetailsSection
                                    config={config}
                                    values={values}
                                    setValues={setValues}
                                    isDetail={isDetail}
                                    onOpenItem={isDetail ? setSelectedItem : handleEditItem}
                                    onCreateItem={handleCreateItem}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <TransactionDock actions={dockActions} />
            </div>

            <div className="flex justify-end">
                <TransactionTotalCard label="Total" value={values.totalValue} />
            </div>

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
                onConfirm={handleDelete}
                title="Hapus Dokumen"
                message="Dokumen ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}

export function InventoryAdjustmentTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{
                label: config.table.createLabel,
                onClick: onCreate,
            }}
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
