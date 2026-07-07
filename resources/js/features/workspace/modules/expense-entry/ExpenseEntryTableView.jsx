import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { tableRegistry } from '@/features/workspace/shared/columnVisibility';
import Pagination from '@/components/ui/Pagination';
import useTableSort from '@/features/workspace/shared/useTableSort';


import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CogIcon,
    DownloadIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionToolbarIconButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { ExpenseTableFilters } from './ExpenseEntrySections';

export default function ExpenseEntryTableView({
    config,
    onCreate,
    onOpenDetail,
    loading = false,
    error = '',
    onRefresh = null,
}) {
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

                if (!selectedValue || selectedValue === 'all') {
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
            return searchCols.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);

    useEffect(() => {
        tableRegistry.setActiveTable(config.table.columns, filteredRows, 'expense-entries');
        return () => {
            tableRegistry.setActiveTable(null, null, null);
        };
    }, [config.table.columns, filteredRows]);

    

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
                <TableToolbar
                    size="compact"
                    className="space-y-3"
                    filters={config.table.filters?.length ? <ExpenseTableFilters table={config.table} filters={filters} setFilters={setFilters} /> : null}
                    createButton={{
                        label: config.table.createLabel,
                        onClick: onCreate,
                        icon: <PlusIcon className="h-6 w-6" />,
                    }}
                    refreshButton={{
                        label: loading ? 'Memuat data...' : config.table.refreshLabel,
                        icon: <RefreshIcon className="h-5 w-5" />,
                        onClick: onRefresh,
                        loading,
                    }}
                    menuButton={{
                        label: config.table.settingsLabel,
                        icon: <CogIcon className="h-4 w-4" />,
                        items: config.table.settingsMenu,
                        widthClassName: 'w-[190px]',
                    }}
                    search={{
                        value: keyword,
                        onChange: (event) => setKeyword(event.target.value),
                        placeholder: config.table.searchPlaceholder,
                        widthClassName: 'sm:w-[342px]',
                        trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                    }}
                    pageValue={sortedRows.length.toLocaleString('id-ID')}
                    resourceName="expense-entries"
                />

                <div className="mt-3 min-h-0 overflow-x-auto">
                    <TransactionDataTable
                        columns={config.table.columns}
                        rows={sortedRows}
                        emptyLabel={loading ? 'Memuat data...' : (error || config.table.emptyLabel)}
                        minWidthClassName="min-w-[1180px]"
                        onRowClick={(row) =>
                            onOpenDetail?.({
                                recordId: row.id,
                                label: row.documentNumber,
                                tabLabel: row.documentNumber,
                            })
                        }
                        getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                                                renderHeaderCell={(column) => {
                            const sortable = column.sortable !== false;
                            const direction = sortKey === column.id ? sortDir : null;
                            const justifyClass = column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start';

                            if (!sortable) {
                                return <span className="block truncate">{column.label}</span>;
                            }

                            return (
                                <button
                                    type="button"
                                    onClick={() => handleSort(column.id)}
                                    className={`inline-flex w-full items-center gap-1 transition-opacity hover:opacity-80 min-w-0 ${justifyClass}`}
                                >
                                    <span className="block whitespace-nowrap truncate min-w-0 flex-1 text-left">{column.label}</span>
                                    {direction === 'asc' ? (
                                        <ChevronUp className="h-3.5 w-3.5 shrink-0 text-white" />
                                    ) : direction === 'desc' ? (
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white" />
                                    ) : (
                                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white opacity-40" />
                                    )}
                                </button>
                            );
                        }}
                        renderCell={({ row, column }) => (
                            <span className="block truncate">{formatTableTextValue(row[column.id], column)}</span>
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
