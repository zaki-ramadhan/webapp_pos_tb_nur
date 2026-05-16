import { useMemo, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';

export default function SalaryAllowanceTableView({ config, rows, filters, setFilters, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

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

            if (keyword.trim()) {
                const normalizedKeyword = keyword.trim().toLowerCase();

                return row.name.toLowerCase().includes(normalizedKeyword) || row.type.toLowerCase().includes(normalizedKeyword);
            }

            return true;
        });
    }, [filters.inactive, filters.type, keyword, rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-[#f4f4f5] px-3 pb-3 pt-3">
            <TableToolbar
                filters={config.table.filterOptions.map((filter) => (
                    <SelectField
                        key={filter.id}
                        value={filters[filter.id]}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                [filter.id]: event.target.value,
                            }))
                        }
                        className="h-[40px] min-w-[222px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#394157]"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                ))}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{ label: config.table.refreshLabel }}
                printButton={{ label: config.table.printLabel }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-4">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead key={column} className="px-3 py-3 text-[16px] font-medium text-white">
                                    <span>{column}</span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${index % 2 === 1 ? 'bg-[#f1f1f2]' : 'bg-white'}`.trim()}
                                onClick={() => onOpenDetail(row.id)}
                            >
                                <DataTableCell className="py-3 text-[17px]">{formatTableTextValue(row.name)}</DataTableCell>
                                <DataTableCell className="py-3 text-[17px]">{formatTableTextValue(row.type)}</DataTableCell>
                                <DataTableCell className="py-3 text-[17px]">{formatTableTextValue(row.inactiveLabel)}</DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}
