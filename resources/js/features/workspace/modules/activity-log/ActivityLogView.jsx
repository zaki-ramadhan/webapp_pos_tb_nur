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
import Pagination from '@/components/ui/Pagination';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildActivityLogFilters,
    mapActivityLogRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import {
    cleanHeaderLabel,
    getTableSchemaKey,
    tableRegistry,
    useColumnVisibility,
} from '@/features/workspace/shared/columnVisibility';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

function matchesFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export default function ActivityLogView({ page }) {
    const [keyword, setKeyword] = useState('');
    const isFirstMount = useRef(true);
    const prevKeywordRef = useRef(keyword);
    const {
        rows: backendRows,
        total,
        loading,
        error,
        reload,
        sortBy,
        sortDirection,
        setSort,
        serverTableProps,
    } = useBackendIndexResource({
        resource: 'activity-logs',
        initialPerPage: 25,
    });

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        if (prevKeywordRef.current === keyword) {
            return;
        }
        prevKeywordRef.current = keyword;

        const timer = setTimeout(() => {
            serverTableProps.onSearch(keyword);
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword, serverTableProps.onSearch]);

    const rows = useMemo(() => mapActivityLogRows(backendRows), [backendRows]);
    const filtersConfig = useMemo(() => buildActivityLogFilters(rows), [rows]);

    const cleanedColumns = useMemo(() => {
        return (page.table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label),
        }));
    }, [page.table.columns]);

    const schemaKey = getTableSchemaKey(cleanedColumns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, cleanedColumns);
    const { handleResizeStart, getCellStyle } = useColumnResize(schemaKey);

    const visibleColumns = useMemo(() => {
        return cleanedColumns.filter(col => visibleColumnIds.includes(col.id));
    }, [cleanedColumns, visibleColumnIds]);

    const table = useMemo(() => ({
        ...page.table,
        filters: filtersConfig,
        columns: cleanedColumns,
        rows,
        pageValue: total.toLocaleString('id-ID'),
        ...serverTableProps,
    }), [filtersConfig, page.table, cleanedColumns, rows, total, serverTableProps]);

    const [filters, setFilters] = useState(() =>
        filtersConfig.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    useEffect(() => {
        setFilters((currentFilters) =>
            filtersConfig.reduce((result, filter) => {
                const currentValue = currentFilters[filter.id];
                const optionExists = filter.options.some((option) => option.value === currentValue);

                result[filter.id] = optionExists ? currentValue : (filter.options?.[0]?.value ?? 'all');

                return result;
            }, {}),
        );
    }, [filtersConfig]);

    const handleSortClick = (columnId) => {
        const nextDir = sortBy === columnId ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
        setSort(columnId, nextDir);
    };

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const passesFilters = filtersConfig.every((filter) =>
                matchesFilter(row, filter, filters[filter.id] ?? 'all'),
            );
            return passesFilters;
        });
    }, [filters, rows, filtersConfig]);

    const sortedRows = useMemo(() => {
        if (sortBy) {
            return sortRows(filteredRows, sortBy, sortDirection);
        }
        return filteredRows;
    }, [filteredRows, sortBy, sortDirection]);

    useEffect(() => {
        tableRegistry.setActiveTable(cleanedColumns, sortedRows, 'activity-log');
        return () => {
            if (tableRegistry.activeTable?.resource === 'activity-log') {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, sortedRows]);

    const emptyLabel = loading ? 'Memuat data...' : (error || 'Tidak ada data');

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                resourceName="activity-log"
                filters={null}
                size="compact"
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                    onClick: reload,
                    loading,
                }}
                exportConfig={false}
                importButton={false}
                printButton={false}
                columnSettings={{
                    columns: cleanedColumns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label),
                    visibleIds: visibleColumnIds,
                    onToggle: (columnId) => {
                        setVisibleColumnIds(prev =>
                            prev.includes(columnId)
                                ? prev.filter(id => id !== columnId)
                                : [...prev, columnId]
                        );
                    },
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder || 'Cari...',
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                pageValue={total.toLocaleString('id-ID')}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1320px]" wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            <DataTableHead className="w-[50px] px-2.5 text-center text-base font-light text-white">
                                No.
                            </DataTableHead>
                            {visibleColumns.map((column) => (
                                <SortableTableHeaderCell
                                    key={column.id}
                                    label={column.label}
                                    align={column.align}
                                    widthClassName={column.widthClassName}
                                    sortable={column.sortable !== false}
                                    sortDirection={sortBy === column.id ? sortDirection : null}
                                    onSort={column.sortable !== false ? () => handleSortClick(column.id) : null}
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
                                    <DataTableCell className="px-2.5 text-center text-base text-table-row-number whitespace-nowrap">
                                        {table.pagination ? (table.pagination.from + index) : (index + 1)}
                                    </DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className="px-2.5 text-base text-text-workspace-dark whitespace-nowrap"
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-2.5 py-2 text-center text-base text-black">
                                    {emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {table.pagination ? (
                <Pagination
                    page={table.pagination.page}
                    perPage={table.pagination.perPage}
                    total={table.pagination.total}
                    lastPage={table.pagination.lastPage}
                    from={table.pagination.from}
                    to={table.pagination.to}
                    onPageChange={table.pagination.onPageChange}
                    onPerPageChange={table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
