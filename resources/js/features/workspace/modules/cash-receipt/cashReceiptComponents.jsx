import { SortIcon, TableActionIcon } from '@/features/workspace/shared/Icons';

export function ReceiptFilterBar({ table, filters, setFilters, SelectField }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto shrink-0"
                    className="h-[34px] min-w-[126px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}
        </div>
    );
}

export function CashReceiptSortHeader({ column }) {
    return (
        <span className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}>
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}

export function CashReceiptEmptyLineRow({ colSpan, emptyLabel }) {
    return (
        <tr className="bg-white">
            <td className="px-3 text-center text-text-workspace-inactive">
                <TableActionIcon className="mx-auto h-4 w-4" />
            </td>
            <td
                colSpan={colSpan - 1}
                className="px-3 py-3 text-center text-base text-text-workspace-dark"
            >
                {emptyLabel}
            </td>
        </tr>
    );
}
