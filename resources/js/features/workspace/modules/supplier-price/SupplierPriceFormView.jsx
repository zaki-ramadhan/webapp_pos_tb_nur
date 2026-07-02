import { useEffect, useState, useMemo } from 'react';

import { useTransactionForm } from '@/features/workspace/shared/hooks/useTransactionForm';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { 
    createBackendResource, 
    updateBackendResource, 
    deleteBackendResource 
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

import { TransactionFormLayout } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { SupplierPriceDetailsSection, SupplierPriceHeader, SupplierPriceInfoSection } from './SupplierPriceSections';
import { buildFormValues, buildRecord, buildSupplierPricePayload, validateSupplierPrice } from './supplierPriceShared';

export default function SupplierPriceFormView({ 
    config, 
    activeLevel2Tab, 
    onOpenContent, 
    onOpenDetail, 
    onCloseDetail, 
    onRefresh 
}) {
    const isDetail = Boolean(activeLevel2Tab?.id);
    const pageId = 'supplier-price';
    const activeLevel2TabId = activeLevel2Tab?.id;

    const [activeSectionId, setActiveSectionId] = useState(config.sectionTabs?.[0]?.id ?? 'details');
    const [values, setValues] = useState(() => buildFormValues(config));
    const [localRecord, setLocalRecord] = useState(null);

    useEffect(() => {
        if (activeLevel2Tab?.record) {
            const parsed = buildRecord(activeLevel2Tab.record, config);
            setValues(parsed);
            setLocalRecord(activeLevel2Tab.record);
        } else {
            setValues(buildFormValues(config));
            setLocalRecord(null);
        }
        setActiveSectionId(config.sectionTabs?.[0]?.id ?? 'details');
    }, [activeLevel2Tab, config]);

    const validationMessage = useMemo(() => validateSupplierPrice(values), [values]);

    const {
        status,
        saving,
        deleteConfirmationOpen,
        setDeleteConfirmationOpen,
        handleSave,
        requestDelete,
        handleDelete,
    } = useTransactionForm({ validationMessage });

    const isDirty = useMemo(() => {
        if (isDetail) return false;
        return (values.itemLines?.length ?? 0) > 0 || Boolean(values.__supplierId);
    }, [isDetail, values.itemLines, values.__supplierId]);

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2TabId,
        dirty: isDirty,
        enabled: Boolean(pageId),
    });

    const dockActions = useMemo(
        () =>
            (config.dockActions ?? [])
                .filter((action) => (isDetail ? true : action.id !== 'delete'))
                .map((action) => {
                    if (action.id === 'save') {
                        return {
                            ...action,
                            tone: isDetail ? action.tone : 'primary',
                            disabled: saving || Boolean(validationMessage && (validationMessage.includes('wajib diisi') || validationMessage.includes('wajib dipilih'))),
                            label: saving ? 'Memproses...' : action.label,
                            onClick: onSave,
                        };
                    }
                    if (action.id === 'delete') {
                        return {
                            ...action,
                            disabled: saving,
                            label: saving ? 'Memproses...' : action.label,
                            onClick: onRequestDelete,
                        };
                    }
                    return action;
                }),
        [config.dockActions, isDetail, saving, validationMessage]
    );

    async function onSave() {
        await handleSave({
            loadingMessage: isDetail ? 'Sedang memperbarui harga pemasok.' : 'Sedang menyimpan harga pemasok.',
            successMessage: isDetail ? 'Harga pemasok berhasil diperbarui.' : 'Harga pemasok berhasil dibuat.',
            execute: async () => {
                if (isDetail && values.__backendRecordId) {
                    const lineItem = values.itemLines[0];
                    const payload = buildSupplierPricePayload(values, lineItem);
                    const response = await updateBackendResource('supplier-prices', values.__backendRecordId, payload);
                    return {
                        record: response?.data ?? null,
                    };
                } else {
                    const requests = values.itemLines.map((lineItem) => {
                        const payload = buildSupplierPricePayload(values, lineItem);
                        return createBackendResource('supplier-prices', payload);
                    });
                    const responses = await Promise.all(requests);
                    return {
                        record: responses[0]?.data ?? null,
                    };
                }
            },
            onSuccess: async ({ record }) => {
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
                    const parsed = buildRecord(record, config);
                    setValues(parsed);
                    setLocalRecord(record);
                }

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: `SP-${String(record.id).padStart(5, '0')}`,
                        tabLabel: `SP-${String(record.id).padStart(5, '0')}`,
                    });
                }
            },
        });
    }

    function onRequestDelete() {
        if (!values.__backendRecordId) return;
        requestDelete();
    }

    async function onDelete() {
        if (!values.__backendRecordId) return;

        await handleDelete({
            loadingMessage: 'Sedang menghapus harga pemasok.',
            successMessage: 'Harga pemasok berhasil dihapus.',
            execute: () => deleteBackendResource('supplier-prices', values.__backendRecordId),
            onSuccess: async () => {
                await onRefresh?.();
                onCloseDetail?.(values.__backendRecordId);
                onOpenContent?.();
            },
        });
    }

    return (
        <TransactionFormLayout
            validationMessage={validationMessage}
            header={<SupplierPriceHeader config={config} values={values} setValues={setValues} />}
            sectionTabs={config.sectionTabs}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
            dockActions={dockActions}
        >
            <CrudStatusMessage status={status} className="mb-4" />
            {activeSectionId === 'additional-info' ? (
                <SupplierPriceInfoSection config={config} values={values} setValues={setValues} />
            ) : (
                <SupplierPriceDetailsSection config={config} values={values} setValues={setValues} isDetail={isDetail} />
            )}
            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={onDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan menghapus harga pemasok ini?`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </TransactionFormLayout>
    );
}
