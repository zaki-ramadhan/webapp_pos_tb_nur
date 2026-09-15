import { useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CircleX } from 'lucide-react';
import { isOwnerUser } from '@/features/workspace/backend/adapters/generalAdapters';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import Pagination from '@/components/ui/Pagination';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';
import { showSuccessToast } from '@/components/feedback/toast';
import Checkbox from '@/components/ui/Checkbox';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ExternalLinkIcon,
    LinkIcon,
    LoadingIcon,
    SearchIcon,
    RefreshIcon,
    DownloadIcon,
} from '@/features/workspace/shared/Icons';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import ToolbarIconButton from '@/features/workspace/shared/toolbar/ToolbarIconButton';

import { cleanHeaderLabel } from '@/features/workspace/shared/columnVisibility';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort from '@/features/workspace/shared/useTableSort';
import {
    BACKEND_INVENTORY_RESOURCES,
    buildInventoryFilters,
    mapInventoryRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import { parseNumericInput } from '@/features/workspace/backend/operationDocumentBackend';
import { buildInitialValues, InquiryControl } from './InventoryInquiryControls';
import { loadInquiryFilter, saveInquiryFilter } from '@/features/workspace/shared/inquiryFilterPersistence';
import { buildTodayDisplayDate } from '@/features/workspace/shared/dateDefaults';
import { formatAmountInput, formatMultiUnitQuantity } from '@/features/workspace/shared/amountFormatting';

function resolveCellAlignClassName(align) {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
}

function isInactiveRow(row) {
    if (!row) return false;
    return row.is_active === false || row.isActive === false;
}

export default function InventoryInquiryView({ config, pageId }) {
    const resource = BACKEND_INVENTORY_RESOURCES[pageId];
    const isItemLocation = pageId === 'item-location';
    const initialValues = useMemo(() => {
        const base = buildInitialValues(config);
        const today = buildTodayDisplayDate();
        if (isItemLocation) {
            const saved = loadInquiryFilter(pageId);
            return {
                ...base,
                ...(saved || {}),
                asOfDate: saved?.asOfDate || today,
                unitMode: saved?.unitMode || 'multi',
            };
        }
        return base;
    }, [config, isItemLocation, pageId]);

    const [values, setValues] = useState(initialValues);
    const [keyword, setKeyword] = useState(config.search?.value ?? '');
    const [debouncedKeyword, setDebouncedKeyword] = useState(config.search?.value ?? '');
    const [isDebouncing, setIsDebouncing] = useState(false);
    const lastFiltersRef = useRef(null);

    const [filters, setFilters] = useState(() => {
        const initFilters = buildInventoryFilters(pageId, {
            ...initialValues,
            keyword: config.search?.value ?? '',
        });
        lastFiltersRef.current = initFilters;
        return initFilters;
    });
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    const isWarehouseMode = values.itemType === 'warehouse';
    const hasTarget = isWarehouseMode
        ? Boolean(values.warehouseSearchId || (values.warehouseSearch && values.warehouseSearch.trim()))
        : Boolean(values.itemSearchId || (values.itemSearch && values.itemSearch.trim()));

    const isQueryEnabled = isItemLocation ? hasTarget : true;

    const {
        rows: rawRows,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to,
        total,
    } = useBackendIndexResource({ resource, filters, enabled: isQueryEnabled });

    const tableRows = useMemo(() => {
        if (isItemLocation && !hasTarget) return [];
        const rows = mapInventoryRows(pageId, rawRows);
        if (!isItemLocation) return rows;

        const unitMode = values.unitMode || 'multi';
        return rows.map((row) => {
            const rawQty = row.rawQuantity ?? 0;
            const baseUnitName = row.baseUnit?.name || row.unitName || row.unit || 'PCS';
            const conversions = row.conversions || [];

            let multiUnitQty = row.multiUnitQuantity;
            let saleableStock = row.saleableStock;

            if (unitMode === 'multi') {
                multiUnitQty = formatMultiUnitQuantity(rawQty, baseUnitName, conversions);
                saleableStock = multiUnitQty;
            } else if (unitMode === 'base' || unitMode === baseUnitName) {
                const formatted = `${formatAmountInput(rawQty)} ${baseUnitName}`;
                multiUnitQty = formatted;
                saleableStock = formatted;
            } else {
                const conv = conversions.find(
                    (c) => (c.unit_name || c.unitName) === unitMode || String(c.unit_id) === String(unitMode)
                );
                if (conv && Number(conv.quantity) > 0) {
                    const ratio = Number(conv.quantity);
                    const convertedQty = rawQty / ratio;
                    const formattedQty = Number.isInteger(convertedQty)
                        ? formatAmountInput(convertedQty)
                        : formatAmountInput(Number(convertedQty.toFixed(2)));
                    const unitLabel = conv.unit_name || conv.unitName || unitMode;
                    const formatted = `${formattedQty} ${unitLabel}`;
                    multiUnitQty = formatted;
                    saleableStock = formatted;
                }
            }

            return {
                ...row,
                multiUnitQuantity: multiUnitQty,
                saleableStock: saleableStock,
            };
        });
    }, [isItemLocation, hasTarget, pageId, rawRows, values.unitMode]);

    const cleanedColumns = useMemo(() => {
        if (isItemLocation && values.itemType === 'warehouse') {
            const isBase = values.unitMode === 'base';
            return [
                { id: 'productName', label: 'Nama Barang', align: 'left', widthClassName: 'w-[280px]' },
                { id: 'productCode', label: 'Kode Barang', align: 'left', widthClassName: 'w-[160px]' },
                { id: 'multiUnitQuantity', label: isBase ? 'Satuan Dasar' : 'Multi Satuan', align: 'left', widthClassName: 'w-[200px]' },
                { id: 'saleableStock', label: 'Stok dapat dijual', align: 'left', widthClassName: 'w-[200px]' },
            ];
        }

        const columns = config.table.columns ?? [];
        return columns.map((col) => {
            if (col.id === 'multiUnitQuantity') {
                let label = 'Kts dalam Multi Satuan';
                if (isItemLocation && values.unitMode && values.unitMode !== 'multi') {
                    label = `Kts (${values.unitMode === 'base' ? (tableRows[0]?.unitName || tableRows[0]?.unit || 'Satuan Dasar') : values.unitMode})`;
                }
                return {
                    ...col,
                    label,
                };
            }
            return {
                ...col,
                label: cleanHeaderLabel(col.label),
            };
        });
    }, [config.table.columns, values.itemType, values.unitMode, isItemLocation, tableRows]);

  // Pisahkan kolom checkbox dari kolom data

    const firstColumnIsCheckbox = cleanedColumns[0]?.kind === 'checkbox';
    const dataColumns = useMemo(
        () => firstColumnIsCheckbox ? cleanedColumns.slice(1) : cleanedColumns,
        [cleanedColumns, firstColumnIsCheckbox],
    );

    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingLookups, setLoadingLookups] = useState(false);

    const pageProps = usePage()?.props ?? {};
    const authUser = pageProps.auth?.user ?? null;
    const isSuperAdmin = isOwnerUser(authUser);
    const resourceAbility = authUser?.abilities?.[resource] ?? null;

    const isAccessRestricted = Boolean(
        (error && String(error).toLowerCase().includes('hak akses')) ||
        (!isSuperAdmin && (resourceAbility === null || resourceAbility?.view === false))
    );

    useEffect(() => {
        if (isAccessRestricted || !authUser || (!isSuperAdmin && (resourceAbility === null || resourceAbility?.view === false))) {
            setLoadingLookups(false);
            return undefined;
        }

        let ignore = false;
        async function fetchLookups() {
            setLoadingLookups(true);
            try {
                const supplierAbility = authUser?.abilities?.['suppliers']?.view !== false;
                const warehouseAbility = authUser?.abilities?.['warehouses']?.view !== false;
                const productAbility = authUser?.abilities?.['products']?.view !== false;

                const lookupPromises = [];
                if (isSuperAdmin || supplierAbility) lookupPromises.push(listBackendResource('suppliers', { per_page: 250 }).catch(() => null));
                else lookupPromises.push(Promise.resolve(null));

                if (isSuperAdmin || warehouseAbility) lookupPromises.push(listBackendResource('warehouses', { per_page: 250 }).catch(() => null));
                else lookupPromises.push(Promise.resolve(null));

                if (isSuperAdmin || productAbility) lookupPromises.push(listBackendResource('products', { per_page: 250 }).catch(() => null));
                else lookupPromises.push(Promise.resolve(null));

                const [supplierData, warehouseData, productData] = await Promise.all(lookupPromises);

                if (!ignore) {
                    if (supplierData) setSuppliers(extractBackendRows(supplierData));
                    if (warehouseData) setWarehouses(extractBackendRows(warehouseData));
                    if (productData) setProducts(extractBackendRows(productData));
                }
            } catch (err) {
                // Ignore lookup errors silently
            } finally {
                if (!ignore) {
                    setLoadingLookups(false);
                }
            }
        }
        fetchLookups();
        return () => {
            ignore = true;
        };
    }, [isAccessRestricted, authUser, isSuperAdmin, resource, resourceAbility]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = debouncedKeyword.trim().toLowerCase();
        const supplierSearch = (values.supplierSearch ?? '').trim().toLowerCase();

        return tableRows.filter((row) => {
            if (supplierSearch) {
                const rowSupplier = String(row.supplier ?? '').toLowerCase();
                if (!rowSupplier.includes(supplierSearch)) {
                    return false;
                }
            }

            if (!normalizedKeyword) return true;

            const searchKeys = config.table.searchKeys?.length
                ? config.table.searchKeys
                : dataColumns.map((col) => col.id);

            return searchKeys.some((key) =>
                String(row[key] ?? '').toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [config.table.searchKeys, dataColumns, debouncedKeyword, tableRows, values.supplierSearch]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);
    const { handleResizeStart, getCellStyle } = useColumnResize('inventory-inquiry');

    const displayRows = useMemo(() => {
        const activeRows = [];
        const inactiveRows = [];
        for (const row of sortedRows) {
            if (isInactiveRow(row)) {
                inactiveRows.push(row);
            } else {
                activeRows.push(row);
            }
        }
        return [...activeRows, ...inactiveRows];
    }, [sortedRows]);

    const serializedIds = displayRows.map((r) => r.id).join(',');
    useMemo(() => setSelectedIds(new Set()), [serializedIds]);

    const selectableRows = useMemo(() => displayRows.filter((r) => !isInactiveRow(r)), [displayRows]);
    const allSelected = selectableRows.length > 0 && selectableRows.every((r) => selectedIds.has(r.id));
    const someSelected = !allSelected && selectableRows.some((r) => selectedIds.has(r.id));

    const hasSelectedProduct = Boolean(values.itemSearchId || (values.itemSearch && values.itemSearch.trim()));
    const shouldShowUnitDropdown = !isItemLocation || values.itemType === 'warehouse' || hasSelectedProduct;

    const currentProductUnitOptions = useMemo(() => {
        if (!isItemLocation || values.itemType === 'warehouse') {
            return [
                { value: 'multi', label: 'Multi Satuan' },
                { value: 'base', label: 'Satuan Dasar' },
            ];
        }

        const selectedProduct = products.find(
            (p) => String(p.id) === String(values.itemSearchId) || p.name === values.itemSearch
        );
        const firstRow = rawRows?.[0];

        const baseUnitName =
            selectedProduct?.base_unit?.name ||
            selectedProduct?.purchase_unit?.name ||
            firstRow?.unit_name ||
            firstRow?.unit ||
            'PCS';

        const rawConversions =
            selectedProduct?.unit_conversions ||
            selectedProduct?.conversions ||
            firstRow?.conversions ||
            [];

        const conversionOptions = (Array.isArray(rawConversions) ? rawConversions : [])
            .map((c) => {
                const name = c.unit?.name || c.unit_name || c.unitName || '';
                return { value: name, label: name };
            })
            .filter((opt) => opt.value && opt.value !== baseUnitName);

        const uniqueConversions = [];
        const seen = new Set([baseUnitName, 'multi']);
        for (const conv of conversionOptions) {
            if (!seen.has(conv.value)) {
                seen.add(conv.value);
                uniqueConversions.push(conv);
            }
        }

        return [
            { value: 'multi', label: 'Multi Satuan' },
            { value: baseUnitName, label: baseUnitName },
            ...uniqueConversions,
        ];
    }, [isItemLocation, values.itemType, values.itemSearchId, values.itemSearch, products, rawRows]);

    useEffect(() => {
        if (isItemLocation && values.unitMode && values.unitMode !== 'multi') {
            const validValues = currentProductUnitOptions.map((o) => o.value);
            if (!validValues.includes(values.unitMode)) {
                setValues((prev) => {
                    const updated = { ...prev, unitMode: 'multi' };
                    saveInquiryFilter(pageId, updated);
                    return updated;
                });
            }
        }
    }, [isItemLocation, values.unitMode, currentProductUnitOptions, pageId]);

    const resolvedControls = useMemo(() => {
        return (config.controls ?? [])
            .filter((control) => {
                if (control.id === 'request') return false;
                if (control.id === 'unitMode' && !shouldShowUnitDropdown) return false;
                return true;
            })
            .map((control) => {
                if (control.id === 'itemSearch') {
                    const isWarehouseMode = values.itemType === 'warehouse';
                    return {
                        ...control,
                        id: isWarehouseMode ? 'warehouseSearch' : 'itemSearch',
                        placeholder: isWarehouseMode ? 'Cari/Pilih Gudang' : 'Cari/Pilih Barang',
                    };
                }
                if (control.id === 'unitMode') {
                    return {
                        ...control,
                        options: currentProductUnitOptions,
                    };
                }
                return control;
            });
    }, [config.controls, shouldShowUnitDropdown, values.itemType, currentProductUnitOptions]);

    function toggleAll() {
        setSelectedIds(allSelected ? new Set() : new Set(selectableRows.map((r) => r.id)));
    }

    function toggleRow(rowOrId) {
        const row = typeof rowOrId === 'object' ? rowOrId : displayRows.find((r) => r.id === rowOrId);
        if (row && isInactiveRow(row)) return;
        const id = typeof rowOrId === 'object' ? rowOrId.id : rowOrId;
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function handleChange(controlId, nextValue) {
        const nextValues = { ...values, [controlId]: nextValue };
        if (controlId === 'supplierSearch' && !nextValue) {
            nextValues.supplierSearchId = null;
        }
        if (controlId === 'warehouseSearch' && !nextValue) {
            nextValues.warehouseSearchId = null;
        }
        if (controlId === 'itemSearch' && !nextValue) {
            nextValues.itemSearchId = null;
            nextValues.unitMode = 'multi';
        }
        if (controlId === 'itemType') {
            nextValues.itemSearch = '';
            nextValues.itemSearchId = null;
            nextValues.warehouseSearch = '';
            nextValues.warehouseSearchId = null;
            nextValues.unitMode = 'multi';
            const newFilters = buildInventoryFilters(pageId, { ...nextValues, keyword });
            lastFiltersRef.current = newFilters;
            setFilters(newFilters);
        }
        setValues(nextValues);
        if (isItemLocation) {
            saveInquiryFilter(pageId, nextValues);
        }
    }

    useEffect(() => {
        const targetFilters = buildInventoryFilters(pageId, {
            ...values,
            keyword,
        });
        const isFiltersChanged = JSON.stringify(targetFilters) !== JSON.stringify(lastFiltersRef.current);
        const isKeywordChanged = keyword !== debouncedKeyword;

        if (!isFiltersChanged && !isKeywordChanged) {
            setIsDebouncing(false);
            return undefined;
        }

        setIsDebouncing(true);
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword);
            setFilters((prev) => {
                const prevJson = JSON.stringify(prev);
                const targetJson = JSON.stringify(targetFilters);
                if (prevJson === targetJson) return prev;
                lastFiltersRef.current = targetFilters;
                return targetFilters;
            });
            setIsDebouncing(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword, values, pageId, debouncedKeyword]);

    useEffect(() => {
        if (error && !isAccessRestricted && (!isItemLocation || hasTarget)) {
            showSystemErrorModal({
                title: 'Terjadi Permasalahan pada Pemrosesan',
                description: 'Silakan perbaiki permasalahan berikut ini:',
                message: typeof error === 'string' ? error : (error.message || 'Terjadi kesalahan saat memuat data.'),
                maxWidthClassName: 'max-w-[480px]',
            });
        }
    }, [error, isAccessRestricted, isItemLocation, hasTarget]);

    function handleButtonClick(controlId) {
        if (controlId === 'order') {
            if (selectedIds.size === 0) {
                showSystemErrorModal({
                    title: 'Terjadi Permasalahan pada Pemrosesan',
                    description: 'Silakan perbaiki permasalahan berikut ini:',
                    message: 'Barang belum ada yang dicentang',
                    maxWidthClassName: 'max-w-[480px]',
                });
                return;
            }

            const selectedRows = displayRows.filter((row) => selectedIds.has(row.id) && !isInactiveRow(row));
            const targetPageId = 'purchase-invoice';
            const targetLabel = 'Faktur Pembelian';

            const lineItems = selectedRows.map((row) => {
                const minLimit = parseNumericInput(row.rawMinimumLimit ?? row.minimumLimit ?? row.minimumStock ?? 0);
                const currentStock = parseNumericInput(row.rawAvailableStock ?? row.availableStock ?? row.rawCurrentStock ?? row.currentStock ?? 0);
                const ordered = parseNumericInput(row.rawOrdered ?? row.ordered ?? 0);

                const netNeeded = minLimit - (currentStock + ordered);
                const calculatedNeeded = netNeeded > 0
                    ? netNeeded
                    : (minLimit - currentStock > 0 ? minLimit - currentStock : 1);

                const qtyNeeded = Math.max(1, parseNumericInput(calculatedNeeded));

                const itemId = String(row.productId || row.itemId || row.id);
                const matchingProduct = products.find((p) => String(p.id) === itemId);

                const price = parseNumericInput(
                    row.defaultPurchasePrice ??
                    row.default_purchase_price ??
                    row.raw_cost_price ??
                    row.costPrice ??
                    row.price ??
                    matchingProduct?.default_purchase_price ??
                    matchingProduct?.cost_price ??
                    0
                );
                const name = row.itemName || row.productName || row.name || matchingProduct?.name || '';
                const code = row.itemCode || row.productCode || row.code || matchingProduct?.code || '';
                const unit = row.unit || row.baseUnit || matchingProduct?.purchase_unit?.name || matchingProduct?.base_unit?.name || '';
                const unitId = row.unitId || row.unit_id || matchingProduct?.purchase_unit_id || matchingProduct?.base_unit_id || null;
                const parsedProdId = !isNaN(Number(itemId)) ? Number(itemId) : null;

                return {
                    id: itemId,
                    productId: itemId,
                    __productId: parsedProdId,
                    __unitId: unitId,
                    name: name,
                    item: name,
                    code: code,
                    itemCode: code,
                    quantity: Number.isInteger(qtyNeeded) ? qtyNeeded : Number(qtyNeeded.toFixed(2)),
                    unit: unit,
                    price: price,
                    discount: 0,
                    discountValue: 0,
                    total: qtyNeeded * price,
                };
            });

            const supplierNames = selectedRows
                .map((r) => (r.supplier && r.supplier !== '-' ? r.supplier.trim() : ''))
                .filter(Boolean);

            const uniqueSupplierNames = [...new Set(supplierNames)];

            let resolvedSupplierName = '';
            let resolvedSupplierId = null;

            if (uniqueSupplierNames.length === 1) {
                const targetSupplierName = uniqueSupplierNames[0];
                const matchingSupplier = suppliers.find((s) =>
                    (targetSupplierName && s.name?.toLowerCase() === targetSupplierName.toLowerCase()) ||
                    (targetSupplierName && s.full_name?.toLowerCase() === targetSupplierName.toLowerCase())
                );
                const rowSupplierId = selectedRows.find((r) => r.supplierId || r.supplier_id)?.supplierId || null;

                resolvedSupplierName = matchingSupplier ? (matchingSupplier.name || matchingSupplier.full_name) : targetSupplierName;
                resolvedSupplierId = matchingSupplier ? matchingSupplier.id : (rowSupplierId ? Number(rowSupplierId) : null);
            }

            const today = buildTodayDisplayDate();

            const initialValues = {
                customer: resolvedSupplierName ? [resolvedSupplierName] : [],
                supplier: resolvedSupplierName ? [resolvedSupplierName] : [],
                __partnerId: resolvedSupplierId ? Number(resolvedSupplierId) : null,
                entryDate: today,
                shippingDate: today,
                items: lineItems,
            };

            window.dispatchEvent(
                new CustomEvent('workspace:open-page', {
                    detail: {
                        pageId: targetPageId,
                        mode: 'form',
                        openForm: true,
                        initialValues,
                    },
                }),
            );

            showSuccessToast({
                title: 'Berhasil',
                message: `Berhasil membuka formulir ${targetLabel} dengan ${selectedRows.length} barang.`,
            });
        }
    }

    function handleLookupSelect(controlId, option) {
        const optionLabel = option.name ?? option.label ?? '';
        const nextValues = {
            ...values,
            [controlId]: optionLabel,
            [controlId + 'Id']: option.id,
        };
        if (controlId === 'itemSearch') {
            nextValues.unitMode = 'multi';
        }
        setValues(nextValues);
        const nextFilters = buildInventoryFilters(pageId, { ...nextValues, keyword });
        lastFiltersRef.current = nextFilters;
        setFilters(nextFilters);
        if (isItemLocation) {
            saveInquiryFilter(pageId, nextValues);
        }
    }

    function handleLookupClear(controlId) {
        const nextValues = {
            ...values,
            [controlId]: '',
            [controlId + 'Id']: null,
        };
        if (controlId === 'itemSearch' || controlId === 'warehouseSearch') {
            nextValues.unitMode = 'multi';
        }
        setValues(nextValues);
        const nextFilters = buildInventoryFilters(pageId, { ...nextValues, keyword });
        lastFiltersRef.current = nextFilters;
        setFilters(nextFilters);
        if (isItemLocation) {
            saveInquiryFilter(pageId, nextValues);
        }
    }

    const emptyMessage = useMemo(() => {
        if (loading) return 'Memuat data...';
        if (error) return error;
        if (isItemLocation && !hasTarget) {
            return 'Belum ada data';
        }
        return config.table.emptyLabel || 'Belum ada data';
    }, [loading, error, isItemLocation, hasTarget, config.table.emptyLabel]);

    const isSearching = isDebouncing || loading;

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
            <fieldset disabled={isAccessRestricted} className="w-full border-0 p-0 m-0 disabled:opacity-60 disabled:pointer-events-none">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                        {resolvedControls.map((control) => (
                            <div key={control.id} className={control.wrapperClassName ?? ''}>
                                <InquiryControl
                                    control={control}
                                    value={control.id ? values[control.id] ?? '' : ''}
                                    onChange={handleChange}
                                    onSelectLookup={handleLookupSelect}
                                    onClearLookup={handleLookupClear}
                                    onRefresh={reload}
                                    exportConfig={{
                                        rows: displayRows,
                                        columns: cleanedColumns,
                                        filename: 'barang-per-gudang'
                                    }}
                                    suppliers={suppliers}
                                    warehouses={warehouses}
                                    products={products}
                                    onLookupSelect={handleLookupSelect}
                                    onLookupClear={handleLookupClear}
                                    searching={loadingLookups || isSearching}
                                    loading={isSearching}
                                    onButtonClick={handleButtonClick}
                                />
                            </div>
                        ))}
                    </div>

                    {config.search ? (
                        <div className="flex items-center gap-2">
                            <TextInput
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder={config.search.placeholder ?? 'Cari...'}
                                trailing={
                                    isSearching ? (
                                        <LoadingIcon className="h-5 w-5 animate-spin text-brand-dark" />
                                    ) : (
                                        <SearchIcon className="h-5 w-5 text-text-darkest" />
                                    )
                                }
                                className={`h-[40px] rounded-[4px] border-ui-border ${config.search.className ?? ''}`.trim()}
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                                trailingClassName="px-3"
                            />
                        </div>
                    ) : null}
                </div>
            </fieldset>

            {error && !isAccessRestricted && (!isItemLocation || hasTarget) ? (
                <div className="mt-3 rounded-[6px] border border-danger-border bg-surface px-3 py-2 text-sm text-red-850">
                    {error}
                </div>
            ) : null}

            <div className="mt-3 flex flex-1 flex-col min-h-0 overflow-hidden">
                <DataTable
                    bordered="table"
                    className={config.table.tableClassName ?? 'min-w-[1280px]'}
                    wrapperClassName="flex-1 min-h-0 overflow-auto border-0"
                >
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {firstColumnIsCheckbox ? (
                                <DataTableHead className="w-px px-3 text-center">
                                    <Checkbox
                                        checked={allSelected}
                                        indeterminate={someSelected}
                                        onChange={toggleAll}
                                        size="sm"
                                        aria-label="Pilih semua"
                                    />
                                </DataTableHead>
                            ) : null}
                            {sortedRows.length > 0 ? (
                                <DataTableHead className="w-[50px] px-2.5 text-center text-base font-light text-white">
                                    No.
                                </DataTableHead>
                            ) : null}
                            {dataColumns.map((column) => (
                                <SortableTableHeaderCell
                                    key={column.id}
                                    label={column.label}
                                    align={column.align}
                                    widthClassName={column.widthClassName}
                                    sortable={column.sortable !== false}
                                    sortDirection={sortKey === column.id ? sortDir : null}
                                    onSort={() => handleSort(column.id)}
                                    style={getCellStyle(column.id, { position: 'relative' })}
                                    onResizeStart={(e) => handleResizeStart(e, column.id)}
                                />
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {displayRows.length ? (
                            displayRows.map((row, index) => {
                                const isInactive = isInactiveRow(row);
                                const isSelected = selectedIds.has(row.id);
                                return (
                                <DataTableRow
                                    key={row.id}
                                    aria-selected={isSelected ? 'true' : undefined}
                                    data-selected={isSelected ? 'true' : undefined}
                                    onClick={firstColumnIsCheckbox && !isInactive ? () => toggleRow(row) : undefined}
                                    className={`border-ui-border-row ${
                                        isSelected
                                            ? 'table-row-selected bg-[#e8f2ff] hover:bg-[#d6e8fe]'
                                            : index % 2 === 1
                                            ? 'bg-ui-bg-hover hover:bg-workspace-hover-bg'
                                            : 'bg-white hover:bg-workspace-hover-bg'
                                    } ${firstColumnIsCheckbox && !isInactive ? 'cursor-pointer transition' : ''}`.trim()}
                                >
                                    {firstColumnIsCheckbox ? (
                                        <DataTableCell className="w-px px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            {isInactive ? (
                                                <div className="flex items-center justify-center py-0.5" aria-label="Barang nonaktif tidak dapat dipesan / direstok">
                                                    <CircleX className="h-5 w-5 text-red-800 select-none" strokeWidth={1.2} />
                                                </div>
                                            ) : (
                                                <Checkbox
                                                    checked={selectedIds.has(row.id)}
                                                    onChange={() => toggleRow(row)}
                                                    size="sm"
                                                    aria-label={`Pilih baris ${index + 1}`}
                                                />
                                            )}
                                        </DataTableCell>
                                    ) : null}
                                    <DataTableCell className="px-2.5 text-center text-base text-table-row-number whitespace-nowrap">
                                        {from > 0 ? (from + index) : (index + 1)}
                                    </DataTableCell>
                                    {dataColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-2.5 text-base text-text-workspace-dark ${resolveCellAlignClassName(column.align)}`.trim()}
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            {column.id === 'itemName' || column.id === 'productName' ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const prodId = row.productId || row.itemId || row.id;
                                                        if (typeof window !== 'undefined') {
                                                            window.dispatchEvent(
                                                                new CustomEvent('workspace:open-page', {
                                                                    detail: {
                                                                        pageId: 'items-services',
                                                                        recordId: prodId,
                                                                        label: row.productName || row.itemName,
                                                                        tabLabel: row.productName || row.itemName,
                                                                        openForm: true,
                                                                    },
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    className="font-normal text-blue-700 hover:text-blue-900 hover:underline cursor-pointer transition-colors text-left focus:outline-none block w-full max-w-full truncate"
                                                >
                                                    {formatTableTextValue(row[column.id])}
                                                </button>
                                            ) : (
                                                <span className="block truncate w-full min-w-0">
                                                    {formatTableTextValue(row[column.id])}
                                                </span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            );
                        })
                        ) : (
                            <DataTableRow className="bg-white">
                                {firstColumnIsCheckbox ? <DataTableCell className="px-2.5 py-2 text-black" /> : null}
                                <DataTableCell
                                    colSpan={dataColumns.length}
                                    className="px-2.5 py-2 text-center text-base text-black font-normal"
                                >
                                    {emptyMessage}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {total > 0 ? (
                <Pagination
                    page={currentPage}
                    perPage={perPage}
                    total={total}
                    lastPage={lastPage}
                    from={from}
                    to={to}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
