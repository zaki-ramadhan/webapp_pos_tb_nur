import SelectField from '@/components/ui/SelectField';
import {
    CircleCheckIcon,
    FunnelIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

export function SalesDepositFilterBar({ config, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {config.table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto"
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={config.table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

export function SalesDepositTableHeaderCell({ column }) {
    return (
        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`.trim()}>
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}

export function SalesDepositTableCell({ row, column }) {
    return column.id === 'statusIcon' ? (
        <span className="inline-flex items-center justify-center text-[#27b35f]">
            <CircleCheckIcon className="h-5.5 w-5.5 text-[#27b35f]" />
        </span>
    ) : (
        <span className="block truncate">{row[column.id] ?? ''}</span>
    );
}
