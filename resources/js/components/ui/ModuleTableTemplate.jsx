import { useEffect, useMemo, useState } from 'react';
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
import { PlusIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { useColumnVisibility, getTableSchemaKey, cleanHeaderLabel, tableRegistry } from '@/features/workspace/shared/columnVisibility';
import TableToolbar from '@/features/workspace/shared/TableToolbar';

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
}) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

    const cleanedColumns = useMemo(() => {
        return (table.columns ?? []).map(col => ({
            ...col,
            label: cleanHeaderLabel(col.label)
        }));
    }, [table.columns]);

    const schemaKey = getTableSchemaKey(cleanedColumns);
    const [visibleColumnIds, setVisibleColumnIds] = useColumnVisibility(schemaKey, cleanedColumns);

    const visibleColumns = useMemo(() => {
        return cleanedColumns.filter((column) => visibleColumnIds.includes(column.id));
    }, [cleanedColumns, visibleColumnIds]);

    const filteredRows = useMemo(() => {
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
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword)
            );
        });
    }, [customFiltersSlot, customRowFilter, inactiveFilter, inactiveFilterKey, keyword, table.rows, table.columns]);

    useEffect(() => {
        tableRegistry.setActiveTable(cleanedColumns, filteredRows, resourceName);
        return () => {
            if (tableRegistry.activeTable?.resource === resourceName) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, filteredRows, resourceName]);

    const filters = useMemo(() => {
        if (customFiltersSlot) {
            return customFiltersSlot;
        }

        if (table.filterOptions && table.filterOptions.length > 0) {
            return (
                <SelectField
                    value={inactiveFilter}
                    onChange={(event) => setInactiveFilter(event.target.value)}
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {table.filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            );
        }

        return null;
    }, [customFiltersSlot, table.filterOptions, inactiveFilter]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                filters={filters}
                leftControls={extraToolbarSlot}
                createButton={onCreate ? {
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                } : null}
                refreshButton={{
                    label: table.refreshLabel,
                    onClick: table.onRefresh,
                    loading: table.loading,
                }}
                resourceName={resourceName}
                onRefresh={table.onRefresh}
                exportConfig={{
                    columns: cleanedColumns,
                    rows: filteredRows,
                    filename: exportFilename,
                    title: exportTitle,
                }}
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
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className={tableMinWidth ?? 'min-w-[760px]'}>
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                    No.
                                </DataTableHead>
                                {visibleColumns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'right' ? 'text-right' : (column.align === 'center' ? 'text-center' : 'text-left')}`.trim()}
                                    >
                                        <span className="flex items-center gap-2 justify-center">
                                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                            <span>{column.label}</span>
                                        </span>
                                    </DataTableHead>
                                ))}
                            </tr>
                        </DataTableHeader>

                        <DataTableBody>
                            {filteredRows.length ? (
                                filteredRows.map((row, index) => (
                                    <DataTableRow
                                        key={row.id}
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''}`.trim()}
                                        onClick={() =>
                                            onOpenDetail?.({
                                                recordId: String(row.id),
                                                label: row.name,
                                                tabLabel: row.tabLabel ?? row.name,
                                            })
                                        }
                                    >
                                        <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                            {index + 1}
                                        </DataTableCell>
                                        {visibleColumns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`px-3 text-base text-[#131a28] ${column.align === 'left' ? 'text-left' : 'text-center'}`}
                                            >
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell
                                        colSpan={visibleColumns.length + 1}
                                        className="px-3 py-3 text-center text-base text-[#131a28]"
                                    >
                                        {table.emptyLabel}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
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
