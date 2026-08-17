import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { tableRegistry } from '@/features/workspace/shared/columnVisibility';
import Pagination from '@/components/ui/Pagination';
import useTableSort from '@/features/workspace/shared/useTableSort';

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
                onClick: table.onRefresh,
                loading: table.loading,
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
            filters={null}
        />
    );
}

export default function PayrollEntryTableView({ config, onCreate, onOpenDetail }) {
    const isServerSearch = Boolean(config.table.onSearch || config.table.pagination?.onSearch);
    const isServerSort = Boolean(config.table.onSort || config.table.pagination?.onSort);

    const [keyword, setKeyword] = useState(config.table.search ?? config.table.pagination?.search ?? '');
    const [filters, setFilters] = useState(() =>
        config.table.filters.reduce((result, filter) => {
            result[filter.id] = filter.options[0]?.value ?? 'all';
            return result;
        }, {}),
    );
    const isFirstMount = useRef(true);
    const prevKeywordRef = useRef(keyword);

    useEffect(() => {
        if (!isServerSearch) return;
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        if (prevKeywordRef.current === keyword) {
            return;
        }
        prevKeywordRef.current = keyword;

        const timer = setTimeout(() => {
            const onSearch = config.table.onSearch || config.table.pagination?.onSearch;
            onSearch?.(keyword);
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword, isServerSearch, config.table.onSearch, config.table.pagination?.onSearch]);

    const handleSortClick = (columnId) => {
        if (isServerSort) {
            const onSort = config.table.onSort || config.table.pagination?.onSort;
            const currentKey = config.table.sortBy || config.table.pagination?.sortBy;
            const currentDir = config.table.sortDirection || config.table.pagination?.sortDirection || 'asc';
            const nextDir = currentKey === columnId ? (currentDir === 'asc' ? 'desc' : 'asc') : 'asc';
            onSort?.(columnId, nextDir);
        } else {
            handleClientSort(columnId);
        }
    };

    const filteredRows = useMemo(() => {
        if (isServerSearch) {
            return config.table.rows.filter((row) => {
                return config.table.filters.every((filter) => {
                    const selectedValue = filters[filter.id];
                    if (!selectedValue || selectedValue === 'all') {
                        return true;
                    }
                    return row[filter.rowKey] === selectedValue;
                });
            });
        }

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
            return searchCols.some((column) =>
                String(row[column.id] ?? '')
                    .toLowerCase()
                    .includes(normalizedKeyword),
            );
        });
    }, [isServerSearch, config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows: clientSortedRows, sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const sortedRows = isServerSort ? filteredRows : clientSortedRows;

    useEffect(() => {
        tableRegistry.setActiveTable(config.table.columns, filteredRows, 'payroll-entries');
        return () => {
            tableRegistry.setActiveTable(null, null, null);
        };
    }, [config.table.columns, filteredRows]);

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
                <PayrollTableToolbar
                    table={config.table}
                    filters={null}
                    setFilters={setFilters}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    onCreate={onCreate}
                />

                <div className="mt-3 min-h-0 overflow-x-auto">
                    <TransactionDataTable
                        columns={config.table.columns}
                        rows={sortedRows}
                        emptyLabel={config.table.loading ? 'Memuat data...' : (config.table.emptyLabel || 'Tidak ada data')}
                        minWidthClassName="min-w-[1180px]"
                        onRowClick={(row) =>
                            onOpenDetail?.({
                                recordId: row.id,
                                label: row.number,
                                tabLabel: row.number,
                            })
                        }
                        getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                        renderHeaderCell={(column) => {
                            const sortable = column.sortable !== false;
                            const activeKey = isServerSort ? (config.table.sortBy || config.table.pagination?.sortBy) : sortKey;
                            const activeDir = isServerSort ? (config.table.sortDirection || config.table.pagination?.sortDirection) : sortDir;
                            const direction = activeKey === column.id ? activeDir : null;
                            const justifyClass = column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start';

                            if (!sortable) {
                                return <span className="block truncate">{column.label}</span>;
                            }

                            return (
                                <button
                                    type="button"
                                    onClick={() => handleSortClick(column.id)}
                                    className={`inline-flex w-full items-center gap-1 transition-opacity hover:opacity-80 min-w-0 ${justifyClass}`}
                                >
                                    <span className="block whitespace-nowrap truncate min-w-0 flex-1 text-left">{column.label}</span>
                                    {direction === 'asc' ? (
                                        <ChevronUp className="h-3.5 w-3.5 shrink-0 text-white" />
                                    ) : direction === 'desc' ? (
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white" />
                                    ) : (
                                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/50" />
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
