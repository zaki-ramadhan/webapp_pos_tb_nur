import React from 'react';
import { FunnelIcon, SortIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

export function ReceiptFilterBar({ table, filters, setFilters, SelectField }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto shrink-0"
                    className="h-[34px] min-w-[126px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-[15px] text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[48px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

export function CashReceiptSortHeader({ column }) {
    return (
        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}

export function CashReceiptEmptyLineRow({ colSpan, emptyLabel }) {
    return (
        <tr className="bg-white">
            <td className="px-3 text-center text-[#a8afbe]">
                <TableActionIcon className="mx-auto h-4 w-4" />
            </td>
            <td
                colSpan={colSpan - 1}
                className="px-3 py-3 text-center text-[15px] text-[#131a28]"
            >
                {emptyLabel}
            </td>
        </tr>
    );
}
