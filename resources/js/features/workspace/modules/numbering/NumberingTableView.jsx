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
import { CogIcon, PlusIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function NumberingTableView({ table, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [transactionType, setTransactionType] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (transactionType !== 'all' && row.transactionTypeValue !== transactionType) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, table.columns, table.rows, transactionType]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    table.filters?.map((filter) => (
                        <SelectField
                            key={filter.id}
                            value={transactionType}
                            onChange={(event) => setTransactionType(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[40px] min-w-[228px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-xs sm:text-sm text-[#394157]"
                        >
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    )) ?? null
                }
                topRowClassName="mb-4"
                size="compact"
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{ label: table.refreshLabel }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-5 w-5" />,
                    buttonClassName: 'w-[70px]',
                    items: table.menuItems,
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
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                    No.
                                </DataTableHead>
                            {table.columns.map((column) => (
                                <DataTableHead key={column.id} className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}>
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.length ? (
                            filteredRows.map((row, index) => (
                                <DataTableRow key={row.id} className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}>
                                    {filteredRows.length > 0 ? (
                                        <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                            {index + 1}
                                        </DataTableCell>
                                    ) : null}
                                    <DataTableCell className="px-3 text-base text-[#131a28]"><span className="block truncate">{formatTableTextValue(row.name)}</span></DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]"><span className="block truncate">{formatTableTextValue(row.transactionTypeLabel)}</span></DataTableCell>
                                    <DataTableCell className="px-3 text-base text-[#131a28]"><span className="block truncate">{formatTableTextValue(row.userScopeLabel)}</span></DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length + 1} className="px-3 py-3 text-center text-base text-[#131a28]">
                                    Belum ada data
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
