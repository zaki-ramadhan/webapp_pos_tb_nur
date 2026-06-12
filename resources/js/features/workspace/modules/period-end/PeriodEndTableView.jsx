import { useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    CogIcon,
    PlusIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';

export default function PeriodEndTableView({ config, onCreate, onOpenDetail }) {
    const table = config.historyTable;
    const [keyword, setKeyword] = useState('');
    const [monthFilter, setMonthFilter] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');
    const [yearFilter, setYearFilter] = useState(table.filters?.[1]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (monthFilter !== 'all' && row.monthValue !== monthFilter) {
                return false;
            }

            if (yearFilter !== 'all' && row.yearValue !== yearFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, monthFilter, table.columns, table.rows, yearFilter]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={
                    <div className="flex flex-wrap items-center gap-2">
                        <SelectField
                            value={monthFilter}
                            onChange={(event) => setMonthFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[106px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                        >
                            {table.filters[0].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            value={yearFilter}
                            onChange={(event) => setYearFilter(event.target.value)}
                            containerClassName="w-auto shrink-0"
                            className="h-[34px] min-w-[110px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                        >
                            {table.filters[1].options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                }
                createButton={{
                    label: table.createLabel,
                    onClick: onCreate,
                    icon: <PlusIcon className="h-6 w-6" />,
                }}
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                menuButton={{
                    label: table.actionsLabel,
                    icon: <CogIcon className="h-4 w-4" />,
                    items: table.menuItems,
                    widthClassName: 'w-[190px]',
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
                <DataTable className="min-w-[1180px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[50px] px-3 py-2.5 text-center text-base font-medium text-white">
                                No.
                            </DataTableHead>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${column.align === 'right' ? 'text-right' : 'text-left'}`.trim()}
                                >
                                    <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`.trim()}>
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span>{column.label}</span>
                                    </span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''}`.trim()}
                                onClick={() =>
                                    onOpenDetail?.({
                                        recordId: row.id,
                                        label: row.name,
                                        tabLabel: row.tabLabel ?? row.name,
                                    })
                                }
                            >
                                                                    <DataTableCell className="px-3 text-center text-base text-[#646d83]">
                                        {index + 1}
                                    </DataTableCell>
{table.columns.map((column) => (
                                    <DataTableCell key={column.id} className="px-2.5 text-base text-[#131a28]">
                                        {row[column.id]}
                                    </DataTableCell>
                                ))}
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
