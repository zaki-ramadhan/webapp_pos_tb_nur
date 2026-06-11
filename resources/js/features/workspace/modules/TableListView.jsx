import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { FunnelIcon, LinkIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey, tableRegistry } from '@/features/workspace/shared/columnVisibility';

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
                        className={`h-[34px] min-w-[118px] rounded-[4px] sm:min-w-[138px] ${
                            filter.disabled ? 'border-[#ead6a7] bg-[#fff8e9]' : 'border-[#cfd6e2]'
                        }`.trim()}
                        selectClassName={`px-3 text-[15px] ${filter.disabled ? 'text-[#9a7b35]' : 'text-[#394157]'}`.trim()}
                        iconClassName={`mr-2 ${filter.disabled ? 'text-[#9a7b35]' : 'text-[#6c7894]'}`.trim()}
                    >
                        {filter.options.map((option, optionIndex) => (
                            <option key={`${filter.id}-${option.value}-${optionIndex}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>

                    {filter.disabled && filter.hint ? (
                        <div className="flex flex-wrap items-center gap-1.5 pl-1 text-[11px] text-[#9a7b35]">
                            {filter.badgeLabel ? (
                                <span className="rounded-full bg-[#f6dfab] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b6511]">
                                    {filter.badgeLabel}
                                </span>
                            ) : null}
                            <span>{filter.hint}</span>
                        </div>
                    ) : null}
                </div>
            ))}

            {filterButtonLabel ? (
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[48px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                    aria-label={filterButtonLabel}
                    title={filterButtonLabel}
                >
                    <FunnelIcon className="h-4.5 w-4.5" />
                </button>
            ) : null}
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
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const handleSort = useCallback((columnId) => {
        setSortKey((prev) => {
            if (prev === columnId) {
                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                return columnId;
            }
            setSortDir('asc');
            return columnId;
        });
    }, []);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        const searchKeys = table.searchKeys?.length ? table.searchKeys : table.columns.map((column) => column.id);

        const filtered = table.rows.filter((row) => {
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

        if (!sortKey) return filtered;

        return [...filtered].sort((a, b) => {
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            const aNum = Number(aVal);
            const bNum = Number(bVal);
            const isNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);
            const cmp = isNumeric ? aNum - bNum : String(aVal).localeCompare(String(bVal), 'id');
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filters, keyword, sortDir, sortKey, table.columns, table.filters, table.rows, table.searchKeys]);

    const schemaKey = getTableSchemaKey(table.columns);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, table.columns);

    const visibleColumns = useMemo(() => {
        return table.columns.filter((column) => visibleColumnIds.includes(column.id));
    }, [table.columns, visibleColumnIds]);

    useEffect(() => {
        tableRegistry.setActiveTable(table.columns, filteredRows, table.resource);
        return () => {
            if (tableRegistry.activeTable?.resource === table.resource) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [table.columns, filteredRows, table.resource]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-2 py-2 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:px-3 sm:py-3">
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
                topRowClassName="mb-3"
                createButton={createButton}
                refreshButton={
                    table.refreshLabel
                        ? {
                              label: table.refreshLabel,
                              icon: <LinkIcon className="h-4.5 w-4.5" />,
                              onClick: table.onRefresh,
                              loading: Boolean(table.refreshLoading ?? table.loading),
                          }
                        : null
                }
                rightControls={rightControls}
                menuButton={menuButton}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder ?? 'Cari data di sini...',
                    widthClassName: table.searchWidthClassName ?? 'w-full sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                resourceName={table.resource}
                onRefresh={table.onRefresh}
                exportConfig={{
                    columns: table.columns,
                    rows: filteredRows,
                    filename: table.label ? table.label.toLowerCase().replace(/\s+/g, '-') : 'export',
                    title: table.label || 'Laporan',
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable
                    className={table.tableClassName ?? 'min-w-[760px] sm:min-w-[960px] lg:min-w-[1200px]'}
                    wrapperClassName="border-[#d1d8e4]"
                >
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-2.5 text-center text-[15px] font-medium text-white">
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
                                    sortDirection={sortKey === column.id ? sortDir : null}
                                    onSort={column.sortable !== false ? () => handleSort(column.id) : null}
                                />
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${onRowClick ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''} ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    <DataTableCell className="px-2.5 text-center text-[15px] text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} px-2.5 text-[15px] text-[#131a28] ${column.cellClassName ?? ''}`.trim()}
                                        >
                                            {column.truncate ? (
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            ) : (
                                                formatTableTextValue(row[column.id])
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-2.5 py-3 text-center text-[15px] text-[#131a28]">
                                    {keyword.trim() ? 'Tidak ada hasil pencarian yang cocok' : (table.emptyLabel ?? 'Belum ada data')}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
