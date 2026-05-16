import { useMemo, useRef, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
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

function TaxToolbarIconButton({ label, onClick, className = '', children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={className}
        >
            {children}
        </button>
    );
}

function TaxTableActionMenu({ table }) {
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
                className="inline-flex h-[34px] w-[52px] shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0]"
                aria-label={table.actionsLabel}
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

function TaxTableToolbar({
    table,
    keyword,
    typeFilter,
    onKeywordChange,
    onTypeFilterChange,
    onCreate,
    onRefresh,
    loading = false,
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <SelectField
                    value={typeFilter}
                    onChange={(event) => onTypeFilterChange(event.target.value)}
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
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <TaxToolbarIconButton
                        label={table.createLabel}
                        onClick={onCreate}
                        className="inline-flex h-[34px] w-[60px] shrink-0 items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </TaxToolbarIconButton>

                    <TaxToolbarIconButton
                        label={table.refreshLabel}
                        onClick={onRefresh}
                        className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <RefreshIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`.trim()} />
                    </TaxToolbarIconButton>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <TaxToolbarIconButton
                        label={table.printLabel}
                        className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                    >
                        <PrintIcon className="h-4 w-4" />
                    </TaxToolbarIconButton>

                    <TaxTableActionMenu table={table} />

                    <TextInput
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder={table.searchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                        className="h-[34px] w-full rounded-[4px] border-[#cfd6e2] sm:w-[340px]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />

                    <TextInput
                        value={table.pageValue}
                        readOnly
                        className="h-[34px] w-[76px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-right text-[15px] text-[#646d83]"
                    />
                </div>
            </div>
        </div>
    );
}

export default function TaxTableView({ page, rows, loading, error, onCreate, onOpenDetail, onRefresh }) {
    const table = page.table;
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState(table.filterOptions?.[0]?.value ?? 'all');

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
            <TaxTableToolbar
                table={table}
                keyword={keyword}
                typeFilter={typeFilter}
                onKeywordChange={setKeyword}
                onTypeFilterChange={setTypeFilter}
                onCreate={onCreate}
                onRefresh={onRefresh}
                loading={loading}
            />

            <div className="mt-3">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            <DataTableHead className="w-[34px] px-2 py-2.5 text-center">
                                <SortIcon className="mx-auto h-3 w-3 text-white/55" />
                            </DataTableHead>
                            <DataTableHead className="px-3 py-2.5 text-[16px] font-medium text-white">
                                Keterangan
                            </DataTableHead>
                            <DataTableHead className="px-3 py-2.5 text-[16px] font-medium text-white">
                                Tipe Pajak
                            </DataTableHead>
                            <DataTableHead className="w-[120px] px-3 py-2.5 text-[16px] font-medium text-white">
                                Persentase
                            </DataTableHead>
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
                                    <DataTableCell className="px-2 py-2.5" />
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">
                                        {row.description}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">
                                        {row.typeLabel}
                                    </DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-right text-[15px] text-[#131a28]">
                                        {row.percentage}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={4} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
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
