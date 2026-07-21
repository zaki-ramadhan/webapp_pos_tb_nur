import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort from '@/features/workspace/shared/useTableSort';
import { useColumnVisibility, getTableSchemaKey, tableRegistry } from '@/features/workspace/shared/columnVisibility';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

function SupplierPriceFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
                    containerClassName="w-auto"
                    className="h-[34px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}



        </div>
    );
}

export default function SupplierPriceTableView({ config, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];

                return !selectedValue || selectedValue === 'all' ? true : row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
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
    }, [config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);

    const schemaKey = getTableSchemaKey(config.table.columns);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, config.table.columns);
    const { handleResizeStart, getCellStyle } = useColumnResize(schemaKey);

    const visibleColumns = useMemo(() => {
        return config.table.columns.filter(col => !visibleColumnIds || visibleColumnIds.includes(col.id));
    }, [config.table.columns, visibleColumnIds]);

    useEffect(() => {
        tableRegistry.setActiveTable(config.table.columns, sortedRows, 'supplier-prices');
        return () => {
            if (tableRegistry.activeTable?.resource === 'supplier-prices') {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [config.table.columns, sortedRows]);

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={config.table.filters?.length ? <SupplierPriceFilterBar table={config.table} filters={filters} setFilters={setFilters} /> : null}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                }}
                importButton={false}
                exportConfig={false}
                resourceName="supplier-prices"
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1280px]" wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {sortedRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-light text-white">
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
                                    sortDirection={sortKey === column.id ? sortDir : null}
                                    onSort={() => handleSort(column.id)}
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
                                    onClick={() => onOpenDetail?.({ recordId: String(row.id), label: row.number, tabLabel: row.number })}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer transition hover:bg-workspace-hover-bg' : ''}`.trim()}
                                >
                                        {sortedRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                        {index + 1}
                                    </DataTableCell>
                                    ) : null}
                                    {visibleColumns.map((column) => (
                                         <DataTableCell
                                             key={column.id}
                                             className={`text-left px-2.5 text-base text-text-workspace-dark`.trim()}
                                             style={getCellStyle(column.id)}
                                             onResizeStart={(e) => handleResizeStart(e, column.id)}
                                         >
                                             <span className="block truncate">{row[column.id] ?? ''}</span>
                                         </DataTableCell>
                                     ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell
                                    colSpan={visibleColumns.length + 1}
                                    className="px-2.5 py-3 text-center text-base text-text-workspace-dark"
                                >
                                    {config.table.loading ? 'Memuat data...' : config.table.emptyLabel}
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
