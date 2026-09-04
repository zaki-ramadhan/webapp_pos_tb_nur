import { useEffect, useMemo, useRef, useState } from 'react';
import Pagination from './Pagination';
import SelectField from './SelectField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from './DataTable';
import { PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { useColumnVisibility, getTableSchemaKey, cleanHeaderLabel, tableRegistry } from '@/features/workspace/shared/columnVisibility';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

export default function ModuleTableTemplate({
    table,
    resourceName,
    exportFilename,
    exportTitle,
    inactiveFilterKey = 'inactiveValue',
    onCreate,
    onOpenDetail,
    customFiltersSlot,
    extraToolbarSlot,
    customRowFilter,
    tableMinWidth,
    disableImport = false,
    disableExport = false,
    disablePrint = false,
    disableColumnSettings = false,
    disableRefresh = false,
}) {
    const isServerSearch = Boolean(table.onSearch || table.pagination?.onSearch);
    const isServerSort = Boolean(table.onSort || table.pagination?.onSort);

    const [keyword, setKeyword] = useState(table.search ?? table.pagination?.search ?? '');
    const [inactiveFilter, setInactiveFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');
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

    const cleanedColumns = useMemo(() => {
        return (table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [table.columns]);

    const schemaKey = getTableSchemaKey(cleanedColumns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, cleanedColumns);
    const { handleResizeStart, getCellStyle } = useColumnResize(schemaKey);

    const visibleColumns = useMemo(() => {
        return cleanedColumns.filter((column) => visibleColumnIds.includes(column.id));
    }, [cleanedColumns, visibleColumnIds]);

    const filteredRows = useMemo(() => {
        if (isServerSearch) {
            if (!customFiltersSlot && inactiveFilter !== 'all') {
                return (table.rows ?? []).filter((row) => row[inactiveFilterKey] === inactiveFilter);
            }
            if (customRowFilter) {
                return (table.rows ?? []).filter(customRowFilter);
            }
            return table.rows ?? [];
        }

        const normalizedKeyword = keyword.trim().toLowerCase();

        return (table.rows ?? []).filter((row) => {
            if (customRowFilter && !customRowFilter(row)) {
                return false;
            }

            if (!customFiltersSlot && inactiveFilter !== 'all' && row[inactiveFilterKey] !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = (table.columns ?? []).filter(
                (col) => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label
            );
            return searchCols.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword)
            );
        });
    }, [isServerSearch, customFiltersSlot, customRowFilter, inactiveFilter, inactiveFilterKey, keyword, table.rows, table.columns]);

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

    const sortedRows = useMemo(() => {
        if (activeSortKey) {
            return sortRows(filteredRows, activeSortKey, activeSortDir);
        }
        return filteredRows;
    }, [filteredRows, activeSortKey, activeSortDir]);

    const hasExternalPagination = Boolean(table.pagination);
    const [localPage, setLocalPage] = useState(1);
    const [localPerPage, setLocalPerPage] = useState(25);

    useEffect(() => {
        if (!hasExternalPagination) {
            setLocalPage(1);
        }
    }, [keyword, inactiveFilter, hasExternalPagination]);

    const displayRows = useMemo(() => {
        if (hasExternalPagination) {
            return sortedRows;
        }
        const start = (localPage - 1) * localPerPage;
        return sortedRows.slice(start, start + localPerPage);
    }, [sortedRows, hasExternalPagination, localPage, localPerPage]);

    const paginationConfig = useMemo(() => {
        if (hasExternalPagination) {
            return table.pagination;
        }
        const total = sortedRows.length;
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
    }, [hasExternalPagination, table.pagination, sortedRows.length, localPage, localPerPage]);

    useEffect(() => {
        tableRegistry.setActiveTable(cleanedColumns, sortedRows, resourceName);
        return () => {
            if (tableRegistry.activeTable?.resource === resourceName) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, sortedRows, resourceName]);

    const filters = useMemo(() => {
        return null;
    }, []);

    const isAccessRestricted = Boolean(
        table.readOnly ||
        (table.error && String(table.error).toLowerCase().includes('hak akses')) ||
        (table.emptyLabel && String(table.emptyLabel).toLowerCase().includes('hak akses'))
    );

    const resolvedCreateButton = isAccessRestricted ? null : (onCreate ? {
        label: table.createLabel,
        onClick: onCreate,
        icon: <PlusIcon className="h-6 w-6" />,
    } : null);

    return (
        <div className="min-h-full">
            <TableToolbar
                size="compact"
                filters={filters}
                leftControls={extraToolbarSlot}
                createButton={resolvedCreateButton}
                refreshButton={disableRefresh ? null : {
                    label: table.refreshLabel,
                    onClick: table.onRefresh,
                    loading: table.loading,
                }}
                resourceName={resourceName}
                onRefresh={table.onRefresh}
                importButton={disableImport ? false : null}
                printButton={disablePrint ? false : null}
                exportConfig={disableExport ? false : {
                    columns: cleanedColumns,
                    rows: filteredRows,
                    filename: exportFilename,
                    title: exportTitle,
                }}
                columnSettings={disableColumnSettings ? false : {
                    columns: cleanedColumns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label),
                    visibleIds: visibleColumnIds,
                    onToggle: (columnId) => {
                        setVisibleColumnIds(prev =>
                            prev.includes(columnId)
                                ? prev.filter(id => id !== columnId)
                                : [...prev, columnId]
                        );
                    }
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: 'Cari data...',
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className={(tableMinWidth ?? '').replace(/\b(?:[a-z-]*:)?min-w-\[[^\]]+\]/g, '').trim() || 'w-full'}>
                    <DataTable wrapperClassName="border-table-wrapper-border">
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
                                        columnId={column.id}
                                        label={column.label}
                                        align={column.align}
                                        widthClassName={column.widthClassName}
                                        sortable={column.sortable !== false}
                                        sortDirection={activeSortKey === column.id ? activeSortDir : null}
                                        onSort={column.sortable !== false ? () => handleSortClick(column.id) : null}
                                        style={getCellStyle(column.id, { position: 'relative' })}
                                        onResizeStart={(e) => handleResizeStart(e, column.id)}
                                    />
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {displayRows.length ? (
                                displayRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''}`.trim()}
                                        onClick={() =>
                                            onOpenDetail?.({
                                                recordId: String(row.id),
                                                label: row.name,
                                                tabLabel: row.tabLabel ?? row.name,
                                            })
                                        }
                                    >
                                        <DataTableCell
                                            className="w-[48px] min-w-[48px] max-w-[48px] px-2.5 text-center text-base text-table-row-number whitespace-nowrap"
                                            style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }}
                                        >
                                            {paginationConfig?.from ? (paginationConfig.from + index) : (index + 1)}
                                        </DataTableCell>
                                         {visibleColumns.map((column) => {
                                             const isCheckbox = column.id === 'checkbox';
                                             return (
                                             <DataTableCell
                                                 key={column.id}
                                                 className={`${isCheckbox ? '!px-2.5 !sm:px-2.5' : 'px-3'} text-base text-text-workspace-dark ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                                                 style={getCellStyle(column.id, isCheckbox ? { minWidth: '0px', width: '1px' } : {})}
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
                                                     <span className="block truncate">{formatTableTextValue(row[column.id], column)}</span>
                                                 )}
                                             </DataTableCell>
                                             );
                                         })}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white table-row-empty" data-empty-row="true">
                                    <DataTableCell
                                        colSpan={visibleColumns.length + 1}
                                        className="px-3 py-2 text-center text-base text-black"
                                    >
                                        {table.loading ? (
                                            'Memuat data...'
                                        ) : isAccessRestricted || (table.error && String(table.error).toLowerCase().includes('hak akses')) || (table.emptyLabel && String(table.emptyLabel).toLowerCase().includes('hak akses')) ? (
                                            'Anda tidak memiliki hak akses ke halaman ini. Hubungi Owner untuk menambahkan akses.'
                                        ) : (
                                            table.error || table.emptyLabel || 'Tidak ada data'
                                        )}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>

            {paginationConfig && (hasExternalPagination || paginationConfig.total > 25) ? (
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
