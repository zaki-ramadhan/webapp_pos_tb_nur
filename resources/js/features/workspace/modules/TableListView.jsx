import { useEffect, useMemo, useRef, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from '@/features/workspace/shared/columnVisibility';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import Pagination from '@/components/ui/Pagination';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

function matchesFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

function TableListFilters({ filters, values, onChange, filterButtonLabel = '' }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
                <div key={filter.id} className="flex flex-col gap-1">
                    <SelectField
                        value={values[filter.id]}
                        onChange={(event) => onChange(filter.id, event.target.value)}
                        disabled={Boolean(filter.disabled)}
                        containerClassName="w-auto shrink-0"
                        className={`h-[34px] rounded-[4px] ${
                            filter.disabled ? 'border-warning-border bg-warning-bg' : 'border-ui-border bg-white'
                        }`.trim()}
                        selectClassName={`px-3 text-[11px] sm:text-xs ${filter.disabled ? 'text-warning-label-text' : 'text-filter-select-text'}`.trim()}
                        iconClassName={`mr-2 ${filter.disabled ? 'text-warning-label-text' : 'text-filter-icon'}`.trim()}
                    >
                        {filter.options.map((option, optionIndex) => {
                            const val = typeof option === 'object' && option !== null ? (option.value ?? option.id ?? '') : option;
                            const lbl = typeof option === 'object' && option !== null ? (option.label ?? option.name ?? val) : option;
                            return (
                                <option key={`${filter.id}-${val}-${optionIndex}`} value={val}>
                                    {lbl}
                                </option>
                            );
                        })}
                    </SelectField>

                    {filter.disabled && filter.hint ? (
                        <div className="flex flex-wrap items-center gap-1.5 pl-1 text-xs text-warning-label-text">
                            {filter.badgeLabel ? (
                                <span className="rounded-full bg-bg-warning-tag px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-warning-badge-text">
                                    {filter.badgeLabel}
                                </span>
                            ) : null}
                            <span>{filter.hint}</span>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export default function TableListView({
    table,
    createButton = null,
    rightControls = null,
    menuButton = null,
    onRowClick = null,
}) {
    const isServerSearch = Boolean(table.onSearch || table.pagination?.onSearch);
    const isServerSort = Boolean(table.onSort || table.pagination?.onSort);
    const hasExternalPagination = Boolean(table.pagination);

    const [keyword, setKeyword] = useState(table.search ?? table.pagination?.search ?? '');
    const [filters, setFilters] = useState(() =>
        (table.filters ?? []).reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const [localPage, setLocalPage] = useState(1);
    const [localPerPage, setLocalPerPage] = useState(25);
    const isFirstMount = useRef(true);
    const prevKeywordRef = useRef(keyword);

    useEffect(() => {
        if (!isServerSearch) return;
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        if (prevKeywordRef.current === keyword) {
            return;
        }
        prevKeywordRef.current = keyword;

        const timer = setTimeout(() => {
            const onSearch = table.onSearch || table.pagination?.onSearch;
            onSearch?.(keyword);
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword, isServerSearch, table.onSearch, table.pagination?.onSearch]);

    useEffect(() => {
        if (!hasExternalPagination) {
            setLocalPage(1);
        }
    }, [keyword, filters, hasExternalPagination]);

    const filteredRows = useMemo(() => {
        if (isServerSearch) {
            return (table.rows ?? []).filter((row) => {
                return (table.filters ?? []).every((filter) =>
                    matchesFilter(row, filter, filters[filter.id] ?? 'all'),
                );
            });
        }

        const normalizedKeyword = keyword.trim().toLowerCase();
        const searchCols = (table.columns ?? []).filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
        const searchKeys = searchCols.map(col => col.id);

        return (table.rows ?? []).filter((row) => {
            const passesFilters = (table.filters ?? []).every((filter) =>
                matchesFilter(row, filter, filters[filter.id] ?? 'all'),
            );

            if (!passesFilters) return false;
            if (!normalizedKeyword) return true;

            return searchKeys.some((key) =>
                String(row[key] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [isServerSearch, filters, keyword, table.columns, table.filters, table.rows]);

    const { sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const activeSortKey = isServerSort ? (table.sortBy || table.pagination?.sortBy || sortKey) : sortKey;
    const activeSortDir = isServerSort ? (table.sortDirection || table.pagination?.sortDirection || sortDir) : sortDir;

    const handleSortClick = (columnId) => {
        const nextDir = activeSortKey === columnId ? (activeSortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        if (isServerSort) {
            const onSort = table.onSort || table.pagination?.onSort;
            onSort?.(columnId, nextDir);
        }
        handleClientSort(columnId, nextDir);
    };

    const displayRows = useMemo(() => {
        if (activeSortKey) {
            return sortRows(filteredRows, activeSortKey, activeSortDir);
        }
        return filteredRows;
    }, [filteredRows, activeSortKey, activeSortDir]);

    const paginatedRows = useMemo(() => {
        if (hasExternalPagination) {
            return displayRows;
        }
        const start = (localPage - 1) * localPerPage;
        return displayRows.slice(start, start + localPerPage);
    }, [displayRows, hasExternalPagination, localPage, localPerPage]);

    const paginationConfig = useMemo(() => {
        if (hasExternalPagination) {
            return table.pagination;
        }
        const total = displayRows.length;
        const lastPage = Math.max(1, Math.ceil(total / localPerPage));
        const from = total > 0 ? (localPage - 1) * localPerPage + 1 : 0;
        const to = Math.min(total, localPage * localPerPage);
        return {
            page: localPage,
            perPage: localPerPage,
            total,
            lastPage,
            from,
            to,
            onPageChange: setLocalPage,
            onPerPageChange: (nextPerPage) => {
                setLocalPerPage(nextPerPage);
                setLocalPage(1);
            },
        };
    }, [hasExternalPagination, table.pagination, filteredRows.length, localPage, localPerPage]);

    const cleanedColumns = useMemo(() => {
        return (table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [table.columns]);

    const schemaKey = getTableSchemaKey(cleanedColumns);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, cleanedColumns);

    const visibleColumns = useMemo(() => {
        return cleanedColumns.filter((column) => visibleColumnIds.includes(column.id));
    }, [cleanedColumns, visibleColumnIds]);

    const { handleResizeStart, getCellStyle } = useColumnResize(schemaKey);

    useEffect(() => {
        tableRegistry.setActiveTable(cleanedColumns, displayRows, table.resource);
        return () => {
            if (tableRegistry.activeTable?.resource === table.resource) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, displayRows, table.resource]);

    const isAccessRestricted = Boolean(
        table.readOnly ||
        (table.error && String(table.error).toLowerCase().includes('hak akses')) ||
        (table.emptyLabel && String(table.emptyLabel).toLowerCase().includes('hak akses'))
    );

    const resolvedCreateButton = isAccessRestricted ? null : createButton;

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full">
            <TableToolbar
                size="compact"
                filters={null}
                createButton={resolvedCreateButton}
                refreshButton={
                    table.refreshLabel
                        ? {
                              label: table.refreshLabel,
                              icon: <RefreshIcon className="h-4.5 w-4.5" />,
                              onClick: table.onRefresh,
                              loading: Boolean(table.refreshLoading ?? table.loading),
                          }
                        : null
                }
                rightControls={rightControls}
                menuButton={menuButton}
                importButton={table.importButton}
                printButton={table.printButton}
                columnSettings={table.columnSettings}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: (() => {
                        const searchCols = (table.columns ?? []).filter(
                            (col) => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label
                        );
                        if (!searchCols.length) return table.searchPlaceholder ?? 'Cari data...';
                        const labels = searchCols.map((col) => col.label);
                        return `Cari ${labels.slice(0, 3).join(', ')}${labels.length > 3 ? '...' : ''}`;
                    })(),
                    widthClassName: table.searchWidthClassName ?? 'w-full sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                resourceName={table.resource}
                onRefresh={table.onRefresh}
                exportConfig={table.exportConfig === false ? false : {
                    columns: cleanedColumns,
                    rows: filteredRows,
                    filename: table.label ? table.label.toLowerCase().replace(/\s+/g, '-') : 'export',
                    title: table.label || 'Laporan',
                }}
            />

            <div className="mt-3 flex flex-1 flex-col min-h-0 overflow-hidden">
                <DataTable
                    className={table.tableClassName ?? 'min-w-[760px] sm:min-w-[960px] lg:min-w-[1200px]'}
                    wrapperClassName="flex-1 min-h-0 overflow-auto border-table-wrapper-border"
                >
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            <DataTableHead
                                className="w-[48px] min-w-[48px] max-w-[48px] px-2.5 py-2.5 text-center text-base font-light text-white whitespace-nowrap"
                                style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }}
                            >
                                No.
                            </DataTableHead>
                            {visibleColumns.map((column) => (
                                <SortableTableHeaderCell
                                    key={column.id}
                                    label={column.label}
                                    align={column.align}
                                    widthClassName={column.widthClassName}
                                    sortable={column.sortable !== false}
                                    noWrap={column.noWrap === true}
                                    sortDirection={activeSortKey === column.id ? activeSortDir : null}
                                    onSort={column.sortable !== false ? () => handleSortClick(column.id) : null}
                                    style={getCellStyle(column.id, { position: 'relative' })}
                                    onResizeStart={(e) => handleResizeStart(e, column.id)}
                                />
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {paginatedRows.length ? (
                            paginatedRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-ui-border-row ${onRowClick && !isAccessRestricted ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''} ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                    onClick={onRowClick && !isAccessRestricted ? () => onRowClick(row) : undefined}
                                >
                                    <DataTableCell
                                        className="w-[48px] min-w-[48px] max-w-[48px] px-2.5 text-center text-base text-table-row-number whitespace-nowrap"
                                        style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }}
                                    >
                                        {paginationConfig ? (paginationConfig.from + index) : (index + 1)}
                                    </DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : (column.align === 'center' ? 'text-center' : 'text-left')} px-2.5 text-base text-black ${column.cellClassName ?? ''}`.trim()}
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            {column.type === 'image' || column.id === 'image' ? (
                                                row[column.id] ? (
                                                    <div className="flex justify-center items-center py-1">
                                                        <img
                                                            src={row[column.id]}
                                                            alt=""
                                                            className="h-9 w-9 rounded-md object-cover border border-ui-border-medium bg-slate-50"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 font-medium select-none">-</span>
                                                )
                                            ) : column.truncate ? (
                                                <span className="block truncate">{formatTableTextValue(row[column.id], column)}</span>
                                            ) : (
                                                formatTableTextValue(row[column.id], column)
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white table-row-empty" data-empty-row="true">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-2.5 py-2 text-center text-base text-black">
                                    {table.loading ? (
                                        'Memuat data...'
                                    ) : isAccessRestricted || (table.error && String(table.error).toLowerCase().includes('hak akses')) || (table.emptyLabel && String(table.emptyLabel).toLowerCase().includes('hak akses')) ? (
                                        'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.'
                                    ) : table.error ? (
                                        table.error
                                    ) : (
                                        keyword.trim() ? 'Tidak ada hasil pencarian yang cocok' : (table.emptyLabel ?? 'Tidak ada data')
                                    )}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {paginationConfig ? (
                <Pagination
                    page={paginationConfig.page}
                    perPage={paginationConfig.perPage}
                    total={paginationConfig.total}
                    lastPage={paginationConfig.lastPage}
                    from={paginationConfig.from}
                    to={paginationConfig.to}
                    onPageChange={paginationConfig.onPageChange}
                    onPerPageChange={paginationConfig.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
