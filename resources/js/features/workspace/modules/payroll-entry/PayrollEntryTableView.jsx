import { useMemo, useState } from 'react';

import SelectField from '@/components/ui/SelectField';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CogIcon,
    FunnelIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

function PayrollTableToolbar({ table, filters, setFilters, keyword, setKeyword, onCreate }) {
    return (
        <TableToolbar
            size="compact"
            createButton={{
                label: table.createLabel,
                onClick: onCreate,
                icon: <PlusIcon className="h-6 w-6" />,
            }}
            refreshButton={{
                label: table.refreshLabel,
                icon: <RefreshIcon className="h-5 w-5" />,
            }}
            printButton={{
                label: table.printLabel,
                icon: <PrintIcon className="h-5 w-5" />,
            }}
            menuButton={{
                label: table.settingsLabel,
                icon: <CogIcon className="h-4 w-4" />,
                items: [{ id: 'table-settings', label: table.settingsLabel }],
                widthClassName: 'w-[190px]',
            }}
            search={{
                value: keyword,
                onChange: (event) => setKeyword(event.target.value),
                placeholder: table.searchPlaceholder,
                widthClassName: 'sm:w-[342px]',
                trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
            }}
            pageValue={table.pageValue}
            className="space-y-3"
            filters={
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
                            containerClassName="w-auto"
                            className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                            selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
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
                        className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                        aria-label={table.filterButtonLabel}
                    >
                        <FunnelIcon className="h-5 w-5" />
                    </button>
                </div>
            }
        />
    );
}

export default function PayrollEntryTableView({ config, onCreate }) {
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchFilter = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];

                if (!selectedValue || selectedValue === 'all') {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
            });

            if (!matchFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            return config.table.columns.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="min-h-full rounded-[6px] border border-[#d6dce8] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                <PayrollTableToolbar
                    table={config.table}
                    filters={filters}
                    setFilters={setFilters}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    onCreate={onCreate}
                />

                <div className="mt-3 min-h-0 overflow-x-auto">
                    <TransactionDataTable
                        columns={config.table.columns}
                        rows={filteredRows}
                        emptyLabel={config.table.emptyLabel}
                        minWidthClassName="min-w-[1180px]"
                        renderHeaderCell={(column) => (
                            <span
                                className={`flex items-center gap-2 ${
                                    column.align === 'right' ? 'justify-end' : 'justify-start'
                                }`.trim()}
                            >
                                <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                                <span>{column.label}</span>
                            </span>
                        )}
                        renderCell={({ row, column }) => (
                            <span className="block truncate">{formatTableTextValue(row[column.id])}</span>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
