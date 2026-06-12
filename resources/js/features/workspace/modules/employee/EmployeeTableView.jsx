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
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { FunnelIcon, PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { matchesEmployeeFilter } from '@/features/workspace/modules/employee/employeeViewShared';
import { useColumnVisibility, getTableSchemaKey } from '@/features/workspace/shared/columnVisibility';

export default function EmployeeTableView({ table, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const schemaKey = getTableSchemaKey(table.columns);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, table.columns);

    const visibleColumns = useMemo(() => {
        return table.columns.filter((column) => visibleColumnIds.includes(column.id));
    }, [table.columns, visibleColumnIds]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            const passesFilters = table.filters.every((filter) =>
                matchesEmployeeFilter(row, filter, filters[filter.id] ?? 'all'),
            );

            if (!passesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [
                row.name,
                row.position,
                row.email,
                row.mobilePhone,
                row.employeeId,
                row.taxStatus,
                row.employmentStatus,
                row.payable,
            ].some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword));
        });
    }, [filters, keyword, table.filters, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                filters={
                    <div className="flex flex-wrap items-center gap-2.5">
                        {table.filters.map((filter) => (
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
                                className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2] sm:min-w-[154px]"
                                selectClassName="text-xs sm:text-sm text-[#394157]"
                            >
                                {filter.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>
                        ))}
                    </div>
                }
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    onClick: table.onRefresh,
                    loading: table.loading,
                }}
                resourceName="employees"
                onRefresh={table.onRefresh}
                exportConfig={{
                    columns: table.columns,
                    rows: filteredRows,
                    filename: 'daftar-karyawan',
                    title: 'Laporan Daftar Karyawan',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1460px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                            {visibleColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer' : ''}`.trim()}
                                    onClick={onOpenDetail ? () => onOpenDetail({ recordId: String(row.id), label: row.tabLabel ?? row.name, tabLabel: row.tabLabel ?? row.name }) : undefined}
                                >
                                    <DataTableCell className="px-2.5 text-center text-base text-[#646d83]">{index + 1}</DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-2.5 text-base text-[#131a28] ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`.trim()}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-2.5 py-4 text-center text-base text-[#6b7280]">
                                    {table.loading ? 'Memuat data...' : table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
