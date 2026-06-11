import { useMemo, useState } from 'react';

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
import { PlusIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey } from '@/features/workspace/shared/columnVisibility';

export default function ShippingTableView({ table, onCreate, onOpenDetail, onRefresh }) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

    const schemaKey = getTableSchemaKey(table.columns);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, table.columns);

    const visibleColumns = useMemo(() => {
        return table.columns.filter((column) => visibleColumnIds.includes(column.id));
    }, [table.columns, visibleColumnIds]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.pic, row.phone, row.address, row.inactiveLabel].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [inactiveFilter, keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-white px-3 pb-3 pt-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <SelectField
                        value={inactiveFilter}
                        onChange={(event) => setInactiveFilter(event.target.value)}
                        containerClassName="w-auto"
                        className="h-[34px] min-w-[130px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="px-3 text-[15px] text-[#394157]"
                        iconClassName="mr-2 text-[#6c7894]"
                    >
                        {table.filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                }
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    onClick: onRefresh,
                    loading: table.loading,
                }}
                resourceName="shipping-methods"
                onRefresh={onRefresh}
                exportConfig={{
                    columns: table.columns,
                    rows: filteredRows,
                    filename: 'metode-pengiriman',
                    title: 'Laporan Metode Pengiriman',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
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
                            {visibleColumns.map((column) => (
                                <DataTableHead key={column.id} className={`${column.widthClassName ?? ''} px-3 py-2.5 text-[16px] font-medium text-white`.trim()}>
                                    <span className="flex items-center gap-2">
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span className="truncate">{column.label}</span>
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
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name,
                                            tabLabel: row.name,
                                        })
                                    }
                                    className={`${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} border-[#dde1e8] cursor-pointer hover:bg-[#eef3fb] transition`.trim()}
                                >
                                    <DataTableCell className="px-3 py-2.5 text-center text-[15px] text-[#646d83]">{index + 1}</DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell key={column.id} className="px-3 py-2.5 text-[15px] text-[#131a28]">
                                            {row[column.id]}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel}
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
