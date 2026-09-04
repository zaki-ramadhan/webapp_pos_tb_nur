import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import useTableSort from '@/features/workspace/shared/useTableSort';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import {
    DownloadIcon,
    PrintIcon,
    CogIcon,
    SearchIcon,
    PlusIcon,
    RefreshIcon,
} from '@/features/workspace/shared/Icons';
import {
    TransactionDataTable,
    TransactionToolbarIconButton,
    TransactionToolbarSplitButton,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { TransferTableFilterBar } from './BankTransferSections';

export default function BankTransferTableView({ config, onCreate, onOpenDetail }) {
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
        if (columnId === '__no') return;
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
                    if (!selectedValue || selectedValue === 'all') return true;
                    return row[filter.rowKey] === selectedValue;
                });
            });
        }

        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = config.table.filters.every((filter) => {
                const selectedValue = filters[filter.id];
                if (!selectedValue || selectedValue === 'all') return true;
                return row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) return false;
            if (!normalizedKeyword) return true;

            const searchFields = ['number', 'date', 'fromBank', 'toBank', 'description', 'purchasePayment', 'fromTotal', 'toTotal'];
            return searchFields.some((field) =>
                String(row[field] ?? '').toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [isServerSearch, config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows: clientSortedRows, sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const sortedRows = isServerSort ? filteredRows : clientSortedRows;

    const columnsWithNo = useMemo(() => {
        return [
            { id: '__no', label: 'No.', widthClassName: 'w-[48px]', align: 'center', sortable: false },
            ...config.table.columns,
        ];
    }, [config.table.columns]);

    const rowsWithNo = useMemo(() => {
        const { from = 1 } = config.table.pagination ?? {};
        return sortedRows.map((row, index) => ({
            ...row,
            __no: from + index,
        }));
    }, [sortedRows, config.table.pagination]);

    return (
        <div className="flex min-h-full flex-col">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={null}
                createButton={{ label: config.table.createLabel, onClick: onCreate, icon: <PlusIcon className="h-6 w-6" /> }}
                refreshButton={{ label: config.table.refreshLabel, icon: <RefreshIcon className="h-4.5 w-4.5" />, onClick: config.table.onRefresh, loading: config.table.loading }}
                importButton={false}
                rightControls={
                    <>
                        <TransactionToolbarSplitButton label={config.table.downloadLabel} icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
                        <TransactionToolbarIconButton label={config.table.printLabel}>
                            <PrintIcon className="h-4 w-4" />
                        </TransactionToolbarIconButton>
                        <TransactionToolbarSplitButton label={config.table.settingsLabel} icon={<CogIcon className="h-4 w-4" />} items={config.table.settingsItems} />
                    </>
                }
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: 'Cari data...',
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                pageValue={config.table.total ? config.table.total.toLocaleString('id-ID') : sortedRows.length.toLocaleString('id-ID')}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={columnsWithNo}
                    rows={rowsWithNo}
                    showNumbering={false}
                    emptyLabel={config.table.loading ? 'Memuat data...' : (config.table.emptyLabel || 'Tidak ada data')}
                    minWidthClassName="min-w-[1280px]"
                    onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
                    getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                    renderHeaderCell={(column) => {
                        const sortable = column.sortable !== false && column.id !== '__no';
                        const activeKey = isServerSort ? (config.table.sortBy || config.table.pagination?.sortBy) : sortKey;
                        const activeDir = isServerSort ? (config.table.sortDirection || config.table.pagination?.sortDirection) : sortDir;
                        const direction = activeKey === column.id ? activeDir : null;
                        const justifyClass = column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start';

                        if (!sortable) {
                            return <span className={`block truncate ${column.align === 'center' ? 'text-center' : ''}`}>{column.label}</span>;
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
