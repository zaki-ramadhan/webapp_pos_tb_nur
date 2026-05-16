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
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import { PlusIcon, PrintIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

export default function BranchTableView({ table, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.phone, row.inactiveLabel, row.name, row.userList].some((value) =>
                String(value).toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [inactiveFilter, keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={
                    table.filters?.map((filter) => (
                        <SelectField
                            key={filter.id}
                            value={inactiveFilter}
                            onChange={(event) => setInactiveFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[40px] min-w-[192px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="text-[15px] text-[#394157]"
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
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                printButton={{
                    label: table.printLabel,
                    icon: <PrintIcon className="h-5 w-5" />,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder,
                    widthClassName: 'sm:w-[310px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    {column.label}
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                            >
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.phone)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.inactiveLabel)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.name)}</span>
                                </DataTableCell>
                                <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                    <span className="block truncate">{formatTableTextValue(row.userList)}</span>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
