import { useMemo, useState } from 'react';
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
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState(() =>
        (config.table.filters ?? []).reduce((result, filter) => {
            result[filter.id] = filter.options?.[0]?.value ?? 'all';
            return result;
        }, {}),
    );

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return config.table.rows.filter((row) => {
            const matchesFilters = (config.table.filters ?? []).every((filter) => {
                const selectedValue = filters[filter.id];
                return !selectedValue || selectedValue === 'all' ? true : row[filter.rowKey] === selectedValue;
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
    }, [config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                {...salesDocumentToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters)}
                refreshButton={{
                    ...salesDocumentToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters).refreshButton,
                    label: loading ? 'Memuat data...' : config.table.refreshLabel,
                    onClick: onRefresh,
                    loading,
                }}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={config.table.columns}
                    rows={sortedRows}
                    emptyLabel={config.table.emptyLabel ?? 'Belum ada data'}
                    minWidthClassName="min-w-[1380px]"
                    onRowClick={(row) =>
                        onOpenDetail?.({
                            recordId: row.id,
                            label: row.number,
                            tabLabel: row.number,
                        })
                    }
                    getRowClassName={() => 'cursor-pointer transition hover:bg-workspace-hover-bg'}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
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
