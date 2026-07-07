import { useEffect, useMemo, useState } from 'react';

import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { SalesCommissionCommissionTab, SalesCommissionOtherTab } from './SalesCommissionSections';
import { buildCommissionFormValues } from './salesCommissionShared';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';

export default function SalesCommissionFormView({
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onCloseDetail,
    onRefresh,
}) {
    const detailRow = useMemo(
        () =>
            activeLevel2Tab?.tabType === 'detail'
                ? (config.table.rows ?? []).find((row) => String(row.id) === String(activeLevel2Tab.recordId)) ?? null
                : null,
        [activeLevel2Tab, config.table.rows],
    );
    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.formTabs?.[0]?.id ?? 'commission');
    const initialValues = useMemo(() => buildCommissionFormValues(config, detailRow), [config, detailRow]);
    const [values, setValues] = useState(() => initialValues);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [initialValues, values]
    );

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(config.formTabs?.[0]?.id ?? 'commission');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

    const saveDisabled = saving || !isDirty || !values.name?.trim();

    useWorkspaceDirtyRegistration({
        pageId: 'sales-commission',
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama perhitungan komisi wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui komisi.' : 'Sedang menyimpan komisi.',
            successMessage: isDetail ? 'Komisi berhasil diperbarui.' : 'Komisi berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    branch_id: 1,
                    document_number: isDetail ? detailRow.document_number : 'COM-' + Date.now(),
                    entry_date: new Date().toISOString().split('T')[0],
                    is_closed: values.inactive,
                    notes: values.notes || '',
                    metadata: {
                        periodType: values.periodType,
                        name: values.name.trim(),
                        sellerScope: values.sellerScope,
                        orderSelections: values.orderSelections,
                        productScope: values.productScope,
                        supplierScope: values.supplierScope,
                        conditionType: values.conditionType,
                        salesValueFrom: values.salesValueFrom,
                        salesValueTo: values.salesValueTo,
                        quantityFrom: values.quantityFrom,
                        quantityTo: values.quantityTo,
                        quantityUnit: values.quantityUnit,
                        rewardType: values.rewardType,
                        rewardValue: values.rewardValue,
                        rewardBase: values.rewardBase,
                    }
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('sales-commissions', detailRow.id, payload)
                    : await createBackendResource('sales-commissions', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
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

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.metadata?.name ?? record.document_number ?? values.name.trim(),
                        tabLabel: record.metadata?.name ?? record.document_number ?? values.name.trim(),
                    });
                }
            },
        });
    }

    function requestDelete() {
        if (!detailRow?.id || saving) {
            return;
        }
        setDeleteConfirmationOpen(true);
    }

    async function handleDelete() {
        if (!detailRow?.id) {
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menghapus komisi.',
            successMessage: 'Komisi berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('sales-commissions', detailRow.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    return (
        <ModuleFormTemplate
            form={{
                tabs: config.formTabs,
                saveLabel: 'Simpan',
            }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                isDetail ? (
                    <DockActionButton
                        label={saving ? 'Memproses...' : 'Hapus'}
                        tone="danger"
                        icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                        disabled={saving}
                        onClick={requestDelete}
                    />
                ) : null
            }
        >
            <div className="flex-1 min-h-0">
                {activeTabId === 'others' ? (
                    <SalesCommissionOtherTab config={config} values={values} setValues={setValues} />
                ) : (
                    <SalesCommissionCommissionTab config={config} values={values} setValues={setValues} />
                )}
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={`Apakah Anda yakin akan melakukan penghapusan data:\n${values.name}`}
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}

