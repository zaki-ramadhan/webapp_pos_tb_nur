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
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    DownloadIcon,
    ExternalLinkIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import { matchesEmployeeFilter } from '@/features/workspace/modules/employee/employeeViewShared';
import { TableActionMenu, ToolbarSquareButton } from '@/features/workspace/modules/employee/employeeControls';

export default function EmployeeTableView({ table, onCreate, onOpenDetail }) {
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
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
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
                        selectClassName="text-[14px] text-[#394157]"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                ))}

                <ToolbarSquareButton label={table.filterButtonLabel}>
                    <FunnelIcon className="h-5 w-5" />
                </ToolbarSquareButton>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCreate}
                        aria-label={table.createLabel}
                        className="inline-flex h-[34px] w-[60px] items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>

                    <ToolbarSquareButton label={table.refreshLabel} onClick={table.onRefresh}>
                        <RefreshIcon className="h-5 w-5" />
                    </ToolbarSquareButton>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <ToolbarSquareButton label={table.downloadLabel}>
                        <DownloadIcon className="h-4 w-4" />
                    </ToolbarSquareButton>
                    <ToolbarSquareButton label={table.shareLabel}>
                        <ExternalLinkIcon className="h-4 w-4" />
                    </ToolbarSquareButton>
                    <ToolbarSquareButton label={table.printLabel}>
                        <PrintIcon className="h-4 w-4" />
                    </ToolbarSquareButton>
                    <TableActionMenu items={table.menuItems} label={table.actionsLabel} />

                    <TextInput
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder={table.searchPlaceholder}
                        className="h-[34px] w-full rounded-[4px] border-[#cfd6e2] sm:w-[340px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                    />

                    <TextInput
                        value={table.pageValue}
                        readOnly
                        className="h-[34px] w-[74px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-[15px] text-[#646d83]"
                    />
                </div>
            </div>

            <div className="mt-3 min-h-0 overflow-x-auto">
                <DataTable className="min-w-[1460px]" wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead
                                    key={column.id}
                                    className={`${column.widthClassName ?? ''} px-2.5 text-[15px] font-medium text-white ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`.trim()}
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
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.name)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.position)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.email)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.mobilePhone)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">
                                        <span className="block max-w-[112px] truncate">{formatTableTextValue(row.employeeId)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.taxStatus)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-[15px] text-[#131a28]">{formatTableTextValue(row.employmentStatus)}</DataTableCell>
                                    <DataTableCell className="px-2.5 text-right text-[15px] text-[#131a28]">{formatTableTextValue(row.payable)}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-2.5 py-4 text-center text-[15px] text-[#6b7280]">
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
