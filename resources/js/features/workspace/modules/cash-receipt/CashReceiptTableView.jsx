import { useMemo, useState } from 'react';
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
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    cashReceiptToolbarConfig,
} from '@/features/workspace/modules/cash-receipt/cashReceiptViewShared';
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import useTableSort from '@/features/workspace/shared/useTableSort';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';

export default function CashReceiptTableView({
    config,
    onCreate,
    onOpenDetail,
    loading = false,
    error = '',
    onRefresh = null,
}) {
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

                if (!selectedValue || selectedValue === 'all') {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
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
    }, [config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);
    const { handleResizeStart, getCellStyle } = useColumnResize('cash-receipts');

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                {...cashReceiptToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters, SelectField)}
                refreshButton={{
                    ...cashReceiptToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters, SelectField).refreshButton,
                    label: loading ? 'Memuat data...' : config.table.refreshLabel,
                    onClick: onRefresh,
                    loading,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1380px]" wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {sortedRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-normal text-white">
                                    No.
                                </DataTableHead>
                            )}
                            {config.table.columns.map((column) => (
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
                        {sortedRows.length ? sortedRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`cursor-pointer border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                    index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                }`.trim()}
                                onClick={() => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                            >
                                    {sortedRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                        {index + 1}
                                    </DataTableCell>
                                    ) : null}
{config.table.columns.map((column) => (
                                    <DataTableCell
                                        key={column.id}
                                        className={`text-left px-2.5 text-base text-text-workspace-dark`.trim()}
                                        style={getCellStyle(column.id)}
                                        onResizeStart={(e) => handleResizeStart(e, column.id)}
                                    >
                                        {formatTableTextValue(row[column.id])}
                                    </DataTableCell>
                                ))}
                            </DataTableRow>
                        )) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={config.table.columns.length + 1} className="px-3 py-3 text-center text-base text-text-workspace-dark">
                                    {loading ? 'Memuat data...' : (error || 'Belum ada data')}
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
