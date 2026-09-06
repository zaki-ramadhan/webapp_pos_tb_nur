import SelectField from '@/components/ui/SelectField';

export default function TableFilterBar({
    filters: filterDefsProp,
    table,
    config,
    values: valuesProp,
    filters: filtersProp,
    setFilters,
    onChange,
    className = 'flex flex-wrap items-center gap-2',
    filterClassName = 'h-[34px] min-w-[126px] rounded-[4px] border-ui-border',
    selectClassName = 'px-3 text-xs sm:text-sm text-filter-select-text',
    containerClassName = 'w-auto shrink-0',
    iconClassName = 'mr-2 text-filter-icon',
}) {
    const filterDefs = Array.isArray(filterDefsProp)
        ? filterDefsProp
        : (table?.filters || config?.table?.filters || []);

    const values = (valuesProp && typeof valuesProp === 'object')
        ? valuesProp
        : (filtersProp && !Array.isArray(filtersProp) ? filtersProp : {});

    if (!filterDefs || filterDefs.length === 0) {
        return null;
    }

    const handleChange = (filterId, value) => {
        if (onChange) {
            onChange(filterId, value);
        } else if (setFilters) {
            setFilters((current) => ({
                ...current,
                [filterId]: value,
            }));
        }
    };

    return (
        <div className={className}>
            {filterDefs.map((filter) => {
                const currentValue = values[filter.id] ?? '';
                return (
                    <SelectField
                        key={filter.id}
                        value={currentValue}
                        onChange={(event) => handleChange(filter.id, event.target.value)}
                        containerClassName={containerClassName}
                        className={filterClassName}
                        selectClassName={selectClassName}
                        iconClassName={iconClassName}
                    >
                        {(filter.options ?? []).map((option, optionIndex) => {
                            const val = typeof option === 'object' && option !== null
                                ? (option.value ?? option.id ?? '')
                                : option;
                            const lbl = typeof option === 'object' && option !== null
                                ? (option.label ?? option.name ?? val)
                                : option;
                            return (
                                <option key={`${filter.id}-${val}-${optionIndex}`} value={val}>
                                    {lbl}
                                </option>
                            );
                        })}
                    </SelectField>
                );
            })}
        </div>
    );
}
