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
    DownloadIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function DownloadSplitButton({ table }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((currentValue) => !currentValue)}
                className="inline-flex h-[34px] shrink-0 overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                aria-label={table.downloadLabel}
                title={table.downloadLabel}
            >
                <span className="inline-flex w-[34px] items-center justify-center">
                    <DownloadIcon className="h-4 w-4" />
                </span>
                <span className="inline-flex w-[24px] items-center justify-center border-l border-[#7aa2d5]">
                    <ChevronDownIcon className="h-4 w-4" />
                </span>
            </button>

            <DropdownMenu open={open} onClose={() => setOpen(false)} anchorRef={buttonRef} widthClassName="w-[180px]">
                <div className="flex flex-col">
                    {(table.downloadItems ?? []).map((item) => (
                        <DropdownMenuItem key={item.id} onClick={() => setOpen(false)}>
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

export default function ShippingTableView({ table, onCreate, onOpenDetail, onRefresh }) {
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

            return [row.name, row.pic, row.phone, row.address, row.inactiveLabel].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [inactiveFilter, keyword, table.rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-white px-3 pb-3 pt-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <SelectField
                        value={inactiveFilter}
                        onChange={(event) => setInactiveFilter(event.target.value)}
                        containerClassName="w-auto"
                        className="h-[34px] min-w-[130px] rounded-[4px] border-[#cfd6e2]"
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
                        <button
                            type="button"
                            onClick={onCreate}
                            aria-label={table.createLabel}
                            className="inline-flex h-[34px] w-[60px] shrink-0 items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
                        >
                            <PlusIcon className="h-6 w-6" />
                        </button>

                        <button
                            type="button"
                            onClick={onRefresh}
                            aria-label={table.refreshLabel}
                            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                        <DownloadSplitButton table={table} />

                        <button
                            type="button"
                            aria-label={table.printLabel}
                            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                        >
                            <PrintIcon className="h-4 w-4" />
                        </button>

                        <TextInput
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
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

            <div className="mt-3 min-h-0">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {table.columns.map((column) => (
                                <DataTableHead key={column.id} className={`${column.widthClassName ?? ''} px-3 py-2.5 text-[16px] font-medium text-white`.trim()}>
                                    <span className="flex items-center gap-2">
                                        <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                        <span className="truncate">{column.label}</span>
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
                                    onClick={() =>
                                        onOpenDetail?.({
                                            recordId: row.id,
                                            label: row.name,
                                            tabLabel: row.name,
                                        })
                                    }
                                    className={`${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} border-[#dde1e8] cursor-pointer hover:bg-[#eef3fb] transition`.trim()}
                                >
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">{row.name}</DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">{row.pic}</DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">{row.phone}</DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">{row.address}</DataTableCell>
                                    <DataTableCell className="px-3 py-2.5 text-[15px] text-[#131a28]">{row.inactiveLabel}</DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow className="bg-white">
                                <DataTableCell colSpan={table.columns.length} className="px-3 py-3 text-center text-[15px] text-[#131a28]">
                                    {table.emptyLabel}
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
