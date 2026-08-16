import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import useTableSort from '@/features/workspace/shared/useTableSort';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    SalesDocumentStatusCell,
    salesDocumentToolbarConfig,
} from '@/features/workspace/modules/sales-document/salesDocumentViewShared';
import { TransactionDataTable } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function SalesDocumentTableView({
    config,
    onCreate,
    onOpenDetail,
    onRefresh = null,
    loading = false,
}) {
    const isServerSearch = Boolean(config.table.onSearch || config.table.pagination?.onSearch);
    const isServerSort = Boolean(config.table.onSort || config.table.pagination?.onSort);

    const [keyword, setKeyword] = useState(config.table.search ?? config.table.pagination?.search ?? '');
    const [filters, setFilters] = useState(() =>
        (config.table.filters ?? []).reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    useEffect(() => {
        if (!isServerSearch) return;
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
                return (config.table.filters ?? []).every((filter) => {
                    const selectedValue = filters[filter.id];
                    if (!selectedValue || selectedValue === 'all' || filter.id === 'dateType' || filter.rowKey === 'dateType') {
                        return true;
                    }
                    return row[filter.rowKey] === selectedValue;
                });
            });
        }

        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = (config.table.filters ?? []).every((filter) => {
                const selectedValue = filters[filter.id];
                if (!selectedValue || selectedValue === 'all' || filter.id === 'dateType' || filter.rowKey === 'dateType') {
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
    }, [isServerSearch, config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows: clientSortedRows, sortKey, sortDir, handleSort: handleClientSort } = useTableSort(filteredRows);
    const sortedRows = isServerSort ? filteredRows : clientSortedRows;

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                {...salesDocumentToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters)}
                refreshButton={{
                    ...salesDocumentToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters).refreshButton,
                    label: config.table?.refreshLabel || 'Muat ulang',
                    onClick: onRefresh,
                    loading,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={sortedRows}
                    emptyLabel={(loading || config.table?.loading) ? 'Memuat data...' : (config.table?.emptyLabel ?? 'Tidak ada data')}
                    minWidthClassName="min-w-[1380px]"
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.number,
                            tabLabel: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                    sortKey={isServerSort ? (config.table.sortBy || config.table.pagination?.sortBy) : sortKey}
                    sortDir={isServerSort ? (config.table.sortDirection || config.table.pagination?.sortDirection) : sortDir}
                    onSort={handleSortClick}
                    renderCell={({ row, column }) => (
                        <SalesDocumentStatusCell columnId={column.id} row={row}>
                            <span className="block truncate">{formatTableTextValue(row[column.id], column)}</span>
                        </SalesDocumentStatusCell>
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
    );
}
