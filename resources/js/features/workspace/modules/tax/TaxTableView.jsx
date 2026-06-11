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
import { PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import { useColumnVisibility, getTableSchemaKey } from '@/features/workspace/shared/columnVisibility';

const TAX_COLUMNS = [
    { id: 'description', label: 'Keterangan', align: 'left' },
    { id: 'typeLabel', label: 'Tipe Pajak', align: 'left' },
    { id: 'percentage', label: 'Persentase', align: 'right', widthClassName: 'w-[120px]' },
];

export default function TaxTableView({ page, rows, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const table = page.table;
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

    const schemaKey = getTableSchemaKey(TAX_COLUMNS);
    const [visibleColumnIds] = useColumnVisibility(schemaKey, TAX_COLUMNS);

    const visibleColumns = useMemo(() => {
        return TAX_COLUMNS.filter((column) => visibleColumnIds.includes(column.id));
    }, [visibleColumnIds]);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return rows.filter((row) => {
            if (typeFilter !== 'all' && row.typeValue !== typeFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.description, row.typeLabel, row.percentage].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, rows, typeFilter]);

    function handleOpenRow(row) {
        onOpenDetail?.({
            recordId: row.id,
            label: row.description,
            tabLabel: row.tabLabel ?? row.description,
        });
    }

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-white px-3 pb-3 pt-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                filters={
                    <SelectField
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        containerClassName="w-auto"
                        className="h-[34px] min-w-[132px] rounded-[4px] border-[#cfd6e2]"
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
                    loading: loading,
                }}
                resourceName="taxes"
                onRefresh={onRefresh}
                exportConfig={{
                    columns: TAX_COLUMNS,
                    rows: filteredRows,
                    filename: 'tarif-pajak',
                    title: 'Laporan Tarif Pajak',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
            />

            <div className="mt-3">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[45px] px-2 py-2.5 text-center text-[16px] font-medium text-white">
                                No.
                            </DataTableHead>
                            {visibleColumns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 py-2.5 text-[16px] font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`}
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
                                    className={`cursor-pointer border-[#e3e6ec] transition hover:bg-[#eef3fb] ${
                                        index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'
                                    }`.trim()}
                                    onClick={() => handleOpenRow(row)}
                                >
                                    <DataTableCell className="px-2 py-2.5 text-center text-[15px] text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
                                    {visibleColumns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 py-2.5 text-[15px] text-[#131a28] ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                                        >
                                            {row[column.id === 'percentage' ? 'percentage' : column.id === 'typeLabel' ? 'typeLabel' : 'description']}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={visibleColumns.length + 1} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {error || 'Belum ada data'}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
