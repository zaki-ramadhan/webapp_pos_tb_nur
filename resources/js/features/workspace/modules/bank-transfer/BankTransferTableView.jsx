import { useMemo, useState } from 'react';
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
                if (!selectedValue || selectedValue === 'all') return true;
                return row[filter.rowKey] === selectedValue;
            });

            if (!matchesFilters) return false;
            if (!normalizedKeyword) return true;

            // Search across all meaningful text columns
            const searchFields = ['number', 'date', 'fromBank', 'toBank', 'description', 'purchasePayment', 'fromTotal', 'toTotal'];
            return searchFields.some((field) =>
                String(row[field] ?? '').toLowerCase().includes(normalizedKeyword),
            );
        });
    }, [config.table.filters, config.table.rows, filters, keyword]);

    const { sortedRows, sortKey, sortDir, handleSort } = useTableSort(filteredRows);

    // Inject row-number column at the front
    const columnsWithNo = useMemo(() => {
        if (filteredRows.length === 0) {
            return config.table.columns;
        }
        return [
            { id: '__no', label: 'No.', widthClassName: 'w-[64px]' },
            ...config.table.columns,
        ];
    }, [config.table.columns, filteredRows.length]);

    

    const rowsWithNo = useMemo(() => {
        const { page = 1, perPage = 25 } = config.table.pagination ?? {};
        const offset = (page - 1) * perPage;
        return filteredRows.map((row, index) => ({
            ...row,
            __no: offset + index + 1,
        }));
    }, [filteredRows, config.table.pagination]);

    return (
        <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-3 py-3 shadow-card-light">
            <TableToolbar
                size="compact"
                className="space-y-3"
                filters={config.table.filters?.length ? <TransferTableFilterBar table={config.table} filters={filters} setFilters={setFilters} /> : null}
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
                    placeholder: 'Cari No. Bukti, Bank (Keluar/Masuk), Keterangan...',
                    widthClassName: 'sm:w-[342px]',
                    trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
                }}
                pageValue={sortedRows.length.toLocaleString('id-ID')}
            />

            <div className="mt-3 min-h-0 overflow-x-auto">
                <TransactionDataTable
                    columns={columnsWithNo}
                    rows={rowsWithNo}
                    emptyLabel={config.table.loading ? 'Memuat data...' : (config.table.emptyLabel || 'Belum ada data')}
                    minWidthClassName="min-w-[1280px]"
                    onRowClick={(row) => onOpenDetail?.({ recordId: row.id, label: row.number, tabLabel: row.number })}
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
