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
import TextInput from '@/components/ui/TextInput';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey } from '@/features/workspace/shared/columnVisibility';

const SALARY_COLUMNS = [
    { id: 'name', label: 'Nama', align: 'left' },
    { id: 'type', label: 'Tipe Gaji/Tunjangan', align: 'left' },
    { id: 'inactiveLabel', label: 'Non Aktif', align: 'center', widthClassName: 'w-[120px]' },
];

export default function SalaryAllowanceTableView({
    config,
    rows,
    filters,
    setFilters,
    onCreate,
    onOpenDetail,
    loading = false,
    error = '',
    onRefresh = null,
}) {
    const [keyword, setKeyword] = useState('');

    const schemaKey = getTableSchemaKey(SALARY_COLUMNS);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, SALARY_COLUMNS);

    const visibleColumns = useMemo(() => {
        return SALARY_COLUMNS.filter((column) => visibleColumnIds.includes(column.id));
    }, [visibleColumnIds]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            if (filters.type !== 'all') {
                const typeCategory = row.type === 'Gaji/Pensiun atau THT/JHT' ? 'salary' : 'allowance';

                if (typeCategory !== filters.type) {
                    return false;
                }
            }

            if (filters.inactive !== 'all') {
                const inactiveValue = row.inactive ? 'yes' : 'no';

                if (inactiveValue !== filters.inactive) {
                    return false;
                }
            }

            if (keyword.trim()) {
                const normalizedKeyword = keyword.trim().toLowerCase();

                return row.name.toLowerCase().includes(normalizedKeyword) || row.type.toLowerCase().includes(normalizedKeyword);
            }

            return true;
        });
    }, [filters.inactive, filters.type, keyword, rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-white px-3 pb-3 pt-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                filters={
                    <div className="flex flex-wrap items-center gap-3">
                        {config.table.filterOptions.map((filter) => (
                            <SelectField
                                key={filter.id}
                                value={filters[filter.id]}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        [filter.id]: event.target.value,
                                    }))
                                }
                                containerClassName="w-full sm:w-auto"
                                className="h-[34px] min-w-[222px] rounded-[4px] border-[#cfd6e2]"
                                selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
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
                    label: config.table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    onClick: onRefresh,
                    loading: loading,
                }}
                resourceName="salary-allowances"
                onRefresh={onRefresh}
                exportConfig={{
                    columns: SALARY_COLUMNS,
                    rows: filteredRows,
                    filename: 'gaji-tunjangan',
                    title: 'Laporan Gaji dan Tunjangan',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
            />

            <div className="mt-4">
                <CrudStatusMessage status={error ? { tone: 'error', message: error } : null} className="mb-3" />
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                            {visibleColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`px-3 py-2.5 text-base font-medium text-white ${column.align === 'center' ? 'w-[120px] text-center' : 'text-left'}`}
                                >
                                    <span>{column.label}</span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow
                                    key={row.id}
                                    className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f1f1f2]' : 'bg-white'}`.trim()}
                                    onClick={() => onOpenDetail(row.id)}
                                >
                                    <DataTableCell className="py-2.5 text-center text-base text-[#646d83]">{index + 1}</DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`py-2.5 text-base text-[#131a28] ${column.align === 'center' ? 'text-center' : 'text-left'}`}
                                        >
                                            {formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow>
                                <DataTableCell colSpan={visibleColumns.length + 1} className="py-6 text-center text-base text-[#6b7280]">
                                    {loading ? 'Memuat data...' : config.table.emptyLabel ?? 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
