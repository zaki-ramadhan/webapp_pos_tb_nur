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
import { buildActivityLogFilters } from '@/features/workspace/backend/workspaceBackendAdapters';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey, cleanHeaderLabel, tableRegistry } from '@/features/workspace/shared/columnVisibility';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

function matchesFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export default function JournalActivityLogTableView({ config, onOpenDetail }) {
    const isServerSearch = Boolean(config.table.onSearch || config.table.pagination?.onSearch);
    const isServerSort = Boolean(config.table.onSort || config.table.pagination?.onSort);

    const [keyword, setKeyword] = useState(config.table.search ?? config.table.pagination?.search ?? '');
    const isFirstMount = useRef(true);
    const prevKeywordRef = useRef(keyword);

    const filtersConfig = useMemo(() => buildActivityLogFilters(config.table.rows), [config.table.rows]);
    const [filters, setFilters] = useState(() =>
        filtersConfig.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

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
            const onSearch = config.table.onSearch || config.table.pagination?.onSearch;
            onSearch?.(keyword);
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword, isServerSearch, config.table.onSearch, config.table.pagination?.onSearch]);

    const { sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const activeSortKey = isServerSort ? (config.table.sortBy || config.table.pagination?.sortBy || sortKey) : sortKey;
    const activeSortDir = isServerSort ? (config.table.sortDirection || config.table.pagination?.sortDirection || sortDir) : sortDir;

    const handleSortClick = (columnId) => {
        const nextDir = activeSortKey === columnId ? (activeSortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        if (isServerSort) {
            const onSort = config.table.onSort || config.table.pagination?.onSort;
            onSort?.(columnId, nextDir);
        }
        handleClientSort(columnId, nextDir);
    };

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

    const cleanedColumns = useMemo(() => {
        return (config.table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [config.table.columns]);

    const schemaKey = getTableSchemaKey(cleanedColumns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, cleanedColumns);
    const { handleResizeStart, getCellStyle } = useColumnResize(schemaKey);

    const visibleColumns = useMemo(() => {
        return cleanedColumns.filter((column) => visibleColumnIds.includes(column.id));
    }, [cleanedColumns, visibleColumnIds]);

    const filteredRows = useMemo(() => {
        if (isServerSearch) {
            return config.table.rows.filter((row) => {
                const passesFilters = filtersConfig.every((filter) =>
                    matchesFilter(row, filter, filters[filter.id] ?? 'all'),
                );
                return passesFilters;
            });
        }

        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const passesFilters = filtersConfig.every((filter) =>
                matchesFilter(row, filter, filters[filter.id] ?? 'all'),
            );

            if (!passesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = config.table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [isServerSearch, config.table.rows, keyword, filters, filtersConfig, config.table.columns]);

    const sortedRows = useMemo(() => {
        if (activeSortKey) {
            return sortRows(filteredRows, activeSortKey, activeSortDir);
        }
        return filteredRows;
    }, [filteredRows, activeSortKey, activeSortDir]);

    useEffect(() => {
        tableRegistry.setActiveTable(cleanedColumns, sortedRows, 'journal-activity-log');
        return () => {
            if (tableRegistry.activeTable?.columns === cleanedColumns) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, sortedRows]);

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                resourceName="journal-activity-log"
                size="compact"
                filters={null}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                    onClick: config.table.onRefresh,
                    loading: Boolean(config.table.loading),
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
                    }
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                pageValue={config.table.total ? config.table.total.toLocaleString('id-ID') : sortedRows.length.toLocaleString('id-ID')}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1380px]" wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {sortedRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-2.5 text-center text-base font-light text-white">
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
                                    sortDirection={activeSortKey === column.id ? activeSortDir : null}
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
                                    className={`cursor-pointer border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                        index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                    }`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.number,
                                            tabLabel: row.number,
                                        })
                                    }
                                >
                                    <DataTableCell className="px-2.5 text-center text-base text-table-row-number whitespace-nowrap">
                                        {config.table.pagination ? (config.table.pagination.from + index) : (index + 1)}
                                    </DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className="px-2.5 text-base text-text-workspace-dark"
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-2.5 py-2 text-center text-base text-black">
                                    {config.table.loading ? 'Memuat data...' : (config.table.emptyLabel ?? 'Tidak ada data')}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {config.table.pagination ? (
                <Pagination
                    page={config.table.pagination.page}
                    perPage={config.table.pagination.perPage}
                    total={config.table.pagination.total}
                    lastPage={config.table.pagination.lastPage}
                    from={config.table.pagination.from}
                    to={config.table.pagination.to}
                    onPageChange={config.table.pagination.onPageChange}
                    onPerPageChange={config.table.pagination.onPerPageChange}
                    className="mt-3"
                />
            ) : null}
        </div>
    );
}
