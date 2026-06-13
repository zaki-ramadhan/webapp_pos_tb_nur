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
import { CogIcon, FunnelIcon, PrintIcon, RefreshIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';

function FilterButton({ label }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
        >
            <FunnelIcon className="h-4.5 w-4.5" />
        </button>
    );
}

export default function ContactView({ page }) {
    const table = page.table;
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (typeFilter !== 'all' && row.typeValue !== typeFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchCols = table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 3).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [keyword, table.rows, typeFilter]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <TableToolbar
                filters={[
                    <SelectField
                        key="contact-type"
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        containerClassName="w-auto shrink-0"
                        className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-xs sm:text-sm text-[#394157]"
                    >
                        {table.filters[0].options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>,
                    <FilterButton key="contact-filter" label={table.filterButtonLabel} />,
                ]}
                topRowClassName="mb-3"
                size="compact"
                refreshButton={{
                    label: table.refreshLabel,
                    icon: <RefreshIcon className="h-5 w-5" />,
                }}
                printButton={{
                    label: table.printLabel,
                    icon: <PrintIcon className="h-4 w-4" />,
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
                pageValue={table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1280px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-base font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                >
                                    <span className={`flex items-center gap-2 ${column.align === 'left' ? '' : 'justify-center'}`.trim()}>
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
                                className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'}`.trim()}
                            >
                                <DataTableCell className="px-2.5 text-base text-[#131a28]">
                                    {formatTableTextValue(row.fullName)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-base text-[#131a28]">
                                    {formatTableTextValue(row.typeLabel)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-base text-[#131a28]">
                                    {formatTableTextValue(row.company)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-base text-[#131a28]">
                                    {formatTableTextValue(row.mobilePhone)}
                                </DataTableCell>
                                <DataTableCell className="px-2.5 text-base text-[#131a28]">
                                    {formatTableTextValue(row.email)}
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
