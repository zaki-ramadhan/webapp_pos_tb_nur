import SelectField from '@/components/ui/SelectField';

export function PurchasePaymentTableFilterBar({ table, filters, setFilters }) {
    const renderFilter = (filter) => (
        <SelectField
            key={filter.id}
            value={filters[filter.id]}
            onChange={(event) =>
                setFilters((current) => ({
                    ...current,
                    [filter.id]: event.target.value,
                }))
            }
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
    );

    return (
        <div className="flex w-full flex-wrap items-center gap-2">
            {table.filters.map(renderFilter)}
        </div>
    );
}
