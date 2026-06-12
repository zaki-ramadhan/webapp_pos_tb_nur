import { useEffect, useMemo, useState } from 'react';

import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import {
    ItemGeneralTab,
    ItemSalesPurchaseTab,
} from '@/features/workspace/modules/items-services/ItemsServicesPrimaryTabs';
import {
    ItemAccountsTab,
    ItemImagesTab,
    ItemOtherTab,
    ItemStockTab,
} from '@/features/workspace/modules/items-services/ItemsServicesSecondaryTabs';
import {
    buildItemsServicesFormValues,
    DetailActionButton,
    renderItemsServicesDockIcon,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
    createBackendResource,
    deleteBackendResource,
    getBackendErrorMessage,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';

export default function ItemsServicesFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onRefresh,
}) {
    const detailRow = useMemo(() => {
        const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [activeLevel2Tab, config.table.rows]);

    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'general');
    const initialValues = useMemo(() => buildItemsServicesFormValues(config, detailRow), [detailRow, config]);
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
        setActiveTabId(config.tabs?.[0]?.id ?? 'general');
        setValues(initialValues);
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId]);

    useEffect(() => {
        if (!isDirty) {
            setValues(initialValues);
        }
    }, [initialValues, isDirty]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    useWorkspaceDirtyRegistration({
        pageId,
        tabId: activeLevel2Tab?.id,
        dirty: isDirty,
        enabled: Boolean(pageId && activeLevel2Tab?.id),
    });

    async function handleSave() {
        if (!values.name?.trim()) {
            rejectCrudFormAction('Nama Barang wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui barang/jasa.' : 'Sedang menyimpan barang/jasa.',
            successMessage: isDetail ? 'Barang/jasa berhasil diperbarui.' : 'Barang/jasa berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: values.code?.trim() || null,
                    barcode: values.barcode?.trim() || null,
                    name: values.name?.trim(),
                    product_type: values.kind || 'Persediaan',
                    category_id: values.category?.[0]?.id ?? values.categoryId ?? null,
                    brand_id: values.brand?.[0]?.id ?? values.brandId ?? null,
                    base_unit_id: values.primaryUnit?.[0]?.id ?? values.baseUnitId ?? null,
                    purchase_unit_id: values.purchaseUnit?.[0]?.id ?? values.purchaseUnitId ?? null,
                    sales_unit_id: values.salesUnit?.[0]?.id ?? values.salesUnitId ?? null,
                    minimum_stock: values.minimumStock ? parseFloat(values.minimumStock) : null,
                    default_purchase_price: values.purchasePrice ? parseFloat(values.purchasePrice) : null,
                    default_sale_price: values.sellPriceLevel1 ? parseFloat(values.sellPriceLevel1) : null,
                    notes: values.notes?.trim() || null,
                    is_active: values.isActive !== false,
                    attachment_ids: (values.attachments ?? []).map((att) => att.id),
                    unit_conversions: (values.unitConversions ?? [])
                        .map((conv) => ({
                            id: String(conv.id).startsWith('conversion-') ? undefined : conv.id,
                            unit_id: conv.unit?.[0]?.id ?? conv.unitId ?? null,
                            quantity: conv.quantity ? parseFloat(conv.quantity) : 0,
                        }))
                        .filter((conv) => conv.unit_id && conv.quantity > 0),
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('products', detailRow.id, payload)
                    : await createBackendResource('products', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();

                if (!isDetail && record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
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
            loadingMessage: 'Sedang menghapus barang/jasa.',
            successMessage: 'Barang/jasa berhasil dihapus.',
            setSaving,
            setStatus,
            onStart: () => setDeleteConfirmationOpen(false),
            execute: () => deleteBackendResource('products', detailRow.id),
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async () => {
                await onRefresh?.();
                onOpenContent?.();
            },
        });
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="shrink-0 flex flex-col gap-2 border-b border-[#d5d9e1] bg-transparent pl-0 pr-2 pt-[6px] sm:pl-0 lg:flex-row lg:items-end lg:justify-between">
                <PreferencesTabs
                    tabs={config.tabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                    className="flex-1 border-none bg-transparent pt-0"
                />

                {isDetail ? (
                    <div className="flex flex-wrap items-center gap-1.5 pb-[1px]">
                        {config.detailQuickActions.map((label) => (
                            <DetailActionButton key={label} label={label} />
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-5 px-4 py-4 lg:flex-row lg:items-stretch overflow-hidden">
                <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                    <CrudStatusMessage status={status} className="mb-4 shrink-0" />

                    <div className="flex-1 min-h-0 flex flex-col">
                        {activeTabId === 'sales-purchase' ? (
                            <ItemSalesPurchaseTab config={config} values={values} onChange={handleChange} />
                        ) : activeTabId === 'stock' ? (
                            <ItemStockTab config={config} values={values} />
                        ) : activeTabId === 'accounts' ? (
                            <ItemAccountsTab config={config} values={values} onChange={handleChange} />
                        ) : activeTabId === 'images' ? (
                            <ItemImagesTab values={values} onChange={handleChange} />
                        ) : activeTabId === 'other' ? (
                            <ItemOtherTab config={config} values={values} onChange={handleChange} />
                        ) : (
                            <ItemGeneralTab
                                config={config}
                                values={values}
                                onChange={handleChange}
                                isDetail={isDetail}
                            />
                        )}
                    </div>
                </div>

                <div className="order-1 flex justify-end lg:order-2 lg:shrink-0 lg:self-start">
                    <div className="flex flex-row gap-3 lg:flex-col">
                        {(isDetail ? config.detailDockActions : config.createDockActions).map((action) => (
                            <DockActionButton
                                key={action.id}
                                label={action.label}
                                tone={action.tone}
                                icon={renderItemsServicesDockIcon(action.icon)}
                                loading={saving && action.id === 'save'}
                                onClick={() => {
                                    if (action.id === 'save') {
                                        handleSave();
                                    } else if (action.id === 'delete') {
                                        requestDelete();
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Barang/Jasa"
                message={
                    values.unitConversions && values.unitConversions.length > 0 ? (
                        <div>
                            <p className="mb-2">
                                Barang/jasa <strong>"{values.name}"</strong> memiliki data konversi unit berelasi yang akan ikut terhapus:
                            </p>
                            <ul className="mb-3 list-disc pl-5 text-sm text-slate-500 max-h-[150px] overflow-y-auto">
                                {values.unitConversions.map((conv, idx) => (
                                    <li key={conv.id ?? idx}>
                                        Unit: {conv.unitLabel || conv.unit?.[0]?.name || 'Pcs'} (Kuantitas: {conv.quantity})
                                    </li>
                                ))}
                            </ul>
                            <p>Apakah Anda yakin ingin melanjutkan penghapusan permanen?</p>
                        </div>
                    ) : (
                        "Barang/jasa ini akan dihapus permanen. Lanjutkan?"
                    )
                }
                confirmLabel="Hapus"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={saving}
            />
        </div>
    );
}
