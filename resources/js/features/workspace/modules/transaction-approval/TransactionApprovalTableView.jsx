import { useMemo, useState } from 'react';
import SelectField from '@/components/ui/SelectField';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, RefreshIcon, CogIcon } from '@/features/workspace/shared/Icons';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort, { sortRows } from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';
import Pagination from '@/components/ui/Pagination';

function ApprovalFilterSlot({ filters: filterDefs, values, onChange }) {
    return (
        <>
            {filterDefs.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={values[filter.id]}
                    onChange={(event) => onChange(filter.id, event.target.value)}
                    containerClassName="w-auto shrink-0"
                    className="h-[40px] rounded-[4px] border-ui-border"
                    selectClassName="text-xs sm:text-sm text-filter-select-text"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </SelectField>
            ))}
        </>
    );
}

export default function TransactionApprovalTableView({ table, onCreate, onRefresh, onOpenDetail }) {
    const isServerSearch = Boolean(table.onSearch || table.pagination?.onSearch);
    const isServerSort = Boolean(table.onSort || table.pagination?.onSort);

    const [filterValues, setFilterValues] = useState(() =>
        table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? '';
            return result;
        }, {}),
    );

    function handleFilterChange(filterId, value) {
        setFilterValues((current) => ({ ...current, [filterId]: value }));
    }

    const filteredRows = useMemo(() => {
        return table.rows.filter((row) =>
            table.filters.every((filter) => {
                const selected = filterValues[filter.id];
                return !selected || selected === 'all' || row[filter.rowKey] === selected;
            }),
        );
    }, [filterValues, table.filters, table.rows]);

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
    const { handleResizeStart, getCellStyle } = useColumnResize('transaction-approval');

    return (
        <div className="flex min-h-full flex-col">
            <TableToolbar
                filters={table.filters?.length ? <ApprovalFilterSlot filters={table.filters} values={filterValues} onChange={handleFilterChange} /> : null}
                size="compact"
                createButton={{ label: table.createLabel, onClick: onCreate, icon: <PlusIcon className="h-6 w-6" /> }}
                refreshButton={{ label: table.refreshLabel, onClick: onRefresh, icon: <RefreshIcon className="h-5 w-5" /> }}
                menuButton={{ label: table.actionsLabel, icon: <CogIcon className="h-5 w-5" />, buttonClassName: 'w-[70px]', items: table.menuItems }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {sortedRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-light text-white">
                                    No.
                                </DataTableHead>
                            )}
                            {table.columns.map((column) => (
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
                                    onClick={() => onOpenDetail?.({ recordId: row.id, label: row.ruleName, tabLabel: row.tabLabel })}
                                    className={`border-ui-border-row ${index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'} cursor-pointer hover:bg-brand-blue-lightest`}
                                >
                                    <DataTableCell className="px-3 text-center text-base text-table-row-number whitespace-nowrap">
                                        {table.pagination ? (table.pagination.from + index) : (index + 1)}
                                    </DataTableCell>
                                    {table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className="px-3 text-base text-text-workspace-dark"
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-ui-border-row bg-white">
                                <DataTableCell colSpan={table.columns.length + 1} className="px-3 py-2 text-center text-base text-black">
                                    {table.loading ? 'Memuat data...' : table.emptyLabel}
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
