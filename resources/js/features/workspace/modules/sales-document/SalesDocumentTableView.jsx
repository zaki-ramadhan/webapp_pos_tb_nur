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
import SortableTableHeaderCell from '@/features/workspace/shared/SortableTableHeaderCell';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import useTableSort from '@/features/workspace/shared/useTableSort';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { useColumnResize } from '@/features/workspace/shared/useColumnResize';
import {
    SalesDocumentStatusCell,
    salesDocumentToolbarConfig,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';

export default function SalesDocumentTableView({ config, onCreate, onOpenDetail }) {
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

            return Object.values(row).some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);
    const { handleResizeStart, getCellStyle } = useColumnResize('sales-document');

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                {...salesDocumentToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters)}
                resourceName={config.table.resourceName}
                exportConfig={{
                    columns: config.table.columns,
                    rows: filteredRows,
                    title: config.table.createLabel ? config.table.createLabel.replace('Tambah ', '') : 'Laporan',
                    hideExport: true,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1380px]" wrapperClassName="border-table-wrapper-border">
                    <DataTableHeader className="bg-table-header-bg">
                        <tr>
                            {filteredRows.length > 0 && (
                                <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
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
                        {sortedRows.length ? (
                            sortedRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-ui-border-row transition hover:bg-workspace-hover-bg ${
                                        index % 2 === 1 ? 'bg-ui-bg-hover' : 'bg-white'
                                    }`.trim()}
                                    onClick={() => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                                >
                                                                        {filteredRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-table-row-number">
                                        {index + 1}
                                    </DataTableCell>
                                    ) : null}
{config.table.columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} px-2.5 text-base text-text-workspace-dark`.trim()}
                                            style={getCellStyle(column.id)}
                                            onResizeStart={(e) => handleResizeStart(e, column.id)}
                                        >
                                            <SalesDocumentStatusCell columnId={column.id} row={row}>
                                                <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                                            </SalesDocumentStatusCell>
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="border-ui-border-row bg-white">
                                <DataTableCell
                                    colSpan={config.table.columns.length + (filteredRows.length > 0 ? 1 : 0)}
                                    className="px-2.5 py-6 text-center text-base text-text-placeholder"
                                >
                                    {config.table.emptyLabel ?? 'Belum ada data'}
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
