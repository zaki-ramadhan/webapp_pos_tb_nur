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
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    ExternalLinkIcon,
    LinkIcon,
    SearchIcon,
    RefreshIcon,
} from '@/features/workspace/shared/Icons';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { extractBackendRows, listBackendResource } from '@/features/workspace/backend/workspaceBackendApi';
import ToolbarIconButton from '@/features/workspace/shared/toolbar/ToolbarIconButton';

import { cleanHeaderLabel, getColumnMinWidth } from '@/features/workspace/shared/columnVisibility';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    BACKEND_INVENTORY_RESOURCES,
    buildInventoryFilters,
    mapInventoryRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';

function buildInitialValues(config) {
    return (config.controls ?? []).reduce((result, control) => {
        result[control.id] = control.value ?? '';
        return result;
    }, {});
}

function resolveHeaderAlignClassName(align) {
    return 'text-center';
}

function resolveCellAlignClassName(align) {
    return 'text-left';
}


function InquiryIconButton({ icon, label, onClick }) {
    const IconComponent =
        icon === 'external-link'
            ? ExternalLinkIcon
            : icon === 'refresh'
            ? RefreshIcon
            : LinkIcon;

    return (
        <ToolbarIconButton
            label={label}
            onClick={onClick}
            className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition hover:bg-brand-blue-light h-[34px] w-[40px]"
        >
            <IconComponent className="h-4 w-4" />
        </ToolbarIconButton>
    );
}

function InquiryTextButton({ label, tone = 'default' }) {
    return (
        <button
            type="button"
            className={`inline-flex h-[34px] items-center justify-center rounded-[4px] border px-4 text-base ${
                tone === 'primary'
                    ? 'border-brand-blue-border bg-bg-brand-blue-toggled text-brand-blue'
                    : 'border-brand-blue-border bg-white text-brand-blue'
            }`.trim()}
        >
            {label}
        </button>
    );
}

function InquiryControl({
    control,
    value,
    onChange,
    onRefresh,
    suppliers = [],
    warehouses = [],
    products = [],
    onLookupSelect,
    onLookupClear,
    searching = false,
}) {
    if (control.type === 'select') {
        return (
            <SelectField
                value={value}
                onChange={(event) => onChange(control.id, event.target.value)}
                containerClassName="w-auto shrink-0"
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                selectClassName="text-xs sm:text-sm text-brand-dark"
            >
                {(control.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
        );
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                value={value}
                onChange={(nextValue) => onChange(control.id, nextValue)}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-xs sm:text-sm text-brand-dark"
                trailingClassName="w-[42px] shrink-0 justify-center px-0"
            />
        );
    }

    if (control.type === 'icon-button') {
        return <InquiryIconButton icon={control.icon} label={control.label} onClick={control.id === 'refresh' ? onRefresh : undefined} />;
    }

    if (control.type === 'button') {
        return <InquiryTextButton label={control.label} tone={control.tone} />;
    }

    if (control.type === 'lookup') {
        const lookupItems =
            control.id === 'supplierSearch'
                ? suppliers
                : control.id === 'warehouseSearch'
                ? warehouses
                : control.id === 'itemSearch'
                ? products
                : [];

        return (
            <ReferenceLookupInput
                value={value}
                placeholder={control.placeholder ?? 'Cari/Pilih...'}
                items={lookupItems}
                searching={searching}
                getOptionLabel={(option) =>
                    option?.code ? `[${option.code}] ${option.name}` : (option?.name ?? option?.label ?? '')
                }
                onSelect={(option) => onLookupSelect(control.id, option)}
                onClear={() => onLookupClear(control.id)}
                className={control.className ?? 'w-full sm:w-[240px]'}
            />
        );
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? ''}
            trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
            className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
            inputClassName="text-xs sm:text-sm text-brand-dark"
            trailingClassName="px-3"
        />
    );
}

export default function InventoryInquiryView({ config, pageId }) {
    const resource = BACKEND_INVENTORY_RESOURCES[pageId];
    const [values, setValues] = useState(() => buildInitialValues(config));
    const [keyword, setKeyword] = useState(config.search?.value ?? '');
    const [filters, setFilters] = useState(() => buildInventoryFilters(pageId, {}));
    const [selectedIds, setSelectedIds] = useState(() => new Set());

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
        return (config.table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [config.table.columns]);

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

    // Reset selection jika data berubah
    const serializedIds = filteredRows.map((r) => r.id).join(',');
    useMemo(() => setSelectedIds(new Set()), [serializedIds]); // eslint-disable-line react-hooks/exhaustive-deps

    const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));
    const someSelected = !allSelected && filteredRows.some((r) => selectedIds.has(r.id));

    function toggleAll() {
        setSelectedIds(allSelected ? new Set() : new Set(filteredRows.map((r) => r.id)));
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
        setValues(nextValues);
        setFilters(buildInventoryFilters(pageId, nextValues));
    }

    function handleLookupSelect(controlId, option) {
        const optionLabel = option.code ? `[${option.code}] ${option.name}` : (option.name ?? option.label ?? '');
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
        <div className="min-h-full rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    {(config.controls ?? []).map((control) => (
                        <div key={control.id} className={control.wrapperClassName ?? ''}>
                            <InquiryControl
                                control={control}
                                value={values[control.id] ?? ''}
                                onChange={handleChange}
                                onRefresh={reload}
                                suppliers={suppliers}
                                warehouses={warehouses}
                                products={products}
                                onLookupSelect={handleLookupSelect}
                                onLookupClear={handleLookupClear}
                                searching={loadingLookups}
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
                                <DataTableHead className="w-[52px] px-2.5 text-center">
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
                            {filteredRows.length > 0 || !firstColumnIsCheckbox ? (
                                <DataTableHead className="w-[50px] px-2.5 text-center text-base font-medium text-white">
                                    No.
                                </DataTableHead>
                            ) : null}
                            {dataColumns.map((column) => {
                                const minWidth = getColumnMinWidth(column.label);
                                return (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${resolveHeaderAlignClassName(column.align)}`.trim()}
                                        style={minWidth ? { minWidth } : undefined}
                                    >
                                        {column.label}
                                    </DataTableHead>
                                );
                            })}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                >
                                    {firstColumnIsCheckbox ? (
                                        <DataTableCell className="px-2.5 text-center">
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
                                        >
                                            {formatTableTextValue(row[column.id])}
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
        </div>
    );
}
