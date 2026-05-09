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
import { CogIcon, RefreshIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function matchesFilter(row, filter, selectedValue) {
    if (!filter.rowKey || selectedValue === 'all') {
        return true;
    }

    return row[filter.rowKey] === selectedValue;
}

export default function ActivityLogView({ page }) {
    const table = page.table;
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            const passesFilters = table.filters.every((filter) =>
                matchesFilter(row, filter, filters[filter.id] ?? 'all'),
            );

            if (!passesFilters) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [
                row.transactionDateLabel,
                row.referenceName,
                row.actionLabel,
                row.transactionTypeLabel,
                row.loggedAt,
                row.userName,
                row.email,
                row.ipAddress,
            ].some((value) => String(value ?? '').toLowerCase().includes(normalizedKeyword));
        });
    }, [filters, keyword, table.filters, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={table.filters.map((filter) => (
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
                        className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2] sm:min-w-[138px]"
                        selectClassName="text-[14px] text-[#394157]"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                ))}
                topRowClassName="mb-3"
                size="compact"
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-5 w-5" />,
                    items: table.menuItems,
                    widthClassName: 'w-[190px]',
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: table.searchPlaceholder ?? '',
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
                }}
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1320px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
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
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.transactionDateLabel)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.referenceName)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.actionLabel)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.transactionTypeLabel)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.loggedAt)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.userName)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.email)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                    {formatTableTextValue(row.ipAddress)}
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
