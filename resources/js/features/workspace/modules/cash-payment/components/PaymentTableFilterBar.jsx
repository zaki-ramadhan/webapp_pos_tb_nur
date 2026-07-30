import SelectField from '@/components/ui/SelectField';

export default function PaymentTableFilterBar({ table, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) =>
                        setFilters((current) => ({
                            ...current,
                            [filter.id]: event.target.value,
                        }))
                    }
                    className="h-[36px] w-[180px] rounded-[4px] border-ui-border"
                    selectClassName="text-xs sm:text-sm text-brand-dark"
                >
                    {filter.options.map((option, optionIndex) => {
                        const val = typeof option === 'object' && option !== null ? (option.value ?? option.id ?? '') : option;
                        const lbl = typeof option === 'object' && option !== null ? (option.label ?? option.name ?? val) : option;
                        return (
                            <option key={`${filter.id}-${val}-${optionIndex}`} value={val}>
                                {lbl}
                            </option>
                        );
                    })}
                </SelectField>
            ))}
        </div>
    );
}
