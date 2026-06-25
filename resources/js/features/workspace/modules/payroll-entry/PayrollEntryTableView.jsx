import { useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';

import SelectField from '@/components/ui/SelectField';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CogIcon,
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
                trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
            }}
            pageValue={table.pageValue}
            className="space-y-3"
            importButton={false}
            exportConfig={false}
            filters={
                table.filters?.length ? (
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
                                className="h-[34px] min-w-[118px] rounded-[4px] border-ui-border"
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
                ) : null
            }
        />
    );
}

export default function PayrollEntryTableView({ config, onCreate, onOpenDetail }) {
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

            const searchCols = config.table.columns.filter(col => col && col.kind !== 'spacer' && col.id !== 'actions' && col.label);
            return searchCols.slice(0, 2).some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
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
                        onRowClick={(row) =>
                            onOpenDetail?.({
                                recordId: row.id,
                                label: row.number,
                                tabLabel: row.number,
                            })
                        }
                        getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
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

    {config.table.pagination ? (
                    <Pagination
                        page={config.table.pagination.page}
                        perPage={config.table.pagination.perPage}
                        total={config.table.pagination.total}
                        lastPage={config.table.pagination.lastPage}
                        from={config.table.pagination.from}
                        to={config.table.pagination.to}
                        onPageChange={config.table.pagination.onPageChange}
                        onPerPageChange={config.table.pagination.onPerPageChange}
                        className="mt-3"
                    />
                ) : null}
</div>
</div>
    );
}
