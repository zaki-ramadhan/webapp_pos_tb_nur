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
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel } from '@/features/workspace/shared/columnVisibility';
import useTableSort from '@/features/workspace/shared/useTableSort';
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
                        selectClassName={`px-3 text-xs sm:text-sm ${filter.disabled ? 'text-warning-label-text' : 'text-filter-select-text'}`.trim()}
                        iconClassName={`mr-2 ${filter.disabled ? 'text-warning-label-text' : 'text-filter-icon'}`.trim()}
                    >
                        {filter.options.map((option, optionIndex) => (
                            <option key={`${filter.id}-${option.value}-${optionIndex}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
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
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        (table.filters ?? []).reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const hasExternalPagination = Boolean(table.pagination);
    const [localPage, setLocalPage] = useState(1);
    const [localPerPage, setLocalPerPage] = useState(25);

    useEffect(() => {
        if (!hasExternalPagination) {
            setLocalPage(1);
        }
    }, [keyword, filters, hasExternalPagination]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        const searchCols = (table.columns ?? []).filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
        const searchKeys = searchCols.map(col => col.id);

        return table.rows.filter((row) => {
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
    }, [filters, keyword, table.columns, table.filters, table.rows]);

    const { sortedRows: displayRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);

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

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-2 py-2 shadow-card-light sm:px-3 sm:py-3">
            <TableToolbar
                size="compact"
                filters={
                    table.filters?.length ? (
                        <TableListFilters
                            filters={table.filters}
                            values={filters}
                            onChange={(filterId, nextValue) =>
                                setFilters((current) => ({
                                    ...current,
                                    [filterId]: nextValue,
                                }))
                            }
                            filterButtonLabel={table.filterButtonLabel}
                        />
                    ) : null
                }
                createButton={createButton}
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

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable
                    className={table.tableClassName ?? 'min-w-[760px] sm:min-w-[960px] lg:min-w-[1200px]'}
                    wrapperClassName="border-table-wrapper-border"
                >
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {paginatedRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-2.5 text-center text-base font-normal text-white">
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
                                    sortDirection={sortKey === column.id ? sortDir : null}
                                    onSort={column.sortable !== false ? () => handleSort(column.id) : null}
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
                                    className={`border-ui-border-row ${onRowClick ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''} ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'}`.trim()}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    {paginatedRows.length > 0 && (
                                        <DataTableCell className="px-2.5 text-center text-base text-black">
                                            {paginationConfig ? (paginationConfig.from + index) : (index + 1)}
                                        </DataTableCell>
                                    )}
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
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length} className="px-2.5 py-3 text-center text-base text-black">
                                    {keyword.trim() ? 'Tidak ada hasil pencarian yang cocok' : (table.emptyLabel ?? 'Belum ada data')}
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
