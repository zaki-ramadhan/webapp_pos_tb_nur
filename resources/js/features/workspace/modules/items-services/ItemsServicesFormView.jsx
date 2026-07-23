import { useEffect, useMemo, useState } from 'react';

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
    renderItemsServicesDockIcon,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useFormValuesSync } from '@/features/workspace/shared/hooks/useFormValuesSync';
import {
    createBackendResource,
    deleteBackendResource,
    extractBackendRows,
    getBackendErrorMessage,
    listBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { useWorkspaceDirtyRegistration } from '@/features/workspace/dashboard/WorkspaceDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';
import { parseAmountInput } from '@/features/workspace/shared/amountFormatting';

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

    // Fetch saved stock locations from DB and populate openingStockRows
    useEffect(() => {
        if (!detailRow?.id) return;
        let active = true;

        listBackendResource('item-locations', { product_id: detailRow.id, per_page: 100 })
            .then((response) => {
                if (!active) return;
                const rows = extractBackendRows(response);
                const stockRows = rows
                    .filter((r) => parseAmountInput(r.stock_on_hand) !== 0)
                    .map((r) => ({
                        id: `db-stock-${r.id ?? r.warehouse_id}`,
                        date: '-',
                        warehouse: r.warehouse_name ?? r.warehouse?.name ?? '-',
                        quantity: parseAmountInput(r.stock_on_hand),
                        unit: r.unit_name ?? r.unit?.name ?? '-',
                        unitCost: parseAmountInput(r.average_cost ?? r.unit_cost),
                        serials: [],
                        __fromDb: true,
                    }));
                setValues((prev) => {
                    // Don't override if user has already added rows
                    const hasUserRows = (prev.openingStockRows ?? []).some((r) => !r.__fromDb);
                    if (hasUserRows) return prev;
                    return { ...prev, openingStockRows: stockRows };
                });
            })
            .catch(() => {/* silent — tidak hapus data lokal */});

        return () => { active = false; };
    }, [detailRow?.id]);

    useFormValuesSync({
        initialValues,
        recordId: detailRow?.id ?? null,
        values,
        isDirty,
        setValues,
    });

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const filteredTabs = useMemo(() => {
        const hasStockTab = values.kind === 'Persediaan' || values.kind === 'Grup';
        return (config.tabs ?? []).filter((tab) => {
            if (tab.id === 'stock') {
                return hasStockTab;
            }
            return true;
        });
    }, [config.tabs, values.kind]);

    useEffect(() => {
        const tabExists = filteredTabs.some((tab) => tab.id === activeTabId);
        if (!tabExists) {
            setActiveTabId('general');
        }
    }, [filteredTabs, activeTabId]);

    const saveDisabled = saving || !isDirty || !values.name?.trim() || (isDetail && !values.code?.trim());

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
        if (isDetail && !values.code?.trim()) {
            rejectCrudFormAction('Kode Barang wajib diisi.', { setStatus });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: isDetail ? 'Sedang memperbarui barang/jasa.' : 'Sedang menyimpan barang/jasa.',
            successMessage: isDetail ? 'Barang/jasa berhasil diperbarui.' : 'Barang/jasa berhasil dibuat.',
            setSaving,
            setStatus,
            execute: async () => {
                const payload = {
                    code: isDetail ? values.code?.trim() : buildGeneratedDocNumber('BRG'),
                    barcode: values.barcode?.trim() || null,
                    name: values.name?.trim(),
                    product_type: values.kind || 'Persediaan',
                    category_id: values.category?.[0]?.id ?? values.categoryId ?? null,
                    brand_id: values.brand?.[0]?.id ?? values.brandId ?? null,
                    base_unit_id: values.primaryUnit?.[0]?.id ?? values.baseUnitId ?? null,
                    purchase_unit_id: values.purchaseUnit?.[0]?.id ?? values.purchaseUnitId ?? null,
                    sales_unit_id: values.salesUnit?.[0]?.id ?? values.salesUnitId ?? null,
                    minimum_stock: values.minimumStock ? parseAmountInput(values.minimumStock) : null,
                    default_purchase_price: values.purchasePrice ? parseAmountInput(values.purchasePrice) : null,
                    default_sale_price: values.sellPriceLevel1 ? parseAmountInput(values.sellPriceLevel1) : null,
                    notes: values.notes?.trim() || null,
                    is_active: values.isActive !== false,
                    attachment_ids: (values.attachments ?? []).map((att) => att.id),
                    inventory_account_id: values.inventoryAccountId ?? null,
                    sales_account_id: values.salesAccountId ?? null,
                    sales_return_account_id: values.salesReturnAccountId ?? null,
                    sales_discount_account_id: values.salesDiscountAccountId ?? null,
                    delivered_goods_account_id: values.deliveredGoodsAccountId ?? null,
                    cogs_account_id: values.cogsAccountId ?? null,
                    purchase_return_account_id: values.purchaseReturnAccountId ?? null,
                    uninvoiced_purchase_account_id: values.uninvoicedPurchaseAccountId ?? null,
                    unit_conversions: (values.unitConversions ?? [])
                        .map((conv) => ({
                            id: String(conv.id).startsWith('conversion-') ? undefined : conv.id,
                            unit_id: conv.unit?.[0]?.id ?? conv.unitId ?? null,
                            quantity: conv.quantity ? parseAmountInput(conv.quantity) : 0,
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
                        label: record.name ?? values.name.trim(),
                        tabLabel: record.name ?? values.name.trim(),
                    });
                    setValues(buildFormValues(config, null));
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
                window.dispatchEvent(new CustomEvent('workspace:close-tab', { detail: { tabId: activeLevel2Tab?.id } }));
                onOpenContent?.();
            },
        });
    }

    return (
        <ModuleFormTemplate
            form={{ ...config, tabs: filteredTabs }}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            status={status}
            saving={saving}
            saveDisabled={saveDisabled}
            onSave={handleSave}
            actionsSlot={
                <>
                    {isDetail ? (
                        <DockActionButton
                            label={saving ? 'Memproses...' : 'Hapus'}
                            tone="danger"
                            icon={<TrashIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
                            disabled={saving}
                            onClick={requestDelete}
                        />
                    ) : null}
                </>
            }
        >
            <div className="flex-1 min-h-0">
                {activeTabId === 'sales-purchase' ? (
                    <ItemSalesPurchaseTab config={config} values={values} onChange={handleChange} />
                ) : activeTabId === 'stock' ? (
                    (() => {
                        const openingStockRows = values.openingStockRows || [];
                        const totalQty = openingStockRows.reduce((sum, r) => sum + (parseAmountInput(r.quantity) || 0), 0);
                        const totalCost = openingStockRows.reduce((sum, r) => {
                            const qty = parseAmountInput(r.quantity) || 0;
                            const cost = parseAmountInput(r.unitCost) || 0;
                            return sum + (qty * cost);
                        }, 0);
                        const avgCost = totalQty > 0 ? (totalCost / totalQty) : 0;
                        const stockValues = {
                            ...values,
                            stockQuantity: String(totalQty),
                            stockUnitValue: String(avgCost),
                            stockCostOfGoods: String(totalCost),
                        };
                        return <ItemStockTab config={config} values={stockValues} onChange={handleChange} />;
                    })()
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

            <ConfirmationModal
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleDelete}
                title="Konfirmasi"
                message={
                    values.unitConversions && values.unitConversions.length > 0 ? (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.code} - ${values.name}\n\nBarang/jasa ini memiliki data konversi unit berelasi yang akan ikut terhapus.`
                    ) : (
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.code} - ${values.name}`
                    )
                }
                confirmLabel="Ya"
                cancelLabel="Batal"
                confirmVariant="primary"
                confirmLoading={saving}
            />
        </ModuleFormTemplate>
    );
}

