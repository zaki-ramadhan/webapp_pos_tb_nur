import { useState, useMemo } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';
import SelectField from '@/components/ui/SelectField';

export default function ContactView({ page }) {
    const table = page.table;
    const [typeFilter, setTypeFilter] = useState(table.filters?.[0]?.options?.[0]?.value ?? 'all');

    const customRowFilter = useMemo(() => {
        return (row) => typeFilter === 'all' || row.typeValue === typeFilter;
    }, [typeFilter]);

    const extraToolbarSlot = useMemo(() => {
        if (!table.filters?.[0]?.options) {
            return null;
        }

        return (
            <SelectField
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                containerClassName="w-auto shrink-0"
                className="h-[34px] min-w-[128px] rounded-[4px] border-[#cfd6e2]"
                selectClassName="text-xs sm:text-sm text-[#394157]"
            >
                {table.filters[0].options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
        );
    }, [table.filters, typeFilter]);

    return (
        <ModuleTableTemplate
            table={table}
            resourceName="contacts"
            exportFilename="kontak"
            exportTitle="Daftar Kontak"
            extraToolbarSlot={extraToolbarSlot}
            customRowFilter={customRowFilter}
            tableMinWidth="min-w-[1280px]"
        />
    );
}
