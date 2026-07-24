import { useEffect, useMemo, useState } from 'react';

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
import Button from '@/components/ui/Button';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { showSuccessToast } from '@/components/feedback/toast';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
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
import { buildInitialValues, InquiryControl } from './InventoryInquiryControls';

export default function InventoryInquiryView({ config, pageId }) {
    const resource = BACKEND_INVENTORY_RESOURCES[pageId];
    const [values, setValues] = useState(() => buildInitialValues(config));
    const [keyword, setKeyword] = useState(config.search?.value ?? '');
    const [filters, setFilters] = useState(() => buildInventoryFilters(pageId, {}));
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [warningModal, setWarningModal] = useState({ open: false, title: '', message: '' });

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
        return columns.map(col => {
            if (col.id === 'warehouse' && values.itemType === 'warehouse') {
                return {
                    ...col,
                    id: 'productName',
                    label: 'Barang',
                };
            }
            return {
                ...col,
                label: cleanHeaderLabel(col.label)
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

    useEffect(() => {
        let ignore = false;
        async function fetchLookups() {
            setLoadingLookups(true);
            try {
                const [supplierData, warehouseData, productData] = await Promise.all([
                    listBackendResource('suppliers', { per_page: 250 }),
                    listBackendResource('warehouses', { per_page: 250 }),
                    listBackendResource('products', { per_page: 250 }),
                ]);
                if (!ignore) {
                    setSuppliers(extractBackendRows(supplierData));
                    setWarehouses(extractBackendRows(warehouseData));
                    setProducts(extractBackendRows(productData));
                }
            } catch (err) {
                console.error(err);
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
    }, []);

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

    const allSelected = sortedRows.length > 0 && sortedRows.every((r) => selectedIds.has(r.id));
    const someSelected = !allSelected && sortedRows.some((r) => selectedIds.has(r.id));

    const resolvedControls = useMemo(() => {
        return (config.controls ?? []).map((control) => {
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
        setSelectedIds(allSelected ? new Set() : new Set(sortedRows.map((r) => r.id)));
    }

    function toggleRow(id) {
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

    function handleButtonClick(controlId) {
        if (controlId === 'order' || controlId === 'request') {
            if (selectedIds.size === 0) {
                setWarningModal({
                    open: true,
                    title: 'Peringatan',
                    message: `Silakan pilih minimal satu barang terlebih dahulu untuk melakukan tindakan ${controlId === 'order' ? 'Pesan' : 'Minta'}.`,
                });
                return;
            }
            
            showSuccessToast({
                message: `Draf dokumen ${controlId === 'order' ? 'Pemesanan Pembelian' : 'Permintaan Barang'} berhasil dibuat untuk ${selectedIds.size} barang.`,
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

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    {resolvedControls.map((control) => (
                        <div key={control.id} className={control.wrapperClassName ?? ''}>
                            <InquiryControl
                                control={control}
                                value={values[control.id] ?? ''}
                                onChange={handleChange}
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
                    <div className="w-full lg:w-auto">
                        <TextInput
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={config.search.placeholder}
                            trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
                            className={`h-[40px] rounded-[4px] border-ui-border ${config.search.className ?? ''}`.trim()}
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                            trailingClassName="px-3"
                        />
                    </div>
                ) : null}
            </div>

            {error ? (
                <div className="mt-3 rounded-[6px] border border-danger-border bg-surface px-3 py-2 text-sm text-red-850">
                    {error}
                </div>
            ) : null}

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className={config.table.tableClassName ?? 'min-w-[1280px]'} wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {firstColumnIsCheckbox ? (
                                <DataTableHead className="w-[36px] px-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                        onChange={toggleAll}
                                        aria-label="Pilih semua"
                                        className="h-3.5 w-3.5 cursor-pointer rounded-[3px] border border-ui-border-medium"
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
                            sortedRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                >
                                    {firstColumnIsCheckbox ? (
                                        <DataTableCell className="px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                                aria-label={`Pilih baris ${index + 1}`}
                                                className="h-3.5 w-3.5 cursor-pointer rounded-[3px] border border-ui-border"
                                            />
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
                                            {column.id === 'productName' && row.productCode
                                                ? `[${row.productCode}] ${row.productName}`
                                                : formatTableTextValue(row[column.id])
                                            }
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                {firstColumnIsCheckbox ? <DataTableCell className="px-2.5" /> : null}
                                <DataTableCell
                                    colSpan={dataColumns.length + 1}
                                    className="px-2.5 py-3 text-center text-base text-text-workspace-dark"
                                >
                                    {loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Belum ada data')}
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

            <WorkspaceDialog
                open={warningModal.open}
                onClose={() => setWarningModal((prev) => ({ ...prev, open: false }))}
                title={warningModal.title}
                footer={
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setWarningModal((prev) => ({ ...prev, open: false }))}
                            className="bg-[#0c50a4] hover:bg-[#0a4288]"
                        >
                            OK
                        </Button>
                    </div>
                }
            >
                <div className="text-sm text-brand-dark py-2">
                    {warningModal.message}
                </div>
            </WorkspaceDialog>
        </div>
    );
}
