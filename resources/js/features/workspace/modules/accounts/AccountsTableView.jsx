import { useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';


import SelectField from '@/components/ui/SelectField';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import { RefreshIcon, SearchIcon, SortIcon } from '@/features/workspace/shared/Icons';

export default function AccountsTableView({ config, onCreate, onOpenDetail, loading = false, error = '', onReload = null }) {
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
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];

                if (!selectedValue || selectedValue === 'all' || !filter.rowKey) {
                    return true;
                }

                return row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) {
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
    }, [config.table.filters, config.table.rows, filters, keyword]);

    return (
        <div className="min-h-full rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                size="compact"
                filters={
                    config.table.filters?.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {config.table.filters.map((filter) => (
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
                                    className="h-[34px] min-w-[128px] rounded-[4px] border-ui-border"
                                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                                    iconClassName="mr-2 text-filter-icon"
                                >
                                    {filter.options.map((option, index) => (
                                        <option key={`${filter.id}-${option.value}-${index}`} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            ))}
                        </div>
                    ) : null
                }
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{
                    label: config.table.refreshLabel,
                    icon: <RefreshIcon className="h-4.5 w-4.5" />,
                    onClick: onReload,
                    loading,
                }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                    widthClassName: 'sm:w-[340px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={filteredRows}
                    minWidthClassName="min-w-[1380px]"
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.name,
                            tabLabel: row.name,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                    renderHeaderCell={(column) => (
                        <span className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : 'justify-start'}`.trim()}>
                            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
                            <span>{column.label}</span>
                        </span>
                    )}
                    renderCell={({ row, column }) => {
                        if (column.id === 'code') {
                            return (
                                <span className="block truncate" style={{ paddingLeft: `${row.level * 18}px` }}>
                                    {row.code}
                                </span>
                            );
                        }

                        if (column.id === 'name') {
                            return (
                                <span className="block truncate" style={{ paddingLeft: `${row.level * 18}px` }}>
                                    {row.name}
                                </span>
                            );
                        }

                        if (column.id === 'balance') {
                            return <span className={row.negative ? 'text-red-500' : ''}>{row.balance}</span>;
                        }

                        return <span className="block truncate">{row[column.id]}</span>;
                    }}
                    emptyLabel={loading ? 'Memuat data...' : (error || 'Belum ada data')}
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
    );
}
