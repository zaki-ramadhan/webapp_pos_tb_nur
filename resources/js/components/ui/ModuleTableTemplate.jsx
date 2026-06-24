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
    disableImport = false,
    disableExport = false,
    disablePrint = false,
    disableColumnSettings = false,
    disableRefresh = false,
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
                    className="h-[34px] min-w-[128px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
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
        <div className="min-h-full rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                size="compact"
                filters={filters}
                leftControls={extraToolbarSlot}
                createButton={onCreate ? {
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                } : null}
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
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className={(tableMinWidth ?? '').replace(/\b(?:[a-z-]*:)?min-w-\[[^\]]+\]/g, '').trim() || 'w-full'}>
                    <DataTable wrapperClassName="border-table-wrapper-border">
                        <DataTableHeader className="bg-table-header-bg">
                            <tr>
                                {filteredRows.length > 0 && (
                                    <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                        No.
                                    </DataTableHead>
                                )}
                                {visibleColumns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'center' ? 'text-center' : 'text-left'}`.trim()}
                                    >
                                        <span className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
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
                                        className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''}`.trim()}
                                        onClick={() =>
                                            onOpenDetail?.({
                                                recordId: String(row.id),
                                                label: row.name,
                                                tabLabel: row.tabLabel ?? row.name,
                                            })
                                        }
                                    >
                                        <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                            {index + 1}
                                        </DataTableCell>
                                        {visibleColumns.map((column) => (
                                            <DataTableCell
                                                key={column.id}
                                                className={`px-3 text-base text-text-workspace-dark ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell
                                        colSpan={visibleColumns.length + (filteredRows.length > 0 ? 1 : 0)}
                                        className="px-3 py-3 text-center text-base text-text-workspace-dark"
                                    >
                                        {table.emptyLabel ?? 'Belum ada data'}
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
