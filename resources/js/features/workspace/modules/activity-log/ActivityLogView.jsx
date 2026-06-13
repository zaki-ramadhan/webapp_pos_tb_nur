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
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import {
    buildActivityLogFilters,
    mapActivityLogRows,
} from '@/features/workspace/backend/workspaceBackendAdapters';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { CogIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { cleanHeaderLabel, getColumnMinWidth } from '@/features/workspace/shared/columnVisibility';

function matchesFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export default function ActivityLogView({ page }) {
    const [keyword, setKeyword] = useState('');
    const { rows: backendRows, total, loading, error, reload } = useBackendIndexResource({
        resource: 'activity-logs',
        filters: {
            search: keyword.trim(),
            per_page: 100,
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
    }, [filtersConfig]);

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
            return searchCols.slice(0, 3).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [filters, keyword, table.filters, table.rows]);

    const emptyLabel = loading ? 'Memuat data...' : (error || 'Belum ada data');

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
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
                exportConfig={{
                    columns: table.columns,
                    rows: filteredRows,
                    filename: 'log-aktivitas',
                    title: 'Log Aktivitas',
                }}
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
                            {table.columns.map((column) => {
                                const minWidth = getColumnMinWidth(column.label);
                                return (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
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
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                >
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
                                <DataTableCell colSpan={table.columns.length} className="px-2.5 py-3 text-center text-base text-[#131a28]">
                                    {emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
