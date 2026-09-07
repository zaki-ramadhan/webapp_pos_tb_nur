import { useEffect, useMemo, useRef, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from '@/features/workspace/shared/columnVisibility';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import Pagination from '@/components/ui/Pagination';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

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
    }, [keyword, hasExternalPagination]);

    const filteredRows = useMemo(() => {
        if (isServerSearch) {
            return table.rows ?? [];
        }

        const normalizedKeyword = keyword.trim().toLowerCase();
        if (!normalizedKeyword) {
            return table.rows ?? [];
        }

        const searchCols = (table.columns ?? []).filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
        const searchKeys = searchCols.map(col => col.id);

        return (table.rows ?? []).filter((row) => {
            return searchKeys.some((key) =>
                String(row[key] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [isServerSearch, keyword, table.columns, table.rows]);

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
        <div className="min-h-full">
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
                    placeholder: 'Cari data...',
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

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable
                    className={table.tableClassName ?? 'w-full min-w-[760px] sm:min-w-[960px] lg:min-w-[1200px]'}
                    wrapperClassName="border-table-wrapper-border"
                >
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {paginatedRows.length > 0 && (
                                <DataTableHead
                                    className="w-[48px] min-w-[48px] max-w-[48px] px-2.5 py-2.5 text-center text-base font-normal text-white whitespace-nowrap"
                                    style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }}
                                >
                                    No.
                                </DataTableHead>
                            )}
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
                                            className={`${column.align === 'right' ? 'text-right' : (column.align === 'center' ? 'text-center' : 'text-left')} px-2.5 text-base text-text-workspace-dark ${column.cellClassName ?? ''}`.trim()}
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
                                            ) : (
                                                <span className="block truncate w-full min-w-0">{formatTableTextValue(row[column.id], column)}</span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white table-row-empty" data-empty-row="true">
                                <DataTableCell colSpan={visibleColumns.length} className="px-2.5 py-2 text-center text-base text-text-workspace-dark">
                                    {table.loading ? (
                                        'Memuat data...'
                                    ) : isAccessRestricted || (table.error && String(table.error).toLowerCase().includes('hak akses')) || (table.emptyLabel && String(table.emptyLabel).toLowerCase().includes('hak akses')) ? (
                                        'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.'
                                    ) : (
                                        'Tidak ada data'
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
