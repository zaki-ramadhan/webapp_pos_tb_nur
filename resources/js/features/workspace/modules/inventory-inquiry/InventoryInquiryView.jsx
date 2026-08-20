import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
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

function resolveCellAlignClassName(align) {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
}

function isInactiveRow(row) {
    if (!row) return false;
    const cond = String(row.itemCondition ?? row.item_condition ?? '').toLowerCase();
    const badge = String(row.statusBadge ?? '').toLowerCase();
    const status = String(row.status ?? row.statusLabel ?? '').toLowerCase();
    return cond === 'inactive' || badge === 'inactive' || status.includes('nonaktif') || row.is_active === false || row.isActive === false;
}

export default function InventoryInquiryView({ config, pageId }) {
    const resource = BACKEND_INVENTORY_RESOURCES[pageId];
    const [values, setValues] = useState(() => buildInitialValues(config));
    const [keyword, setKeyword] = useState(config.search?.value ?? '');
    const [filters, setFilters] = useState(() => buildInventoryFilters(pageId, {}));
    const [selectedIds, setSelectedIds] = useState(() => new Set());

    const isItemLocation = pageId === 'item-location';
    const isWarehouseMode = values.itemType === 'warehouse';
    const hasTarget = isWarehouseMode
        ? Boolean(values.warehouseSearchId || (values.warehouseSearch && values.warehouseSearch.trim()))
        : Boolean(values.itemSearchId || (values.itemSearch && values.itemSearch.trim()));

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
    } = useBackendIndexResource({ resource, filters });

    const tableRows = useMemo(() => mapInventoryRows(pageId, rawRows), [pageId, rawRows]);

    const cleanedColumns = useMemo(() => {
        const columns = config.table.columns ?? [];
        return columns
            .filter(col => !(values.itemType === 'warehouse' && col.id === 'address'))
            .map(col => {
                if (col.id === 'warehouse') {
                    if (values.itemType === 'warehouse') {
                        return {
                            ...col,
                            id: 'productName',
                            label: 'Barang',
                            align: 'left',
                        };
                    }
                    return {
                        ...col,
                        align: 'left',
                        label: cleanHeaderLabel(col.label),
                    };
                }
                return {
                    ...col,
                    label: cleanHeaderLabel(col.label),
                };
            });
    }, [config.table.columns, values.itemType]);

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
        const normalizedKeyword = keyword.trim().toLowerCase();
        if (!normalizedKeyword) return tableRows;

        const searchKeys = config.table.searchKeys?.length
            ? config.table.searchKeys
            : dataColumns.map((col) => col.id);

        return tableRows.filter((row) =>
            searchKeys.some((key) =>
                String(row[key] ?? '').toLowerCase().includes(normalizedKeyword),
            ),
        );
    }, [config.table.searchKeys, dataColumns, keyword, tableRows]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);
    const { handleResizeStart, getCellStyle } = useColumnResize('inventory-inquiry');

  // Reset selection jika data berubah

    const serializedIds = sortedRows.map((r) => r.id).join(',');
    useMemo(() => setSelectedIds(new Set()), [serializedIds]);

    const selectableRows = useMemo(() => sortedRows.filter((r) => !isInactiveRow(r)), [sortedRows]);
    const allSelected = selectableRows.length > 0 && selectableRows.every((r) => selectedIds.has(r.id));
    const someSelected = !allSelected && selectableRows.some((r) => selectedIds.has(r.id));

    const resolvedControls = useMemo(() => {
        return (config.controls ?? [])
            .filter((control) => control.id !== 'request')
            .map((control) => {
                if (control.id === 'itemSearch') {
                    const isWarehouseMode = values.itemType === 'warehouse';
                    return {
                        ...control,
                        id: isWarehouseMode ? 'warehouseSearch' : 'itemSearch',
                        placeholder: isWarehouseMode ? 'Cari/Pilih Gudang' : 'Cari/Pilih Barang',
                    };
                }
                return control;
            });
    }, [config.controls, values.itemType]);

    function toggleAll() {
        setSelectedIds(allSelected ? new Set() : new Set(selectableRows.map((r) => r.id)));
    }

    function toggleRow(rowOrId) {
        const row = typeof rowOrId === 'object' ? rowOrId : sortedRows.find((r) => r.id === rowOrId);
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
        if (controlId === 'itemType') {
            nextValues.itemSearch = '';
            nextValues.itemSearchId = null;
            nextValues.warehouseSearch = '';
            nextValues.warehouseSearchId = null;
        }
        setValues(nextValues);
        setFilters(buildInventoryFilters(pageId, nextValues));
    }



    useEffect(() => {
        if (error && !isAccessRestricted && (!isItemLocation || hasTarget)) {
            showSystemErrorModal({
                title: 'Terjadi Permasalahan pada Pemrosesan',
                description: 'Silakan perbaiki permasalahan berikut ini:',
                message: typeof error === 'string' ? error : (error.message || 'Terjadi kesalahan saat memuat data.'),
            });
        }
    }, [error, isAccessRestricted, isItemLocation, hasTarget]);

    function handleButtonClick(controlId) {
        if (controlId === 'order' || controlId === 'request') {
            if (selectedIds.size === 0) {
                showSystemErrorModal({
                    title: 'Terjadi Permasalahan pada Pemrosesan',
                    description: 'Silakan perbaiki permasalahan berikut ini:',
                    message: 'Barang belum ada yang dicentang. Silakan centang barang yang ingin dipesan terlebih dahulu.',
                });
                return;
            }

            const selectedRows = tableRows.filter((row) => selectedIds.has(row.id) && !isInactiveRow(row));
            const targetPageId = controlId === 'order'
                ? (pageProps.pages?.['purchase-order'] ? 'purchase-order' : 'purchase-invoice')
                : (pageProps.pages?.['item-request'] ? 'item-request' : 'purchase-invoice');

            const targetLabel = targetPageId === 'purchase-order'
                ? 'Pesanan Pembelian'
                : (targetPageId === 'purchase-invoice' ? 'Faktur Pembelian' : 'Permintaan Barang');

            const lineItems = selectedRows.map((row) => {
                const minLimit = parseNumericInput(row.rawMinimumLimit ?? row.minimumLimit ?? row.minimumStock ?? 1);
                const currentStock = parseNumericInput(row.rawAvailableStock ?? row.availableStock ?? 0);
                const isProblematic = row.itemCondition === 'damaged' || row.itemCondition === 'expired' || row.itemCondition === 'inactive';
                const effectiveStock = isProblematic ? 0 : currentStock;
                const targetReplenishQty = isProblematic ? Math.max(minLimit, currentStock, 1) : Math.max(1, minLimit - effectiveStock);
                const qtyNeeded = Math.max(minLimit > 0 ? minLimit : 1, targetReplenishQty);

                const price = parseNumericInput(
                    row.default_purchase_price ??
                    row.defaultPurchasePrice ??
                    row.raw_cost_price ??
                    row.costPrice ??
                    row.price ??
                    (products.find((p) => String(p.id) === String(row.productId || row.itemId || row.id))?.default_purchase_price) ??
                    0
                );
                const name = row.itemName || row.productName || row.name || '';
                const code = row.itemCode || row.productCode || row.code || '';
                const unit = row.unit || row.baseUnit || '';
                const itemId = String(row.productId || row.itemId || row.id);
                const parsedProdId = !isNaN(Number(itemId)) ? Number(itemId) : null;
                return {
                    id: itemId,
                    productId: itemId,
                    __productId: parsedProdId,
                    __unitId: row.unitId || row.unit_id || null,
                    name: name,
                    item: name,
                    code: code,
                    itemCode: code,
                    quantity: qtyNeeded,
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
            const isSameSupplier = uniqueSupplierNames.length === 1 && supplierNames.length === selectedRows.length;

            let resolvedSupplierName = '';
            let resolvedSupplierId = null;

            if (isSameSupplier) {
                const targetSupplierName = uniqueSupplierNames[0];
                const targetSupplierId = selectedRows.find((r) => r.supplierId || r.supplier_id)?.supplierId || null;
                const matchingSupplier = suppliers.find((s) =>
                    (targetSupplierId && Number(s.id) === Number(targetSupplierId)) ||
                    (targetSupplierName && s.name?.toLowerCase() === targetSupplierName.toLowerCase()) ||
                    (targetSupplierName && s.full_name?.toLowerCase() === targetSupplierName.toLowerCase())
                );
                resolvedSupplierName = matchingSupplier ? (matchingSupplier.name || matchingSupplier.full_name) : targetSupplierName;
                resolvedSupplierId = matchingSupplier ? matchingSupplier.id : targetSupplierId;
            }

            const initialValues = {
                customer: resolvedSupplierName ? [resolvedSupplierName] : [],
                supplier: resolvedSupplierName ? [resolvedSupplierName] : [],
                __partnerId: resolvedSupplierId,
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
        setValues(nextValues);
        setFilters(buildInventoryFilters(pageId, nextValues));
    }

    function handleLookupClear(controlId) {
        const nextValues = {
            ...values,
            [controlId]: '',
            [controlId + 'Id']: null,
        };
        setValues(nextValues);
        setFilters(buildInventoryFilters(pageId, nextValues));
    }

    const emptyMessage = useMemo(() => {
        if (loading) return 'Memuat data...';
        if (error) return error;
        if (isItemLocation && !hasTarget) {
            return isWarehouseMode
                ? 'Silakan cari dan pilih gudang untuk melihat daftar stok barang di gudang tersebut.'
                : 'Silakan cari dan pilih barang untuk melihat sebaran stok di setiap gudang.';
        }
        return config.table.emptyLabel || 'Tidak ada data';
    }, [loading, error, isItemLocation, hasTarget, isWarehouseMode, config.table.emptyLabel]);

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light overflow-hidden">
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
                                        rows: sortedRows,
                                        columns: cleanedColumns,
                                        filename: 'barang-per-gudang'
                                    }}
                                    suppliers={suppliers}
                                    warehouses={warehouses}
                                    products={products}
                                    onLookupSelect={handleLookupSelect}
                                    onLookupClear={handleLookupClear}
                                    searching={loadingLookups}
                                    loading={loading}
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
                                trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
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
                <DataTable className={config.table.tableClassName ?? 'min-w-[1280px]'} wrapperClassName="flex-1 min-h-0 overflow-auto border-table-wrapper-border">
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
                        {sortedRows.length ? (
                            sortedRows.map((row, index) => {
                                const isInactive = isInactiveRow(row);
                                return (
                                <DataTableRow
                                    key={row.id}
                                    onClick={firstColumnIsCheckbox && !isInactive ? () => toggleRow(row) : undefined}
                                    className={`border-ui-border-row transition-colors ${
                                        isInactive
                                            ? '!bg-[#fff1f2] hover:!bg-[#ffe4e6] text-rose-950'
                                            : selectedIds.has(row.id)
                                            ? '!bg-blue-50/60 hover:!bg-blue-50'
                                            : index % 2 === 1
                                            ? 'bg-ui-bg-hover hover:bg-[#edf2f7]'
                                            : 'bg-white hover:bg-[#edf2f7]'
                                    } ${firstColumnIsCheckbox && !isInactive ? 'cursor-pointer' : ''}`.trim()}
                                >
                                    {firstColumnIsCheckbox ? (
                                        <DataTableCell className="w-px px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={!isInactive && selectedIds.has(row.id)}
                                                onChange={() => toggleRow(row)}
                                                disabled={isInactive}
                                                size="sm"
                                                aria-label={`Pilih baris ${index + 1}`}
                                                title={isInactive ? 'Barang nonaktif tidak dapat dipesan / direstok' : undefined}
                                            />
                                        </DataTableCell>
                                    ) : null}
                                    <DataTableCell className={`px-2.5 text-center text-base whitespace-nowrap ${isInactive ? 'text-rose-800 font-medium' : 'text-table-row-number'}`}>
                                        {from > 0 ? (from + index) : (index + 1)}
                                    </DataTableCell>
                                    {dataColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-2.5 text-base text-text-workspace-dark ${resolveCellAlignClassName(column.align)}`.trim()}
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            {column.id === 'itemName' ? (
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
                                                                        label: row.itemName,
                                                                        tabLabel: row.itemName,
                                                                        openForm: true,
                                                                    },
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    className="font-normal text-blue-700 hover:text-blue-900 hover:underline cursor-pointer transition-colors text-left focus:outline-none"
                                                >
                                                    {formatTableTextValue(row[column.id])}
                                                </button>
                                            ) : (
                                                formatTableTextValue(row[column.id])
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
                                    colSpan={dataColumns.length + 1}
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
