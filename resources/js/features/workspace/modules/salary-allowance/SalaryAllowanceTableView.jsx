import { useMemo, useState } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import SelectField from '@/components/ui/SelectField';

const SALARY_COLUMNS = [
    { id: 'name', label: 'Nama', align: 'left' },
    { id: 'type', label: 'Tipe Gaji atau Tunjangan', align: 'left' },
    { id: 'inactiveLabel', label: 'Non Aktif', align: 'center', widthClassName: 'w-[120px]' },
];

export default function SalaryAllowanceTableView({
    config,
    rows,
    filters,
    setFilters,
    onCreate,
    onOpenDetail,
}) {
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            if (filters.type !== 'all') {
                const typeCategory = row.type === 'Gaji/Pensiun atau THT/JHT' ? 'salary' : 'allowance';

                if (typeCategory !== filters.type) {
                     return false;
                }
            }

            if (filters.inactive !== 'all') {
                const inactiveValue = row.inactive ? 'yes' : 'no';

                if (inactiveValue !== filters.inactive) {
                    return false;
                }
            }

            return true;
        });
    }, [filters.inactive, filters.type, rows]);

    return (
        <ModuleTableTemplate
            table={{
                ...config.table,
                columns: SALARY_COLUMNS,
                rows: filteredRows,
            }}
            resourceName="salary-allowances"
            exportFilename="gaji-tunjangan"
            exportTitle="Laporan Gaji dan Tunjangan"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            customFiltersSlot={
                <div className="flex flex-wrap items-center gap-3">
                    {config.table.filterOptions.map((filter) => (
                        <SelectField
                            key={filter.id}
                            value={filters[filter.id]}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    [filter.id]: event.target.value,
                                }))
                            }
                            containerClassName="w-auto"
                            className="h-[34px] min-w-[222px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                        >
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    ))}
                </div>
            }
        />
    );
}
