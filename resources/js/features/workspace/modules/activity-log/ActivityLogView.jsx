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
import Pagination from '@/components/ui/Pagination';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildActivityLogFilters,
    mapActivityLogRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { cleanHeaderLabel, getColumnMinWidth, tableRegistry } from '@/features/workspace/shared/columnVisibility';

function matchesFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export default function ActivityLogView({ page }) {
    const [keyword, setKeyword] = useState('');
    const {
        rows: backendRows,
        total,
        loading,
        error,
        reload,
        page: currentPage,
        perPage,
        setPage,
        setPerPage,
        lastPage,
        from,
        to
    } = useBackendIndexResource({
        resource: 'activity-logs',
        initialPerPage: 25,
        filters: {
            search: keyword.trim(),
            
        },
    });
    const rows = useMemo(() => mapActivityLogRows(backendRows), [backendRows]);
    const filtersConfig = useMemo(() => buildActivityLogFilters(rows), [rows]);
    const cleanedColumns = useMemo(() => {
        return (page.table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [page.table.columns]);
    const table = useMemo(() => ({
        ...page.table,
        filters: filtersConfig,
        columns: cleanedColumns,
        rows,
        pageValue: total.toLocaleString('id-ID'),
                pagination: {
                    page: currentPage,
                    perPage,
                    total,
                    lastPage,
                    from,
                    to,
                    onPageChange: setPage,
                    onPerPageChange: setPerPage,
                },
    }), [filtersConfig, page.table, cleanedColumns, rows, total]);
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
    }, [filtersConfig, currentPage, perPage, lastPage, from, to, setPage, setPerPage]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            const passesFilters = table.filters.every((filter) =>
                matchesFilter(row, filter, filters[filter.id] ?? 'all'),
            );

            if (!passesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [filters, keyword, table.filters, table.rows]);

    useEffect(() => {
        tableRegistry.setActiveTable(table.columns, filteredRows, 'activity-log');
        return () => {
            if (tableRegistry.activeTable?.resource === 'activity-log') {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [table.columns, filteredRows]);

    const emptyLabel = loading ? 'Memuat data...' : (error || 'Belum ada data');

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                resourceName="activity-log"
                filters={table.filters.map((filter) => (
                    <SelectField
                        key={filter.id}
                        value={filters[filter.id]}
                        onChange={(event) =>
                            setFilters((currentFilters) => ({
                                ...currentFilters,
                                [filter.id]: event.target.value,
                            }))
                        }
                        containerClassName="w-auto shrink-0"
                        className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2] sm:min-w-[138px]"
                        selectClassName="text-xs sm:text-sm text-[#394157]"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                ))}
                topRowClassName="mb-3"
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
                menuButton={{
                    label: 'Pengaturan',
                    icon: <CogIcon className="h-5 w-5" />,
                    items: [{ id: 'settings', label: 'Pengaturan' }],
                    widthClassName: 'w-[160px]',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder ?? '',
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={filteredRows.length.toLocaleString('id-ID')}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1320px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                            {table.columns.map((column) => {
                                const minWidth = getColumnMinWidth(column.label);
                                return (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white text-center`.trim()}
                                        style={minWidth ? { minWidth } : undefined}
                                    >
                                        <span className="block whitespace-nowrap">{column.label}</span>
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
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`.trim()}
                                >
                                    <DataTableCell className="px-2.5 text-center text-base text-[#646d83] whitespace-nowrap">
                                        {table.pagination ? (table.pagination.from + index) : (index + 1)}
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.transactionDateLabel)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.referenceName)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.actionLabel)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.transactionTypeLabel)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.loggedAt)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.userName)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.email)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-base text-[#131a28] whitespace-nowrap">
                                        <span className="block truncate">{formatTableTextValue(row.ipAddress)}</span>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length + 1} className="px-2.5 py-3 text-center text-base text-[#131a28]">
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
