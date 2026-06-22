import { useMemo, useState } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import SelectField from '@/components/ui/SelectField';
import { matchesEmployeeFilter } from '@/features/workspace/modules/employee/employeeViewShared';

function EmployeeFilterSlot({ filters: filterDefs, values, onChange }) {
    return (
        <div className="flex flex-wrap items-center gap-2.5">
            {filterDefs.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={values[filter.id]}
                    onChange={(event) => onChange(filter.id, event.target.value)}
                    containerClassName="w-auto shrink-0"
                    className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2] sm:min-w-[154px]"
                    selectClassName="text-xs sm:text-sm text-[#394157]"
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

export default function EmployeeTableView({ table, onCreate, onOpenDetail }) {
    const [filterValues, setFilterValues] = useState(() =>
        table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    function handleFilterChange(filterId, value) {
        setFilterValues((current) => ({ ...current, [filterId]: value }));
    }

    const customRowFilter = useMemo(() => (row) => {
        return table.filters.every((filter) =>
            matchesEmployeeFilter(row, filter, filterValues[filter.id] ?? 'all'),
        );
    }, [filterValues, table.filters]);

    return (
        <ModuleTableTemplate
            table={table}
            resourceName="employees"
            exportFilename="daftar-karyawan"
            exportTitle="Laporan Daftar Karyawan"
            tableMinWidth="min-w-[1460px]"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            customRowFilter={customRowFilter}
            customFiltersSlot={
                table.filters?.length ? (
                    <EmployeeFilterSlot
                        filters={table.filters}
                        values={filterValues}
                        onChange={handleFilterChange}
                    />
                ) : null
            }
        />
    );
}
