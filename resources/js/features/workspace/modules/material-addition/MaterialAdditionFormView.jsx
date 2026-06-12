import { useEffect, useMemo, useState } from 'react';

import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { areComparableValuesEqual } from '@/features/workspace/shared/formValidation';
import {
    MaterialAdditionAdditionalInfoSection,
    MaterialAdditionChargesSection,
    MaterialAdditionHeader,
    MaterialAdditionItemsSection,
} from './MaterialAdditionSections';
import { createDeleteDockAction } from '@/features/workspace/modules/shared/workspaceDockActions';
import {
    applyMaterialAdditionCharges,
    applyMaterialAdditionItems,
    buildFormValues,
    buildGeneratedMaterialAdditionNumber,
    buildLookupLabel,
    buildMaterialAdditionPayload,
    promptMaterialAdditionCharge,
    promptMaterialAdditionItem,
    validateMaterialAdditionValues,
} from './materialAdditionShared';
import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';

export default function MaterialAdditionFormView({
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
    }, [config.sectionTabs, sourceRecord]);

    const validationMessage = useMemo(() => validateMaterialAdditionValues(values, config), [config, values]);
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

        return baseActions
            .filter((action) => (isDetail ? true : action.id !== 'delete'))
            .map((action) =>
                action.id === 'save'
                    ? {
                          ...action,
                          disabled: saveDisabled,
                          label: saving ? 'Memproses...' : action.label,
                          onClick: onSave,
                      }
                    : action.id === 'delete'
                      ? {
                            ...action,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: onRequestDelete,
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

    async function applyItemUpdate(record, currentItem = null) {
        try {
            const nextItem = await promptMaterialAdditionItem(record, currentItem);

            if (!nextItem) {
                return;
            }

            setValues((current) =>
                applyMaterialAdditionItems(
                    current,
                    currentItem
                        ? (current.items ?? []).map((item) => (item.id === currentItem.id ? nextItem : item))
                        : [...(current.items ?? []), nextItem],
                ),
            );
            setStatus({
                tone: 'success',
                message: currentItem ? 'Rincian barang diperbarui.' : 'Rincian barang ditambahkan.',
            });
        } catch (error) {
            setStatus({ tone: 'error', message: error?.message ?? 'Rincian barang tidak valid.' });
        }
    }

    async function applyChargeUpdate(record, currentCharge = null) {
        try {
            const nextCharge = await promptMaterialAdditionCharge(record, currentCharge);

            if (!nextCharge) {
                return;
            }

            setValues((current) =>
                applyMaterialAdditionCharges(
                    current,
                    currentCharge
                        ? (current.additionalCosts ?? []).map((item) => (item.id === currentCharge.id ? nextCharge : item))
                        : [...(current.additionalCosts ?? []), nextCharge],
                ),
            );
            setStatus({
                tone: 'success',
                message: currentCharge ? 'Biaya lainnya diperbarui.' : 'Biaya lainnya ditambahkan.',
            });
        } catch (error) {
            setStatus({ tone: 'error', message: error?.message ?? 'Biaya lainnya tidak valid.' });
        }
    }

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui penambahan bahan baku.' : 'Sedang menyimpan penambahan bahan baku.',
            successMessage: isDetail ? 'Penambahan bahan baku berhasil diperbarui.' : 'Penambahan bahan baku berhasil dibuat.',
            execute: async () => {
                const resolvedDocumentNumber =
                    values.autoNumber || !String(values.documentNumber ?? '').trim()
                        ? buildGeneratedMaterialAdditionNumber()
                        : values.documentNumber;
                const payload = buildMaterialAdditionPayload({
                    ...values,
                    documentNumber: resolvedDocumentNumber,
                });
                const response = values.__backendRecordId
                    ? await updateBackendResource('material-additions', values.__backendRecordId, payload)
                    : await createBackendResource('material-additions', payload);

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

    function onRequestDelete() {
        if (!values.__backendRecordId) {
            return;
        }
        requestDelete();
    }

    async function onDelete() {
        if (!values.__backendRecordId) {
            return;
        }

        await handleDelete({
            loadingMessage: 'Sedang menghapus penambahan bahan baku.',
            successMessage: 'Penambahan bahan baku berhasil dihapus.',
            execute: () => deleteBackendResource('material-additions', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    const handlers = useMemo(
        () => ({
            onSelectWorkOrder: () =>
                selectLookup(
                    'work-orders',
                    'pekerjaan pesanan',
                    (record) =>
                        setValues((current) => ({
                            ...current,
                            __workOrderId: record.id,
                            workOrderNumber: record.document_number ?? buildLookupLabel(record, 'document_number'),
                        })),
                    (record) => buildLookupLabel(record, 'document_number')
                ),
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
            onSelectCharge: () =>
                selectLookup('accounts', 'akun biaya', (record) => applyChargeUpdate(record)),
            onEditCharge: (charge) => applyChargeUpdate(null, charge),
        }),
        [selectLookup],
    );

    return (
        <>
            <TransactionFormLayout
                header={<MaterialAdditionHeader config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />}
                sectionTabs={config.sectionTabs}
                activeSectionId={activeSectionId}
                onSectionChange={setActiveSectionId}
                dockActions={dockActions}
            >
                <CrudStatusMessage status={status} className="mb-4" />
                {activeSectionId === 'charges' ? (
                    <MaterialAdditionChargesSection config={config} values={values} setValues={setValues} handlers={handlers} />
                ) : activeSectionId === 'additional-info' ? (
                    <MaterialAdditionAdditionalInfoSection config={config} values={values} setValues={setValues} handlers={handlers} />
                ) : (
                    <MaterialAdditionItemsSection config={config} values={values} setValues={setValues} isDetail={isDetail} handlers={handlers} />
                )}
            </TransactionFormLayout>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Hapus Penambahan Bahan Baku"
                message="Penambahan bahan baku ini akan dihapus permanen. Lanjutkan?"
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </>
    );
}
