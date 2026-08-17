import { useEffect, useMemo, useRef, useState } from 'react';
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
import { JournalTableFilters } from './GeneralJournalSections';

export default function GeneralJournalTableView({
    config,
    onCreate,
    onOpenDetail,
    loading = false,
    error = '',
    onRefresh = null,
}) {
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
    }, [isServerSearch, config.table.columns, config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows: clientSortedRows, sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const sortedRows = isServerSort ? filteredRows : clientSortedRows;

    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
                <TableToolbar
                    size="compact"
                    className="space-y-3"
                    filters={null}
                    createButton={{
                        label: config.table.createLabel,
                        onClick: onCreate,
                        icon: <PlusIcon className="h-6 w-6" />,
                    }}
                    refreshButton={{
                        label: config.table?.refreshLabel || 'Muat ulang',
                        icon: <RefreshIcon className="h-5 w-5" />,
                        onClick: onRefresh,
                        loading,
                    }}
                    rightControls={
                        <>
                            <TransactionToolbarIconButton label={config.table.downloadLabel}>
                                <DownloadIcon className="h-4 w-4" />
                            </TransactionToolbarIconButton>
                            <TransactionToolbarIconButton label={config.table.printLabel}>
                                <PrintIcon className="h-4 w-4" />
                            </TransactionToolbarIconButton>
                        </>
                    }
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
                />

                <div className="mt-3 min-h-0 overflow-x-auto">
                    <TransactionDataTable
                        columns={config.table.columns}
                        rows={sortedRows}
                        emptyLabel={loading ? 'Memuat data...' : (error || 'Tidak ada data')}
                        minWidthClassName="min-w-[1100px]"
                        onRowClick={(row) =>
                            onOpenDetail?.({
                                recordId: row.id,
                                label: row.documentNumber,
                                tabLabel: row.documentNumber,
                            })
                        }
                        getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                        sortKey={isServerSort ? (config.table.sortBy || config.table.pagination?.sortBy) : sortKey}
                        sortDir={isServerSort ? (config.table.sortDirection || config.table.pagination?.sortDirection) : sortDir}
                        onSort={handleSortClick}
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
