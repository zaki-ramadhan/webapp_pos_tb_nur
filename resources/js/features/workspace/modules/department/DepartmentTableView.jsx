import { useMemo, useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
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
import {
    ChevronDownIcon,
    CogIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

function DepartmentToolbarButton({ label, onClick, className = '', children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`shrink-0 ${className}`.trim()}
        >
            {children}
        </button>
    );
}

function DepartmentTableActionMenu({ table }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    if (!table.menuItems?.length) {
        return null;
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label={table.settingsLabel}
                className="inline-flex h-[34px] w-[52px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0]"
            >
                <CogIcon className="h-4 w-4" />
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[190px]"
            >
                <div className="flex flex-col">
                    {table.menuItems.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

function DepartmentTableToolbar({
    table,
    keyword,
    inactiveFilter,
    onKeywordChange,
    onFilterChange,
    onCreate,
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <SelectField
                    value={inactiveFilter}
                    onChange={(event) => onFilterChange(event.target.value)}
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {table.filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <DepartmentToolbarButton
                        label={table.createLabel}
                        onClick={onCreate}
                        className="inline-flex h-[34px] w-[60px] items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </DepartmentToolbarButton>

                    <DepartmentToolbarButton
                        label={table.refreshLabel}
                        onClick={table.loading ? undefined : table.onRefresh}
                        className={`inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${table.loading ? 'pointer-events-none opacity-80' : ''}`.trim()}
                    >
                        <RefreshIcon className={`h-5 w-5 ${table.loading ? 'animate-spin' : ''}`.trim()} />
                    </DepartmentToolbarButton>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <DepartmentToolbarButton
                        label={table.printLabel}
                        className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <PrintIcon className="h-5 w-5" />
                    </DepartmentToolbarButton>

                    <DepartmentTableActionMenu table={table} />

                    <TextInput
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder={table.searchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                        className="h-[34px] w-full rounded-[4px] border-[#cfd6e2] sm:w-[342px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                        trailingClassName="px-3"
                    />

                    <TextInput
                        value={table.pageValue}
                        readOnly
                        className="h-[34px] w-[74px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-[15px] text-[#646d83]"
                    />
                </div>
            </div>
        </div>
    );
}

export default function DepartmentTableView({ table, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');
    const [inactiveFilter, setInactiveFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return table.rows.filter((row) => {
            if (inactiveFilter !== 'all' && row.inactiveValue !== inactiveFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return [row.name, row.userList].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [inactiveFilter, keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <DepartmentTableToolbar
                table={table}
                keyword={keyword}
                inactiveFilter={inactiveFilter}
                onKeywordChange={setKeyword}
                onFilterChange={setInactiveFilter}
                onCreate={onCreate}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <div className="min-w-[760px]">
                    <DataTable wrapperClassName="border-[#d1d8e4]">
                        <DataTableHeader className="bg-[#5f7690]">
                            <tr>
                                {table.columns.map((column) => (
                                    <DataTableHead
                                        key={column.id}
                                        className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${column.align === 'left' ? 'text-left' : 'text-center'}`.trim()}
                                    >
                                        <span
                                            className={`flex items-center gap-2 ${column.align === 'left' ? 'justify-start' : 'justify-center'}`.trim()}
                                        >
                                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                            <span>{column.label}</span>
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
                                        className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${onOpenDetail ? 'cursor-pointer transition hover:bg-[#eef3fb]' : ''}`.trim()}
                                        onClick={() =>
                                            onOpenDetail?.({
                                                recordId: String(row.id),
                                                label: row.name,
                                                tabLabel: row.tabLabel ?? row.name,
                                            })
                                        }
                                    >
                                        <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                            <span className="block truncate">{formatTableTextValue(row.name)}</span>
                                        </DataTableCell>
                                        <DataTableCell className="px-3 text-[15px] text-[#131a28]">
                                            <span className="block truncate">{formatTableTextValue(row.userList)}</span>
                                        </DataTableCell>
                                    </DataTableRow>
                                ))
                            ) : (
                                <DataTableRow className="bg-white">
                                    <DataTableCell
                                        colSpan={table.columns.length}
                                        className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                                    >
                                        {table.emptyLabel}
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
