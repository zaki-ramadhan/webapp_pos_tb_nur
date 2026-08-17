import { useEffect, useMemo, useState } from 'react';

import {
    ItemGeneralTab,
    ItemGroupTab,
    ItemSalesPurchaseTab,
} from '@/features/workspace/modules/items-services/ItemsServicesPrimaryTabs';
import {
    ItemAccountsTab,
    ItemImagesTab,
    ItemMutationTab,
    ItemOtherTab,
    ItemStockTab,
    ItemWarehouseTab,
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
    getBackendResource,
    listBackendResource,
    updateBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';
import { mapProductRow } from '@/features/workspace/backend/workspaceBackendAdapters';
import { useWorkspaceFormDraftState } from '@/features/workspace/shared/hooks/useWorkspaceFormDraftState';
import { executeCrudFormAction, rejectCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import ModuleFormTemplate from '@/components/ui/ModuleFormTemplate';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { TrashIcon } from '@/features/workspace/shared/Icons';
import { buildGeneratedDocNumber } from '@/features/workspace/shared/documentNumberUtils';
function mapBackendStockRows(rows, detailRow) {
    return rows
        .map((r) => {
            const qty = parseAmountInput(r.quantity ?? r.saleable_stock ?? r.stock_on_hand ?? 0);
            const warehouseName = typeof r.warehouse === 'string' ? r.warehouse : (r.warehouse_name ?? r.warehouse?.name ?? '-');
            const unitName = (typeof r.unit === 'string' && r.unit)
                ? r.unit
                : (r.unit_name ?? r.unit?.name ?? detailRow?.primaryUnit?.[0]?.name ?? detailRow?.baseUnit?.name ?? detailRow?.base_unit?.name ?? detailRow?.unit ?? detailRow?.purchaseUnit?.[0]?.name ?? detailRow?.purchase_unit?.name ?? 'PCS');
            const cost = typeof r.raw_unit_cost === 'number' && r.raw_unit_cost > 0
                ? r.raw_unit_cost
                : parseAmountInput(r.unit_cost ?? r.average_cost ?? detailRow?.default_purchase_price ?? detailRow?.purchasePrice ?? detailRow?.default_sale_price ?? 0);
            return {
                id: `db-stock-${r.id ?? r.warehouse_id}`,
                warehouse_id: r.warehouse_id ? Number(r.warehouse_id) : null,
                date: (r.date && r.date !== '-') ? r.date : (r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'),
                warehouse: warehouseName,
                quantity: qty,
                unit: unitName,
                unitCost: cost,
                serials: [],
                __fromDb: true,
            };
        })
        .filter((r) => r.quantity !== 0);
}

export default function ItemsServicesFormView({
    pageId,
    config,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
    onRefresh,
}) {
    const recordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const [fetchedRow, setFetchedRow] = useState(null);
    const [dbStockRows, setDbStockRows] = useState([]);

    useEffect(() => {
        if (!recordId) {
            setFetchedRow(null);
            setDbStockRows([]);
            return;
        }

        let active = true;
        getBackendResource('products', recordId)
            .then((response) => {
                if (!active) return;
                const data = response?.data ?? response;
                if (data && data.id) {
                    setFetchedRow(mapProductRow(data));
                }
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, [recordId]);

    const detailRow = useMemo(() => {
        if (fetchedRow && String(fetchedRow.id) === String(recordId)) {
            return fetchedRow;
        }

        if (!recordId) {
            return null;
        }

        return config.table.rows.find((row) => String(row.id) === String(recordId)) ?? null;
    }, [recordId, fetchedRow, config.table.rows]);

    const isDetail = Boolean(detailRow);
    const [activeTabId, setActiveTabId] = useState(config.tabs?.[0]?.id ?? 'general');
    const initialValues = useMemo(() => {
        const base = buildItemsServicesFormValues(config, detailRow);
        if (dbStockRows.length > 0) {
            base.openingStockRows = dbStockRows;
        }
        return base;
    }, [detailRow, config, dbStockRows]);

    const {
        values,
        setValues,
        isDirty,
        markClean,
        updateDbBaseline,
    } = useWorkspaceFormDraftState({
        initialValues,
        recordId: detailRow?.id ?? null,
        pageId,
        tabId: activeLevel2Tab?.id,
    });

    const [status, setStatus] = useState({ tone: '', message: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const activeTabInstanceId = activeLevel2Tab?.id;

    useEffect(() => {
        setActiveTabId(config.tabs?.[0]?.id ?? 'general');
        setStatus({ tone: '', message: '' });
        setDeleteConfirmationOpen(false);
    }, [activeTabInstanceId, detailRow?.id]);

    useEffect(() => {
        if (!recordId) {
            setDbStockRows([]);
            return;
        }
        let active = true;

        listBackendResource('item-locations', { product_id: recordId, per_page: 100, _refresh: Date.now() })
            .then((response) => {
                if (!active) return;
                const rows = extractBackendRows(response);
                const stockRows = mapBackendStockRows(rows, detailRow);

                setDbStockRows(stockRows);
                updateDbBaseline((prev) => {
                    const hasUserRows = (prev.openingStockRows ?? []).some((r) => !r.__fromDb);
                    if (hasUserRows) return prev;
                    return { ...prev, openingStockRows: stockRows };
                });
            })
            .catch(() => {});

        return () => { active = false; };
    }, [recordId, updateDbBaseline]);

    function handleChange(field, nextValue) {
        setValues((currentValues) => ({
            ...currentValues,
            [field]: nextValue,
        }));
    }

    const isStock = useMemo(() => {
        const k = String(values.kind ?? '').trim().toLowerCase();
        return k === 'persediaan' || k === 'stock' || k === 'inventory' || !k;
    }, [values.kind]);

    const rightTabs = useMemo(() => {
        if (!isDetail || !isStock) return [];
        return [
            { id: 'mutasi', label: 'Mutasi' },
            { id: 'gudang', label: 'Gudang' },
        ];
    }, [isDetail, isStock]);

    const filteredTabs = useMemo(() => {
        const isGroup = values.kind === 'Grup' || String(values.kind ?? '').toLowerCase() === 'group';
        return (config.tabs ?? []).filter((tab) => {
            if (tab.id === 'stock') {
                return isStock;
            }
            if (tab.id === 'group') {
                return isGroup;
            }
            return true;
        });
    }, [config.tabs, isStock, values.kind]);

    useEffect(() => {
        const allTabs = [...filteredTabs, ...rightTabs];
        const tabExists = allTabs.some((tab) => tab.id === activeTabId);
        if (!tabExists) {
            setActiveTabId('general');
        }
    }, [filteredTabs, rightTabs, activeTabId]);

    const saveDisabled = saving || !values.name?.trim() || (isDetail && !values.code?.trim());



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
            loadingMessage: isDetail ? 'Sedang memperbarui barang.' : 'Sedang menyimpan barang.',
            successMessage: isDetail ? 'Barang berhasil diperbarui.' : 'Barang berhasil dibuat.',
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
                    main_supplier_id: values.mainSupplier?.[0]?.id ?? values.mainSupplierId ?? values.supplierId ?? null,
                    minimum_stock: values.minimumStock ? parseAmountInput(values.minimumStock) : null,
                    default_purchase_price: values.purchasePrice ? parseAmountInput(values.purchasePrice) : null,
                    default_sale_price: values.sellPriceLevel1 ? parseAmountInput(values.sellPriceLevel1) : null,
                    print_group_details: values.printGroupDetails !== false,
                    allow_edit_group_quantity: Boolean(values.allowEditGroupQuantity),
                    use_group_price: values.useGroupPrice !== false,
                    notes: values.notes?.trim() || null,
                    attachment_ids: (values.attachments ?? [])
                        .map((att) => (typeof att === 'object' ? att?.id : att))
                        .filter((id) => id != null && !isNaN(Number(id)) && Number(id) > 0)
                        .map(Number),
                    sales_account_id: values.salesAccountId ?? null,
                    sales_return_account_id: values.salesReturnAccountId ?? null,
                    sales_discount_account_id: values.salesDiscountAccountId ?? null,
                    delivered_goods_account_id: values.deliveredGoodsAccountId ?? null,
                    cogs_account_id: values.cogsAccountId ?? null,
                    purchase_return_account_id: values.purchaseReturnAccountId ?? null,
                    uninvoiced_purchase_account_id: values.uninvoicedPurchaseAccountId ?? null,
                    opening_stock_rows: (values.openingStockRows ?? [])
                        .filter((r) => !r.__fromDb)
                        .map((r) => ({
                            warehouse_id: r.warehouse_id ?? r.warehouseId ?? null,
                            warehouse_name: typeof r.warehouse === 'string' ? r.warehouse : (r.warehouse?.name ?? null),
                            quantity: parseAmountInput(r.quantity),
                            unit_cost: parseAmountInput(r.unitCost),
                            unit_name: typeof r.unit === 'string' ? r.unit : (r.unit?.name ?? null),
                            date: r.date || null,
                        })),
                    unit_conversions: (values.unitConversions ?? [])
                        .map((conv) => ({
                            id: String(conv.id).startsWith('conversion-') ? undefined : conv.id,
                            unit_id: conv.unit?.[0]?.id ?? conv.unitId ?? null,
                            quantity: conv.quantity ? parseAmountInput(conv.quantity) : 0,
                        }))
                        .filter((conv) => conv.unit_id && conv.quantity > 0),
                    group_items: (values.groupItems ?? [])
                        .map((item) => ({
                            id: String(item.id).startsWith('group-item-') ? undefined : item.id,
                            child_product_id: item.child_product_id ?? item.child_product?.id ?? item.id,
                            unit_id: item.unit_id ?? item.unitId ?? null,
                            quantity: item.quantity ? parseAmountInput(item.quantity) : 1,
                        }))
                        .filter((item) => item.child_product_id && item.quantity > 0),
                };

                const response = isDetail && detailRow?.id
                    ? await updateBackendResource('products', detailRow.id, payload)
                    : await createBackendResource('products', payload);

                return response?.data ?? null;
            },
            getErrorMessage: (error) => getBackendErrorMessage(error),
            onSuccess: async (record) => {
                await onRefresh?.();
                markClean();
                if (recordId) {
                    listBackendResource('item-locations', { product_id: recordId, per_page: 100, _refresh: Date.now() })
                        .then((res) => {
                            const rows = extractBackendRows(res);
                            const stockRows = mapBackendStockRows(rows, detailRow);

                            setDbStockRows(stockRows);
                            setValues((prev) => ({
                                ...prev,
                                openingStockRows: stockRows,
                            }));
                        })
                        .catch(() => {});
                }
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
                    if (activeLevel2Tab?.id) {
                        window.dispatchEvent(
                            new CustomEvent('workspace:close-tab', {
                                detail: { tabId: activeLevel2Tab.id },
                            })
                        );
                    }
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
            loadingMessage: 'Sedang menghapus barang.',
            successMessage: 'Barang berhasil dihapus.',
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
            form={{ ...config, tabs: filteredTabs, rightTabs }}
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
                        const confirmedRows = openingStockRows.filter((r) => r.__fromDb);
                        const totalQty = confirmedRows.reduce((sum, r) => sum + (parseAmountInput(r.quantity) || 0), 0);
                        const totalCost = confirmedRows.reduce((sum, r) => {
                            const qty = parseAmountInput(r.quantity) || 0;
                            const cost = parseAmountInput(r.unitCost) || 0;
                            return sum + (qty * cost);
                        }, 0);
                        const avgCost = totalQty > 0
                            ? (totalCost / totalQty)
                            : (detailRow?.default_purchase_price ? Number(detailRow.default_purchase_price) : 0);
                        const stockValues = {
                            ...values,
                            stockQuantity: String(totalQty),
                            stockUnitValue: String(avgCost),
                            stockCostOfGoods: String(totalCost),
                        };
                        return <ItemStockTab config={config} values={stockValues} onChange={handleChange} />;
                    })()
                ) : activeTabId === 'group' ? (
                    <ItemGroupTab values={values} onChange={handleChange} />
                ) : activeTabId === 'accounts' ? (
                    <ItemAccountsTab config={config} values={values} onChange={handleChange} />
                ) : activeTabId === 'images' ? (
                    <ItemImagesTab values={values} onChange={handleChange} />
                ) : activeTabId === 'other' ? (
                    <ItemOtherTab config={config} values={values} onChange={handleChange} />
                ) : activeTabId === 'mutasi' ? (
                    <ItemMutationTab productId={detailRow?.id} />
                ) : activeTabId === 'gudang' ? (
                    <ItemWarehouseTab productId={detailRow?.id} />
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
                        `Apakah Anda yakin akan melakukan penghapusan data:\n${values.code} - ${values.name}\n\nBarang ini memiliki data konversi unit berelasi yang akan ikut terhapus.`
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

