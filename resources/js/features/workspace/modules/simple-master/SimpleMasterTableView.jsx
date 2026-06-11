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
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { renderSimpleMasterCellValue } from './simpleMasterShared.jsx';
import { useColumnVisibility, getTableSchemaKey, tableRegistry, cleanHeaderLabel, getColumnMinWidth } from '@/features/workspace/shared/columnVisibility';

export default function SimpleMasterTableView({ table, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return (table.rows ?? []).filter((row) => {
            if (!normalizedKeyword) {
                return true;
            }

            return table.columns.some((column) => {
                if (column.kind === 'spacer') {
                    return false;
                }

                return String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword);
            });
        });
    }, [keyword, table.columns, table.rows]);
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

    useEffect(() => {
        tableRegistry.setActiveTable(cleanedColumns, filteredRows, table.resource);
        return () => {
            if (tableRegistry.activeTable?.resource === table.resource) {
                tableRegistry.setActiveTable(null, null, null);
            }
        };
    }, [cleanedColumns, filteredRows, table.resource]);

    const isRowInteractive = Boolean(onOpenDetail);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{ label: table.refreshLabel, onClick: table.onRefresh, loading: table.loading }}
                resourceName={table.resource}
                onRefresh={table.onRefresh}
                exportConfig={{
                    columns: cleanedColumns,
                    rows: filteredRows,
                    filename: table.label ? table.label.toLowerCase().replace(/\s+/g, '-') : 'data-master',
                    title: table.label || 'Laporan',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[310px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-[16px] font-medium text-white">
                                No.
                            </DataTableHead>
                            {visibleColumns.map((column) => {
                                const minWidth = getColumnMinWidth(column.label);
                                return (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                        style={minWidth ? { minWidth } : undefined}
                                    >
                                        {column.label}
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
                                    className={`${isRowInteractive ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''} border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name ?? row.label ?? row.id,
                                            tabLabel: row.tabLabel ?? row.name ?? row.label ?? row.id,
                                        })
                                    }
                                >
                                    <DataTableCell className="px-3 text-center text-[15px] text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`${column.cellClassName ?? ''} px-3 text-[15px] text-[#131a28]`.trim()}
                                        >
                                            {column.kind === 'spacer' ? null : (
                                                <span className={column.truncate === false ? '' : 'block truncate'}>
                                                    {renderSimpleMasterCellValue(column, row)}
                                                </span>
                                            )}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel ?? 'Belum ada data'}
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
